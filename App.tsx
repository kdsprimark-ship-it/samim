
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Clock, 
  Settings, 
  LogOut, 
  Truck as TruckIcon, 
  DollarSign, 
  Users, 
  Tag, 
  Briefcase, 
  Layers, 
  Info, 
  Anchor, 
  UserPlus, 
  FileCheck, 
  PlusCircle,
  Maximize2,
  Minimize2,
  Globe,
  ClipboardList,
  Wallet,
  Settings2,
  ShieldCheck,
  UserCircle,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
  Monitor,
  AlertTriangle,
  Cloud,
  CloudOff,
  RefreshCw,
  Scan,
  CheckCircle2,
  DownloadCloud
} from 'lucide-react';
import { 
  Shipment, 
  Transaction, 
  AppSettings, 
  ListData, 
  Shipper, 
  Employee, 
  Buyer, 
  Depot, 
  PriceRate,
  Truck as TruckType,
  UserSession
} from './types';
import { DEFAULT_SETTINGS, DEFAULT_LISTS } from './constants';
import Swal from 'sweetalert2';

// Views
import Dashboard from './views/Dashboard';
import LiveSheet from './views/LiveSheet';
import MasterDataSheet from './views/MasterDataSheet';
import EmployeeEntry from './views/EmployeeEntry';
import BillSubmission from './views/BillSubmission';
import PendingIndent from './views/PendingIndent';
import TruckInfo from './views/TruckInfo';
import ManageShippers from './views/ManageShippers';
import ManageBuyers from './views/ManageBuyers';
import ManageDepots from './views/ManageDepots';
import ManageEmployees from './views/ManageEmployees';
import ManagePrices from './views/ManagePrices';
import ExportImport from './views/ExportImport';
import ExportInfo from './views/ExportInfo';
import AssociationInfo from './views/AssociationInfo';
import AccountInfo from './views/AccountInfo';
import UserManagement from './views/UserManagement';
import Login from './views/Login';
import SpecialAccounts from './views/SpecialAccounts';
import SubAccounts from './views/SubAccounts';
import SystemSettings from './views/SystemSettings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('st_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('st_last_sync'));

  // Data States
  const [shipments, setShipments] = useState<Shipment[]>(() => JSON.parse(localStorage.getItem('st_shipments') || '[]'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('st_transactions') || '[]'));
  const [shippers, setShippers] = useState<Shipper[]>(() => JSON.parse(localStorage.getItem('st_shippers') || '[]'));
  const [employees, setEmployees] = useState<Employee[]>(() => JSON.parse(localStorage.getItem('st_employees') || '[]'));
  const [buyers, setBuyers] = useState<Buyer[]>(() => JSON.parse(localStorage.getItem('st_buyers') || '[]'));
  const [depots, setDepots] = useState<Depot[]>(() => JSON.parse(localStorage.getItem('st_depots_list') || '[]'));
  const [prices, setPrices] = useState<PriceRate[]>(() => JSON.parse(localStorage.getItem('st_prices') || '[]'));
  const [trucks, setTrucks] = useState<TruckType[]>(() => JSON.parse(localStorage.getItem('st_trucks') || '[]'));
  const [lists, setLists] = useState<ListData>(() => JSON.parse(localStorage.getItem('st_lists') || JSON.stringify({ ...DEFAULT_LISTS, subAccounts: ['Main', 'Salary', 'Rent'] })));
  const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('st_settings') || JSON.stringify(DEFAULT_SETTINGS)));
  const [submittedInvoices, setSubmittedInvoices] = useState<string[]>(() => JSON.parse(localStorage.getItem('st_submitted_invoices') || '[]'));

  // REFRESH & CLOUD HANDSHAKE ENGINE
  const performSync = useCallback(async (mode: 'PUSH' | 'PULL' = 'PUSH', silent = false) => {
    if (!settings.googleSheetUrl || settings.googleSheetUrl.length < 10) {
      if (!silent && mode === 'PULL') Swal.fire({ title: 'CLOUD OFFLINE', text: 'Please add your Google Web App URL in Settings.', icon: 'info' });
      return;
    }
    
    setIsSyncing(true);
    try {
      if (mode === 'PUSH') {
        const payload = {
          action: 'push',
          data: { shipments, transactions, shippers, employees, buyers, depots, prices, trucks, lists, settings, submittedInvoices }
        };
        await fetch(settings.googleSheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      } else {
        const response = await fetch(`${settings.googleSheetUrl}?action=pull`);
        const result = await response.json();
        if (result && result.data) {
          const d = result.data;
          if (d.shipments) setShipments(d.shipments);
          if (d.transactions) setTransactions(d.transactions);
          if (d.shippers) setShippers(d.shippers);
          if (d.employees) setEmployees(d.employees);
          if (d.buyers) setBuyers(d.buyers);
          if (d.depots) setDepots(d.depots);
          if (d.prices) setPrices(d.prices);
          if (d.trucks) setTrucks(d.trucks);
          if (d.lists) setLists(d.lists);
          if (d.settings) setSettings(d.settings);
        }
      }
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSynced(now);
      localStorage.setItem('st_last_sync', now);
      if (!silent) Swal.fire({ title: mode === 'PULL' ? 'SYSTEM REFRESHED' : 'CLOUD UPDATED', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } catch (error) {
      console.error('Sync Error:', error);
      if (!silent) Swal.fire({ title: 'SYNC ERROR', text: 'Connection failed.', icon: 'error' });
    } finally {
      setIsSyncing(false);
    }
  }, [settings.googleSheetUrl, shipments, transactions, shippers, employees, buyers, depots, prices, trucks, lists, settings, submittedInvoices]);

  // Initial Full Refresh on Startup
  useEffect(() => {
    if (settings.googleSheetUrl) performSync('PULL', true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to local
  useEffect(() => {
    localStorage.setItem('st_shipments', JSON.stringify(shipments));
    localStorage.setItem('st_transactions', JSON.stringify(transactions));
    localStorage.setItem('st_shippers', JSON.stringify(shippers));
    localStorage.setItem('st_employees', JSON.stringify(employees));
    localStorage.setItem('st_buyers', JSON.stringify(buyers));
    localStorage.setItem('st_depots_list', JSON.stringify(depots));
    localStorage.setItem('st_prices', JSON.stringify(prices));
    localStorage.setItem('st_trucks', JSON.stringify(trucks));
    localStorage.setItem('st_lists', JSON.stringify(lists));
    localStorage.setItem('st_settings', JSON.stringify(settings));
    localStorage.setItem('st_submitted_invoices', JSON.stringify(submittedInvoices));
    if (currentUser) localStorage.setItem('st_session', JSON.stringify(currentUser));
  }, [shipments, transactions, shippers, employees, buyers, depots, prices, trucks, lists, settings, submittedInvoices, currentUser]);

  const handleLogin = (name: string, role: 'Admin' | 'Operator', id: string) => {
    setCurrentUser({ name, role, id });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('st_session');
  };

  if (!currentUser) return <Login employees={employees} onLogin={handleLogin} />;

  const isAdmin = currentUser.role === 'Admin';
  const userShipments = isAdmin ? shipments : shipments.filter(s => s.employeeName === currentUser.name);

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === 'dark' ? 'dark' : ''}`} style={{ fontSize: `${settings.textSize}px`, fontFamily: settings.fontFamily }}>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center brightness-[0.25]" style={{ backgroundImage: `url(${settings.wallpaper})` }}></div>
      
      {/* FULL SIDEBAR RESTORED */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 flex flex-col h-full text-slate-300 shadow-2xl z-50 border-r border-white/5 overflow-hidden`} style={{ background: `linear-gradient(180deg, ${settings.sidebarColor} 0%, #020617 100%)` }}>
        <div className="h-16 flex items-center px-4 border-b border-white/5 bg-black/20 gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg ring-1 ring-white/20">
             {settings.logoUrl ? <img src={settings.logoUrl} className="w-6 h-6 object-contain" alt="Logo" /> : <Globe size={22} className="text-white" />}
          </div>
          {isSidebarOpen && <h1 className="font-black uppercase tracking-tight text-[15px] text-white truncate">{settings.appName}</h1>}
        </div>

        <nav className="flex-1 overflow-y-auto custom-scroll px-3 space-y-5 py-6">
          <Section label="CORE ENGINE" isOpen={isSidebarOpen}>
            <NavItem icon={<LayoutDashboard size={18}/>} label="DASHBOARD HUB" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            {isAdmin && <NavItem icon={<Wallet size={18}/>} label="ACCOUNT MASTER" active={activeTab === 'account_info'} onClick={() => setActiveTab('account_info')} isOpen={isSidebarOpen} radius={settings.boxRadius} />}
            <NavItem icon={<FileText size={18}/>} label="EXPORT LEDGER" active={activeTab === 'live_sheet'} onClick={() => setActiveTab('live_sheet')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            <NavItem icon={<Database size={18}/>} label="MASTER ARCHIVE" active={activeTab === 'master_sheet'} onClick={() => setActiveTab('master_sheet')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
          </Section>

          <Section label="LOGISTICS MGMT" isOpen={isSidebarOpen}>
            <NavItem icon={<UserPlus size={18}/>} label="NEW SHIPMENT" active={activeTab === 'employee_entry'} onClick={() => setActiveTab('employee_entry')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            {isAdmin && <NavItem icon={<FileCheck size={18}/>} label="BILL SETTLEMENT" active={activeTab === 'bill_submission'} onClick={() => setActiveTab('bill_submission')} isOpen={isSidebarOpen} radius={settings.boxRadius} />}
            <NavItem icon={<Clock size={18}/>} label="PENDING INDENTS" active={activeTab === 'pending_indent'} onClick={() => setActiveTab('pending_indent')} isOpen={isSidebarOpen} badge={userShipments.filter(s => (s.totalIndent - s.paid) > 0.01).length} radius={settings.boxRadius} />
            <NavItem icon={<TruckIcon size={18}/>} label="FLEET LOGISTICS" active={activeTab === 'trucks'} onClick={() => setActiveTab('trucks')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
          </Section>

          {isAdmin && (
            <Section label="REGISTRY & CONTROL" isOpen={isSidebarOpen}>
              <NavItem icon={<ShieldCheck size={18}/>} label="USER AUTH SYSTEM" active={activeTab === 'user_mgmt'} onClick={() => setActiveTab('user_mgmt')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<Anchor size={18}/>} label="SHIPPER LIST" active={activeTab === 'manage_shippers'} onClick={() => setActiveTab('manage_shippers')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<Tag size={18}/>} label="BUYER DIRECTORY" active={activeTab === 'manage_buyers'} onClick={() => setActiveTab('manage_buyers')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<Layers size={18}/>} label="DEPOT REGISTRY" active={activeTab === 'manage_depots'} onClick={() => setActiveTab('manage_depots')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<Users size={18}/>} label="OPERATOR MGMT" active={activeTab === 'manage_employees'} onClick={() => setActiveTab('manage_employees')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<DollarSign size={18}/>} label="PRICE RULE ENGINE" active={activeTab === 'manage_prices'} onClick={() => setActiveTab('manage_prices')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
              <NavItem icon={<PlusCircle size={18}/>} label="SUB ACCOUNTS" active={activeTab === 'sub_accounts'} onClick={() => setActiveTab('sub_accounts')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            </Section>
          )}

          <Section label="UTILITY SERVICES" isOpen={isSidebarOpen}>
            {isAdmin && <NavItem icon={<Settings2 size={18}/>} label="SYSTEM CODES" active={activeTab === 'export_import'} onClick={() => setActiveTab('export_import')} isOpen={isSidebarOpen} radius={settings.boxRadius} />}
            <NavItem icon={<Info size={18}/>} label="EXPORT INTELLIGENCE" active={activeTab === 'export_info'} onClick={() => setActiveTab('export_info')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            <NavItem icon={<ClipboardList size={18}/>} label="ASSOCIATION FEE" active={activeTab === 'association_info'} onClick={() => setActiveTab('association_info')} isOpen={isSidebarOpen} radius={settings.boxRadius} />
            {isAdmin && <NavItem icon={<Briefcase size={18}/>} label="FINANCE PRO" active={activeTab === 'finance_pro'} onClick={() => setActiveTab('finance_pro')} isOpen={isSidebarOpen} radius={settings.boxRadius} />}
            {isAdmin && <NavItem icon={<Settings size={18}/>} label="CONFIG SETTINGS" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isOpen={isSidebarOpen} radius={settings.boxRadius} />}
          </Section>
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/40">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white p-3 transition-all font-black text-xs" style={{ borderRadius: settings.boxRadius }}>
            <LogOut size={16}/> {isSidebarOpen && "TERMINATE SESSION"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b border-black/10 flex items-center justify-between px-6 backdrop-blur-md" style={{ backgroundColor: settings.backgroundColor + 'CC' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/5 rounded-lg text-slate-600"><Menu size={20}/></button>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{activeTab.replace('_', ' ')} TERMINAL</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => performSync('PULL')} 
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isSyncing ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span className="text-[9px] font-black uppercase">{isSyncing ? 'Refreshing...' : 'REFRESH UPDATES'}</span>
            </button>
            <div className="bg-white/60 rounded-full px-5 py-1.5 ring-1 ring-white font-mono font-black text-[12px]">{currentTime}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {(() => {
            const commonProps = { swalSize: settings.swalSize };
            switch (activeTab) {
              case 'dashboard': return <Dashboard shipments={userShipments} transactions={transactions} settings={settings} setShipments={setShipments} />;
              case 'account_info': return <AccountInfo transactions={transactions} setTransactions={setTransactions} shipments={shipments} setShipments={setShipments} lists={lists} employees={employees} {...commonProps} />;
              case 'live_sheet': return <LiveSheet shipments={userShipments} setShipments={setShipments} shippers={shippers} buyers={buyers} employees={employees} depots={depots} prices={prices} {...commonProps} />;
              case 'master_sheet': return <MasterDataSheet shipments={userShipments} {...commonProps} />;
              case 'employee_entry': return <EmployeeEntry currentUser={currentUser} setShipments={setShipments} shippers={shippers} buyers={buyers} depots={depots} employees={employees} onComplete={() => setActiveTab('live_sheet')} prices={prices} {...commonProps} />;
              case 'bill_submission': return <BillSubmission shipments={shipments} setShipments={setShipments} submittedInvoices={submittedInvoices} setSubmittedInvoices={setSubmittedInvoices} {...commonProps} />;
              case 'pending_indent': return <PendingIndent shipments={userShipments} setShipments={setShipments} {...commonProps} />;
              case 'trucks': return <TruckInfo trucks={trucks} setTrucks={setTrucks} depots={depots} {...commonProps} />;
              case 'manage_shippers': return <ManageShippers shippers={shippers} setShippers={setShippers} {...commonProps} />;
              case 'manage_buyers': return <ManageBuyers buyers={buyers} setBuyers={setBuyers} {...commonProps} />;
              case 'manage_depots': return <ManageDepots depots={depots} setDepots={setDepots} {...commonProps} />;
              case 'manage_employees': return <ManageEmployees employees={employees} setEmployees={setEmployees} {...commonProps} />;
              case 'manage_prices': return <ManagePrices prices={prices} setPrices={setPrices} {...commonProps} />;
              case 'export_import': return <ExportImport refData={{ countries: [], hsCodes: [], buyers: [], depots: [], forwarders: [] }} setRefData={() => {}} />;
              case 'export_info': return <ExportInfo shipments={userShipments} />;
              case 'association_info': return <AssociationInfo shipments={shipments} setShipments={setShipments} {...commonProps} />;
              case 'finance_pro': return <SpecialAccounts transactions={transactions} setTransactions={setTransactions} lists={lists} {...commonProps} />;
              case 'sub_accounts': return <SubAccounts lists={lists} setLists={setLists} {...commonProps} />;
              case 'user_mgmt': return <UserManagement employees={employees} setEmployees={setEmployees} shipments={shipments} {...commonProps} />;
              case 'settings': return <SystemSettings settings={settings} setSettings={setSettings} onSyncRequest={() => performSync('PUSH', true)} />;
              default: return <Dashboard shipments={userShipments} transactions={transactions} settings={settings} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
};

const Section = ({ label, children, isOpen }: any) => (
  <div className="space-y-1">
    {isOpen && <p className="text-[10px] font-black text-slate-500 mb-2 px-3 tracking-[0.2em]">{label}</p>}
    <div className="space-y-0.5">{children}</div>
  </div>
);

const NavItem = ({ icon, label, active, onClick, isOpen, badge, radius }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 transition-all relative ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} style={{ borderRadius: radius }}>
    <div className="flex-shrink-0">{icon}</div>
    {isOpen && <span className="uppercase tracking-wider font-black text-[10px] flex-1 text-left">{label}</span>}
    {isOpen && badge > 0 && <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold animate-pulse">{badge}</span>}
  </button>
);

export default App;
