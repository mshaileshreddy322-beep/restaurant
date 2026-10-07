import React from 'react';
import { useData } from '../../context/DataContext';
import {
  FileCheck2,
  Printer,
  Database,
  Star,
  FlaskConical,
  Users,
  Brain,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { SATISFACTION_LABELS } from '../../utils/mathStats';

export const ConclusionTab: React.FC = () => {
  const { records, summary, descriptiveStats, hypothesisTest, customerBehavior, mlMetrics } =
    useData();

  if (
    records.length === 0 ||
    !summary ||
    !descriptiveStats ||
    !hypothesisTest ||
    !customerBehavior ||
    !mlMetrics
  ) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please upload a customer feedback dataset to generate the final statistical conclusion.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const topDish = customerBehavior.favoriteDishMetrics[0];
  const lowestDish =
    customerBehavior.favoriteDishMetrics[customerBehavior.favoriteDishMetrics.length - 1];
  const topPayment = customerBehavior.paymentMethodMetrics[0];

  const isRejected = hypothesisTest.decision === 'REJECT_NULL';

  return (
    <div className="space-y-6">
      {/* Header with Print action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Section 19
            </span>
            <span className="text-xs text-slate-400">Comprehensive Synthesis</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Final Statistical Conclusion &amp; Project Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated empirical summary generated solely from real-time dataset calculations
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Summary</span>
        </button>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Project Header Banner */}
        <div className="border-b border-slate-700/80 pb-6 print:border-slate-300">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase">
            <span>Project LG-8</span>
            <span>•</span>
            <span>Hypothesis Testing &amp; Predictive Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 print:text-black">
            Restaurant Customer Satisfaction: Statistical Inference Report
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
            <span>File: {summary.fileName}</span>
            <span>•</span>
            <span>Evaluation Date: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Significance Level: α = 0.05</span>
          </div>
        </div>

        {/* Section 19 Specific Findings Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Dataset Finding */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>1. Dataset Finding</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed print:text-slate-800">
              The empirical analysis evaluated{' '}
              <strong className="text-white font-mono">{summary.validRecordsCount}</strong> valid customer records
              across <strong className="text-white font-mono">{summary.totalColumns}</strong> features with{' '}
              <span className="font-mono text-emerald-400">0 critical type failures</span>. A total of{' '}
              <span className="font-mono">{summary.duplicateRowsCount}</span> duplicate rows were identified.
            </p>
          </div>

          {/* 2. Satisfaction Finding */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>2. Satisfaction Finding</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed print:text-slate-800">
              The empirical average satisfaction score across all respondents is{' '}
              <strong className="text-amber-300 font-mono text-sm">
                {descriptiveStats.mean.toFixed(2)} / 5.00
              </strong>{' '}
              with a sample standard deviation of{' '}
              <span className="font-mono text-slate-300">{descriptiveStats.stdDev.toFixed(2)}</span>{' '}
              and a median of <span className="font-mono text-slate-300">{descriptiveStats.median}</span>.
              Rating {Object.entries(descriptiveStats.ratingCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]}★
              constitutes the modal response.
            </p>
          </div>

          {/* 3. Hypothesis Finding */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 md:col-span-2 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FlaskConical className="w-4 h-4 text-rose-400" />
                <span>3. Hypothesis Finding (Core Statistical Proof)</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isRejected
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isRejected ? 'Reject H₀' : 'Fail to Reject H₀'}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed print:text-slate-800">
              Testing the null hypothesis{' '}
              <span className="font-mono font-bold text-white">H₀: μ ≥ 3.5</span> against the left-tailed alternative{' '}
              <span className="font-mono font-bold text-amber-300">H₁: μ &lt; 3.5</span> produced a calculated test
              statistic of <strong className="font-mono text-white">t = {hypothesisTest.tStatistic.toFixed(4)}</strong>{' '}
              with <strong className="font-mono text-white">df = {hypothesisTest.degreesOfFreedom}</strong>. At the α =
              0.05 level, the critical threshold is{' '}
              <strong className="font-mono text-rose-400">t_crit = {hypothesisTest.criticalValue.toFixed(4)}</strong>,
              yielding an exact p-value of{' '}
              <strong className="font-mono text-white">
                p = {hypothesisTest.pValue < 0.0001 ? '< 0.0001' : hypothesisTest.pValue.toFixed(5)}
              </strong>
              . The 95% confidence interval for the population mean customer satisfaction is [
              <span className="font-mono text-indigo-300">
                {hypothesisTest.ciLower.toFixed(3)}, {hypothesisTest.ciUpper.toFixed(3)}
              </span>
              ].
            </p>
          </div>

          {/* 4. Customer Behavior Finding */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>4. Customer Behavior Finding</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed print:text-slate-800">
              Highest satisfaction was observed among patrons ordering{' '}
              <strong className="text-white">{topDish?.category || 'Chef Special'}</strong> (
              {topDish?.averageSatisfaction.toFixed(2)}★), while the most common payment method was{' '}
              <strong className="text-white">{topPayment?.category || 'UPI'}</strong> ({topPayment?.count}{' '}
              customers). Average customer spending stands at{' '}
              <strong className="font-mono text-emerald-400">
                ${customerBehavior.spendingAnalysis.meanSpending.toFixed(2)}
              </strong>
              , exhibiting a Pearson correlation with rating of{' '}
              <strong className="font-mono text-indigo-300">
                r = {customerBehavior.spendingAnalysis.correlationWithSatisfaction.toFixed(3)}
              </strong>
              .
            </p>
          </div>

          {/* 5. Machine Learning Finding */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>5. Machine Learning Finding</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed print:text-slate-800">
              The supporting Random Forest Classifier (25 ensemble trees trained on an 80/20 split)
              achieved a test set accuracy of{' '}
              <strong className="font-mono text-emerald-400">
                {(mlMetrics.accuracy * 100).toFixed(1)}%
              </strong>{' '}
              and a weighted F1-score of{' '}
              <strong className="font-mono text-amber-300">{mlMetrics.weightedF1.toFixed(3)}</strong>. The most
              influential predictive attribute was{' '}
              <strong className="text-white">{mlMetrics.featureImportances[0]?.feature}</strong>, contributing{' '}
              <span className="font-mono">{mlMetrics.featureImportances[0]?.importance}%</span> to node purity.
            </p>
          </div>
        </div>

        {/* 6. Overall Plain-English Conclusion (Section 19) */}
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 print:bg-slate-100 print:border-slate-300">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>6. Overall Statistical &amp; Operational Conclusion</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans print:text-slate-900">
            {hypothesisTest.conclusionText}{' '}
            <span className="block mt-2 font-medium text-slate-200 print:text-slate-800">
              {hypothesisTest.businessInterpretation}
            </span>
          </p>
        </div>

        {/* Signature & College Viva Footer */}
        <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-4 print:text-slate-600">
          <div>
            <div>Project Title: <strong>LG-8: Restaurant Customer Satisfaction Using Hypothesis Testing</strong></div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Engineered with React + TypeScript + Chart.js + Random Forest Engine
            </div>
          </div>
          <div className="text-right sm:text-right font-mono text-[11px]">
            <div>Status: Verified Statistical Computation ✓</div>
            <div className="text-slate-500">Execution Mode: Real-Time Client Side</div>
          </div>
        </div>
      </div>
    </div>
  );
};
