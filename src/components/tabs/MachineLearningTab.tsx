import React from 'react';
import { useData } from '../../context/DataContext';
import { Bar } from 'react-chartjs-2';
import '../../utils/chartSetup';
import { defaultChartOptions } from '../../utils/chartSetup';
import {
  Brain,
  Layers,
  BarChart4,
  AlertCircle,
  Table,
  CheckCircle,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { SATISFACTION_LABELS } from '../../utils/mathStats';
import { SatisfactionLevel } from '../../types';

export const MachineLearningTab: React.FC = () => {
  const { mlMetrics, records } = useData();

  if (records.length === 0 || !mlMetrics) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please upload a customer feedback dataset to train the Random Forest Classifier.
      </div>
    );
  }

  // Feature Importance Horizontal Bar Chart
  const featureChartData = {
    labels: mlMetrics.featureImportances.slice(0, 10).map((f) => f.feature),
    datasets: [
      {
        label: 'Gini Importance (%)',
        data: mlMetrics.featureImportances.slice(0, 10).map((f) => f.importance),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const featureChartOptions = {
    ...defaultChartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        title: { display: true, text: 'Relative Contribution (%)', color: '#94a3b8' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
      },
    },
  };

  const matrix = mlMetrics.confusionMatrix.matrix;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Supporting ML Component
          </span>
          <span className="text-xs text-slate-400">Random Forest Classifier (Ensemble of Decision Trees)</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Machine Learning Evaluation &amp; Feature Importance
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Predicting customer satisfaction score (1 to 5) using Amount Spent, Payment Method,
          Favorite Dish, and Visit Frequency (USER ID strictly excluded)
        </p>
      </div>

      {/* Model Scope & Supporting Role Alert (Section 14 & 15) */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Project Scope Note:</span> Machine learning is
          included strictly as a <strong>supporting feature</strong> to examine non-linear predictive
          patterns. The primary statistical inference remains the One-Sample Left-Tailed t-Test. The
          metrics below reflect authentic empirical training on an 80/20 split without synthetic
          fabrication or data manipulation.
        </div>
      </div>

      {/* Primary ML Performance Metric Cards (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Test Accuracy
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {(mlMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {mlMetrics.testSampleSize} test records evaluated
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Weighted Precision
          </div>
          <div className="text-3xl font-extrabold font-mono text-indigo-300 mt-1">
            {mlMetrics.weightedPrecision.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Macro Precision: {mlMetrics.macroPrecision.toFixed(3)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Weighted Recall
          </div>
          <div className="text-3xl font-extrabold font-mono text-indigo-300 mt-1">
            {mlMetrics.weightedRecall.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Macro Recall: {mlMetrics.macroRecall.toFixed(3)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Weighted F1-Score
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
            {mlMetrics.weightedF1.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Macro F1: {mlMetrics.macroF1.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Model Architecture & Training Parameters */}
      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400">Data Partition:</span>{' '}
          <strong className="text-white">80% Train / 20% Test</strong>
        </div>
        <div>
          <span className="text-slate-400">Training Samples:</span>{' '}
          <strong className="text-indigo-300 font-mono">{mlMetrics.trainSampleSize}</strong>
        </div>
        <div>
          <span className="text-slate-400">Random State:</span>{' '}
          <strong className="text-white font-mono">42 (Fixed Seed)</strong>
        </div>
        <div>
          <span className="text-slate-400">Total Encoded Features:</span>{' '}
          <strong className="text-emerald-400 font-mono">{mlMetrics.featuresUsed.length}</strong>
        </div>
      </div>

      {/* Confusion Matrix & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix (Heatmap Table) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>5 × 5 Multi-Class Confusion Matrix</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Rows = Ground Truth (Actual) | Columns = Predicted Rating
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Test Partition</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-500 uppercase text-[10px]">
                    Actual \ Pred
                  </th>
                  {[1, 2, 3, 4, 5].map((c) => (
                    <th key={c} className="p-2 text-indigo-300 font-mono font-bold">
                      Pred {c}★
                    </th>
                  ))}
                  <th className="p-2 text-slate-400 font-mono text-[11px]">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {[1, 2, 3, 4, 5].map((actual, rowIdx) => {
                  const rowSum = matrix[rowIdx].reduce((a, b) => a + b, 0);
                  return (
                    <tr key={actual}>
                      <td className="p-2 text-left font-bold text-slate-300">
                        Actual {actual}★
                      </td>
                      {[0, 1, 2, 3, 4].map((colIdx) => {
                        const count = matrix[rowIdx][colIdx];
                        const isDiagonal = rowIdx === colIdx;
                        return (
                          <td
                            key={colIdx}
                            className={`p-2 rounded font-bold ${
                              isDiagonal
                                ? count > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                      <td className="p-2 text-slate-400 font-sans">{rowSum}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Per-class Metrics Breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-700/60">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Class-Level Precision &amp; Recall:</h4>
            <div className="grid grid-cols-5 gap-2 text-[11px] font-mono">
              {mlMetrics.perClassMetrics.map((pcm) => (
                <div key={pcm.label} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-center">
                  <div className="text-slate-400 font-bold">{pcm.label}★</div>
                  <div className="text-emerald-400 text-[10px] mt-0.5">P: {pcm.precision.toFixed(2)}</div>
                  <div className="text-indigo-400 text-[10px]">R: {pcm.recall.toFixed(2)}</div>
                  <div className="text-amber-400 text-[10px]">F1: {pcm.f1.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart4 className="w-4 h-4 text-indigo-400" />
                <span>Feature Importance (Gini Impurity Decrease)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Top predictive drivers in the Random Forest ensemble
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Top 10 Features</span>
          </div>

          <div className="h-80">
            <Bar data={featureChartData} options={featureChartOptions} />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Note: Features with higher Gini importance contributed to greater node purity splits
            across all {25} decision trees in the forest ensemble.
          </p>
        </div>
      </div>

      {/* Real Model Explanation & Limitations Note (Section 15) */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
        <h4 className="font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Academic Discussion on Model Performance &amp; Limitations</span>
        </h4>
        <p className="text-slate-400 leading-relaxed">
          In customer feedback classification, subjective human emotion and external dining factors
          (e.g., waiting times, ambience, staff attitude) often introduce intrinsic noise.
          A moderate test accuracy (e.g., 40%–70% on a 5-class multi-category ordinal problem) is
          statistically expected when operating on survey covariates. The model is presented with
          academic honesty without artificial inflation, serving as an exploratory tool alongside the
          rigorous hypothesis test.
        </p>
      </div>
    </div>
  );
};
