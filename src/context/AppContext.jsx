import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts.js';
import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { generateDemoOrders } from '../data/demoOrders.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { KEYS } from '../utils/storage.js';
import { normalizeOptions, calcUnitPrice, cartItemKey, calcTotals } from '../utils/pricing.js';
import { buildOrder } from '../utils/orders.js';
import { useToast } from './ToastContext.jsx';

const AppContext = createContext(null);
const EMPTY_CART = { items: [], discount: null };

const uid = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function makeCartItem(product, options) {
  const opts = normalizeOptions(product.category, options);
  return {
    key: cartItemKey(product.id, opts),
    productId: product.id,
    name: product.name,
    category: product.category,
    emoji: product.emoji,
    basePrice: product.price,
    unitPrice: calcUnitPrice(product.price, opts),
    qty: 1,
    options: opts,
  };
}

export function AppProvider({ children }) {
  const toast = useToast();
  const onSaveError = useCallback(
    () => toast.error('บันทึกข้อมูลไม่สำเร็จ: พื้นที่ LocalStorage อาจเต็ม (ลองลดขนาด/ลบรูปภาพสินค้า)'),
    [toast],
  );

  const [products, setProducts] = usePersistentState(KEYS.products, () => DEFAULT_PRODUCTS, onSaveError);
  const [orders, setOrders] = usePersistentState(KEYS.orders, () => generateDemoOrders(DEFAULT_PRODUCTS), onSaveError);
  const [settingsRaw, setSettings] = usePersistentState(KEYS.settings, () => DEFAULT_SETTINGS, onSaveError);
  const [cart, setCart] = usePersistentState(KEYS.cart, () => EMPTY_CART, onSaveError);
  const [printJob, setPrintJob] = useState(null);

  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...settingsRaw }), [settingsRaw]);
  const totals = useMemo(() => calcTotals(cart.items, cart.discount), [cart]);

  // ---------- Cart ----------
  const addToCart = useCallback(
    (product, options, qty = 1) => {
      const item = makeCartItem(product, options);
      setCart((c) => {
        const exists = c.items.find((i) => i.key === item.key);
        const items = exists
          ? c.items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i))
          : [...c.items, { ...item, qty }];
        return { ...c, items };
      });
    },
    [setCart],
  );

  /** แก้ไขตัวเลือกของรายการในตะกร้า (ถ้าตัวเลือกใหม่ซ้ำกับรายการอื่น จะรวมจำนวนให้) */
  const replaceCartItem = useCallback(
    (oldKey, product, options, qty) => {
      const item = { ...makeCartItem(product, options), qty };
      setCart((c) => {
        const rest = c.items.filter((i) => i.key !== oldKey);
        const dup = rest.find((i) => i.key === item.key);
        const idx = c.items.findIndex((i) => i.key === oldKey);
        if (dup) return { ...c, items: rest.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i)) };
        const items = [...rest];
        items.splice(idx < 0 ? items.length : idx, 0, item);
        return { ...c, items };
      });
    },
    [setCart],
  );

  const setQty = useCallback(
    (key, qty) =>
      setCart((c) => ({
        ...c,
        items: qty <= 0 ? c.items.filter((i) => i.key !== key) : c.items.map((i) => (i.key === key ? { ...i, qty } : i)),
      })),
    [setCart],
  );

  const removeFromCart = useCallback((key) => setCart((c) => ({ ...c, items: c.items.filter((i) => i.key !== key) })), [setCart]);
  const clearCart = useCallback(() => setCart(EMPTY_CART), [setCart]);
  const setDiscount = useCallback((discount) => setCart((c) => ({ ...c, discount })), [setCart]);

  // ---------- Checkout / Orders ----------
  const checkout = useCallback(
    (payment) => {
      const order = buildOrder({ orders, items: cart.items, discount: cart.discount, payment });
      setOrders((list) => [order, ...list]);
      setCart(EMPTY_CART);
      return order;
    },
    [orders, cart, setOrders, setCart],
  );

  const voidOrder = useCallback(
    (id, reason) =>
      setOrders((list) =>
        list.map((o) => (o.id === id ? { ...o, status: 'voided', voidedAt: new Date().toISOString(), voidReason: reason } : o)),
      ),
    [setOrders],
  );

  // ---------- Products ----------
  const addProduct = useCallback(
    (data) => {
      const product = { ...data, id: uid(), price: Number(data.price), name: data.name.trim() };
      setProducts((list) => [...list, product]);
      return product;
    },
    [setProducts],
  );
  const updateProduct = useCallback(
    (id, data) =>
      setProducts((list) =>
        list.map((p) => (p.id === id ? { ...p, ...data, price: Number(data.price ?? p.price), name: (data.name ?? p.name).trim() } : p)),
      ),
    [setProducts],
  );
  const deleteProduct = useCallback(
    (id) => {
      setProducts((list) => list.filter((p) => p.id !== id));
      setCart((c) => ({ ...c, items: c.items.filter((i) => i.productId !== id) }));
    },
    [setProducts, setCart],
  );
  const toggleProduct = useCallback(
    (id) => setProducts((list) => list.map((p) => (p.id === id ? { ...p, active: !p.active } : p))),
    [setProducts],
  );

  // ---------- Settings / Data ----------
  const updateSettings = useCallback((data) => setSettings((s) => ({ ...s, ...data })), [setSettings]);

  const resetDemo = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
    setOrders(generateDemoOrders(DEFAULT_PRODUCTS));
    setSettings(DEFAULT_SETTINGS);
    setCart(EMPTY_CART);
  }, [setProducts, setOrders, setSettings, setCart]);

  const clearSales = useCallback(() => setOrders([]), [setOrders]);

  const printOrder = useCallback((order, { copy = false } = {}) => setPrintJob({ order, copy, at: Date.now() }), []);

  const value = {
    products, orders, settings, cart, totals, printJob,
    addToCart, replaceCartItem, setQty, removeFromCart, clearCart, setDiscount,
    checkout, voidOrder,
    addProduct, updateProduct, deleteProduct, toggleProduct,
    updateSettings, resetDemo, clearSales,
    printOrder, clearPrintJob: () => setPrintJob(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
