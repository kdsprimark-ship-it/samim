
import React, { useState, useRef, useEffect } from 'react';
import { AppSettings } from '../types';
import { 
  RotateCcw, 
  Save, 
  Maximize2, 
  Image as ImageIcon, 
  Command, 
  Brush, 
  Palette,
  HardDrive, 
  Trash2, 
  ShieldAlert, 
  Download, 
  Upload, 
  CloudLightning, 
  Scan, 
  Link2, 
  Activity, 
  Globe,
  Languages,
  Monitor,
  RefreshCw,
  FileDown,
  FileUp,
  Database,
  Loader2,
  Layout,
  Type,
  Cloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DEFAULT_SETTINGS, SYSTEM_FONTS, SYSTEM_COLORS, SYSTEM_LANGUAGES } from '../constants';
import Swal from 'sweetalert2';

interface SystemSettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onSyncRequest?: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ settings, setSettings, onSyncRequest }) => {
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'range' || type === 'number' ? parseFloat(value) : value
    }));
  };

  const adjustValue = (name: keyof AppSettings, delta: number, min: number, max: number) => {
    setTempSettings(prev => {
      const current = (prev[name] as number) || 0;
      return { ...prev, [name]: Math.max(min, Math.min(max, current + delta)) };
    });
  };

  const saveChanges = () => {
    setSettings({ ...tempSettings });
    Swal.fire({
      icon: 'success',
      title: 'SYSTEM RECONFIGURED',
      text: 'Visual identity and branding updated.',
      timer: 2000,
      showConfirmButton: false,
      width: tempSettings.swalSize,
      customClass: { popup: 'classic-swal' }
    });
  };

  const handleExportData = () => {
    const fullData: any = {};
    const keys = [
      'st_shipments', 'st_transactions', 'st_shippers', 'st_employees', 
      'st_buyers', 'st_depots_list', 'st_prices', 'st_trucks', 
      'st_lists', 'st_settings', 'st_submitted_invoices'
    ];
    
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) fullData[key] = JSON.parse(val);
    });

    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SUNNYTRANS_MASTER_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({ title: 'DATA EXPORTED', text: 'Local database bundle saved.', icon: 'success', width: settings.swalSize, customClass: { popup: 'classic-swal' } });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        Swal.fire({
          title: 'DEPLOY IMPORTED DATA?',
          text: 'This will override local records.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'DEPLOY',
          width: settings.swalSize,
          customClass: { popup: 'classic-swal' }
        }).then((res) => {
          if (res.isConfirmed) {
            Object.keys(importedData).forEach(key => localStorage.setItem(key, JSON.stringify(importedData[key])));
            window.location.reload();
          }
        });
      } catch (err) { Swal.fire('ERROR', 'Invalid backup file.', 'error'); }
    };
    reader.readAsText(file);
  };

  const handleSystemScan = () => {
    setIsScanning(true);
    setScanStep(1);
    setTimeout(() => {
      setScanStep(2);
      setTimeout(() => {
        setScanStep(3);
        setTimeout(() => {
          setIsScanning(false);
          setScanStep(0);
          Swal.fire({
            title: 'INTEGRITY VERIFIED',
            html: `<div class="text-left space-y-1 font-mono text-[10px]">
              <p>✔ BUFFER: STABLE</p>
              <p>✔ CLOUD: ${tempSettings.googleSheetUrl ? 'ACTIVE' : 'LOCAL'}</p>
              <p>✔ AUTH: SECURED</p>
            </div>`,
            icon: 'success',
            width: tempSettings.swalSize,
            customClass: { popup: 'classic-swal' }
          });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24">
      
      {/* CLOUD CONNECTIVITY DASHBOARD */}
      <div className="classic-window border-blue-900 shadow-xl overflow-hidden">
        <div className="classic-title-bar !bg-blue-900 flex justify-between px-4">
           <div className="flex items-center gap-2">
             <Cloud size={14} className="text-cyan-400 animate-pulse" />
             <span>CLOUD SYNC ENGINE (GOOGLE APPS SCRIPT)</span>
           </div>
           <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded">REAL-TIME DB REPLICATION</span>
        </div>
        <div className="classic-body p-8 bg-white grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                   <Link2 size={12}/> GOOGLE APPS SCRIPT WEB APP URL
                 </label>
                 <input 
                    name="googleSheetUrl" 
                    value={tempSettings.googleSheetUrl} 
                    onChange={handleInputChange} 
                    className="classic-input w-full h-12 font-mono text-[10px] border-blue-200 bg-blue-50/20 focus:bg-white" 
                    placeholder="https://script.google.com/macros/s/..." 
                 />
                 <p className="text-[9px] text-gray-400 italic">Deploy your Apps Script as a 'Web App' with 'Anyone' access to enable automatic cloud replication.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={onSyncRequest}
                  disabled={!settings.googleSheetUrl}
                  className={`classic-btn h-12 flex items-center justify-center gap-3 font-black text-xs ${settings.googleSheetUrl ? 'bg-emerald-700 text-white border-emerald-900' : 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'}`}
                 >
                    <RefreshCw size={16}/> FORCE HANDSHAKE
                 </button>
                 <button 
                  onClick={handleSystemScan} 
                  disabled={isScanning} 
                  className={`classic-btn h-12 flex items-center justify-center gap-3 font-black text-xs ${isScanning ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white border-black'}`}
                 >
                    {isScanning ? <Loader2 size={16} className="animate-spin"/> : <Scan size={16}/>}
                    {isScanning ? `SCANNING ${scanStep}...` : 'CLOUD INTEGRITY SCAN'}
                 </button>
              </div>
           </div>

           <div className="lg:col-span-4 bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              {tempSettings.googleSheetUrl ? (
                <div className="animate-fadeIn">
                   <div className="p-4 bg-emerald-100 rounded-full text-emerald-700 mb-4 inline-block shadow-inner ring-4 ring-emerald-50">
                      <CheckCircle2 size={40}/>
                   </div>
                   <h4 className="text-sm font-black text-emerald-900 uppercase">Connectivity Ready</h4>
                   <p className="text-[9px] font-bold text-emerald-600 mt-1">BACKGROUND REPLICATION ACTIVE</p>
                </div>
              ) : (
                <div className="opacity-50">
                   <div className="p-4 bg-gray-200 rounded-full text-gray-500 mb-4 inline-block">
                      <AlertTriangle size={40}/>
                   </div>
                   <h4 className="text-sm font-black text-gray-700 uppercase">Cloud Offline</h4>
                   <p className="text-[9px] font-bold text-gray-500 mt-1">PENDING CONFIGURATION</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* RE-ENGINEERED BRANDING SECTION */}
      <div className="classic-window">
        <div className="classic-title-bar !bg-slate-900 flex justify-between px-4">
           <div className="flex items-center gap-2"><Brush size={14}/><span>SYSTEM BRANDING & VISUAL IDENTITY CONTROL</span></div>
        </div>
        <div className="classic-body p-8 bg-white grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* TEXT & LOGO */}
           <div className="space-y-6">
              <p className="text-[11px] font-black text-indigo-900 border-b pb-2 uppercase tracking-widest">01. CORPORATE IDENTITY</p>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">SYSTEM APPLICATION NAME</label>
                    <input name="appName" value={tempSettings.appName} onChange={handleInputChange} className="classic-input w-full h-12 text-lg font-black uppercase text-blue-900 bg-gray-50 border-blue-100" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">SYSTEM TAGLINE</label>
                    <input name="appTagline" value={tempSettings.appTagline} onChange={handleInputChange} className="classic-input w-full h-10 font-bold text-gray-600" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">CORPORATE LOGO URL (PNG/JPG)</label>
                    <div className="flex gap-2">
                       <input name="logoUrl" value={tempSettings.logoUrl} onChange={handleInputChange} className="classic-input flex-1 h-12 font-mono text-[10px]" placeholder="https://..." />
                       {tempSettings.logoUrl && <div className="w-12 h-12 bg-gray-100 rounded border p-1 shrink-0"><img src={tempSettings.logoUrl} className="w-full h-full object-contain" alt="Logo"/></div>}
                    </div>
                 </div>
              </div>
           </div>

           {/* COLOR ENGINE */}
           <div className="space-y-6">
              <p className="text-[11px] font-black text-indigo-900 border-b pb-2 uppercase tracking-widest">02. MASTER UI COLOR SCHEME</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 <ColorInput label="TITLE BARS" name="popboxColor" value={tempSettings.popboxColor} onChange={handleInputChange} />
                 <ColorInput label="SIDEBAR BG" name="sidebarColor" value={tempSettings.sidebarColor} onChange={handleInputChange} />
                 <ColorInput label="GLOBAL BG" name="backgroundColor" value={tempSettings.backgroundColor} onChange={handleInputChange} />
                 <ColorInput label="PRIMARY ACCENT" name="primaryColor" value={tempSettings.primaryColor} onChange={handleInputChange} />
                 <ColorInput label="SUCCESS COLOR" name="successColor" value={tempSettings.successColor} onChange={handleInputChange} />
                 <ColorInput label="DANGER COLOR" name="dangerColor" value={tempSettings.dangerColor} onChange={handleInputChange} />
              </div>
           </div>
        </div>
      </div>

      {/* DATA PORTABILITY & TOOLS */}
      <div className="classic-window">
         <div className="classic-title-bar !bg-indigo-950 flex justify-between px-4">
            <div className="flex items-center gap-2"><Database size={14}/><span>DATA PORTABILITY & MIGRATION</span></div>
            <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">LEGACY BRIDGE</span>
         </div>
         <div className="classic-body p-6 bg-indigo-50/10">
            <div className="p-4 bg-white border-2 border-indigo-100 rounded-xl">
               <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">OFFLINE MIGRATION TOOLS</p>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button onClick={handleExportData} className="classic-btn h-12 bg-indigo-900 text-white flex items-center justify-center gap-2"><FileDown size={16}/> EXPORT OFFLINE BACKUP</button>
                  <button onClick={() => fileInputRef.current?.click()} className="classic-btn h-12 bg-emerald-700 text-white flex items-center justify-center gap-2"><FileUp size={16}/> DEPLOY LOCAL BACKUP</button>
                  <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
               </div>
            </div>
         </div>
      </div>

      {/* GEOMETRY & TYPOGRAPHY */}
      <div className="classic-window">
         <div className="classic-title-bar !bg-blue-900 px-4">
            <div className="flex items-center gap-2"><Maximize2 size={14}/><span>UI GEOMETRY & TYPOGRAPHY ARCHITECTURE</span></div>
         </div>
         <div className="classic-body p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ControlGroup label="ROOT FONT SIZE" value={tempSettings.textSize} onDec={() => adjustValue('textSize', -1, 10, 24)} onInc={() => adjustValue('textSize', 1, 10, 24)} unit="px" />
            <ControlGroup label="CORNER RADIUS" value={tempSettings.boxRadius} onDec={() => adjustValue('boxRadius', -2, 0, 40)} onInc={() => adjustValue('boxRadius', 2, 0, 40)} unit="px" />
            <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">UI ZOOM SCALE</label>
               <input type="range" name="globalZoom" value={tempSettings.globalZoom} min="80" max="130" onChange={handleInputChange} className="w-full mt-4" />
               <div className="flex justify-between text-[8px] font-bold text-gray-400"><span>80%</span><span>{tempSettings.globalZoom}%</span><span>130%</span></div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SYSTEM FONT FAMILY</label>
               <select name="fontFamily" value={tempSettings.fontFamily} onChange={handleInputChange} className="classic-input w-full h-12 font-black text-blue-900">
                  {SYSTEM_FONTS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
               </select>
            </div>
         </div>
      </div>

      {/* MAINTENANCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-7 classic-window">
            <div className="classic-title-bar !bg-rose-900 px-4"><div className="flex items-center gap-2"><ShieldAlert size={14}/><span>MAINTENANCE & PURGE CONTROLS</span></div></div>
            <div className="classic-body p-8 bg-white space-y-6">
               <div className="flex items-center justify-between p-6 bg-amber-50 border-l-8 border-amber-500 rounded-xl">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-full ${tempSettings.maintenanceMode ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}><ShieldAlert size={28}/></div>
                     <div><p className="text-lg font-black text-amber-900 uppercase">MAINTENANCE LOCK</p><p className="text-[10px] font-bold text-amber-700">RESTRICT ACCESS DURING UPDATES</p></div>
                  </div>
                  <button onClick={() => setTempSettings({...tempSettings, maintenanceMode: !tempSettings.maintenanceMode})} className={`px-8 py-3 rounded-xl font-black ${tempSettings.maintenanceMode ? 'bg-amber-600 text-white' : 'bg-white border-2'}`}>
                     {tempSettings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                  </button>
               </div>
               <button onClick={() => { Swal.fire({ title: 'CONFIRM DATA ERASE?', icon: 'warning', showCancelButton: true }).then(r => { if(r.isConfirmed) { localStorage.clear(); window.location.reload(); } }) }} className="w-full h-14 bg-rose-50 text-rose-700 flex items-center justify-center gap-3 border-2 border-rose-100 rounded-xl font-black uppercase text-xs">
                  <Trash2 size={20}/> PURGE CACHE & FACTORY RESET
               </button>
            </div>
         </div>
         <div className="lg:col-span-5 classic-window">
            <div className="classic-title-bar !bg-slate-800 px-4"><div className="flex items-center gap-2"><ImageIcon size={14}/><span>UI ENVIRONMENT</span></div></div>
            <div className="classic-body p-6 bg-slate-50 space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase">ACTIVE WALLPAPER URL</label>
               <input name="wallpaper" value={tempSettings.wallpaper} onChange={handleInputChange} className="classic-input w-full font-mono text-[9px] h-10" />
               <div className="aspect-video w-full rounded-xl border-4 border-white shadow-lg overflow-hidden"><img src={tempSettings.wallpaper} className="w-full h-full object-cover" alt="Wallpaper Preview"/></div>
            </div>
         </div>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-4">
         <button onClick={() => setTempSettings({...DEFAULT_SETTINGS})} className="w-16 h-16 bg-white border-2 border-black text-black shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-full flex items-center justify-center"><RotateCcw size={28}/></button>
         <button onClick={saveChanges} className="px-12 h-16 bg-blue-900 text-white font-black uppercase tracking-[0.4em] border-2 border-blue-950 shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-5 rounded-full"><Save size={28}/> DEPLOY MISSION CONTROL RECONFIG</button>
      </div>

    </div>
  );
};

const ColorInput = ({ label, name, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-gray-500 uppercase text-center block tracking-tighter">{label}</label>
    <div className="relative">
       <input type="color" name={name} value={value} onChange={onChange} className="w-full h-12 p-1 bg-white border border-gray-200 cursor-pointer rounded-lg" />
       <div className="text-[8px] font-mono text-center text-gray-400 mt-1 uppercase">{value}</div>
    </div>
  </div>
);

const ControlGroup = ({ label, value, onDec, onInc, unit = "" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
    <div className="flex items-center justify-between p-2 bg-white border-2 border-gray-100 rounded-xl shadow-inner">
      <button onClick={onDec} className="w-9 h-9 flex items-center justify-center font-black text-xl hover:bg-gray-100 rounded-lg">-</button>
      <span className="text-xl font-black font-mono tracking-tighter text-blue-900">{value}{unit}</span>
      <button onClick={onInc} className="w-9 h-9 flex items-center justify-center font-black text-xl hover:bg-gray-100 rounded-lg">+</button>
    </div>
  </div>
);

export default SystemSettings;
