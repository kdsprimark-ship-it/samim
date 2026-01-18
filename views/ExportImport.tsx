
import React, { useState } from 'react';
// Added Plus to the lucide-react imports to fix the "Cannot find name 'Plus'" error
import { Ship, Globe2, Anchor, Hash, Search, Trash2, MapPin, Plus } from 'lucide-react';
import { ReferenceData } from '../types';
import Swal from 'sweetalert2';

interface ExportImportProps {
  refData: ReferenceData;
  setRefData: React.Dispatch<React.SetStateAction<ReferenceData>>;
}

const ExportImport: React.FC<ExportImportProps> = ({ refData, setRefData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'ports' | 'hscodes'>('overview');
  const isDark = document.documentElement.classList.contains('dark');

  const handleAddData = async () => {
    const { value: dataType } = await Swal.fire({
      title: 'What data to add?',
      input: 'select',
      inputOptions: {
        'port': 'International Port (LOCODE)',
        'hscode': 'HS Code Tariff'
      },
      inputPlaceholder: 'Select type',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
    });

    if (dataType === 'port') {
      const { value: portValues } = await Swal.fire({
        title: 'Add International Port',
        html: `
          <input id="p-name" class="swal2-input" placeholder="Port Name">
          <input id="p-code" class="swal2-input" placeholder="LOCODE (e.g. BD CGP)">
        `,
        confirmButtonText: 'Add Port',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
        preConfirm: () => {
          const name = (document.getElementById('p-name') as HTMLInputElement).value;
          const code = (document.getElementById('p-code') as HTMLInputElement).value;
          if (!name || !code) return Swal.showValidationMessage('Name and Code are required');
          return { name, code };
        }
      });

      if (portValues) {
        setRefData(prev => ({
          ...prev,
          countries: [...prev.countries, { name: portValues.name, code: portValues.code }]
        }));
        Swal.fire('Added!', 'Port added to database.', 'success');
      }
    } else if (dataType === 'hscode') {
      const { value: hsValues } = await Swal.fire({
        title: 'Add HS Code Tariff',
        html: `
          <input id="h-code" class="swal2-input" placeholder="HS Code">
          <input id="h-desc" class="swal2-input" placeholder="Description">
          <input id="h-type" class="swal2-input" placeholder="Category">
        `,
        confirmButtonText: 'Save HS Code',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
        preConfirm: () => {
          const code = (document.getElementById('h-code') as HTMLInputElement).value;
          const desc = (document.getElementById('h-desc') as HTMLInputElement).value;
          const type = (document.getElementById('h-type') as HTMLInputElement).value;
          if (!code || !desc) return Swal.showValidationMessage('Code and Description are required');
          return { code, desc, type };
        }
      });

      if (hsValues) {
        setRefData(prev => ({
          ...prev,
          hsCodes: [...prev.hsCodes, hsValues]
        }));
        Swal.fire('Added!', 'HS Code added to database.', 'success');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Anchor className="text-cyan-500" />
          <h3 className="text-2xl font-bold">International Ports & Codes</h3>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'overview' ? 'btn-neon text-white' : 'neu-panel'}`}
          >
            Overview
          </button>
           <button 
            onClick={() => setViewMode('ports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'ports' ? 'btn-neon text-white' : 'neu-panel'}`}
          >
            Ports
          </button>
          <button 
            onClick={handleAddData}
            className="btn-neon px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2"
          >
            <Plus size={16} /> ADD DATA
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neu-panel p-6 flex items-center gap-4 bg-cyan-50/50 dark:bg-cyan-900/10 border-l-4 border-cyan-500">
              <Globe2 className="text-cyan-600" size={32} />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Port Records</p>
                <p className="text-2xl font-bold">{refData.countries.length}</p>
              </div>
            </div>
            <div className="neu-panel p-6 flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500">
              <Hash className="text-blue-600" size={32} />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Tariff Codes</p>
                <p className="text-2xl font-bold">{refData.hsCodes.length}</p>
              </div>
            </div>
            <div className="neu-panel p-6 flex items-center gap-4 bg-purple-50/50 dark:bg-purple-900/10 border-l-4 border-purple-500">
              <Ship className="text-purple-600" size={32} />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Forwarders</p>
                <p className="text-2xl font-bold">{refData.forwarders.length}</p>
              </div>
            </div>
          </div>

          <div className="neu-panel p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mx-auto">
              <Anchor size={32} />
            </div>
            <h4 className="text-xl font-bold">Logistics Database Management</h4>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Manage your global shipping data including UN/LOCODEs and HS Codes. 
              Integrated with international standards for error-free documentation.
            </p>
            <div className="flex justify-center gap-3">
               <button 
                onClick={() => setViewMode('ports')}
                className="neu-panel px-8 py-3 rounded-full text-cyan-600 font-bold hover:neu-inset transition-all"
              >
                VIEW PORT DIRECTORY
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="neu-panel overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
             <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-8 pr-4 py-2 neu-inset bg-transparent border-none rounded-xl text-xs outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{viewMode} DATABASE</p>
          </div>
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  <th className="p-4">{viewMode === 'ports' ? 'Port Name' : 'HS Code'}</th>
                  <th className="p-4">{viewMode === 'ports' ? 'LOCODE' : 'Description'}</th>
                  {viewMode === 'hscodes' && <th className="p-4">Category</th>}
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {viewMode === 'ports' ? (
                  refData.countries.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 text-sm">
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4 font-mono text-xs">{p.code}</td>
                      <td className="p-4 text-center">
                        <button className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  refData.hsCodes.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 text-sm">
                      <td className="p-4 font-bold font-mono text-yellow-600">{h.code}</td>
                      <td className="p-4">{h.desc}</td>
                      <td className="p-4 italic opacity-60 text-xs">{h.type}</td>
                      <td className="p-4 text-center">
                        <button className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportImport;
