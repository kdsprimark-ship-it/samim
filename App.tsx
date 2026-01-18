
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Truck, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut, 
  CloudRain, 
  Sun, 
  Moon, 
  Clock, 
  RefreshCcw,
  Scissors,
  Ship,
  FileText,
  ExternalLink
} from 'lucide-react';
import { 
  Shipment, 
  Truck as TruckType, 
  Transaction, 
  ReferenceData, 
  AppSettings, 
  ListData,
  DepotMapping 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_REF_DATA, 
  DEFAULT_LISTS,
  DEPOT_MAPPINGS 
} from './constants';
import Swal from 'sweetalert2';

// Views
import Dashboard from './views/Dashboard';
import ReferenceBook from './views/ReferenceBook';
import DistLog from './views/DistLog';
import TruckInfo from './views/TruckInfo';
import Accounts from './views/Accounts';
import ExportImport from './views/ExportImport';
import BusinessSettings from './views/BusinessSettings';
import SystemSettings from './views/SystemSettings';
import Login from './views/Login';
import CutoffAnalyzer from './views/CutoffAnalyzer';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('st_auth') === 'true';
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => JSON.parse(localStorage.getItem('st_dist_log') || '[]'));
  const [trucks, setTrucks] = useState<TruckType[]>(() => JSON.parse(localStorage.getItem('st_trucks') || '[]'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('st_accounting') || '[]'));
  const [refData, setRefData] = useState<ReferenceData>(() => JSON.parse(localStorage.getItem('st_refData') || JSON.stringify(DEFAULT_REF_DATA)));
  const [lists, setLists] = useState<ListData>(() => JSON.parse(localStorage.getItem('st_lists') || JSON.stringify(DEFAULT_LISTS)));
  const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('st_settings') || JSON.stringify(DEFAULT_SETTINGS)));
  const [cutoffMappings, setCutoffMappings] = useState<DepotMapping[]>(() => JSON.parse(localStorage.getItem('st_cutoff_mappings') || JSON.stringify(DEPOT_MAPPINGS)));
  const [submittedInvoices, setSubmittedInvoices] = useState<string[]>(() => JSON.parse(localStorage.getItem('st_submitted_invoices') || '[]'));

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('st_dist_log', JSON.stringify(shipments));
    localStorage.setItem('st_trucks', JSON.stringify(trucks));
    localStorage.setItem('st_accounting', JSON.stringify(transactions));
    localStorage.setItem('st_refData', JSON.stringify(refData));
    localStorage.setItem('st_lists', JSON.stringify(lists));
    localStorage.setItem('st_cutoff_mappings', JSON.stringify(cutoffMappings));
    localStorage.setItem('st_submitted_invoices', JSON.stringify(submittedInvoices));
    localStorage.setItem('st_settings', JSON.stringify(settings));
  }, [shipments, trucks, transactions, refData, lists, cutoffMappings, submittedInvoices, settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.style.setProperty('--font-family', settings.fontFamily || 'Poppins');
    root.style.setProperty('--base-font-size', `${settings.textSize}px`);
    root.style.setProperty('--box-radius', `${settings.boxRadius}px`);
    root.style.setProperty('--bg-color', settings.backgroundColor || (settings.theme === 'dark' ? '#1a202c' : '#e0e5ec'));
    root.style.setProperty('--accent-color', settings.fontColor || '#00ff40');
    
    document.body.style.fontWeight = settings.fontWeight || '400';
    document.body.style.fontStyle = settings.fontStyle === 'Italic' ? 'italic' : 'normal';

    if (settings.wallpaper) {
      document.body.style.backgroundImage = `url(${settings.wallpaper})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'none';
    }

    const scale = (settings.globalZoom || 100) / 100;
    const bodyStyle = document.body.style;
    if ('zoom' in bodyStyle) {
      (bodyStyle as any).zoom = scale;
    } else {
      bodyStyle.transform = `scale(${scale})`;
      bodyStyle.transformOrigin = 'top left';
      bodyStyle.width = `${100 / scale}%`;
      bodyStyle.height = `${100 / scale}%`;
    }
  }, [settings]);

  const handleLogin = (user: string, pass: string) => {
    if (user === 'admin' && pass === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('st_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('st_auth');
  };

  const syncData = useCallback(async () => {
    if (!settings.googleSheetUrl) {
      Swal.fire({
        title: 'URL Needed',
        text: 'Go to System Settings and paste your Google Apps Script URL.',
        icon: 'info',
        background: settings.theme === 'dark' ? '#1a202c' : '#ffffff',
        color: settings.theme === 'dark' ? '#e2e8f0' : '#4a5568',
      });
      return;
    }

    setIsSyncing(true);
    try {
      await fetch(settings.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipments, timestamp: new Date().toLocaleString() })
      });
      
      setTimeout(() => {
        setIsSyncing(false);
        Swal.fire({
          title: 'Sync Successful!',
          text: 'Shipment data pushed to Cloud Storage.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: settings.theme === 'dark' ? '#1a202c' : '#ffffff',
          color: settings.theme === 'dark' ? '#e2e8f0' : '#4a5568',
        });
      }, 800);
    } catch (error) {
      setIsSyncing(false);
      Swal.fire({ title: 'Sync Failed', icon: 'error' });
    }
  }, [settings.googleSheetUrl, shipments]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard shipments={shipments} transactions={transactions} />;
      case 'reference': return <ReferenceBook refData={refData} setRefData={setRefData} />;
      case 'dist_log': return <DistLog shipments={shipments} setShipments={setShipments} lists={lists} submittedInvoices={submittedInvoices} />;
      case 'trucks': return <TruckInfo trucks={trucks} setTrucks={setTrucks} lists={lists} />;
      case 'cutoff': return <CutoffAnalyzer mappings={cutoffMappings} setMappings={setCutoffMappings} />;
      case 'accounts': return (
        <Accounts 
          transactions={transactions} 
          shipments={shipments} 
          setTransactions={setTransactions} 
          setShipments={setShipments} 
          submittedInvoices={submittedInvoices}
          setSubmittedInvoices={setSubmittedInvoices}
        />
      );
      case 'export_import': return <ExportImport refData={refData} setRefData={setRefData} />;
      case 'business_settings': return <BusinessSettings lists={lists} setLists={setLists} />;
      case 'system_settings': return <SystemSettings settings={settings} setSettings={setSettings} />;
      default: return <Dashboard shipments={shipments} transactions={transactions} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {settings.wallpaper && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none z-0"></div>
      )}
      
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex-shrink-0 flex flex-col h-full text-white shadow-2xl z-50`}
        style={{ backgroundColor: settings.sidebarColor }}
      >
        <div className="p-6 border-b border-white/10 flex flex-col items-center gap-3">
          <div className="relative">
            <img src={settings.adminImg} alt="Admin" className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          {isSidebarOpen && (
            <div className="text-center overflow-hidden w-full">
              <h1 className="font-bold text-sm truncate">{settings.adminName}</h1>
              <p className="text-[10px] text-gray-400">{settings.adminRole}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto custom-scroll p-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<BookOpen size={20} />} label="Reference" active={activeTab === 'reference'} onClick={() => setActiveTab('reference')} isOpen={isSidebarOpen} />
          <NavItem icon={<FileText size={20} />} label="DIST_LOG" active={activeTab === 'dist_log'} onClick={() => setActiveTab('dist_log')} isOpen={isSidebarOpen} />
          <NavItem icon={<Truck size={20} />} label="Truck Info" active={activeTab === 'trucks'} onClick={() => setActiveTab('trucks')} isOpen={isSidebarOpen} />
          <NavItem icon={<Scissors size={20} />} label="H&M Cutoff" active={activeTab === 'cutoff'} onClick={() => setActiveTab('cutoff')} isOpen={isSidebarOpen} />
          <NavItem icon={<Ship size={20} />} label="Export/Import" active={activeTab === 'export_import'} onClick={() => setActiveTab('export_import')} isOpen={isSidebarOpen} />
          <NavItem icon={<Wallet size={20} />} label="Accounts" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} isOpen={isSidebarOpen} />
          <NavItem icon={<BarChart3 size={20} />} label="Business" active={activeTab === 'business_settings'} onClick={() => setActiveTab('business_settings')} isOpen={isSidebarOpen} />
          <NavItem icon={<Settings size={20} />} label="System" active={activeTab === 'system_settings'} onClick={() => setActiveTab('system_settings')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={syncData} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors">
            <CloudRain size={20} className={isSyncing ? 'animate-bounce' : ''} />
            {isSidebarOpen && <span className="text-xs font-bold">Cloud Sync</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-xs font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-transparent overflow-hidden transition-all relative z-10">
        <header className="h-16 flex items-center justify-between px-6 bg-[var(--bg-color)] shadow-sm z-40 opacity-95">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 neu-panel active:neu-inset transition-all">
              <LayoutDashboard size={18} />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 p-1 neu-panel px-3">
              <Clock size={16} className="text-blue-500" />
              <span className="font-mono font-bold text-xs tracking-wider">{currentTime}</span>
            </div>
            <div className="flex items-center gap-1 neu-panel p-1">
              <button onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))} className="p-2">
                {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={syncData} className="p-2">
                <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scroll p-6">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isOpen }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${active ? 'bg-blue-600 shadow-lg text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} {isOpen && <span className="text-xs truncate">{label}</span>}
  </button>
);

export default App;
