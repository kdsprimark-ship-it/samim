
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Anchor } from 'lucide-react';
import { Shipper } from '../types';
import Swal from 'sweetalert2';

interface ManageShippersProps {
  shippers: Shipper[];
  setShippers: React.Dispatch<React.SetStateAction<Shipper[]>>;
  swalSize: number;
}

const ManageShippers: React.FC<ManageShippersProps> = ({ shippers, setShippers, swalSize }) => {
  const [filter, setFilter] = useState('');

  const handleAdd = async () => {
    const { value: f } = await Swal.fire({
      title: 'ADD NEW SHIPPER',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">SHIPPER NAME:</label><input id="s-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">COMMERCIAL NAME:</label><input id="s-comm" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">MOBILE NO:</label><input id="s-mob" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">ADDRESS:</label><input id="s-addr" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">DETAILS:</label><textarea id="s-det" class="classic-input w-full h-20"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE SHIPPER',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('s-name') as HTMLInputElement).value,
        commercialName: (document.getElementById('s-comm') as HTMLInputElement).value,
        mobile: (document.getElementById('s-mob') as HTMLInputElement).value,
        address: (document.getElementById('s-addr') as HTMLInputElement).value,
        details: (document.getElementById('s-det') as HTMLTextAreaElement).value,
      })
    });

    if (f?.name) {
      setShippers(prev => [...prev, { ...f, id: Date.now().toString() }]);
    }
  };

  const filtered = shippers.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-blue-900 text-white neon-btn-blue flex items-center gap-2">
          <Plus size={14} /> ADD SHIPPER
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input type="text" placeholder="Search Shippers..." value={filter} onChange={e => setFilter(e.target.value)} className="classic-input pl-8 w-64" />
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar"><span>SHIPPER REGISTRY</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">NAME</th>
                <th className="p-3 border-r border-black/10">COMMERCIAL</th>
                <th className="p-3 border-r border-black/10">MOBILE</th>
                <th className="p-3 border-r border-black/10">ADDRESS</th>
                <th className="p-3 text-center">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono group">
                  <td className="p-3 border-r border-black/5 font-black uppercase text-blue-900">{s.name}</td>
                  <td className="p-3 border-r border-black/5 uppercase">{s.commercialName}</td>
                  <td className="p-3 border-r border-black/5">{s.mobile}</td>
                  <td className="p-3 border-r border-black/5 truncate max-w-[150px]">{s.address}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="neon-btn-blue p-1"><Edit2 size={12}/></button>
                      <button onClick={() => setShippers(prev => prev.filter(x => x.id !== s.id))} className="neon-btn-red p-1 text-red-700"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold italic text-xs uppercase">No shippers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageShippers;
