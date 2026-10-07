import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  Copy,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  Hash,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const DatasetTab: React.FC = () => {
  const { records, summary } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distinct payment methods for filter
  const paymentMethods = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.paymentMethod))).filter(Boolean);
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.favoriteDish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.visitFrequency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.date.toLowerCase().includes(searchTerm.toLowerCase());

      const matchScore = scoreFilter === 'all' || String(r.feedbackScore) === scoreFilter;
      const matchPayment = paymentFilter === 'all' || r.paymentMethod === paymentFilter;

      return matchSearch && matchScore && matchPayment;
    });
  }, [records, searchTerm, scoreFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  if (!summary || records.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No dataset uploaded yet. Please upload a customer feedback CSV.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Dataset Schema &amp; Records</h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspection of the uploaded raw customer feedback dataset with integrity metrics and
          filtering
        </p>
      </div>

      {/* Dataset Metadata Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Records
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {summary.validRecordsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Uploaded rows</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Columns
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {summary.totalColumns}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Features</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Missing Values
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              summary.totalMissingCells > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {summary.totalMissingCells}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all columns</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Duplicates
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              summary.duplicateRowsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {summary.duplicateRowsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Duplicate rows</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Variable
          </div>
          <div className="text-sm font-bold text-amber-300 font-mono mt-2 truncate">
            Feedback Score
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Scale 1–5</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Source File
          </div>
          <div className="text-xs font-bold text-slate-200 font-mono mt-2 truncate" title={summary.fileName}>
            {summary.fileName}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Validated ✓</div>
        </div>
      </div>

      {/* Column Schema & Types Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-indigo-400" />
          <span>Column Metadata &amp; Data Types</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Inferred Data Type</th>
                <th className="py-2.5 px-3 text-center">Missing Count</th>
                <th className="py-2.5 px-3">Role in Study</th>
                <th className="py-2.5 px-3">Sample Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {summary.columnNames.map((col) => {
                const missingCount = summary.missingValuesCount[col] || 0;
                let role = 'Predictor Feature';
                if (col.toLowerCase().includes('feedback')) role = 'Main Hypothesis Variable / Target';
                if (col.toLowerCase().includes('user id')) role = 'Identifier (Excluded from ML)';
                if (col.toLowerCase().includes('amount spent')) role = 'Numeric Continuous Covariate';
                if (col.toLowerCase().includes('date')) role = 'Timestamp';

                const sampleVal = records[0]
                  ? col.toLowerCase().includes('user')
                    ? records[0].userId
                    : col.toLowerCase().includes('amount')
                    ? records[0].amountSpent
                    : col.toLowerCase().includes('feedback')
                    ? records[0].feedbackScore
                    : col.toLowerCase().includes('payment')
                    ? records[0].paymentMethod
                    : col.toLowerCase().includes('dish')
                    ? records[0].favoriteDish
                    : col.toLowerCase().includes('frequency')
                    ? records[0].visitFrequency
                    : records[0].date
                  : 'N/A';

                return (
                  <tr key={col} className="hover:bg-slate-700/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{col}</td>
                    <td className="py-2.5 px-3 text-indigo-300">
                      {summary.columnTypes[col] || 'Categorical (String)'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          missingCount > 0
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {missingCount} ({((missingCount / summary.totalRows) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{role}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{String(sampleVal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Interactive Customer Feedback Table</span>
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredRecords.length} of {records.length} customer records
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, dish, payment..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={scoreFilter}
              onChange={(e) => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Feedback Scores</option>
              <option value="1">Score 1 (Very Dissatisfied)</option>
              <option value="2">Score 2 (Dissatisfied)</option>
              <option value="3">Score 3 (Neutral)</option>
              <option value="4">Score 4 (Satisfied)</option>
              <option value="5">Score 5 (Very Satisfied)</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">USER ID</th>
                <th className="py-2.5 px-3">AMOUNT SPENT</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Feedback Score (1-5)</th>
                <th className="py-2.5 px-3">Favorite Dish</th>
                <th className="py-2.5 px-3">Visit Frequency</th>
                <th className="py-2.5 px-3">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r, i) => {
                  const globalIdx = (currentPage - 1) * pageSize + i + 1;
                  const scoreColors = {
                    1: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    2: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
                    3: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    4: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
                    5: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                  };

                  return (
                    <tr key={r.userId + i} className="hover:bg-slate-700/30 transition">
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{globalIdx}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{r.userId}</td>
                      <td className="py-2.5 px-3 text-emerald-300">${r.amountSpent.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{r.paymentMethod}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                            scoreColors[r.feedbackScore as 1 | 2 | 3 | 4 | 5]
                          }`}
                        >
                          ★ {r.feedbackScore} - {r.satisfactionCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{r.favoriteDish}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{r.visitFrequency}</td>
                      <td className="py-2.5 px-3 text-slate-500">{r.date}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No customer records matched your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}{' '}
            records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
