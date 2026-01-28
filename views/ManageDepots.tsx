
import React from 'react';
import { Plus, Trash2, Database, MapPin } from 'lucide-react';
import { Depot } from '../types';
import Swal from 'sweetalert2';

interface ManageDepotsProps {
  depots: Depot[];
  setDepots: React.Dispatch<React.SetStateAction<Depot[]>>;
  swalSize: number;
}

const ManageDepots: React.FC<ManageDepotsProps> = ({ depots, setDepots, swalSize }) => {
  const handleAdd = async () => {
    const { value: f } = await Swal.fire({
      title: 'ADD NEW DEPOT',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">DEPOT NAME:</label><input id="d-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">DEPOT CODE:</label><input id="d-code" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">DETAILS:</label><input id="d-det" class="classic-input w-full h-10"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE DEPOT',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('d-name') as HTMLInputElement).value,
        code: (document.getElementById('d-code') as HTMLInputElement).value,
        details: (document.getElementById('d-det') as HTMLInputElement).value,
      })
    });

    if (f?.name) {
      setDepots(prev => [...prev, { ...f, id: Date.now().toString() }]);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-gray-800 text-white neon-btn-blue flex items-center gap-2">
          <Plus size={14} /> ADD DEPOT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {depots.map(d => (
          <div key={d.id} className="classic-window group">
            <div className="classic-title-bar !bg-gray-800">
               <div className="flex items-center gap-2"><Database size={12}/> <span>CODE: {d.code}</span></div>
               <button onClick={() => setDepots(p => p.filter(x => x.id !== d.id))} className="text-red-300 hover:text-red-500"><Trash2 size={12}/></button>
            </div>
            <div className="classic-body p-4 bg-white flex items-center gap-3">
               <div className="p-3 bg-gray-100 text-gray-500 rounded-full"><MapPin size={24}/></div>
               <div>
                  <h4 className="font-black text-sm uppercase text-gray-800">{d.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{d.details || 'REGISTRY ACTIVE'}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDepots;
