
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { User, Monitor, RotateCcw, Save, Image as ImageIcon, Search, Database } from 'lucide-react';
import { DEFAULT_SETTINGS, SYSTEM_WALLPAPERS } from '../constants';
import Swal from 'sweetalert2';

interface SystemSettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ settings, setSettings }) => {
  const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });
  const [wallSearch, setWallSearch] = useState('');
  const isDark = settings.theme === 'dark';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: type === 'range' || type === 'number' ? parseFloat(value) : value
    }));
  };

  const saveChanges = () => {
    setSettings({ ...tempSettings });
    Swal.fire({
      icon: 'success',
      title: 'Settings Saved',
      timer: 1500,
      showConfirmButton: false,
      background: isDark ? '#1a202c' : '#ffffff',
    });
  };

  const filteredWalls = SYSTEM_WALLPAPERS.filter(w => 
    w.title.toLowerCase().includes(wallSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fadeIn space-y-8">
      <div className="neu-panel p-8 space-y-8">
        <h2 className="text-2xl font-black text-blue-500 flex items-center gap-2">
          <Database size={28} /> Cloud Sync Setup
        </h2>
        <div className="p-6 neu-inset rounded-3xl bg-blue-500/5">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2">Google Apps Script Web App URL</label>
          <input 
            name="googleSheetUrl"
            value={tempSettings.googleSheetUrl}
            onChange={handleInputChange}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full mt-2 p-4 neu-panel bg-transparent outline-none border-none text-sm font-mono"
          />
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

        <h2 className="text-2xl font-black text-purple-500 flex items-center gap-2">
          <User size={28} /> Admin Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomInput label="Admin Name" name="adminName" value={tempSettings.adminName} onChange={handleInputChange} />
          <CustomInput label="Role Title" name="adminRole" value={tempSettings.adminRole} onChange={handleInputChange} />
          <CustomInput label="Profile Image URL" name="adminImg" value={tempSettings.adminImg} onChange={handleInputChange} />
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

        <h2 className="text-2xl font-black text-pink-500 flex items-center gap-2">
          <ImageIcon size={28} /> System Wallpaper
        </h2>
        <div className="space-y-4">
          <input 
            placeholder="Search wallpapers..." 
            className="w-full p-4 neu-inset bg-transparent outline-none border-none rounded-2xl text-xs"
            value={wallSearch}
            onChange={(e) => setWallSearch(e.target.value)}
          />
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-h-48 overflow-y-auto custom-scroll p-2 neu-inset rounded-3xl">
            {filteredWalls.map(wall => (
              <div 
                key={wall.id}
                onClick={() => setTempSettings(prev => ({ ...prev, wallpaper: wall.url }))}
                className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 ${tempSettings.wallpaper === wall.url ? 'border-pink-500 scale-95' : 'border-transparent'}`}
              >
                <img src={wall.thumb} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-8">
          <button onClick={saveChanges} className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2">
            <Save size={20} /> SAVE ALL CHANGES
          </button>
          <button onClick={() => setTempSettings({ ...DEFAULT_SETTINGS })} className="w-20 py-4 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomInput = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{label}</label>
    <input className="w-full p-4 neu-inset bg-transparent border-none rounded-2xl text-sm outline-none" {...props} />
  </div>
);

export default SystemSettings;
