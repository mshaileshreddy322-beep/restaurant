import React from 'react';
import {
  Users,
  Star,
  Activity,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  FlaskConical,
  Brain,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { MetricCard } from '../MetricCard';
import { Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { defaultChartOptions } from '../../utils/chartSetup';

export const DashboardTab: React.FC = () => {
  const {
    records,
    summary,
    descriptiveStats,
    hypothesisTest,
    mlMetrics,
    customerBehavior,
    setActiveTab,
  } = useData();

  if (records.length === 0 || !descriptiveStats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Dataset Loaded</h3>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          Upload a restaurant customer feedback CSV or click "Load Sample" in the top navigation to
          generate dynamic real-time statistical calculations and hypotheses.
        </p>
      </div>
    );
  }

  // Quick distribution chart
  const barChartData = {
    labels: ['1 (Very Dissat.)', '2 (Dissat.)', '3 (Neutral)', '4 (Satisfied)', '5 (Very Sat.)'],
    datasets: [
      {
        label: 'Customer Count',
        data: [
          descriptiveStats.ratingCounts[1],
          descriptiveStats.ratingCounts[2],
          descriptiveStats.ratingCounts[3],
          descriptiveStats.ratingCounts[4],
          descriptiveStats.ratingCounts[5],
        ],
        backgroundColor: [
          'rgba(244, 63, 94, 0.75)',
          'rgba(251, 146, 60, 0.75)',
          'rgba(250, 204, 21, 0.75)',
          'rgba(99, 102, 241, 0.75)',
          'rgba(16, 185, 129, 0.75)',
        ],
        borderColor: [
          'rgb(244, 63, 94)',
          'rgb(251, 146, 60)',
          'rgb(250, 204, 21)',
          'rgb(99, 102, 241)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-indigo-950/40 to-slate-900 border border-slate-700/80 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Academic Project: LG-8
              </span>
              <span className="text-xs text-slate-400">One-Sample Left-Tailed t-Test (μ₀ = 3.5)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Restaurant Customer Satisfaction Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time statistical evaluation comparing empirical customer feedback ratings against
              the operational benchmark of 3.5 stars, augmented with Random Forest classification.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('hypothesis')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>View Hypothesis Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Required Metric Cards (Section 6) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Primary Customer Satisfaction Metrics</span>
          <span className="text-[11px] text-slate-500 font-normal">Calculated dynamically</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Customers"
            value={descriptiveStats.totalCustomers}
            subtitle="Valid sample records"
            icon={<Users className="w-5 h-5" />}
            badge={{ text: 'Sample n', variant: 'info' }}
            footnote="All rows strictly validated"
          />

          <MetricCard
            title="Average Satisfaction"
            value={descriptiveStats.mean.toFixed(2)}
            subtitle="Scale: 1 to 5"
            icon={<Star className="w-5 h-5" />}
            badge={{
              text: descriptiveStats.mean >= 3.5 ? '≥ Benchmark' : '< Benchmark',
              variant: descriptiveStats.mean >= 3.5 ? 'success' : 'danger',
            }}
            footnote={`Benchmark μ₀ = 3.50`}
          />

          <MetricCard
            title="Median Satisfaction"
            value={descriptiveStats.median}
            subtitle="50th Percentile"
            icon={<ArrowUpDown className="w-5 h-5" />}
            badge={{ text: 'Midpoint', variant: 'purple' }}
            footnote="Resistant to outliers"
          />

          <MetricCard
            title="Standard Deviation"
            value={descriptiveStats.stdDev.toFixed(2)}
            subtitle="Sample dispersion (s)"
            icon={<Activity className="w-5 h-5" />}
            badge={{ text: `Var: ${descriptiveStats.variance.toFixed(2)}`, variant: 'info' }}
            footnote={`SE = ${(descriptiveStats.stdDev / Math.sqrt(descriptiveStats.totalCustomers)).toFixed(3)}`}
          />

          <MetricCard
            title="Minimum Rating"
            value={descriptiveStats.min}
            subtitle="Lowest feedback score"
            icon={<TrendingDown className="w-5 h-5" />}
            badge={{ text: 'Min: 1-5', variant: 'warning' }}
            footnote="Lower score boundary"
          />

          <MetricCard
            title="Maximum Rating"
            value={descriptiveStats.max}
            subtitle="Highest feedback score"
            icon={<TrendingUp className="w-5 h-5" />}
            badge={{ text: 'Max: 1-5', variant: 'success' }}
            footnote="Upper score boundary"
          />
        </div>
      </div>

      {/* Key Analysis Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hypothesis Testing Summary Spotlight Card */}
        {hypothesisTest && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hypothesis Test Decision</h4>
                    <p className="text-[11px] text-slate-400">One-Sample Left-Tailed t-Test</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                    hypothesisTest.decision === 'REJECT_NULL'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {hypothesisTest.decision === 'REJECT_NULL' ? 'Reject H₀' : 'Fail to Reject H₀'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Benchmark μ₀</div>
                  <div className="text-base font-bold text-white font-mono">
                    {hypothesisTest.benchmarkMean.toFixed(1)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Sample Mean x̄</div>
                  <div className="text-base font-bold text-indigo-300 font-mono">
                    {hypothesisTest.sampleMean.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">t-Statistic</div>
                  <div className="text-base font-bold text-amber-300 font-mono">
                    {hypothesisTest.tStatistic.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">p-Value (α = 0.05)</div>
                  <div
                    className={`text-base font-bold font-mono ${
                      hypothesisTest.pValue < 0.05 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {hypothesisTest.pValue < 0.0001 ? '< 0.0001' : hypothesisTest.pValue.toFixed(4)}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                {hypothesisTest.businessInterpretation}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('hypothesis')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition cursor-pointer"
            >
              <span>Explore Detailed t-Test Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Satisfaction Rating Distribution Mini Chart */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <h4 className="text-sm font-bold text-white">Satisfaction Rating Breakdown</h4>
              <button
                onClick={() => setActiveTab('satisfaction')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                View Full
              </button>
            </div>

            <div className="h-56 mt-4">
              <Bar data={barChartData} options={defaultChartOptions} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Dominant Rating:</span>
            <span className="font-semibold text-slate-200">
              {Object.entries(descriptiveStats.ratingCounts).reduce((a, b) =>
                b[1] > a[1] ? b : a
              )[0]}{' '}
              Stars
            </span>
          </div>
        </div>

        {/* Machine Learning Model Performance Summary */}
        {mlMetrics && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Random Forest Classifier</h4>
                    <p className="text-[11px] text-slate-400">Supporting Multi-Class Model</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  80/20 Split
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Accuracy</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {(mlMetrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Weighted F1</div>
                  <div className="text-lg font-bold text-indigo-300 font-mono">
                    {mlMetrics.weightedF1.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Precision</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {mlMetrics.weightedPrecision.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[11px]">Recall</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {mlMetrics.weightedRecall.toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Top Predictive Feature:</span>{' '}
                {mlMetrics.featureImportances[0]?.feature} (
                {mlMetrics.featureImportances[0]?.importance}%)
              </div>
            </div>

            <button
              onClick={() => setActiveTab('prediction')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition cursor-pointer"
            >
              <span>Test Live Customer Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Dataset & Spend Summary Quick Strip */}
      {customerBehavior && summary && (
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">File:</span>
              <span className="font-mono text-slate-200 font-semibold">{summary.fileName}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-400">Columns:</span>
              <span className="text-slate-200 font-semibold">{summary.totalColumns}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Avg Spend:</span>
              <span className="font-mono text-emerald-300 font-semibold">
                ${customerBehavior.spendingAnalysis.meanSpending.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Correlation with Rating:</span>
              <span className="font-mono text-indigo-300 font-semibold">
                r = {customerBehavior.spendingAnalysis.correlationWithSatisfaction.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
