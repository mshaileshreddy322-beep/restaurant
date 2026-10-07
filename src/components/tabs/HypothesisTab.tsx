import React from 'react';
import { useData } from '../../context/DataContext';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingDown,
  Info,
  Scale,
  Award,
  BookOpen,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { studentTCDF } from '../../utils/mathStats';

export const HypothesisTab: React.FC = () => {
  const { records, hypothesisTest } = useData();

  if (records.length === 0 || !hypothesisTest) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please upload a customer feedback dataset to perform hypothesis testing.
      </div>
    );
  }

  const {
    benchmarkMean,
    sampleSize,
    sampleMean,
    sampleStdDev,
    standardError,
    degreesOfFreedom,
    tStatistic,
    pValue,
    criticalValue,
    alpha,
    ciLower,
    ciUpper,
    decision,
    conclusionText,
    businessInterpretation,
  } = hypothesisTest;

  const isRejected = decision === 'REJECT_NULL';

  // Generate Student's t-distribution curve points for the visual graph
  // Centered around 0, spanning from -4.5 to +4.5
  const tRangeMin = Math.min(-4.5, tStatistic - 1);
  const tRangeMax = Math.max(4.5, tStatistic + 1);
  const step = 0.15;
  const tLabels: number[] = [];
  const tCurveData: number[] = [];
  const rejectionShading: (number | null)[] = [];

  for (let val = tRangeMin; val <= tRangeMax; val += step) {
    const rounded = Number(val.toFixed(2));
    tLabels.push(rounded);

    // Student's t PDF approximation
    const df = degreesOfFreedom;
    const numerator = Math.exp(
      // using log gamma ratio for exact density
      -0.5 * (df + 1) * Math.log(1 + (rounded * rounded) / df)
    );
    // proportional density
    tCurveData.push(Number(numerator.toFixed(4)));

    // Rejection zone is left of critical value
    if (rounded <= criticalValue) {
      rejectionShading.push(Number(numerator.toFixed(4)));
    } else {
      rejectionShading.push(null);
    }
  }

  const distributionChartData = {
    labels: tLabels.map((v) => v.toString()),
    datasets: [
      {
        label: `Student's t-Distribution (df = ${degreesOfFreedom})`,
        data: tCurveData,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: `Rejection Region (t < ${criticalValue.toFixed(3)})`,
        data: rejectionShading,
        borderColor: 'rgba(244, 63, 94, 0.8)',
        backgroundColor: 'rgba(244, 63, 94, 0.35)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1e293b',
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', maxTicksLimit: 12 },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        title: { display: true, text: 't-Score Scale', color: '#94a3b8' },
      },
      y: {
        ticks: { display: false },
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Core Statistical Module
            </span>
            <span className="text-xs text-slate-400">Section 9 &amp; 10 Requirements</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            One-Sample Left-Tailed t-Test Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Testing if empirical customer satisfaction is significantly below benchmark μ₀ = 3.5 at
            significance level α = 0.05
          </p>
        </div>

        {/* Big Decision Badge */}
        <div
          className={`px-5 py-3 rounded-2xl border flex items-center gap-3 shadow-lg ${
            isRejected
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {isRejected ? (
            <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">
              Statistical Decision (α = 0.05)
            </div>
            <div className="text-lg font-black tracking-tight">
              {isRejected ? 'REJECT NULL HYPOTHESIS (H₀)' : 'FAIL TO REJECT NULL HYPOTHESIS (H₀)'}
            </div>
          </div>
        </div>
      </div>

      {/* Formal Hypothesis Formulation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Null Hypothesis (H₀)</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">
            H₀: μ ≥ 3.5
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The population mean customer satisfaction is <strong>at least 3.5 stars</strong>{' '}
            (acceptable operational benchmark).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span>Alternative Hypothesis (H₁)</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mb-1">
            H₁: μ &lt; 3.5
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The population mean customer satisfaction is <strong>strictly below 3.5 stars</strong>{' '}
            (left-tailed test indicates underperformance).
          </p>
        </div>
      </div>

      {/* Dynamic Calculated Statistical Parameters Grid */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Calculated Test Parameters (Dynamically Computed)</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">α = 0.05 | Benchmark μ₀ = 3.5</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Sample Size (n)</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{sampleSize}</div>
            <div className="text-[10px] text-slate-500 mt-1">Valid records</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Degrees of Freedom (df = n - 1)</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
              {degreesOfFreedom}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">n - 1 = {degreesOfFreedom}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Sample Mean (x̄)</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {sampleMean.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Empirical average</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Sample Std Dev (s)</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {sampleStdDev.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Sample variance: {(sampleStdDev**2).toFixed(3)}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Standard Error (SE = s / √n)</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
              {standardError.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Precision of mean</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">t-Statistic (t = (x̄ - μ₀) / SE)</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
              {tStatistic.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              ({sampleMean.toFixed(2)} - 3.5) / {standardError.toFixed(3)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Critical Value (t_crit at α = 0.05)</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              {criticalValue.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Left-tail threshold</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Calculated p-Value</div>
            <div
              className={`text-xl font-bold font-mono mt-0.5 ${
                pValue < 0.05 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(5)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {pValue < 0.05 ? 'p < 0.05 (Significant)' : 'p ≥ 0.05 (Not Significant)'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 11: CONFIDENCE INTERVAL VISUALIZATION */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/60 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Section 11: 95% Confidence Interval &amp; Benchmark Visualization</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Clear visual comparison of Sample Mean x̄, 95% Confidence Bounds, and Benchmark μ₀ = 3.5
            </p>
          </div>
          <div className="font-mono text-xs text-indigo-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
            95% CI: [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]
          </div>
        </div>

        {/* Visual Axis Bar representation */}
        <div className="p-6 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-6 flex justify-between items-center">
            <span>Rating Scale: 1.0 (Worst)</span>
            <span className="font-bold text-slate-200">Confidence Interval Range Comparison</span>
            <span>5.0 (Best)</span>
          </div>

          {/* Graphical Interval Representation */}
          <div className="relative h-20 w-full flex items-center">
            {/* Base Scale Line (1.0 to 5.0 -> span = 4.0) */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-700 rounded-full" />

            {/* Benchmark Marker (3.5) */}
            {/* Position = ((3.5 - 1.0) / 4.0) * 100% = 62.5% */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-center z-20 pointer-events-none"
              style={{ left: `${Math.max(0, Math.min(100, ((3.5 - 1.0) / 4.0) * 100))}%` }}
            >
              <div className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow">
                Benchmark μ₀ = 3.50
              </div>
              <div className="w-0.5 flex-1 bg-amber-400 border-dashed" />
              <div className="w-3 h-3 bg-amber-400 rounded-full shadow-md" />
            </div>

            {/* 95% CI Highlight Zone */}
            {(() => {
              const leftPct = Math.max(0, Math.min(100, ((ciLower - 1.0) / 4.0) * 100));
              const rightPct = Math.max(0, Math.min(100, ((ciUpper - 1.0) / 4.0) * 100));
              const widthPct = Math.max(2, rightPct - leftPct);
              const meanPct = Math.max(0, Math.min(100, ((sampleMean - 1.0) / 4.0) * 100));

              return (
                <>
                  {/* CI Bracket Bar */}
                  <div
                    className="absolute h-8 bg-indigo-500/20 border-y-2 border-indigo-400/80 rounded z-10 flex items-center justify-between px-1"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <div className="w-1.5 h-6 bg-indigo-400 rounded-full" title={`Lower CI: ${ciLower.toFixed(3)}`} />
                    <div className="w-1.5 h-6 bg-indigo-400 rounded-full" title={`Upper CI: ${ciUpper.toFixed(3)}`} />
                  </div>

                  {/* Sample Mean Marker (x_bar) */}
                  <div
                    className="absolute top-2 bottom-0 flex flex-col items-center z-30"
                    style={{ left: `${meanPct}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow">
                      x̄ = {sampleMean.toFixed(2)}
                    </div>
                    <div className="w-0.5 h-8 bg-emerald-400" />
                    <div className="w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-md" />
                  </div>
                </>
              );
            })()}
          </div>

          {/* Legend and Presentation Explanation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full shrink-0" />
              <span className="text-slate-300">
                <strong>Sample Mean (x̄):</strong> {sampleMean.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-amber-400 rounded-full shrink-0" />
              <span className="text-slate-300">
                <strong>Target Benchmark (μ₀):</strong> 3.500
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-indigo-400/60 rounded shrink-0" />
              <span className="text-slate-300">
                <strong>95% CI Range:</strong> [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Student's t-Distribution Curve Visual */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Student's t-Distribution Curve &amp; Rejection Region</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Left-Tailed Rejection Zone (t &lt; {criticalValue.toFixed(3)}) with Calculated t ={' '}
              {tStatistic.toFixed(3)}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">df = {degreesOfFreedom}</span>
        </div>

        <div className="h-64">
          <Line data={distributionChartData} options={chartOptions} />
        </div>

        <div className="mt-4 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong>How to explain during viva / presentation:</strong>
            <p className="mt-1 text-slate-400">
              "Because we conduct a left-tailed test at α = 0.05, the critical value is{' '}
              <span className="font-mono text-rose-300">{criticalValue.toFixed(3)}</span>. If our
              calculated test statistic t ({tStatistic.toFixed(3)}) falls into the red rejection
              region to the left of {criticalValue.toFixed(3)}, we reject H₀. Equivalently, our
              p-value is {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}, which is{' '}
              {pValue < 0.05 ? 'strictly less than 0.05' : 'greater than 0.05'}, leading to the
              verdict of{' '}
              <strong className="text-white">
                {isRejected ? 'Rejecting H₀' : 'Failing to Reject H₀'}
              </strong>
              ."
            </p>
          </div>
        </div>
      </div>

      {/* Plain-English Statistical & Business Interpretation (Section 10) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Section 10: Formal Statistical Report &amp; Managerial Interpretation</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Statistical Finding
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            "{conclusionText}"
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Managerial &amp; Operational Takeaway
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            "{businessInterpretation}"
          </p>
        </div>
      </div>
    </div>
  );
};
