import React, { useRef, useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Download, Database } from 'lucide-react';
import { useData } from '../context/DataContext';
import { downloadSampleCSV } from '../data/sampleDataset';
import { REQUIRED_COLUMNS } from '../utils/csvParser';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { loadCSVText, loadSampleData, error, clearError } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setLocalError('Invalid file format. Please upload a .csv file.');
      return;
    }
    setLocalError(null);
    clearError();
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const success = loadCSVText(text, file.name);
      if (success) {
        onClose();
      }
    };
    reader.onerror = () => {
      setLocalError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUseSample = () => {
    setLocalError(null);
    clearError();
    loadSampleData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload Customer Feedback CSV</h3>
              <p className="text-xs text-slate-400">
                Upload real-time dataset for Hypothesis Testing and ML analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {(localError || error) && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold">Validation Error:</span> {localError || error}
            </div>
          </div>
        )}

        {/* Drag & drop upload area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-white">
            Click to browse or drag & drop customer feedback CSV
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supported format: Standard CSV with UTF-8 encoding
          </p>
          {selectedFileName && (
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>{selectedFileName}</span>
            </div>
          )}
        </div>

        {/* Required columns specification */}
        <div className="mt-5 bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Strictly Required Columns in CSV:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {REQUIRED_COLUMNS.map((col) => (
              <span
                key={col}
                className="bg-slate-900/90 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md"
              >
                {col}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Note: <strong className="text-slate-300">Feedback Score (1-5)</strong> must contain
            numeric values between 1 and 5. Out-of-bounds scores will be rejected.
          </p>
        </div>

        {/* Actions footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseSample}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              Load Sample Dataset
            </button>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
