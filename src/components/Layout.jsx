import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, ReceiptText, LayoutDashboard, Package, Settings, Coffee } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PrintReceipt from './PrintReceipt.jsx';

export const NAV = [
  { to: '/', label: 'ขายสินค้า', icon: ShoppingCart, end: true },
  { to: '/history', label: 'ประวัติการขาย', short: 'ประวัติ', icon: ReceiptText },
  { to: '/dashboard', label: 'แดชบอร์ด', short: 'สรุป', icon: LayoutDashboard },
  { to: '/products', label: 'จัดการสินค้า', short: 'สินค้า', icon: Package },
  { to: '/settings', label: 'ตั้งค่าร้านค้า', short: 'ตั้งค่า', icon: Settings },
];

export default function Layout() {
  const { settings, totals } = useApp();
  return (
    <div className="app-shell">
      <nav className="sidebar" aria-label="เมนูหลัก">
        <div className="brand">
          {settings.logo ? (
            <img src={settings.logo} alt="" className="brand-logo" />
          ) : (
            <span className="brand-logo brand-logo-fallback">
              <Coffee size={22} />
            </span>
          )}
          <div className="brand-text">
            <strong>{settings.shopName}</strong>
            <small>POS · Demo</small>
          </div>
        </div>
        <ul className="nav-list">
          {NAV.map(({ to, label, short, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={label}>
                <span className="nav-icon">
                  <Icon size={22} />
                  {to === '/' && totals.itemCount > 0 && <span className="nav-badge">{totals.itemCount}</span>}
                </span>
                <span className="nav-label">{label}</span>
                <span className="nav-short">{short || label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-foot">ข้อมูลบันทึกในเบราว์เซอร์นี้ (LocalStorage)</div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
      <PrintReceipt />
    </div>
  );
}
