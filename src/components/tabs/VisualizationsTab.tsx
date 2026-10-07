import React from 'react';
import { useData } from '../../context/DataContext';
import { Bar, Doughnut, Scatter } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { defaultChartOptions } from '../../utils/chartSetup';
import {
  BarChart3,
  PieChart as PieIcon,
  ScatterChart,
  Table as TableIcon,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { SATISFACTION_LABELS } from '../../utils/mathStats';
import { SatisfactionLevel } from '../../types';

export const VisualizationsTab: React.FC = () => {
  const { records, descriptiveStats, customerBehavior, mlMetrics } = useData();

  if (records.length === 0 || !descriptiveStats || !customerBehavior || !mlMetrics) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please upload a customer feedback dataset to view the visualization gallery.
      </div>
    );
  }

  const ratings: SatisfactionLevel[] = [1, 2, 3, 4, 5];
  const ratingColors = [
    'rgba(244, 63, 94, 0.75)',
    'rgba(251, 146, 60, 0.75)',
    'rgba(250, 204, 21, 0.75)',
    'rgba(99, 102, 241, 0.75)',
    'rgba(16, 185, 129, 0.75)',
  ];

  // 1. Satisfaction Rating Bar Chart
  const chart1BarData = {
    labels: ratings.map((r) => `Score ${r}`),
    datasets: [
      {
        label: 'Number of Customers',
        data: ratings.map((r) => descriptiveStats.ratingCounts[r]),
        backgroundColor: ratingColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // 2. Satisfaction Histogram
  const chart2HistogramData = {
    labels: ['[1.0-1.9]', '[2.0-2.9]', '[3.0-3.9]', '[4.0-4.9]', '[5.0]'],
    datasets: [
      {
        label: 'Frequency Count',
        data: ratings.map((r) => descriptiveStats.ratingCounts[r]),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  // 3. Satisfaction Percentage Donut
  const chart3DonutData = {
    labels: ratings.map((r) => `${r}★ - ${SATISFACTION_LABELS[r]}`),
    datasets: [
      {
        label: 'Share (%)',
        data: ratings.map((r) => Number(descriptiveStats.ratingPercentages[r].toFixed(1))),
        backgroundColor: ratingColors,
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  // 4. Payment Method Satisfaction Bar Chart
  const chart4PaymentData = {
    labels: customerBehavior.paymentMethodMetrics.map((p) => p.category),
    datasets: [
      {
        label: 'Average Feedback Rating (1-5)',
        data: customerBehavior.paymentMethodMetrics.map((p) => p.averageSatisfaction),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // 5. Visit Frequency Satisfaction Bar Chart
  const chart5FreqData = {
    labels: customerBehavior.visitFrequencyMetrics.map((f) => f.category),
    datasets: [
      {
        label: 'Average Feedback Rating (1-5)',
        data: customerBehavior.visitFrequencyMetrics.map((f) => f.averageSatisfaction),
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // 6. Favorite Dish Satisfaction Bar Chart (Horizontal)
  const chart6DishData = {
    labels: customerBehavior.favoriteDishMetrics.map((d) => d.category),
    datasets: [
      {
        label: 'Average Feedback Score',
        data: customerBehavior.favoriteDishMetrics.map((d) => d.averageSatisfaction),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // 7. Amount Spent vs Satisfaction Scatter Plot
  const chart7ScatterData = {
    datasets: [
      {
        label: 'Diner Spend vs Rating',
        data: records.map((r) => ({ x: r.amountSpent, y: r.feedbackScore })),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(129, 140, 248)',
        pointRadius: 4,
      },
    ],
  };

  // 8. ML Feature Importance Chart
  const chart9FeatureData = {
    labels: mlMetrics.featureImportances.slice(0, 8).map((f) => f.feature),
    datasets: [
      {
        label: 'Gini Importance (%)',
        data: mlMetrics.featureImportances.slice(0, 8).map((f) => f.importance),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const matrix = mlMetrics.confusionMatrix.matrix;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 18
          </span>
          <span className="text-xs text-slate-400">Complete Visual Gallery</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Interactive Visualizations Gallery</h2>
        <p className="text-xs text-slate-400 mt-1">
          Unified dashboard showcasing all 9 core graphical visualizations across customer satisfaction,
          behavioral covariates, and machine learning performance
        </p>
      </div>

      {/* Grid of 9 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Satisfaction Rating Bar Chart */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Rating Distribution Bar Chart
            </h3>
            <p className="text-[10px] text-slate-400">X: Feedback Score | Y: Customers</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart1BarData}
              options={{ ...defaultChartOptions, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Chart 2: Satisfaction Histogram */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              2. Satisfaction Score Histogram
            </h3>
            <p className="text-[10px] text-slate-400">Discrete Interval Bins</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart2HistogramData}
              options={{ ...defaultChartOptions, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Chart 3: Satisfaction Percentage Donut */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              3. Satisfaction Share (%) Donut
            </h3>
            <p className="text-[10px] text-slate-400">Percentage distribution</p>
          </div>
          <div className="h-52 flex items-center justify-center">
            <Doughnut
              data={chart3DonutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 4: Payment Method Satisfaction */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              4. Payment Method vs Satisfaction
            </h3>
            <p className="text-[10px] text-slate-400">Average rating by payment type</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart4PaymentData}
              options={{
                ...defaultChartOptions,
                plugins: { legend: { display: false } },
                scales: { ...defaultChartOptions.scales, y: { min: 1, max: 5 } },
              }}
            />
          </div>
        </div>

        {/* Chart 5: Visit Frequency Satisfaction */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              5. Visit Frequency vs Satisfaction
            </h3>
            <p className="text-[10px] text-slate-400">Average rating by frequency</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart5FreqData}
              options={{
                ...defaultChartOptions,
                plugins: { legend: { display: false } },
                scales: { ...defaultChartOptions.scales, y: { min: 1, max: 5 } },
              }}
            />
          </div>
        </div>

        {/* Chart 6: Favorite Dish Satisfaction Horizontal Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              6. Favorite Dish vs Satisfaction
            </h3>
            <p className="text-[10px] text-slate-400">Average rating across dishes</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart6DishData}
              options={{
                ...defaultChartOptions,
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
                scales: { x: { min: 1, max: 5 } },
              }}
            />
          </div>
        </div>

        {/* Chart 7: Amount Spent vs Satisfaction Scatter Plot */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              7. Amount Spent vs Satisfaction
            </h3>
            <p className="text-[10px] text-slate-400">
              Pearson r = {customerBehavior.spendingAnalysis.correlationWithSatisfaction.toFixed(3)}
            </p>
          </div>
          <div className="h-52">
            <Scatter
              data={chart7ScatterData}
              options={{
                ...defaultChartOptions,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ...defaultChartOptions.scales.x, title: { display: true, text: 'Spend ($)' } },
                  y: { min: 1, max: 5, title: { display: true, text: 'Rating' } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 8: ML Confusion Matrix Heatmap */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              8. ML Confusion Matrix (5x5)
            </h3>
            <p className="text-[10px] text-slate-400">Accuracy: {(mlMetrics.accuracy * 100).toFixed(1)}%</p>
          </div>
          <div className="h-52 flex items-center justify-center overflow-x-auto">
            <table className="text-center text-[11px] font-mono border-collapse w-full">
              <thead>
                <tr>
                  <th className="p-1 text-slate-500">Act\Pr</th>
                  {[1, 2, 3, 4, 5].map((c) => (
                    <th key={c} className="p-1 text-indigo-300">
                      {c}★
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((actual, rIdx) => (
                  <tr key={actual}>
                    <td className="p-1 font-bold text-slate-300">{actual}★</td>
                    {[0, 1, 2, 3, 4].map((cIdx) => {
                      const count = matrix[rIdx][cIdx];
                      const isDiag = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-1 rounded font-bold ${
                            isDiag
                              ? count > 0
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-slate-500'
                              : count > 0
                              ? 'bg-rose-500/10 text-rose-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 9: ML Feature Importance Chart */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-700/60 mb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              9. ML Feature Importance
            </h3>
            <p className="text-[10px] text-slate-400">Gini Impurity Contribution (%)</p>
          </div>
          <div className="h-52">
            <Bar
              data={chart9FeatureData}
              options={{
                ...defaultChartOptions,
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
