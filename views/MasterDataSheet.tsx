
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Printer, 
  Download, 
  Filter, 
  FileText, 
  ArrowUpDown,
  ListFilter,
  X,
  Maximize2,
  Package,
  User,
  Calculator,
  Calendar,
  Layers,
  Truck
} from 'lucide-react';
import { Shipment } from '../types';

interface MasterDataSheetProps {
  shipments: Shipment[];
  swalSize: number;
}

const MasterDataSheet: React.FC<MasterDataSheetProps> = ({ shipments, swalSize }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Shipment>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let data = shipments.filter(s => {
      const searchStr = `${s.invoiceNo} ${s.shipper} ${s.buyer} ${s.employeeName} ${s.remarks || ''}`.toLowerCase();
      return searchStr.includes(globalFilter.toLowerCase());
    });

    data.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });

    return data;
  }, [shipments, globalFilter, sortField, sortOrder]);

  const toggleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const headers = ["Date", "Invoice No", "Shipper", "Buyer", "Depot", "Doc Qty", "Unload Qty", "Total Indent", "Paid", "Due", "Employee", "Remarks"];
    const rows = filteredData.map(s => [
      s.date,
      s.invoiceNo,
      `"${s.shipper}"`,
      `"${s.buyer}"`,
      `"${s.depot}"`,
      s.docQty,
      s.unloadQty,
      s.totalIndent,
      s.paid || 0,
      (Number(s.totalIndent || 0) - Number(s.paid || 0)),
      `"${s.employeeName}"`,
      `"${(s.remarks || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SUNNYTRANS_MASTER_SHEET_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-full">
      {/* Search & Action Bar */}
      <div className="classic-window no-print">
        <div className="classic-title-bar !bg-blue-900">
          <div className="flex items-center gap-2">
            <ListFilter size={12}/>
            <span>SYSTEM MASTER DATA CONTROL - GLOBAL FILTERING ENGINE</span>
          </div>
        </div>
        <div className="classic-body p-4 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800" size={18}/>
                <input 
                  type="text"
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className="classic-input w-full pl-10 h-12 font-black text-lg uppercase border-blue-900 tracking-tight"
                  placeholder="GLOBAL SEARCH (INVOICE, SHIPPER, BUYER, STAFF...)"
                />
             </div>
             <div className="flex gap-2 shrink-0">
                <button onClick={handlePrint} className="classic-btn bg-white border-black/20 flex items-center gap-2 h-12 px-6 hover:bg-gray-100">
                   <Printer size={16}/> PRINT
                </button>
                <button onClick={handleDownload} className="classic-btn bg-green-700 text-white flex items-center gap-2 h-12 px-6 border-green-900">
                   <Download size={16}/> EXPORT CSV
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="classic-window h-full">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
            <Database size={12}/>
            <span>MASTER SHIPMENT REPOSITORY [SHOWING: {filteredData.length} RECORDS]</span>
          </div>
          <span className="text-[9px] opacity-70">CLICK ANY ROW FOR DETAILED DOSSIER</span>
        </div>
        <div className="classic-body flex flex-col h-full overflow-hidden">
          <div className="overflow-auto max-h-[70vh] custom-scroll">
            <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
              <thead className="sticky top-0 bg-gray-200 text-[10px] font-black uppercase border-b-2 border-black z-30 shadow-md">
                <tr>
                  <SortableTh label="DATE" field="date" current={sortField} onClick={() => toggleSort('date')}/>
                  <SortableTh label="INVOICE NO" field="invoiceNo" current={sortField} onClick={() => toggleSort('invoiceNo')}/>
                  <SortableTh label="SHIPPER" field="shipper" current={sortField} onClick={() => toggleSort('shipper')}/>
                  <SortableTh label="BUYER" field="buyer" current={sortField} onClick={() => toggleSort('buyer')}/>
                  <SortableTh label="DEPOT" field="depot" current={sortField} onClick={() => toggleSort('depot')}/>
                  <th className="p-3 border-r border-black/10 text-right bg-blue-50">GROSS AMT</th>
                  <th className="p-3 border-r border-black/10 text-right bg-green-50">PAID</th>
                  <th className="p-3 border-r border-black/10 text-right bg-red-50">DUE</th>
                  <SortableTh label="EMPLOYEE" field="employeeName" current={sortField} onClick={() => toggleSort('employeeName')}/>
                  <th className="p-3">REMARKS</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredData.map(s => {
                  const due = Number(s.totalIndent || 0) - Number(s.paid || 0);
                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedShipment(s)}
                      className="border-b border-black/5 hover:bg-blue-50 cursor-pointer text-[11px] font-mono group"
                    >
                      <td className="p-3 border-r border-black/5 whitespace-nowrap">{s.date}</td>
                      <td className="p-3 border-r border-black/5 font-black text-blue-900 uppercase">{s.invoiceNo}</td>
                      <td className="p-3 border-r border-black/5 font-bold text-gray-700 uppercase truncate max-w-[150px]">{s.shipper}</td>
                      <td className="p-3 border-r border-black/5 uppercase font-bold text-gray-500">{s.buyer}</td>
                      <td className="p-3 border-r border-black/5 uppercase font-bold text-gray-500">{s.depot}</td>
                      <td className="p-3 border-r border-black/5 text-right font-black bg-blue-50/20">{s.totalIndent.toLocaleString()}</td>
                      <td className="p-3 border-r border-black/5 text-right font-black text-green-700 bg-green-50/20">{Number(s.paid || 0).toLocaleString()}</td>
                      <td className={`p-3 border-r border-black/5 text-right font-black bg-red-50/20 ${due > 0.01 ? 'text-red-600' : 'text-green-600'}`}>{due.toLocaleString()}</td>
                      <td className="p-3 border-r border-black/5 font-black uppercase text-gray-600">{s.employeeName}</td>
                      <td className="p-3 italic text-[10px] text-gray-400 max-w-[200px] truncate">{s.remarks || '---'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Footer */}
          <div className="classic-footer p-6 bg-gray-100 border-t-2 border-black/30 flex justify-between items-center print:hidden">
            <div className="flex gap-10">
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">FILTERED GROSS INDENT</p>
                  <p className="text-xl font-black font-mono text-blue-900">TK {filteredData.reduce((acc, s) => acc + Number(s.totalIndent || 0), 0).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">FILTERED COLLECTION</p>
                  <p className="text-xl font-black font-mono text-green-700">TK {filteredData.reduce((acc, s) => acc + Number(s.paid || 0), 0).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">FILTERED OUTSTANDING</p>
                  <p className="text-xl font-black font-mono text-red-600">TK {filteredData.reduce((acc, s) => acc + (Number(s.totalIndent || 0) - Number(s.paid || 0)), 0).toLocaleString()}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-blue-900 uppercase">Operational Status</p>
               <div className="flex items-center justify-end gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold">LEDGER ONLINE</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Details Popup */}
      {selectedShipment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 no-print animate-fadeIn">
          <div className="classic-window w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="classic-title-bar !bg-blue-900 py-2">
               <div className="flex items-center gap-2">
                 <Maximize2 size={14}/>
                 <span>SHIPMENT DOSSIER: #{selectedShipment.invoiceNo}</span>
               </div>
               <button onClick={() => setSelectedShipment(null)}><X size={18}/></button>
            </div>
            <div className="classic-body p-8 bg-white space-y-6">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <DetailItem icon={<Calendar size={14}/>} label="SYSTEM DATE" value={selectedShipment.date} />
                     <DetailItem icon={<Package size={14}/>} label="SHIPPER" value={selectedShipment.shipper} />
                     <DetailItem icon={<User size={14}/>} label="BUYER" value={selectedShipment.buyer} />
                     <DetailItem icon={<Truck size={14}/>} label="DEPOT" value={selectedShipment.depot} />
                  </div>
                  <div className="space-y-4">
                     <DetailItem icon={<User size={14}/>} label="OPERATOR" value={selectedShipment.employeeName} />
                     <DetailItem icon={<Layers size={14}/>} label="QUANTITIES" value={`${selectedShipment.docQty} Docs / ${selectedShipment.unloadQty} Unload`} />
                     <DetailItem icon={<FileText size={14}/>} label="REMARKS" value={selectedShipment.remarks || 'NO REMARKS RECORDED'} />
                  </div>
               </div>

               <div className="border-t-2 border-black/10 pt-6">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="p-4 bg-blue-50 border-l-4 border-blue-900 text-center">
                        <p className="text-[9px] font-black text-blue-900 uppercase">GROSS BILL</p>
                        <p className="text-xl font-black font-mono">TK {selectedShipment.totalIndent.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-green-50 border-l-4 border-green-800 text-center">
                        <p className="text-[9px] font-black text-green-800 uppercase">COLLECTED</p>
                        <p className="text-xl font-black font-mono">TK {(selectedShipment.paid || 0).toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-red-50 border-l-4 border-red-800 text-center">
                        <p className="text-[9px] font-black text-red-800 uppercase">DUE BAL</p>
                        <p className="text-xl font-black font-mono">TK {(selectedShipment.totalIndent - (selectedShipment.paid || 0)).toLocaleString()}</p>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => window.print()} className="classic-btn flex-1 py-3 bg-gray-100 flex items-center justify-center gap-2">
                     <Printer size={16}/> PRINT INVOICE SLIP
                  </button>
                  <button onClick={() => setSelectedShipment(null)} className="classic-btn flex-1 py-3 bg-blue-900 text-white font-black border-blue-950">
                     CLOSE DOSSIER
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print, header, aside, .classic-title-bar button, .classic-footer {
            display: none !important;
          }
          .classic-window { border: none !important; box-shadow: none !important; }
          .classic-body { overflow: visible !important; border: 1px solid black !important; }
          table { min-width: 100% !important; border: 1px solid black !important; }
          thead { position: static !important; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: any) => (
  <div className="flex gap-3 items-start border-b border-black/5 pb-2">
    <div className="mt-1 text-blue-900">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold uppercase">{value}</p>
    </div>
  </div>
);

const SortableTh = ({ label, field, current, onClick }: any) => (
  <th className={`p-3 border-r border-black/10 cursor-pointer hover:bg-gray-300 transition-colors ${current === field ? 'bg-blue-100' : ''}`} onClick={onClick}>
    <div className="flex items-center gap-2">
      {label} <ArrowUpDown size={10} className={current === field ? 'text-blue-600' : 'text-gray-300'}/>
    </div>
  </th>
);

export default MasterDataSheet;
