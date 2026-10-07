import React from 'react';
import { useData } from '../../context/DataContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { defaultChartOptions } from '../../utils/chartSetup';
import { Star, PieChart as PieIcon, BarChart2, Hash, Percent } from 'lucide-react';
import { SATISFACTION_LABELS } from '../../utils/mathStats';
import { SatisfactionLevel } from '../../types';

export const SatisfactionTab: React.FC = () => {
  const { records, descriptiveStats } = useData();

  if (records.length === 0 || !descriptiveStats) {
    return (
      <div className="p-8 text-center text-slate-400">
        Upload a customer feedback CSV to inspect satisfaction ratings.
      </div>
    );
  }

  const ratings: SatisfactionLevel[] = [1, 2, 3, 4, 5];
  const colors = {
    1: { bg: 'rgba(244, 63, 94, 0.8)', border: 'rgb(244, 63, 94)', text: 'text-rose-400' },
    2: { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgb(251, 146, 60)', text: 'text-orange-400' },
    3: { bg: 'rgba(250, 204, 21, 0.8)', border: 'rgb(250, 204, 21)', text: 'text-amber-400' },
    4: { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgb(99, 102, 241)', text: 'text-indigo-400' },
    5: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)', text: 'text-emerald-400' },
  };

  // Chart 1: Bar Chart (Rating Distribution)
  const chart1BarData = {
    labels: ratings.map((r) => `Score ${r} (${SATISFACTION_LABELS[r]})`),
    datasets: [
      {
        label: 'Number of Customers',
        data: ratings.map((r) => descriptiveStats.ratingCounts[r]),
        backgroundColor: ratings.map((r) => colors[r].bg),
        borderColor: ratings.map((r) => colors[r].border),
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart 2: Histogram of feedback scores (binned distribution with frequency polygon feel)
  const chart2HistogramData = {
    labels: ['1.0 - 1.9 (Very Dissat.)', '2.0 - 2.9 (Dissat.)', '3.0 - 3.9 (Neutral)', '4.0 - 4.9 (Satisfied)', '5.0 (Very Satisfied)'],
    datasets: [
      {
        type: 'bar' as const,
        label: 'Frequency Count',
        data: ratings.map((r) => descriptiveStats.ratingCounts[r]),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.95,
        categoryPercentage: 1.0,
      },
    ],
  };

  // Chart 3: Doughnut / Pie Chart (Satisfaction Percentage)
  const chart3DoughnutData = {
    labels: ratings.map((r) => `${r}★ - ${SATISFACTION_LABELS[r]}`),
    datasets: [
      {
        label: 'Satisfaction Percentage',
        data: ratings.map((r) => Number(descriptiveStats.ratingPercentages[r].toFixed(1))),
        backgroundColor: ratings.map((r) => colors[r].bg),
        borderColor: '#1e293b',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: "'Inter', sans-serif", size: 12 },
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer Satisfaction Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical frequency and probability density distribution for Feedback Score (1-5)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-slate-400">Overall Average:</span>
          <span className="text-white font-mono font-bold text-sm">
            {descriptiveStats.mean.toFixed(2)} / 5.0
          </span>
        </div>
      </div>

      {/* Ratings Count & Percentage Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ratings.map((score) => {
          const count = descriptiveStats.ratingCounts[score];
          const pct = descriptiveStats.ratingPercentages[score];
          return (
            <div
              key={score}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={`flex items-center gap-1 ${colors[score].text}`}>
                    <Star className="w-3.5 h-3.5 fill-current" /> Rating {score}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{SATISFACTION_LABELS[score]}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-white font-mono">{count}</span>
                  <span className="text-[11px] text-slate-500 ml-1">customers</span>
                </div>
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colors[score].border,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Required Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Customer Satisfaction Rating Distribution (Bar Chart) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Chart 1: Customer Satisfaction Rating Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">X-axis: Feedback Score | Y-axis: Customer Count</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Bar Chart</span>
          </div>
          <div className="h-72 mt-4">
            <Bar
              data={chart1BarData}
              options={{
                ...defaultChartOptions,
                plugins: {
                  ...defaultChartOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 2: Customer Satisfaction Distribution (Histogram) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Chart 2: Customer Satisfaction Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">Histogram of Discrete Score Bins</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Histogram</span>
          </div>
          <div className="h-72 mt-4">
            <Bar
              data={chart2HistogramData}
              options={{
                ...defaultChartOptions,
                plugins: {
                  ...defaultChartOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart 3: Satisfaction Percentage (Donut/Pie Chart) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Chart 3: Satisfaction Percentage Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Proportionate share of each rating level (1 to 5)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Donut Chart</span>
        </div>
        <div className="h-80 mt-4 flex items-center justify-center">
          <div className="w-full max-w-lg h-full">
            <Doughnut data={chart3DoughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
