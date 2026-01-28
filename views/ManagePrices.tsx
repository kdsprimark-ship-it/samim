
import React from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { PriceRate } from '../types';
import Swal from 'sweetalert2';

interface ManagePricesProps {
  prices: PriceRate[];
  setPrices: React.Dispatch<React.SetStateAction<PriceRate[]>>;
  swalSize: number;
}

const ManagePrices: React.FC<ManagePricesProps> = ({ prices, setPrices, swalSize }) => {
  const handleAdd = async () => {
    const { value: f } = await Swal.fire({
      title: 'ADD PRICE CONDITION',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">CATEGORY:</label>
            <select id="p-cat" class="classic-input w-full h-10 font-bold">
              <option value="DOC">DOC RATE</option>
              <option value="CTN">CTN RATE</option>
              <option value="TON">TON RATE</option>
              <option value="UNLOAD">UNLOAD RATE</option>
              <option value="CON">CON RATE</option>
            </select>
          </div>
          <div><label class="text-[10px] font-bold">CONDITION (e.g. BUYER IS H&M):</label><input id="p-cond" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">RATE (TK):</label><input id="p-rate" type="number" class="classic-input w-full h-10 font-black"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE PRICE',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        category: (document.getElementById('p-cat') as HTMLSelectElement).value as any,
        condition: (document.getElementById('p-cond') as HTMLInputElement).value,
        rate: parseFloat((document.getElementById('p-rate') as HTMLInputElement).value) || 0,
      })
    });

    if (f?.rate) {
      setPrices(prev => [...prev, { ...f, id: Date.now().toString() }]);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-green-800 text-white neon-btn-blue flex items-center gap-2">
          <Plus size={14} /> NEW PRICE RULE
        </button>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar !bg-green-800"><span>PRICE LIST & CONDITION RATES</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">CATEGORY</th>
                <th className="p-3 border-r border-black/10">CONDITION RULE</th>
                <th className="p-3 border-r border-black/10 text-right">RATE (TK)</th>
                <th className="p-3 text-center">CMD</th>
              </tr>
            </thead>
            <tbody>
              {prices.map(p => (
                <tr key={p.id} className="border-b border-black/5 hover:bg-green-50 text-[11px] font-mono group">
                  <td className="p-3 border-r border-black/5 font-black text-blue-900">{p.category}</td>
                  <td className="p-3 border-r border-black/5 uppercase italic text-gray-500">{p.condition || 'STANDARD'}</td>
                  <td className="p-3 border-r border-black/5 text-right font-black">TK {p.rate.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setPrices(prev => prev.filter(x => x.id !== p.id))} className="neon-btn-red p-1 text-red-700"><Trash2 size={12}/></button>
                  </td>
                </tr>
              ))}
              {prices.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic text-xs uppercase">No custom rates configured</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePrices;
