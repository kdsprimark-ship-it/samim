
import React, { useState } from 'react';
import { Scissors, Search, Trash2, Clipboard, Plus, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import { DepotMapping } from '../types';

interface CutoffAnalyzerProps {
  mappings: DepotMapping[];
  setMappings: React.Dispatch<React.SetStateAction<DepotMapping[]>>;
}

const CutoffAnalyzer: React.FC<CutoffAnalyzerProps> = ({ mappings, setMappings }) => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<{ [key: string]: number }>({
    VERTEX: 0,
    OCL: 0,
    SAPL: 0,
    KDS: 0
  });
  const isDark = document.documentElement.classList.contains('dark');

  const analyzeText = () => {
    const text = inputText.toUpperCase();
    let counts = { VERTEX: 0, OCL: 0, SAPL: 0, KDS: 0 };
    
    // Normalize text: remove everything except alphanumeric and spaces
    const normalized = text.replace(/\(.*\)/g, ' ').replace(/[^A-Z0-9\s]/g, ' '); 
    const words = normalized.split(/\s+/);
    
    words.forEach(word => {
      let cleanWord = word.replace(/[^A-Z0-9]/g, ''); 
      if (!cleanWord) return;
      
      // Explicit depot mentions
      if (cleanWord === 'VERTEX') { counts.VERTEX++; return; }
      if (cleanWord.includes('OCL')) { counts.OCL++; return; }
      if (cleanWord.includes('SAPL')) { counts.SAPL++; return; }
      if (cleanWord.includes('KDS')) { counts.KDS++; return; }

      // Map codes to depots from dynamic mappings
      const mapping = mappings.find(m => cleanWord.startsWith(m.c));
      if (mapping && counts.hasOwnProperty(mapping.d)) {
        counts[mapping.d as keyof typeof counts]++;
      }
    });

    setResults(counts);
  };

  const handleManageCodes = async () => {
    const { value: action } = await Swal.fire({
      title: 'Manage Depot Mappings',
      input: 'radio',
      inputOptions: {
        'view': 'View Existing Mappings',
        'add': 'Add New Mapping'
      },
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
    });

    if (action === 'add') {
      const { value: formValues } = await Swal.fire({
        title: 'New Mapping',
        html: `
          <input id="code-input" class="swal2-input" placeholder="Code (e.g. USW999)">
          <select id="depot-select" class="swal2-input">
            <option value="VERTEX">VERTEX</option>
            <option value="OCL">OCL</option>
            <option value="SAPL">SAPL</option>
            <option value="KDS">KDS</option>
          </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
          return {
            c: (document.getElementById('code-input') as HTMLInputElement).value.toUpperCase(),
            d: (document.getElementById('depot-select') as HTMLSelectElement).value
          }
        }
      });

      if (formValues && formValues.c) {
        setMappings(prev => [...prev, formValues]);
        Swal.fire('Added!', `Code ${formValues.c} mapped to ${formValues.d}`, 'success');
      }
    } else if (action === 'view') {
      let tableHtml = `<div class="text-left overflow-y-auto max-h-[300px]"><table class="w-full text-xs"><thead><tr class="font-bold border-b"><th>Code</th><th>Depot</th></tr></thead><tbody>`;
      mappings.slice().reverse().forEach(m => {
        tableHtml += `<tr class="border-b"><td>${m.c}</td><td>${m.d}</td></tr>`;
      });
      tableHtml += `</tbody></table></div>`;
      Swal.fire({
        title: 'Current Mappings',
        html: tableHtml,
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const clearAll = () => {
    setInputText('');
    setResults({ VERTEX: 0, OCL: 0, SAPL: 0, KDS: 0 });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Scissors className="text-pink-500" />
          <h3 className="text-2xl font-bold">H&M Cutoff Data Analyzer</h3>
        </div>
        <button 
          onClick={handleManageCodes}
          className="neu-panel px-4 py-2 text-[10px] font-bold text-blue-500 flex items-center gap-2 hover:neu-inset transition-all"
        >
          <Settings size={14} /> MANAGE CODES
        </button>
      </div>

      <div className="neu-panel p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Paste Cutoff Data Text Here
          </label>
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. VERTEX, OCL (Code 1), SAPL, USW022, GBD001..."
              className="w-full h-48 neu-inset bg-transparent border-none rounded-2xl p-6 font-mono text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all custom-scroll"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={pasteFromClipboard}
                className="p-3 bg-white/10 rounded-xl hover:bg-blue-500/20 text-blue-500 transition-all"
                title="Paste from Clipboard"
              >
                <Clipboard size={18} />
              </button>
              <button 
                onClick={clearAll}
                className="p-3 bg-white/10 rounded-xl hover:bg-red-500/20 text-red-500 transition-all"
                title="Clear All"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={analyzeText}
          className="w-full btn-neon py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3"
        >
          <Search size={20} />
          START ANALYSIS
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DepotResultCard name="VERTEX" count={results.VERTEX} color="purple" />
        <DepotResultCard name="OCL" count={results.OCL} color="blue" />
        <DepotResultCard name="SAPL" count={results.SAPL} color="green" />
        <DepotResultCard name="KDS" count={results.KDS} color="orange" />
      </div>
    </div>
  );
};

const DepotResultCard = ({ name, count, color }: { name: string; count: number; color: string }) => {
  const colorClasses = {
    purple: "text-purple-600 border-purple-400 bg-purple-50/50",
    blue: "text-blue-600 border-blue-400 bg-blue-50/50",
    green: "text-green-600 border-green-400 bg-green-50/50",
    orange: "text-orange-600 border-orange-400 bg-orange-50/50",
  }[color as 'purple' | 'blue' | 'green' | 'orange'];

  return (
    <div className={`neu-panel p-6 text-center border-t-4 ${colorClasses}`}>
      <p className="text-[10px] font-bold uppercase tracking-tighter opacity-60 mb-2">{name}</p>
      <div className="text-4xl font-bold font-orbitron">{count}</div>
    </div>
  );
};

export default CutoffAnalyzer;
