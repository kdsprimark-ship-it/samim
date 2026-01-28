
import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Plane, 
  Hash, 
  Globe, 
  Plus, 
  Search, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ReferenceData } from '../types';

interface ReferenceBookProps {
  refData: ReferenceData;
  setRefData: React.Dispatch<React.SetStateAction<ReferenceData>>;
  swalSize: number;
}

const ReferenceBook: React.FC<ReferenceBookProps> = ({ refData, setRefData, swalSize }) => {
  const [activeTab, setActiveTab] = useState<'depots' | 'buyers' | 'forwarders' | 'hscodes' | 'countries'>('depots');
  const isDark = document.documentElement.classList.contains('dark');

  const handleAddNew = async () => {
    const { value: formValues } = await Swal.fire({
      title: `ADD TO ${activeTab.toUpperCase()} DATABASE`,
      html: `
        <div class="text-left">
          <label class="text-[10px] font-bold block mb-1">ENTRY NAME:</label>
          <input id="swal-input1" class="classic-input w-full h-10" placeholder="Type here...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE TO DB',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => (document.getElementById('swal-input1') as HTMLInputElement)?.value
    });

    if (formValues) {
      setRefData(prev => {
        const newData = { ...prev };
        if (activeTab === 'buyers') newData.buyers.push(formValues);
        // Add logic for other tabs if needed
        return newData;
      });
      Swal.fire({ 
        title: 'DATABASE UPDATED', 
        icon: 'success', 
        width: swalSize,
        customClass: { popup: 'classic-swal' } 
      });
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <div className="flex gap-2">
          {['depots', 'buyers', 'forwarders', 'hscodes', 'countries'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`classic-btn px-4 ${activeTab === tab ? 'bg-blue-800 text-white' : ''}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex-1"></div>
        <button onClick={handleAddNew} className="classic-btn px-6 bg-green-700 text-white flex items-center gap-2">
          <Plus size={14} /> NEW ENTRY
        </button>
      </div>

      <div className="classic-window min-h-[400px]">
        <div className="classic-title-bar">
          <span>{activeTab.toUpperCase()} DIRECTORY - REFERENCE SYSTEM</span>
        </div>
        <div className="classic-body p-8">
          {activeTab === 'buyers' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {refData.buyers.map(b => (
                <div key={b} className="p-3 border border-black/10 bg-white font-bold text-[11px] uppercase flex justify-between items-center hover:bg-gray-50">
                  <span>{b}</span>
                  <div className="flex gap-1 opacity-20 hover:opacity-100">
                    <Edit2 size={10} className="cursor-pointer" />
                    <Trash2 size={10} className="text-red-700 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 italic">
               <p className="text-[10px] font-bold uppercase tracking-widest">Database records for {activeTab} shown here</p>
            </div>
          )}
        </div>
        <div className="classic-footer text-[9px] font-bold">
           <span>REF-DB V1.0</span>
           <span>SECURITY: RESTRICTED ACCESS</span>
        </div>
      </div>
    </div>
  );
};

export default ReferenceBook;
