
import React from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Buyer } from '../types';
import Swal from 'sweetalert2';

interface ManageBuyersProps {
  buyers: Buyer[];
  setBuyers: React.Dispatch<React.SetStateAction<Buyer[]>>;
  swalSize: number;
}

const ManageBuyers: React.FC<ManageBuyersProps> = ({ buyers, setBuyers, swalSize }) => {
  const handleAdd = async () => {
    const { value: f } = await Swal.fire({
      title: 'ADD NEW BUYER',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">BUYER NAME:</label><input id="b-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">DETAILS:</label><input id="b-det" class="classic-input w-full h-10"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE BUYER',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('b-name') as HTMLInputElement).value,
        details: (document.getElementById('b-det') as HTMLInputElement).value,
      })
    });

    if (f?.name) {
      setBuyers(prev => [...prev, { ...f, id: Date.now().toString() }]);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-cyan-900 text-white neon-btn-blue flex items-center gap-2">
          <Plus size={14} /> ADD BUYER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {buyers.map(b => (
          <div key={b.id} className="classic-window group">
            <div className="classic-title-bar !bg-cyan-950">
               <div className="flex items-center gap-2"><Tag size={12}/> <span>PROFILE</span></div>
               <button onClick={() => setBuyers(p => p.filter(x => x.id !== b.id))} className="text-red-300 hover:text-red-500"><Trash2 size={12}/></button>
            </div>
            <div className="classic-body p-4 bg-white text-center">
               <h4 className="font-black text-sm uppercase text-blue-900">{b.name}</h4>
               <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{b.details || 'LOGISTICS CLIENT'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBuyers;
