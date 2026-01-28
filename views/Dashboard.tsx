
import React, { useMemo, useState } from 'react';
import { 
  Calculator, 
  Package, 
  Database,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Lock,
  Unlock,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { Shipment, Transaction, AppSettings } from '../types';
import Swal from 'sweetalert2';

interface DashboardProps {
  shipments: Shipment[];
  transactions: Transaction[];
  settings: AppSettings;
  setShipments?: React.Dispatch<React.SetStateAction<Shipment[]>>;
  onToggleFullscreen?: () => void;
  isFullScreen?: boolean;
  performSync?: () => void;
  isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  shipments, transactions, settings, setShipments, onToggleFullscreen, isFullScreen, performSync, isSyncing 
}) => {
  const [dashboardMode, setDashboardMode] = useState<'view' | 'edit'>('view');

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthStr = now.toISOString().substring(0, 7);

    const getShipmentBilling = (s: Shipment) => Number(s.totalIndent || 0);

    // Current Month Stats
    const monthShipments = shipments.filter(s => s.date.startsWith(currentMonthStr));
    const monthDocCount = monthShipments.reduce((acc, s) => acc + (Number(s.docQty || 0)), 0);
    const monthTonCount = monthShipments.reduce((acc, s) => acc + (Number(s.tonQty || 0)), 0);
    const monthIndent = monthShipments.reduce((acc, s) => acc + getShipmentBilling(s), 0);
    const monthReceived = monthShipments.reduce((acc, s) => acc + (Number(s.paid || 0)), 0);
    const monthDue = monthIndent - monthReceived;

    // Total Lifetime Stats
    const totalIndent = shipments.reduce((acc, s) => acc + getShipmentBilling(s), 0);
    const totalReceived = shipments.reduce((acc, s) => acc + (Number(s.paid || 0)), 0);
    const totalDue = totalIndent - totalReceived;

    // Today Stats
    const todayShipments = shipments.filter(s => s.date === todayStr);
    const todayIndent = todayShipments.reduce((acc, s) => acc + getShipmentBilling(s), 0);

    return { 
      monthDocCount, 
      monthTonCount,
      monthIndent, 
      monthReceived, 
      monthDue, 
      totalIndent, 
      totalReceived, 
      totalDue, 
      todayIndent,
      todayDate: todayStr
    };
  }, [shipments]);

  const handleQuickSettle = (id: string, invoiceNo: string, due: number) => {
    if (!setShipments) return;
    Swal.fire({
      title: 'QUICK SETTLEMENT',
      text: `Clear outstanding TK ${due.toLocaleString()} for Invoice #${invoiceNo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'SETTLE NOW',
      confirmButtonColor: '#16a34a',
      width: settings.swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(res => {
      if (res.isConfirmed) {
        setShipments(prev => prev.map(s => s.id === id ? { ...s, paid: Number(s.totalIndent) } : s));
        Swal.fire({ title: 'ACCOUNT CLEARED', icon: 'success', timer: 1000, showConfirmButton: false });
      }
    });
  };

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-[#020617] text-white z-[90] p-10 animate-fadeIn overflow-hidden flex flex-col gap-10">
        
        {/* TERMINAL HEADER */}
        <div className="flex justify-between items-end border-b-2 border-white/10 pb-6">
           <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                 <Zap className="text-yellow-400 fill-yellow-400" size={36}/>
                 {settings.appName} TERMINAL <span className="text-blue-500">DISPLAY 3</span>
              </h1>
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.5em]">{settings.appTagline}</p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={performSync} 
                disabled={isSyncing} 
                className={`flex items-center gap-3 px-8 py-3 rounded-xl border-2 transition-all font-black text-xs ${isSyncing ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'REFRESHING DATABASE...' : 'REFRESH UPDATES'}
              </button>
           </div>
        </div>

        {/* DISPLAY 3 COLUMN GRID */}
        <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
           
           {/* COLUMN 1: OPERATIONAL METRICS */}
           <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                 <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest border-b border-white/10 pb-4">Operational Snapshot</p>
                 <div className="grid grid-cols-2 gap-4">
                    <MiniDisplay label="MONTH DOCS" value={stats.monthDocCount} icon={<Layers size={14}/>} />
                    <MiniDisplay label="MONTH TONS" value={stats.monthTonCount} icon={<TrendingUp size={14}/>} />
                 </div>
                 <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Today's Gross Indent</p>
                    <p className="text-4xl font-black font-mono tracking-tighter">TK {stats.todayIndent.toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 p-6 rounded-3xl overflow-hidden flex flex-col">
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Registry Summary</p>
                 <div className="space-y-4 font-mono">
                    <SummaryRow label="Total Invoices" value={shipments.length} />
                    <SummaryRow label="Active Accounts" value={new Set(shipments.map(s => s.employeeName)).size} />
                    <SummaryRow label="Sub Accounts" value={transactions.length} />
                 </div>
              </div>
           </div>

           {/* COLUMN 2: FINANCIAL CORE (THE BIG NUMBERS) */}
           <div className="flex flex-col gap-6">
              <BigPanel label="TOTAL GROSS INDENT" value={stats.totalIndent} color="blue" icon={<Database size={24}/>} />
              <BigPanel label="TOTAL PAID REVENUE" value={stats.totalReceived} color="green" icon={<CheckCircle2 size={24}/>} />
              <BigPanel label="NET OUTSTANDING DUE" value={stats.totalDue} color="red" icon={<AlertCircle size={24}/>} />
           </div>

           {/* COLUMN 3: REAL-TIME EVENT STREAM */}
           <div className="flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5">
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Real-Time Journal Feed</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
                 {shipments.slice(0, 30).map(s => {
                   const due = Number(s.totalIndent) - Number(s.paid || 0);
                   return (
                     <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-blue-400 font-mono">#{s.invoiceNo}</p>
                           <p className="text-[9px] font-bold text-gray-500 uppercase truncate max-w-[150px]">{s.shipper}</p>
                        </div>
                        <div className="text-right">
                           <p className={`text-[12px] font-black font-mono ${due > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>TK {s.totalIndent.toLocaleString()}</p>
                           <p className="text-[8px] text-gray-600 uppercase">{s.date}</p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

        </div>

        {/* TERMINAL FOOTER */}
        <div className="flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
           <div className="flex gap-10">
              <p>Status: <span className="text-emerald-500">System Healthy</span></p>
              <p>Security: <span className="text-blue-500">AES-256 Encrypted</span></p>
              <p>Mode: <span className="text-yellow-500">Terminal Operational</span></p>
           </div>
           <p>Last Sync: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full space-y-6 animate-fadeIn pb-10">
      
      {/* BRAND WATERMARK BACKGROUND */}
      {settings.logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
           <img 
             src={settings.logoUrl} 
             className="w-[450px] md:w-[600px] h-auto object-contain grayscale scale-110" 
             alt="Anniversary Watermark" 
           />
        </div>
      )}

      {/* DASHBOARD HEADER & MODE TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
           <h2 className="text-xl font-black uppercase text-slate-800 tracking-tight flex items-center gap-3">
              <Settings size={20} className="text-blue-900"/> {settings.appName} COMMAND CENTER
           </h2>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{settings.appTagline}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 border border-black/10 rounded-full p-1 shadow-sm backdrop-blur-sm">
           <button 
             onClick={() => setDashboardMode('view')}
             className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black transition-all ${dashboardMode === 'view' ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-500 hover:bg-black/5'}`}
           >
              <Eye size={14}/> VIEW ONLY
           </button>
           <button 
             onClick={() => setDashboardMode('edit')}
             className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black transition-all ${dashboardMode === 'edit' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:bg-black/5'}`}
           >
              <Edit3 size={14}/> OPERATIONAL MODE
           </button>
           <div className="w-[1px] h-6 bg-black/10 mx-1"></div>
           <button 
             onClick={onToggleFullscreen}
             className="p-2 rounded-full transition-all bg-gray-800 text-white hover:bg-gray-700 shadow-md active:scale-90"
             title="Maximize Terminal"
           >
              <Maximize2 size={16}/>
           </button>
        </div>
      </div>

      {/* Primary Stats Panel */}
      <div className="classic-window relative z-10">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={12}/>
            <span>SYSTEM REAL-TIME ANALYTICS</span>
          </div>
          <div className="flex items-center gap-2">
             {dashboardMode === 'edit' ? <Unlock size={10} className="text-green-300"/> : <Lock size={10} className="text-blue-300"/>}
             <span className="text-[8px] font-black uppercase tracking-widest">{dashboardMode} MODE</span>
          </div>
        </div>
        <div className="classic-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <StatBox label={`TODAY (${stats.todayDate})`} value={stats.todayIndent} color="blue" subtitle="Current Day Indent" />
             <StatBox label="TOTAL INDENT" value={stats.totalIndent} color="black" subtitle="Lifetime Gross" />
             <StatBox label="TOTAL RECEIVED" value={stats.totalReceived} color="green" subtitle="Cumulative Collections" />
             <StatBox label="TOTAL DUE" value={stats.totalDue} color="red" subtitle="Net Outstanding" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
         {/* Monthly Operational Status */}
         <div className="classic-window">
           <div className="classic-title-bar">
             <span>MONTHLY PERFORMANCE SUMMARY [{new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}]</span>
           </div>
           <div className="classic-body p-6 grid grid-cols-2 gap-4 bg-white/50">
              <div className="p-4 border border-black/10 bg-white relative group overflow-hidden">
                 {dashboardMode === 'edit' && <ExternalLink size={10} className="absolute top-2 right-2 text-blue-400 opacity-0 group-hover:opacity-100 cursor-pointer"/>}
                 <p className="text-[9px] font-bold text-gray-400 uppercase">MONTH DOC COUNT</p>
                 <p className="text-2xl font-black">{stats.monthDocCount}</p>
              </div>
              <div className="p-4 border border-black/10 bg-white relative group overflow-hidden">
                 {dashboardMode === 'edit' && <ExternalLink size={10} className="absolute top-2 right-2 text-blue-400 opacity-0 group-hover:opacity-100 cursor-pointer"/>}
                 <p className="text-[9px] font-bold text-gray-500 uppercase">MONTH INDENT</p>
                 <p className="text-2xl font-black text-blue-900">TK {stats.monthIndent.toLocaleString()}</p>
              </div>
              <div className="p-4 border border-black/10 bg-white relative group overflow-hidden">
                 {dashboardMode === 'edit' && <ExternalLink size={10} className="absolute top-2 right-2 text-green-400 opacity-0 group-hover:opacity-100 cursor-pointer"/>}
                 <p className="text-[9px] font-bold text-gray-500 uppercase">MONTH RECEIVED</p>
                 <p className="text-2xl font-black text-green-700">TK {stats.monthReceived.toLocaleString()}</p>
              </div>
              <div className="p-4 border border-black/10 bg-white relative group overflow-hidden">
                 {dashboardMode === 'edit' && <ExternalLink size={10} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer"/>}
                 <p className="text-[9px] font-bold text-gray-500 uppercase">MONTH DUE</p>
                 <p className="text-2xl font-black text-red-600">TK {stats.monthDue.toLocaleString()}</p>
              </div>
           </div>
         </div>

         {/* Recent Entries Terminal */}
         <div className="classic-window">
           <div className="classic-title-bar"><span>SYSTEM JOURNAL (LATEST ACTIVITY)</span></div>
           <div className="classic-body overflow-y-auto max-h-[280px] custom-scroll p-2 space-y-1">
              {shipments.slice(0, 10).map(s => {
                const due = Number(s.totalIndent) - Number(s.paid || 0);
                return (
                  <div key={s.id} className="flex justify-between items-center p-3 border-b border-black/5 bg-white text-[10px] font-mono group hover:bg-blue-50">
                     <div className="flex flex-col">
                        <span className="font-bold text-blue-800">#{s.invoiceNo}</span>
                        <span className="truncate max-w-[180px] text-gray-500 uppercase text-[9px]">{s.shipper}</span>
                     </div>
                     <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <p className={`font-black text-xs ${due > 0 ? 'text-red-700' : 'text-green-700'}`}>TK {s.totalIndent.toLocaleString()}</p>
                          <p className="text-[8px] text-gray-400">{s.date}</p>
                        </div>
                        {dashboardMode === 'edit' ? (
                          <div className="flex gap-1">
                             {due > 0.01 && (
                               <button 
                                 onClick={() => handleQuickSettle(s.id, s.invoiceNo, due)}
                                 className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                 title="Quick Settle"
                               >
                                 <CheckCircle2 size={12}/>
                               </button>
                             )}
                             <button className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                <ArrowRight size={12}/>
                             </button>
                          </div>
                        ) : (
                          <ArrowRight size={10} className="text-gray-300 group-hover:text-blue-900"/>
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
         </div>
      </div>
    </div>
  );
};

const MiniDisplay = ({ label, value, icon }: any) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
     <div className="p-2 bg-white/5 rounded-lg text-blue-400">{icon}</div>
     <div>
        <p className="text-[8px] font-black text-gray-500 uppercase">{label}</p>
        <p className="text-xl font-black font-mono tracking-tight">{value}</p>
     </div>
  </div>
);

const SummaryRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
     <span className="text-gray-500 uppercase font-bold">{label}</span>
     <span className="font-black text-white">{value}</span>
  </div>
);

const BigPanel = ({ label, value, color, icon }: any) => {
  const themes: any = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    green: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    red: "border-rose-500/20 bg-rose-500/5 text-rose-400"
  };
  return (
    <div className={`flex-1 p-8 border-2 rounded-[2rem] flex flex-col justify-center relative overflow-hidden ${themes[color]}`}>
       <div className="absolute top-6 right-8 opacity-20">{icon}</div>
       <p className="text-[12px] font-black uppercase tracking-[0.3em] mb-3 opacity-60">{label}</p>
       <div className="flex items-end gap-3">
          <span className="text-2xl font-bold mb-2">TK</span>
          <h2 className="text-7xl font-black font-mono tracking-tighter drop-shadow-2xl">
            {value.toLocaleString()}
          </h2>
       </div>
    </div>
  );
};

const StatBox = ({ label, value, color, subtitle }: any) => {
  const textColors: any = { blue: "text-blue-800", green: "text-green-800", red: "text-red-800", black: "text-black" };
  return (
    <div className="border border-black/10 bg-white p-4 shadow-inner relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-1 h-full ${color === 'blue' ? 'bg-blue-600' : color === 'green' ? 'bg-green-600' : color === 'red' ? 'bg-red-600' : 'bg-black'}`}></div>
      <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">{label}</p>
      <h3 className={`text-2xl font-black font-mono tracking-tighter ${textColors[color]}`}>TK {value.toLocaleString()}</h3>
      {subtitle && <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase opacity-60 group-hover:opacity-100 transition-opacity">{subtitle}</p>}
    </div>
  );
};

export default Dashboard;
