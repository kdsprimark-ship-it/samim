
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
  Activity,
  ShieldCheck,
  Server
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
    const todayStr = '2026-01-28'; // Locked to requested user timeline
    const currentMonthStr = '2026-01';

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
      <div className="fixed inset-0 bg-[#020617] text-white z-[90] p-8 animate-fadeIn overflow-hidden flex flex-col gap-8">
        
        {/* TERMINAL HEADER DISPLAY */}
        <div className="flex justify-between items-center bg-white/5 border-b-2 border-blue-500/30 p-6 rounded-t-3xl shadow-[0_0_50px_rgba(37,99,235,0.1)]">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                 <Zap className="text-white fill-white" size={32}/>
              </div>
              <div>
                 <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                    {settings.appName} <span className="text-blue-500">TERMINAL DISPLAY 3</span>
                 </h1>
                 <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.5em]">{settings.appTagline} • OPERATIONAL STREAM</p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-black/40 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-4">
                 <div className="flex flex-col text-right">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">System Health</p>
                    <p className="text-xs font-black text-emerald-500 uppercase">Secure / Online</p>
                 </div>
                 <Server size={20} className="text-emerald-500"/>
              </div>
              <button 
                onClick={performSync} 
                disabled={isSyncing} 
                className={`flex items-center gap-3 px-8 py-3 rounded-xl border-2 transition-all font-black text-xs ${isSyncing ? 'bg-orange-500 text-white animate-pulse border-orange-600' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50'}`}
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'SYNCHRONIZING...' : 'REFRESH LIVE DATA'}
              </button>
           </div>
        </div>

        {/* 3-COLUMN HIGH DENSITY GRID */}
        <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
           
           {/* DISPLAY 1: LOGISTICS MONITOR */}
           <div className="flex flex-col gap-6 animate-fadeInRight" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-8 flex flex-col shadow-2xl">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <p className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">Operational Pulse</p>
                    <Activity size={20} className="text-blue-400 animate-pulse"/>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <MiniTerminalDisplay label="TOTAL MONTH DOCUMENTS" value={stats.monthDocCount} icon={<Layers size={20}/>} color="blue" />
                    <MiniTerminalDisplay label="TOTAL MONTH TONNAGE" value={stats.monthTonCount} icon={<TrendingUp size={20}/>} color="cyan" />
                 </div>
                 <div className="flex-1 p-8 bg-blue-600/10 border-2 border-blue-500/20 rounded-3xl flex flex-col justify-center items-center text-center group hover:bg-blue-600/20 transition-all">
                    <p className="text-[12px] font-black text-blue-400 uppercase mb-3 tracking-[0.3em]">TODAY'S GROSS INDENT</p>
                    <div className="flex items-end gap-3">
                       <span className="text-2xl font-bold text-blue-500 mb-2">TK</span>
                       <p className="text-6xl font-black font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{stats.todayIndent.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-4 shadow-xl">
                 <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14}/> SYSTEM REGISTRY SUMMARY
                 </p>
                 <div className="space-y-4 font-mono">
                    <SummaryRow label="TOTAL MASTER INVOICES" value={shipments.length} />
                    <SummaryRow label="ACTIVE SYSTEM OPERATORS" value={new Set(shipments.map(s => s.employeeName)).size} />
                    <SummaryRow label="FINANCIAL SUB-ACCOUNTS" value={transactions.length} />
                 </div>
              </div>
           </div>

           {/* DISPLAY 2: FINANCIAL CORE (THE BIG PANELS) */}
           <div className="flex flex-col gap-6 animate-fadeInUp">
              <LargeTerminalPanel label="TOTAL SYSTEM GROSS INDENT" value={stats.totalIndent} color="blue" icon={<Database size={32}/>} />
              <LargeTerminalPanel label="TOTAL PAID SYSTEM REVENUE" value={stats.totalReceived} color="green" icon={<CheckCircle2 size={32}/>} />
              <LargeTerminalPanel label="NET OUTSTANDING SYSTEM DUE" value={stats.totalDue} color="red" icon={<AlertCircle size={32}/>} />
           </div>

           {/* DISPLAY 3: LIVE SYSTEM JOURNAL */}
           <div className="flex flex-col bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeInLeft" style={{ animationDelay: '0.2s' }}>
              <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center">
                 <div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Real-Time Audit Journal</p>
                    <p className="text-[9px] text-gray-600 mt-1 font-bold">STREAMING LATEST SYSTEM ACTIVITY</p>
                 </div>
                 <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400">LIVE FEED</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2 bg-black/20">
                 {shipments.slice(0, 40).map((s, idx) => {
                   const due = Number(s.totalIndent) - Number(s.paid || 0);
                   return (
                     <div key={s.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all hover:border-blue-500/30">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">#{s.invoiceNo}</span>
                              <span className="text-[8px] font-bold text-gray-600 uppercase font-mono">SEQ-{40-idx}</span>
                           </div>
                           <p className="text-[10px] font-bold text-gray-300 uppercase truncate max-w-[200px]">{s.shipper}</p>
                        </div>
                        <div className="text-right">
                           <p className={`text-sm font-black font-mono tracking-tighter ${due > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>TK {s.totalIndent.toLocaleString()}</p>
                           <p className="text-[9px] text-gray-600 font-bold uppercase">{s.date}</p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

        </div>

        {/* TERMINAL FOOTER STATUS BAR */}
        <div className="flex justify-between items-center text-[11px] font-black text-gray-600 uppercase tracking-[0.5em] border-t border-white/10 pt-6">
           <div className="flex gap-12">
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span> CONNECTIVITY: SECURE</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span> ENGINE: ERP V6.0 PRO</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></span> MODE: MASTER ADMIN</p>
           </div>
           <div className="flex items-center gap-4">
              <p>SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
              <div className="w-[1px] h-4 bg-white/10"></div>
              <p>TIMESTAMP: {new Date().toLocaleTimeString()}</p>
           </div>
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
             className="p-2 rounded-full transition-all bg-gray-800 text-white hover:bg-gray-700 shadow-md active:scale-90 flex items-center gap-2 px-4"
             title="Maximize Terminal"
           >
              <Maximize2 size={16}/>
              <span className="text-[9px] font-black">TERMINAL</span>
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

const MiniTerminalDisplay = ({ label, value, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
  };
  return (
    <div className={`p-6 rounded-3xl border flex items-center gap-6 shadow-lg ${colors[color]}`}>
       <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
          <p className="text-3xl font-black font-mono tracking-tighter">{value}</p>
       </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-[12px] border-b border-white/5 pb-3 group">
     <span className="text-gray-500 uppercase font-bold group-hover:text-white transition-colors">{label}</span>
     <span className="font-black text-white bg-white/5 px-3 py-1 rounded-lg">{value}</span>
  </div>
);

const LargeTerminalPanel = ({ label, value, color, icon }: any) => {
  const themes: any = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[inset_0_0_50px_rgba(37,99,235,0.05)]",
    green: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[inset_0_0_50px_rgba(16,185,129,0.05)]",
    red: "border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-[inset_0_0_50px_rgba(225,29,72,0.05)]"
  };
  const textColors: any = { blue: "text-blue-500", green: "text-emerald-500", red: "text-rose-500" };
  return (
    <div className={`flex-1 p-10 border-2 rounded-[3rem] flex flex-col justify-center relative overflow-hidden group transition-all hover:scale-[1.01] ${themes[color]}`}>
       <div className={`absolute top-8 right-10 opacity-20 ${textColors[color]}`}>{icon}</div>
       <p className="text-sm font-black uppercase tracking-[0.4em] mb-4 opacity-50">{label}</p>
       <div className="flex items-end gap-4">
          <span className={`text-3xl font-bold mb-3 ${textColors[color]}`}>TK</span>
          <h2 className="text-8xl font-black font-mono tracking-tighter drop-shadow-2xl">
            {value.toLocaleString()}
          </h2>
       </div>
       <div className={`absolute bottom-0 left-0 h-1 bg-current transition-all duration-700 w-0 group-hover:w-full ${textColors[color]}`}></div>
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
