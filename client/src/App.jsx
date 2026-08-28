import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

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

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'customer-portal':
        return <CustomerPortal />;
      case 'about-us':
        return <AboutUs setActivePage={setActivePage} />;
      case 'requests':
        return <RequestManager setActivePage={setActivePage} />;
      case 'passport-photo':
        return <ImageTools setActivePage={setActivePage} />;
      case 'conversion-studio':
        return <ConversionStudio />;
      case 'document-tools':
        return <DocumentTools />;
      case 'file-tools':
        return <FileTools />;
      case 'utility-hub':
        return <UtilityHub />;
      case 'website-launcher':
        return <WebsiteLauncher />;
      case 'print-manager':
        return <PrintManager />;
      case 'scanner-studio':
        return <ScannerStudio />;
      case 'billing-manager':
        return <BillingManager />;
      case 'admin-panel':
        return <AdminPanel />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenCustomerSubmit={() => setActivePage('customer-portal')} onOpenAboutUs={() => setActivePage('about-us')} />
      <div className="app-container" style={{ flex: 1 }}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: activePage === 'website-launcher' ? 0 : '16px' }}>
          <div style={{ flex: 1 }}>
            {renderActivePage()}
          </div>

          {/* Global Footer on ALL pages except the in-portal custom browser */}
          {activePage !== 'website-launcher' && (
            <Footer setActivePage={setActivePage} />
          )}
        </main>
      </div>

      {/* Floating WhatsApp Quick Conversation & Helpline Widget */}
      <WhatsAppChatWidget currentUser={user} />
    </div>
  );
}
