import React, { useState } from 'react';
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

export default function App() {
  const { user, loading } = useAuth();
  
  // Default to customer portal for guests / customers, and dashboard for staff
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

  // If user explicitly navigated to login page
  if (activePage === 'login') {
    return <Login setActivePage={setActivePage} />;
  }

  const isOperator = user?.role === 'admin' || user?.role === 'operator';
  const isAdmin = user?.role === 'admin';

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'customer-portal':
        return <CustomerPortal setActivePage={setActivePage} />;
      case 'about-us':
        return <AboutUs setActivePage={setActivePage} />;
      case 'requests':
        return isOperator ? <RequestManager setActivePage={setActivePage} /> : <CustomerPortal setActivePage={setActivePage} />;
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
        return isAdmin ? <AdminPanel /> : <CustomerPortal setActivePage={setActivePage} />;
      default:
        return <CustomerPortal setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Universal Responsive Top Navigation Bar */}
      <NavigationBar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Full-Width Responsive Workspace */}
      <main className="full-width-workspace" style={{ paddingBottom: activePage === 'website-launcher' ? 0 : '24px' }}>
        {renderActivePage()}
      </main>

      {/* Global Responsive Footer on all pages except In-Portal Browser */}
      {activePage !== 'website-launcher' && (
        <Footer setActivePage={setActivePage} />
      )}

      {/* Floating WhatsApp Quick Conversation & Helpline Widget */}
      <WhatsAppChatWidget currentUser={user} />
    </div>
  );
}
