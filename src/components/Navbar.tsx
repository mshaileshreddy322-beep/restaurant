import React, { useState } from 'react';
import {
  Upload,
  Database,
  Download,
  RotateCcw,
  UtensilsCrossed,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { FileUploadModal } from './FileUploadModal';
import { downloadSampleCSV } from '../data/sampleDataset';

export const Navbar: React.FC = () => {
  const { summary, lastUpdated, loadSampleData, resetData, records } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Project Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    LG-8
                  </span>
                  <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                    Restaurant Customer Satisfaction Using Hypothesis Testing
                  </h1>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block truncate">
                  Real-Time Statistical Inference &amp; Random Forest Classification Dashboard
                </p>
              </div>
            </div>

            {/* Status Indicators & Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Dataset Status */}
              {records.length > 0 ? (
                <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Dataset Loaded ✓</span>
                  </div>
                  {lastUpdated && (
                    <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px] border-l border-slate-700 pl-3">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Updated: {lastUpdated}</span>
                    </div>
                  )}
                  {summary && (
                    <div className="text-slate-400 font-mono text-[11px] border-l border-slate-700 pl-3">
                      <span className="text-slate-200 font-bold">{summary.validRecordsCount}</span> rows
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Awaiting CSV Upload</span>
                </div>
              )}

              {/* Sample loader */}
              <button
                onClick={loadSampleData}
                title="Load built-in demonstration dataset"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample</span>
              </button>

              {/* Download Sample CSV */}
              <button
                onClick={downloadSampleCSV}
                title="Download standard template CSV file"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>CSV Template</span>
              </button>

              {/* Upload CSV button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload CSV</span>
              </button>

              {/* Reset Data */}
              {records.length > 0 && (
                <button
                  onClick={resetData}
                  title="Reset and clear current dataset"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* File Upload Modal */}
      <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
