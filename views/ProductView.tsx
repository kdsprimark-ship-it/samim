
import React, { useState } from 'react';
import { Package, Search, Plus, Trash2, Tag } from 'lucide-react';
import { Product, ListData } from '../types';
import Swal from 'sweetalert2';

interface ProductViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  lists: ListData;
  swalSize: number;
}

const ProductView: React.FC<ProductViewProps> = ({ products, setProducts, lists, swalSize }) => {
  const [filter, setFilter] = useState('');

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'NEW PRODUCT/SERVICE ENTRY',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">Product Name:</label><input id="p-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">Category:</label>
            <select id="p-cat" class="classic-input w-full h-10">
              <option value="Export">Export</option>
              <option value="Import">Import</option>
            </select>
          </div>
          <div><label class="text-[10px] font-bold">Shipper Reference:</label>
            <select id="p-shipper" class="classic-input w-full h-10">
              ${lists.shipper.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ADD PRODUCT',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('p-name') as HTMLInputElement).value,
        category: (document.getElementById('p-cat') as HTMLSelectElement).value as any,
        shipperName: (document.getElementById('p-shipper') as HTMLSelectElement).value,
      })
    });

    if (formValues?.name) {
      setProducts(prev => [...prev, { ...formValues, id: Date.now().toString() }]);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn neon-btn-blue flex items-center gap-2 bg-blue-900 text-white">
          <Plus size={14} /> ADD PRODUCT
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search Products..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="classic-input pl-8 w-60"
          />
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar"><span>PRODUCT REPOSITORY</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black border-b border-black">
                <th className="p-3 border-r border-black/10">NAME</th>
                <th className="p-3 border-r border-black/10">CATEGORY</th>
                <th className="p-3 border-r border-black/10">SHIPPER REF</th>
                <th className="p-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono">
                  <td className="p-3 border-r border-black/5 font-black">{p.name}</td>
                  <td className="p-3 border-r border-black/5 uppercase">
                    <span className={`px-2 py-0.5 rounded ${p.category === 'Export' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3 border-r border-black/5 italic">{p.shipperName}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setProducts(x => x.filter(it => it.id !== p.id))} className="neon-btn-red p-1 text-red-700">
                      <Trash2 size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
