
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
  Minimize2
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
}

const Dashboard: React.FC<DashboardProps> = ({ shipments, transactions, settings, setShipments, onToggleFullscreen, isFullScreen }) => {
  const [dashboardMode, setDashboardMode] = useState<'view' | 'edit'>('view');

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthStr = now.toISOString().substring(0, 7);

    const getShipmentBilling = (s: Shipment) => Number(s.totalIndent || 0);

    // Current Month Stats
    const monthShipments = shipments.filter(s => s.date.startsWith(currentMonthStr));
    const monthDocCount = monthShipments.reduce((acc, s) => acc + (Number(s.docQty || 0)), 0);
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

  return (
    <div className={`relative min-h-full space-y-6 animate-fadeIn pb-10 ${isFullScreen ? 'bg-[#c0c7d1] p-10' : ''}`}>
      
      {/* BRAND WATERMARK BACKGROUND */}
      {settings.logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
           <img 
             src={settings.logoUrl} 
             className={`${isFullScreen ? 'w-[800px]' : 'w-[450px] md:w-[600px]'} h-auto object-contain grayscale scale-110`} 
             alt="Anniversary Watermark" 
           />
        </div>
      )}

      {/* DASHBOARD HEADER & MODE TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className={isFullScreen ? 'bg-white/80 p-4 rounded-2xl shadow-xl' : ''}>
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
             className={`p-2 rounded-full transition-all ${isFullScreen ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
             title={isFullScreen ? "Exit Fullscreen" : "Maximize Terminal"}
           >
              {isFullScreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
           </button>
        </div>
      </div>

      {/* Primary Stats Panel */}
      <div className="classic-window relative z-10">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={12}/>
            <span>SYSTEM REAL-TIME ANALYTICS [{dashboardMode === 'view' ? 'READ-ONLY' : 'INTERACTIVE'}]</span>
          </div>
          <div className="flex items-center gap-2">
             {dashboardMode === 'edit' ? <Unlock size={10} className="text-green-300"/> : <Lock size={10} className="text-blue-300"/>}
             <span className="text-[8px] font-black uppercase tracking-widest">{dashboardMode} MODE</span>
          </div>
        </div>
        <div className="classic-body p-6">
          <div className={`grid grid-cols-1 ${isFullScreen ? 'md:grid-cols-4 lg:grid-cols-4' : 'md:grid-cols-4'} gap-4`}>
             <StatBox label={`TODAY (${stats.todayDate})`} value={stats.todayIndent} color="blue" subtitle="Current Day Indent" />
             <StatBox label="TOTAL INDENT" value={stats.totalIndent} color="black" subtitle="Lifetime Gross" />
             <StatBox label="TOTAL RECEIVED" value={stats.totalReceived} color="green" subtitle="Cumulative Collections" />
             <StatBox label="TOTAL DUE" value={stats.totalDue} color="red" subtitle="Net Outstanding" />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isFullScreen ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 relative z-10`}>
         {/* Monthly Operational Status */}
         <div className={`classic-window ${isFullScreen ? 'lg:col-span-1' : ''}`}>
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
         <div className={`classic-window ${isFullScreen ? 'lg:col-span-2' : ''}`}>
           <div className="classic-title-bar"><span>SYSTEM JOURNAL (LATEST ACTIVITY)</span></div>
           <div className={`classic-body overflow-y-auto ${isFullScreen ? 'max-h-[500px]' : 'max-h-[280px]'} custom-scroll p-2 space-y-1`}>
              {shipments.slice(0, isFullScreen ? 20 : 10).map(s => {
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
              {shipments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertCircle size={32} strokeWidth={1}/>
                  <p className="italic text-[11px] mt-2 uppercase font-bold">No Records Found</p>
                </div>
              )}
           </div>
           {dashboardMode === 'edit' && (
             <div className="p-2 bg-gray-100 border-t border-black/10 text-center">
                <button className="text-[9px] font-black text-blue-800 uppercase hover:underline">Launch Full Ledger Manager</button>
             </div>
           )}
         </div>
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
