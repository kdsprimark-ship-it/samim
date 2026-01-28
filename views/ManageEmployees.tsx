
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Download } from 'lucide-react';
import { Employee } from '../types';
import Swal from 'sweetalert2';

interface ManageEmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  swalSize: number;
}

const ManageEmployees: React.FC<ManageEmployeesProps> = ({ employees, setEmployees, swalSize }) => {
  const [filter, setFilter] = useState('');

  const handleAdd = async () => {
    const { value: f } = await Swal.fire({
      title: 'ADD NEW EMPLOYEE',
      html: `
        <div class="text-left space-y-3 overflow-y-auto max-h-[60vh] p-1">
          <div><label class="text-[10px] font-bold">NAME:</label><input id="e-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">POST/POSITION:</label><input id="e-post" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">MOBILE NO:</label><input id="e-mob" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">JOIN DATE:</label><input id="e-date" type="date" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">SALARY:</label><input id="e-sal" type="number" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">ADDRESS:</label><input id="e-addr" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">GUARDIAN MOBILE:</label><input id="e-guard" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">OPTIONAL:</label><input id="e-opt" class="classic-input w-full h-10"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE EMPLOYEE',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('e-name') as HTMLInputElement).value,
        post: (document.getElementById('e-post') as HTMLInputElement).value,
        mobile: (document.getElementById('e-mob') as HTMLInputElement).value,
        joinDate: (document.getElementById('e-date') as HTMLInputElement).value,
        salary: parseFloat((document.getElementById('e-sal') as HTMLInputElement).value) || 0,
        address: (document.getElementById('e-addr') as HTMLInputElement).value,
        guardianMobile: (document.getElementById('e-guard') as HTMLInputElement).value,
        optional: (document.getElementById('e-opt') as HTMLInputElement).value,
      })
    });

    if (f?.name) {
      setEmployees(prev => [...prev, { ...f, id: Date.now().toString() }]);
    }
  };

  const handleDownload = () => {
    const headers = ["Name", "Post", "Mobile", "Salary", "Address"];
    const rows = employees.map(e => [e.name, e.post, e.mobile, e.salary, e.address]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees_list.csv";
    link.click();
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()) || e.post.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-indigo-900 text-white neon-btn-blue flex items-center gap-2">
          <Plus size={14} /> ADD EMPLOYEE
        </button>
        <button onClick={handleDownload} className="classic-btn flex items-center gap-2">
          <Download size={14} /> DOWNLOAD
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input type="text" placeholder="Search Employees..." value={filter} onChange={e => setFilter(e.target.value)} className="classic-input pl-8 w-64" />
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar !bg-indigo-900"><span>EMPLOYEE MANAGEMENT SYSTEM</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">NAME</th>
                <th className="p-3 border-r border-black/10">POST</th>
                <th className="p-3 border-r border-black/10">MOBILE</th>
                <th className="p-3 border-r border-black/10">JOIN DATE</th>
                <th className="p-3 border-r border-black/10 text-right">SALARY</th>
                <th className="p-3 text-center">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono group">
                  <td className="p-3 border-r border-black/5 font-black uppercase text-blue-900">{e.name}</td>
                  <td className="p-3 border-r border-black/5 font-bold">{e.post}</td>
                  <td className="p-3 border-r border-black/5">{e.mobile}</td>
                  <td className="p-3 border-r border-black/5">{e.joinDate}</td>
                  <td className="p-3 border-r border-black/5 text-right font-black">TK {e.salary.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="neon-btn-blue p-1"><Edit2 size={12}/></button>
                      <button onClick={() => setEmployees(p => p.filter(x => x.id !== e.id))} className="neon-btn-red p-1 text-red-700"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-bold italic text-xs uppercase">No employee records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
