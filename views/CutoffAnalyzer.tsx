
import React, { useState } from 'react';
import { Scissors, Search, Trash2, Clipboard, Plus, Settings, Activity } from 'lucide-react';
import Swal from 'sweetalert2';
import { DepotMapping } from '../types';

interface CutoffAnalyzerProps {
  mappings: DepotMapping[];
  setMappings: React.Dispatch<React.SetStateAction<DepotMapping[]>>;
  swalSize: number;
}

const CutoffAnalyzer: React.FC<CutoffAnalyzerProps> = ({ mappings, setMappings, swalSize }) => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ [key: string]: number }>({ VERTEX: 0, OCL: 0, SAPL: 0, KDS: 0 });

  const analyzeText = () => {
    const text = inputText.toUpperCase();
    let counts = { VERTEX: 0, OCL: 0, SAPL: 0, KDS: 0 };
    const words = text.replace(/[^A-Z0-9\s]/g, ' ').split(/\s+/);
    words.forEach(word => {
      const mapping = mappings.find(m => word.startsWith(m.c));
      if (mapping && counts.hasOwnProperty(mapping.d)) counts[mapping.d as keyof typeof counts]++;
    });
    setResults(counts);
  };

  const handleManageCodes = async () => {
    const { value: action } = await Swal.fire({
      title: 'MAPPING CONFIGURATION',
      input: 'radio',
      inputOptions: { 'view': 'View Current Mappings', 'add': 'Add New Code Mapping' },
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      confirmButtonText: 'SELECT'
    });
    
    if (action === 'add') {
      const { value: form } = await Swal.fire({
        title: 'NEW DEPOT MAPPING',
        html: `
          <div class="text-left space-y-3">
            <div><label class="text-[10px] font-bold">Consignee Code Prefix:</label><input id="c" class="classic-input w-full h-10" placeholder="e.g. PA"></div>
            <div><label class="text-[10px] font-bold">Target Depot Name:</label><input id="d" class="classic-input w-full h-10" placeholder="e.g. VERTEX"></div>
          </div>
        `,
        width: swalSize,
        showCancelButton: true,
        confirmButtonText: 'SAVE MAPPING',
        customClass: { popup: 'classic-swal' },
        preConfirm: () => ({ c: (document.getElementById('c') as any).value, d: (document.getElementById('d') as any).value })
      });
      if (form?.c) setMappings(p => [...p, form]);
    } else if (action === 'view') {
      Swal.fire({
        title: 'ACTIVE MAPPING CODES',
        html: `<div class="text-left h-64 overflow-y-auto font-mono text-[11px] p-2 bg-white border border-black/10">
          ${mappings.map(m => `<div class="flex justify-between border-b py-1"><span>${m.c}</span><span class="font-bold">${m.d}</span></div>`).join('')}
        </div>`,
        width: swalSize,
        customClass: { popup: 'classic-swal' }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <div className="flex items-center gap-2 text-pink-700 font-bold text-xs uppercase">
          <Scissors size={14} /> H&M CUTOFF ANALYZER ENGINE
        </div>
        <div className="flex-1"></div>
        <button onClick={handleManageCodes} className="classic-btn flex items-center gap-2">
          <Settings size={12} /> CONFIG MAPPINGS
        </button>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar"><span>DATA INPUT TERMINAL - PASTE CARGO DETAILS</span></div>
        <div className="classic-body p-6 space-y-4">
          <textarea 
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
            className="classic-input w-full h-64 p-4 font-mono text-[12px] bg-white" 
            placeholder="System awaiting cargo data stream..."
          />
          <button onClick={analyzeText} className="classic-btn w-full py-4 bg-pink-700 text-white border-pink-900 font-black text-sm flex items-center justify-center gap-3">
            <Activity size={18} /> RUN ANALYSIS HEURISTICS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(results).map(([depot, count]) => (
          <div key={depot} className="classic-window">
            <div className="classic-title-bar !bg-gray-700"><span>{depot}</span></div>
            <div className="p-6 text-center bg-white border border-black/5">
              <p className="text-4xl font-black font-mono">{count}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Assignments</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CutoffAnalyzer;
