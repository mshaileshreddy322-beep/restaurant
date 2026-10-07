import React from 'react';
import { useData } from '../../context/DataContext';
import { Bar, Scatter } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { defaultChartOptions } from '../../utils/chartSetup';
import {
  CreditCard,
  Repeat,
  Utensils,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { SATISFACTION_LABELS } from '../../utils/mathStats';

export const CustomerBehaviorTab: React.FC = () => {
  const { customerBehavior, records } = useData();

  if (records.length === 0 || !customerBehavior) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please upload a customer feedback dataset to analyze customer behavior.
      </div>
    );
  }

  const {
    paymentMethodMetrics,
    visitFrequencyMetrics,
    favoriteDishMetrics,
    spendingAnalysis,
  } = customerBehavior;

  // Chart: Average Satisfaction by Payment Method
  const paymentChartData = {
    labels: paymentMethodMetrics.map((p) => p.category),
    datasets: [
      {
        label: 'Average Satisfaction (1-5)',
        data: paymentMethodMetrics.map((p) => p.averageSatisfaction),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart: Average Satisfaction by Visit Frequency
  const frequencyChartData = {
    labels: visitFrequencyMetrics.map((f) => f.category),
    datasets: [
      {
        label: 'Average Satisfaction (1-5)',
        data: visitFrequencyMetrics.map((f) => f.averageSatisfaction),
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart: Average Satisfaction by Favorite Dish (Horizontal Bar)
  const dishChartData = {
    labels: favoriteDishMetrics.map((d) => d.category),
    datasets: [
      {
        label: 'Average Satisfaction',
        data: favoriteDishMetrics.map((d) => d.averageSatisfaction),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const horizontalBarOptions = {
    ...defaultChartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        min: 1,
        max: 5,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        title: { display: true, text: 'Average Feedback Rating (1-5)', color: '#94a3b8' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
      },
    },
  };

  // Chart: Amount Spent vs Satisfaction (Scatter Plot)
  const scatterPoints = records.map((r) => ({
    x: r.amountSpent,
    y: r.feedbackScore,
  }));

  const scatterChartData = {
    datasets: [
      {
        label: 'Customer (Spend vs Rating)',
        data: scatterPoints,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(129, 140, 248)',
        pointRadius: 4.5,
        pointHoverRadius: 7,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `Spend: $${ctx.raw.x.toFixed(2)} | Rating: ${ctx.raw.y}★`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        title: { display: true, text: 'Amount Spent ($)', color: '#94a3b8' },
      },
      y: {
        min: 0.5,
        max: 5.5,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        title: { display: true, text: 'Feedback Score (1-5)', color: '#94a3b8' },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Behavior Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">
          Multivariate exploratory breakdown across Payment Methods, Visit Frequencies, Favorite
          Dishes, and Amount Spent
        </p>
      </div>

      {/* Mandatory Non-Causation Warning (Section 12 & 13) */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold">CRITICAL STATISTICAL PRINCIPLE:</span>{' '}
          <strong className="text-white underline decoration-amber-400">
            Correlation does not imply causation.
          </strong>{' '}
          Observed behavioral associations (such as higher satisfaction among certain payment
          methods or spending amounts) reflect empirical patterns in this sample, but do not prove
          that changing a payment method or spending more causes satisfaction to increase.
        </div>
      </div>

      {/* Amount Spent Statistics Overview Cards (Section 13) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Section 13: Amount Spent Summary &amp; Correlation Analysis</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Column: AMOUNT SPENT ON THAT DAY(20/10/2024)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Average Amount Spent</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              ${spendingAnalysis.meanSpending.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sample mean expenditure</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Minimum Amount Spent</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${spendingAnalysis.minSpending.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lowest transaction</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Maximum Amount Spent</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${spendingAnalysis.maxSpending.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Highest transaction</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <div className="text-slate-400 text-[11px]">Pearson Correlation (r)</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
              {spendingAnalysis.correlationWithSatisfaction > 0 ? '+' : ''}
              {spendingAnalysis.correlationWithSatisfaction.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {Math.abs(spendingAnalysis.correlationWithSatisfaction) > 0.5
                ? 'Strong linear relation'
                : Math.abs(spendingAnalysis.correlationWithSatisfaction) > 0.3
                ? 'Moderate correlation'
                : 'Weak/Mild correlation'}
            </div>
          </div>
        </div>

        {/* Average Spending For Each Satisfaction Rating Table */}
        <div className="mt-4 pt-4 border-t border-slate-700/60">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Average Spending for Each Feedback Score (1 to 5):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {spendingAnalysis.spendingByRating.map((item) => (
              <div
                key={item.rating}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center"
              >
                <div className="text-slate-400 font-mono text-[11px]">
                  {item.rating}★ ({SATISFACTION_LABELS[item.rating]})
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ${item.averageSpending.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500">{item.count} customers</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scatter Plot: Amount Spent vs Customer Satisfaction */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Amount Spent vs Customer Satisfaction (Scatter Plot)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              X-axis: Amount Spent ($) | Y-axis: Feedback Score (1-5)
            </p>
          </div>
          <span className="text-xs text-indigo-300 font-mono">
            r = {spendingAnalysis.correlationWithSatisfaction.toFixed(4)}
          </span>
        </div>

        <div className="h-72">
          <Scatter data={scatterChartData} options={scatterOptions} />
        </div>
      </div>

      {/* Behavioral Charts: Payment Method & Visit Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Analysis */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Average Satisfaction by Payment Method</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Bar Chart</span>
          </div>

          <div className="h-60">
            <Bar
              data={paymentChartData}
              options={{
                ...defaultChartOptions,
                plugins: { ...defaultChartOptions.plugins, legend: { display: false } },
                scales: {
                  ...defaultChartOptions.scales,
                  y: { min: 1, max: 5, ticks: { stepSize: 1, color: '#94a3b8' } },
                },
              }}
            />
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="py-1.5 px-2">Payment Method</th>
                  <th className="py-1.5 px-2 text-center">Customers</th>
                  <th className="py-1.5 px-2 text-right">Avg Rating</th>
                  <th className="py-1.5 px-2 text-right">Avg Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {paymentMethodMetrics.map((p) => (
                  <tr key={p.category}>
                    <td className="py-1.5 px-2 text-white font-sans">{p.category}</td>
                    <td className="py-1.5 px-2 text-center text-slate-400">{p.count}</td>
                    <td className="py-1.5 px-2 text-right text-indigo-300 font-bold">
                      {p.averageSatisfaction.toFixed(2)} ★
                    </td>
                    <td className="py-1.5 px-2 text-right text-emerald-400">
                      ${p.averageSpending.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visit Frequency Analysis */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-400" />
              <span>Average Satisfaction by Visit Frequency</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Bar Chart</span>
          </div>

          <div className="h-60">
            <Bar
              data={frequencyChartData}
              options={{
                ...defaultChartOptions,
                plugins: { ...defaultChartOptions.plugins, legend: { display: false } },
                scales: {
                  ...defaultChartOptions.scales,
                  y: { min: 1, max: 5, ticks: { stepSize: 1, color: '#94a3b8' } },
                },
              }}
            />
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="py-1.5 px-2">Visit Frequency</th>
                  <th className="py-1.5 px-2 text-center">Customers</th>
                  <th className="py-1.5 px-2 text-right">Avg Rating</th>
                  <th className="py-1.5 px-2 text-right">Avg Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {visitFrequencyMetrics.map((f) => (
                  <tr key={f.category}>
                    <td className="py-1.5 px-2 text-white font-sans">{f.category}</td>
                    <td className="py-1.5 px-2 text-center text-slate-400">{f.count}</td>
                    <td className="py-1.5 px-2 text-right text-amber-300 font-bold">
                      {f.averageSatisfaction.toFixed(2)} ★
                    </td>
                    <td className="py-1.5 px-2 text-right text-emerald-400">
                      ${f.averageSpending.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Favorite Dish Horizontal Bar Chart & Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Average Satisfaction by Favorite Dish</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Readable horizontal bar comparison across menu items
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Horizontal Bar</span>
        </div>

        <div className="h-80">
          <Bar data={dishChartData} options={horizontalBarOptions} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                <th className="py-1.5 px-2">Favorite Dish</th>
                <th className="py-1.5 px-2 text-center">Popularity (Orders)</th>
                <th className="py-1.5 px-2 text-center">% of Total</th>
                <th className="py-1.5 px-2 text-right">Average Feedback Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {favoriteDishMetrics.map((d) => (
                <tr key={d.category}>
                  <td className="py-1.5 px-2 text-white font-semibold font-sans">{d.category}</td>
                  <td className="py-1.5 px-2 text-center text-slate-300">{d.count}</td>
                  <td className="py-1.5 px-2 text-center text-slate-400">{d.percentage}%</td>
                  <td className="py-1.5 px-2 text-right text-emerald-400 font-bold">
                    {d.averageSatisfaction.toFixed(2)} ★
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
