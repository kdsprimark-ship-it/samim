
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
}

const ReferenceBook: React.FC<ReferenceBookProps> = ({ refData, setRefData }) => {
  const [activeTab, setActiveTab] = useState<'depots' | 'buyers' | 'forwarders' | 'hscodes' | 'countries'>('depots');
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

  const handleAddNew = async () => {
    let title = "Add New Entry";
    let html = "";
    
    if (activeTab === 'depots') {
      title = "Add New CTG Depot";
      html = `
        <input id="swal-input1" class="swal2-input" placeholder="Depot Name">
        <input id="swal-input2" class="swal2-input" placeholder="Codes (e.g. VERTEX, OCL)">
      `;
    } else if (activeTab === 'forwarders') {
      title = "Add Forwarder";
      html = `
        <input id="swal-input1" class="swal2-input" placeholder="Forwarder Name">
        <input id="swal-input2" class="swal2-input" placeholder="AIN No">
        <input id="swal-input3" class="swal2-input" placeholder="Short Code">
      `;
    } else {
      title = `Add New ${activeTab.slice(0, -1)}`;
      html = `<input id="swal-input1" class="swal2-input" placeholder="Entry Name">`;
    }

    const { value: formValues } = await Swal.fire({
      title: title,
      html: html,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
      preConfirm: () => {
        const i1 = (document.getElementById('swal-input1') as HTMLInputElement)?.value;
        const i2 = (document.getElementById('swal-input2') as HTMLInputElement)?.value;
        const i3 = (document.getElementById('swal-input3') as HTMLInputElement)?.value;
        return [i1, i2, i3];
      }
    });

    if (formValues) {
      const [v1, v2, v3] = formValues;
      if (!v1) return;

      setRefData(prev => {
        const newData = { ...prev };
        if (activeTab === 'depots') newData.depots.push({ name: v1, code: v2 });
        if (activeTab === 'forwarders') newData.forwarders.push({ name: v1, ain: v2, code: v3 });
        if (activeTab === 'buyers') newData.buyers.push(v1);
        if (activeTab === 'countries') newData.countries.push({ name: v1, code: v2 || 'XX' });
        return newData;
      });

      Swal.fire({
        title: 'Success!',
        text: 'Data added to Reference Book.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'depots':
        return (
          <div className="animate-fadeIn">
            <Table 
              data={refData.depots} 
              columns={['Depot Name', 'Codes / Alias']} 
              renderRow={(item: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-800">
                  <td className="p-4 font-bold text-blue-600">{item.name}</td>
                  <td className="p-4 font-mono text-xs">{item.code}</td>
                </tr>
              )}
            />
          </div>
        );
      case 'buyers':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fadeIn">
            {refData.buyers.map((buyer, idx) => (
              <div key={idx} className="neu-panel p-4 flex items-center justify-center text-center font-bold text-xs text-pink-600 border border-pink-100 dark:border-pink-900/30">
                {buyer}
              </div>
            ))}
          </div>
        );
      case 'forwarders':
        return (
          <div className="animate-fadeIn">
            <Table 
              data={refData.forwarders} 
              columns={['Forwarder Name', 'AIN (CTG)', 'Short Code']} 
              renderRow={(item: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-800">
                  <td className="p-4 font-bold">{item.name}</td>
                  <td className="p-4 text-green-600 font-mono font-bold">{item.ain}</td>
                  <td className="p-4 text-xs">{item.code}</td>
                </tr>
              )}
            />
          </div>
        );
      case 'hscodes':
        return (
          <div className="animate-fadeIn">
            <Table 
              data={refData.hsCodes} 
              columns={['HS Code', 'Description', 'Type']} 
              renderRow={(item: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-800">
                  <td className="p-4 font-bold font-mono text-yellow-600">{item.code}</td>
                  <td className="p-4">{item.desc}</td>
                  <td className="p-4 text-xs opacity-60">{item.type}</td>
                </tr>
              )}
            />
          </div>
        );
      case 'countries':
        return (
          <div className="animate-fadeIn">
             <Table 
              data={refData.countries} 
              columns={['Country Name', 'Code']} 
              renderRow={(item: any, idx: number) => (
                <tr key={idx} className="border-b dark:border-gray-800">
                  <td className="p-4 font-bold">{item.name}</td>
                  <td className="p-4 font-mono text-cyan-600">{item.code}</td>
                </tr>
              )}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 custom-scroll">
        <TabButton icon={<Building2 size={18}/>} label="CTG Depots" active={activeTab === 'depots'} onClick={() => setActiveTab('depots')} color="blue" />
        <TabButton icon={<Users size={18}/>} label="Buyers List" active={activeTab === 'buyers'} onClick={() => setActiveTab('buyers')} color="pink" />
        <TabButton icon={<Plane size={18}/>} label="Forwarders" active={activeTab === 'forwarders'} onClick={() => setActiveTab('forwarders')} color="green" />
        <TabButton icon={<Hash size={18}/>} label="HS Codes" active={activeTab === 'hscodes'} onClick={() => setActiveTab('hscodes')} color="yellow" />
        <TabButton icon={<Globe size={18}/>} label="Countries" active={activeTab === 'countries'} onClick={() => setActiveTab('countries')} color="cyan" />
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Reference..." 
            className="w-full pl-10 pr-4 py-3 neu-inset bg-transparent border-none rounded-xl text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAddNew} className="btn-neon px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2">
          <Plus size={18} /> ADD NEW
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="neu-panel p-2 min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick, color }: any) => {
  const activeClasses = {
    blue: "bg-blue-600 text-white shadow-lg",
    pink: "bg-pink-600 text-white shadow-lg",
    green: "bg-green-600 text-white shadow-lg",
    yellow: "bg-yellow-600 text-white shadow-lg",
    cyan: "bg-cyan-600 text-white shadow-lg",
  }[color as 'blue'|'pink'|'green'|'yellow'|'cyan'];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
        active ? activeClasses : 'neu-panel text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );
};

const Table = ({ data, columns, renderRow }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
          {columns.map((col: string) => <th key={col} className="p-4">{col}</th>)}
          <th className="p-4 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: any, idx: number) => renderRow(item, idx))}
      </tbody>
    </table>
  </div>
);

export default ReferenceBook;
