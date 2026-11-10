import { Routes, Route, Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import Layout from './components/Layout.jsx';
import EmptyState from './components/EmptyState.jsx';
import POSPage from './pages/POSPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon={Coffee}
        title="ไม่พบหน้านี้"
        message="หน้าที่คุณต้องการอาจถูกย้ายหรือไม่มีอยู่"
        action={<Link to="/" className="btn btn-primary">กลับหน้าขายสินค้า</Link>}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<POSPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
