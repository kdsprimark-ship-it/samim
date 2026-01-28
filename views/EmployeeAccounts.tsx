
import React, { useMemo, useState } from 'react';
import { Users, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Shipment } from '../types';

interface EmployeeAccountsProps {
  shipments: Shipment[];
}

const EmployeeAccounts: React.FC<EmployeeAccountsProps> = ({ shipments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('due');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const employeeData = useMemo(() => {
    const groups: { [name: string]: any } = {};
    shipments.forEach(s => {
      const name = s.employeeName || 'Unknown Operator';
      if (!groups[name]) {
        groups[name] = { name, totalIndent: 0, paid: 0, due: 0, count: 0 };
      }
      groups[name].totalIndent += Number(s.totalIndent || 0);
      groups[name].paid += Number(s.paid || 0);
      groups[name].count++;
    });

    Object.keys(groups).forEach(k => {
      groups[k].due = groups[k].totalIndent - groups[k].paid;
    });

    let results = Object.values(groups).filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Sort logic
    results.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return results;
  }, [shipments, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-6xl mx-auto">
      <div className="classic-info-bar rounded">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase">
          <Users size={16} /> EMPLOYEE PERFORMANCE & FINANCIAL LEDGER
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="classic-input pl-8 w-60 h-10" 
              placeholder="Filter by Name..." 
            />
          </div>
          <button className="classic-btn flex items-center gap-2 px-4">
            <Filter size={12}/> ALL FILTERS
          </button>
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar"><span>EMPLOYEE ACCOUNT AGGREGATES [ACTIVE OPERATORS: {employeeData.length}]</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-300 text-[10px] font-bold border-b border-black">
                <th className="p-4 border-r border-black/10 cursor-pointer hover:bg-gray-400" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">OPERATOR NAME <ArrowUpDown size={8}/></div>
                </th>
                <th className="p-4 border-r border-black/10 text-center cursor-pointer hover:bg-gray-400" onClick={() => toggleSort('count')}>
                  <div className="flex items-center justify-center gap-2">TASKS <ArrowUpDown size={8}/></div>
                </th>
                <th className="p-4 border-r border-black/10 text-right cursor-pointer hover:bg-gray-400" onClick={() => toggleSort('totalIndent')}>
                  <div className="flex items-center justify-end gap-2">GROSS INDENT <ArrowUpDown size={8}/></div>
                </th>
                <th className="p-4 border-r border-black/10 text-right cursor-pointer hover:bg-gray-400" onClick={() => toggleSort('paid')}>
                  <div className="flex items-center justify-end gap-2">COLLECTED <ArrowUpDown size={8}/></div>
                </th>
                <th className="p-4 text-right cursor-pointer hover:bg-blue-300 bg-red-50" onClick={() => toggleSort('due')}>
                  <div className="flex items-center justify-end gap-2 text-red-800">TOTAL DUE <ArrowUpDown size={8}/></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {employeeData.map(e => (
                <tr key={e.name} className="border-b border-black/5 hover:bg-blue-50 transition-colors text-[11px] font-mono group">
                  <td className="p-4 border-r border-black/5 font-black uppercase text-blue-900 group-hover:scale-[1.01] transition-transform origin-left">{e.name}</td>
                  <td className="p-4 border-r border-black/5 text-center font-bold text-gray-500">{e.count}</td>
                  <td className="p-4 border-r border-black/5 text-right font-black">TK {e.totalIndent.toLocaleString()}</td>
                  <td className="p-4 border-r border-black/5 text-right font-bold text-green-700">TK {e.paid.toLocaleString()}</td>
                  <td className="p-4 text-right font-black text-red-600 bg-red-50/30">TK {e.due.toLocaleString()}</td>
                </tr>
              ))}
              {employeeData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Users size={48} strokeWidth={1} />
                      <p className="mt-4 font-black uppercase text-xs tracking-widest">No Operator Data Loaded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {employeeData.length > 0 && (
              <tfoot className="bg-gray-100 font-black text-[11px] border-t-2 border-black">
                <tr>
                  <td className="p-4 border-r border-black/5 uppercase">SYSTEM TOTALS:</td>
                  <td className="p-4 border-r border-black/5 text-center">{employeeData.reduce((a,b) => a+b.count, 0)}</td>
                  <td className="p-4 border-r border-black/5 text-right font-mono">TK {employeeData.reduce((a,b) => a+b.totalIndent, 0).toLocaleString()}</td>
                  <td className="p-4 border-r border-black/5 text-right font-mono text-green-700">TK {employeeData.reduce((a,b) => a+b.paid, 0).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-red-700 bg-red-100">TK {employeeData.reduce((a,b) => a+b.due, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAccounts;
