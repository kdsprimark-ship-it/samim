
import React, { useMemo } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Calculator,
  TrendingUp,
  Globe,
  Anchor
} from 'lucide-react';
import { Shipment } from '../types';

interface ExportInfoProps {
  shipments: Shipment[];
}

const ExportInfo: React.FC<ExportInfoProps> = ({ shipments }) => {
  const employeeSummary = useMemo(() => {
    const summary: Record<string, {
      name: string;
      totalDocs: number;
      totalBill: number;
      totalPaid: number;
      totalDue: number;
      count: number;
    }> = {};

    shipments.forEach(s => {
      const name = s.employeeName || 'Unassigned';
      if (!summary[name]) {
        summary[name] = { 
          name, 
          totalDocs: 0, 
          totalBill: 0, 
          totalPaid: 0, 
          totalDue: 0, 
          count: 0 
        };
      }
      summary[name].totalDocs += Number(s.docQty || 0);
      summary[name].totalBill += Number(s.totalIndent || 0);
      summary[name].totalPaid += Number(s.paid || 0);
      summary[name].count += 1;
    });

    Object.values(summary).forEach(emp => {
      emp.totalDue = emp.totalBill - emp.totalPaid;
    });

    return Object.values(summary);
  }, [shipments]);

  const globalTotals = useMemo(() => {
    return employeeSummary.reduce((acc, curr) => ({
      docs: acc.docs + curr.totalDocs,
      bill: acc.bill + curr.totalBill,
      paid: acc.paid + curr.totalPaid,
      due: acc.due + curr.totalDue
    }), { docs: 0, bill: 0, paid: 0, due: 0 });
  }, [employeeSummary]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* System Status Header */}
      <div className="classic-window">
        <div className="classic-title-bar !bg-blue-900">
          <div className="flex items-center gap-2">
            <Globe size={12}/>
            <span>ASSYCUDA GLOBAL: EMPLOYEE FINANCIAL SUMMARY</span>
          </div>
        </div>
        <div className="classic-body p-6 bg-blue-50/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <TotalCard label="TOTAL DOCS" value={globalTotals.docs} icon={<FileText size={18}/>} color="blue" />
             <TotalCard label="TOTAL BILL AMOUNT" value={globalTotals.bill} icon={<Calculator size={18}/>} color="black" isCurrency />
             <TotalCard label="TOTAL PAID AMOUNT" value={globalTotals.paid} icon={<CheckCircle size={18}/>} color="green" isCurrency />
             <TotalCard label="TOTAL DUE / BALANCE" value={globalTotals.due} icon={<AlertCircle size={18}/>} color="red" isCurrency />
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeeSummary.length > 0 ? employeeSummary.map((emp, idx) => (
          <div key={idx} className="classic-window group hover:shadow-xl transition-all border-blue-900/20">
            <div className="classic-title-bar !bg-gray-800 flex justify-between">
              <div className="flex items-center gap-2">
                <Users size={12} />
                <span className="truncate max-w-[150px] uppercase">{emp.name}</span>
              </div>
              <span className="bg-blue-600 text-[8px] px-2 py-0.5 rounded">TASKS: {emp.count}</span>
            </div>
            <div className="classic-body p-4 space-y-3 bg-white">
              <div className="grid grid-cols-2 gap-2">
                 <div className="p-2 bg-gray-50 border border-black/5 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">DOC QTY</p>
                    <p className="text-sm font-black font-mono">{emp.totalDocs}</p>
                 </div>
                 <div className="p-2 bg-blue-50 border border-blue-100 text-center">
                    <p className="text-[8px] font-bold text-blue-600 uppercase">BILL AMT</p>
                    <p className="text-sm font-black font-mono text-blue-900">{emp.totalBill.toLocaleString()}</p>
                 </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2 py-1 bg-green-50 rounded">
                  <span className="text-[9px] font-black text-green-700 uppercase flex items-center gap-1"><CheckCircle size={10}/> PAID</span>
                  <span className="text-xs font-black font-mono text-green-800">TK {emp.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center px-2 py-2 bg-red-50 rounded border border-red-100">
                  <span className="text-[10px] font-black text-red-700 uppercase flex items-center gap-1"><AlertCircle size={12}/> BALANCE</span>
                  <span className="text-lg font-black font-mono text-red-600">TK {emp.totalDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="classic-footer !bg-gray-100 text-[8px] font-bold">
               <span className="text-blue-900 uppercase tracking-tighter">Account Verified</span>
               <span className="opacity-50 uppercase italic">ID: EMP-{idx + 100}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
            <TrendingUp size={64} className="text-gray-400" />
            <p className="mt-4 font-black uppercase text-sm tracking-[0.5em]">No Employee Data Available</p>
          </div>
        )}
      </div>

      <div className="classic-window mt-10">
         <div className="classic-body p-6 flex items-center gap-6 bg-gray-900 text-white border-none">
            <Anchor size={40} className="text-blue-400" />
            <div>
               <h4 className="text-xl font-black uppercase tracking-tighter">SunnyTrans Port Intelligence</h4>
               <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Global ERP Connectivity Mode: ONLINE</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const TotalCard = ({ label, value, icon, color, isCurrency }: any) => {
  const colorMap: any = {
    blue: "text-blue-900 border-blue-600 bg-blue-50/50",
    green: "text-green-800 border-green-600 bg-green-50/50",
    red: "text-red-800 border-red-600 bg-red-50/50",
    black: "text-gray-900 border-gray-400 bg-white"
  };
  return (
    <div className={`classic-inset p-4 border-l-4 ${colorMap[color]} group`}>
       <div className="flex items-center gap-2 mb-1">
          <div className="opacity-40 group-hover:scale-110 transition-transform">{icon}</div>
          <p className="text-[9px] font-black uppercase tracking-tighter text-gray-500">{label}</p>
       </div>
       <p className="text-2xl font-black font-mono tracking-tighter">
         {isCurrency ? `TK ${value.toLocaleString()}` : value}
       </p>
    </div>
  );
};

export default ExportInfo;
