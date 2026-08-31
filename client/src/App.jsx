import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MobileBottomNav } from './components/MobileBottomNav';
import React from 'react';
import { useAuth } from './context/AuthContext';
import { NavigationBar } from './components/NavigationBar';
import { Footer } from './components/Footer';
import { WhatsAppChatWidget } from './components/WhatsAppChatWidget';
import { Dashboard } from './pages/Dashboard';
import { CustomerPortal } from './pages/CustomerPortal';
import { RequestManager } from './pages/RequestManager';
import { ImageTools } from './pages/ImageTools';
import { ConversionStudio } from './pages/ConversionStudio';
import { DocumentTools } from './pages/DocumentTools';
import { FileTools } from './pages/FileTools';
import { UtilityHub } from './pages/UtilityHub';
import { WebsiteLauncher } from './pages/WebsiteLauncher';
import { PrintManager } from './pages/PrintManager';
import { ScannerStudio } from './pages/ScannerStudio';
import { BillingManager } from './pages/BillingManager';
import { AdminPanel } from './pages/AdminPanel';
import { AboutUs } from './pages/AboutUs';
import { Login } from './pages/Login';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Synthetic setActivePage to minimize refactoring across all pages
  const setActivePage = (page) => {
    if (page === 'customer-portal') navigate('/');
    else navigate(`/${page}`);
  };

  // Derive activePage string for legacy components that rely on it (e.g. Navigation)
  const activePage = location.pathname === '/' ? 'customer-portal' : location.pathname.substring(1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 14px auto', width: '52px', height: '52px' }}>
            ⚡
          </div>
          <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>Shree Online</div>
          <div style={{ color: 'var(--primary-400)', fontSize: '0.85rem', marginTop: '4px' }}>Mahuli, S.K.N • One Window. Every Digital Service.</div>
        </div>
      </div>
    );
  }

  const isOperator = user?.role === 'admin' || user?.role === 'operator';
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavigationBar activePage={activePage} setActivePage={setActivePage} />

      <main className="full-width-workspace" style={{ paddingBottom: activePage === 'website-launcher' ? 0 : '24px' }}>
        <Routes>
          <Route path="/" element={<CustomerPortal setActivePage={setActivePage} />} />
          <Route path="/dashboard" element={<Dashboard setActivePage={setActivePage} />} />
          <Route path="/about-us" element={<AboutUs setActivePage={setActivePage} />} />
          <Route path="/requests" element={isOperator ? <RequestManager setActivePage={setActivePage} /> : <Navigate to="/" />} />
          <Route path="/passport-photo" element={<ImageTools setActivePage={setActivePage} />} />
          <Route path="/conversion-studio" element={<ConversionStudio setActivePage={setActivePage} />} />
          <Route path="/document-tools" element={<DocumentTools setActivePage={setActivePage} />} />
          <Route path="/file-tools" element={<FileTools setActivePage={setActivePage} />} />
          <Route path="/utility-hub" element={<UtilityHub setActivePage={setActivePage} />} />
          <Route path="/website-launcher" element={<WebsiteLauncher setActivePage={setActivePage} />} />
          <Route path="/print-manager" element={<PrintManager setActivePage={setActivePage} />} />
          <Route path="/scanner-studio" element={<ScannerStudio setActivePage={setActivePage} />} />
          <Route path="/billing-manager" element={isOperator ? <BillingManager setActivePage={setActivePage} /> : <Navigate to="/" />} />
          <Route path="/admin-panel" element={isAdmin ? <AdminPanel setActivePage={setActivePage} /> : <Navigate to="/" />} />
          <Route path="/login" element={<Login setActivePage={setActivePage} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {activePage !== 'website-launcher' && (
        <Footer setActivePage={setActivePage} />
      )}
      <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />
      <WhatsAppChatWidget currentUser={user} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
