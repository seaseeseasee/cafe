import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, PackageSearch, Package } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductFormModal from '../components/ProductFormModal.jsx';
import { Toggle } from '../components/FormControls.jsx';
import { categoryLabel } from '../data/categories.js';
import { formatMoney } from '../utils/format.js';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProduct } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState(null); // null | 'new' | product

  const q = search.trim().toLowerCase();
  const searched = useMemo(() => products.filter((p) => !q || p.name.toLowerCase().includes(q)), [products, q]);
  const visible = category === 'all' ? searched : searched.filter((p) => p.category === category);
  const counts = useMemo(() => {
    const c = { all: searched.length };
    for (const p of searched) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [searched]);
  const activeCount = products.filter((p) => p.active).length;

  const handleSave = (data) => {
    if (editing === 'new') {
      const p = addProduct(data);
      toast.success(`เพิ่มสินค้า “${p.name}” แล้ว${p.active ? ' — แสดงในหน้าขายทันที' : ''}`);
    } else {
      updateProduct(editing.id, data);
      toast.success(`บันทึกการแก้ไข “${data.name}” แล้ว`);
    }
    setEditing(null);
  };

  const handleDelete = async (p) => {
    const ok = await confirm({
      title: `ลบสินค้า “${p.name}”?`,
      message: 'สินค้าจะถูกลบออกจากเมนูและตะกร้า (ประวัติการขายเดิมยังอยู่) การลบไม่สามารถย้อนกลับได้',
      confirmText: 'ลบสินค้า',
      danger: true,
    });
    if (ok) {
      deleteProduct(p.id);
      toast.success(`ลบสินค้า “${p.name}” แล้ว`);
    }
  };

  const handleToggle = (p) => {
    toggleProduct(p.id);
    toast.info(p.active ? `ปิดการขาย ${p.name}` : `เปิดการขาย ${p.name}`);
  };

  return (
    <div className="page">
      <PageHeader
        title="จัดการสินค้า"
        subtitle={`สินค้าทั้งหมด ${products.length} รายการ · เปิดขาย ${activeCount} รายการ`}
        actions={
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={18} /> เพิ่มสินค้า
          </button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="ยังไม่มีสินค้า"
          message="เพิ่มสินค้าชิ้นแรกเพื่อเริ่มขาย"
          action={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> เพิ่มสินค้า</button>}
        />
      ) : (
        <>
          <div className="filters">
            <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาชื่อสินค้า" className="grow" />
          </div>
          <CategoryTabs value={category} onChange={setCategory} counts={counts} />
          {visible.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="ไม่พบสินค้า"
              message="ลองเปลี่ยนคำค้นหาหรือหมวดหมู่"
              action={<button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('all'); }}>ล้างตัวกรอง</button>}
            />
          ) : (
            <div className="manage-grid">
              {visible.map((p) => (
                <div key={p.id} className={`manage-card card ${p.active ? '' : 'inactive'}`}>
                  <ProductImage product={p} size={64} />
                  <div className="manage-info">
                    <strong>{p.name}</strong>
                    <span className="muted small">{categoryLabel(p.category)}</span>
                    <span className="product-price">{formatMoney(p.price)}</span>
                  </div>
                  <div className="manage-actions">
                    <Toggle id={`t-${p.id}`} checked={p.active} onChange={() => handleToggle(p)} label={p.active ? 'เปิดขาย' : 'ปิดขาย'} />
                    <div className="row-gap">
                      <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`แก้ไข ${p.name}`} title="แก้ไข">
                        <Pencil size={17} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(p)} aria-label={`ลบ ${p.name}`} title="ลบ">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <ProductFormModal product={editing === 'new' ? null : editing} products={products} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  );
}
