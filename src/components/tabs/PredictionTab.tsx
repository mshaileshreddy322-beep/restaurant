import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Sparkles,
  DollarSign,
  CreditCard,
  Utensils,
  Repeat,
  AlertTriangle,
  ArrowRight,
  Star,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { PredictionInput, PredictionResult, SatisfactionLevel } from '../../types';
import { SATISFACTION_LABELS } from '../../utils/mathStats';

export const PredictionTab: React.FC = () => {
  const { mlModel, records, predictSatisfaction } = useData();

  const [amountSpent, setAmountSpent] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [favoriteDish, setFavoriteDish] = useState<string>('');
  const [visitFrequency, setVisitFrequency] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize dropdown defaults from trained model
  useEffect(() => {
    if (mlModel && mlModel.isTrained) {
      if (mlModel.categoricalValues.paymentMethods.length > 0 && !paymentMethod) {
        setPaymentMethod(mlModel.categoricalValues.paymentMethods[0]);
      }
      if (mlModel.categoricalValues.favoriteDishes.length > 0 && !favoriteDish) {
        setFavoriteDish(mlModel.categoricalValues.favoriteDishes[0]);
      }
      if (mlModel.categoricalValues.visitFrequencies.length > 0 && !visitFrequency) {
        setVisitFrequency(mlModel.categoricalValues.visitFrequencies[0]);
      }
    }
  }, [mlModel]);

  if (records.length === 0 || !mlModel || !mlModel.isTrained) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Model Not Trained</h3>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          Please upload a valid customer feedback dataset first to train the Random Forest
          Classifier before making predictions.
        </p>
      </div>
    );
  }

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amountSpent < 0 || isNaN(amountSpent)) {
      setErrorMsg('Please enter a valid non-negative amount spent.');
      return;
    }

    try {
      const pred = predictSatisfaction({
        amountSpent: Number(amountSpent),
        paymentMethod: paymentMethod || 'Cash',
        favoriteDish: favoriteDish || 'Special',
        visitFrequency: visitFrequency || 'Weekly',
      });
      setResult(pred);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred during prediction.');
    }
  };

  // Quick Preset Scenarios for presentation
  const applyPreset = (amount: number, payment: string, dish: string, freq: string) => {
    setAmountSpent(amount);
    if (mlModel.categoricalValues.paymentMethods.includes(payment)) setPaymentMethod(payment);
    if (mlModel.categoricalValues.favoriteDishes.includes(dish)) setFavoriteDish(dish);
    if (mlModel.categoricalValues.visitFrequencies.includes(freq)) setVisitFrequency(freq);
  };

  const scoreColors = {
    1: 'border-rose-500 bg-rose-500/10 text-rose-400',
    2: 'border-orange-500 bg-orange-500/10 text-orange-400',
    3: 'border-amber-500 bg-amber-500/10 text-amber-400',
    4: 'border-indigo-500 bg-indigo-500/10 text-indigo-300',
    5: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 16
          </span>
          <span className="text-xs text-slate-400">Inference Engine</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Predict Customer Satisfaction
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate prospective diner attributes to evaluate predicted Feedback Score (1-5) and
          probability distribution using the trained Random Forest ensemble
        </p>
      </div>

      {/* Preset Quick Buttons for easy demo */}
      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Demo Scenarios:</span>
        <button
          type="button"
          onClick={() =>
            applyPreset(
              1500,
              mlModel.categoricalValues.paymentMethods[0] || 'Credit Card',
              mlModel.categoricalValues.favoriteDishes[0] || 'Biryani',
              'Daily'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          High-Spend Frequent Diner ($1500)
        </button>
        <button
          type="button"
          onClick={() =>
            applyPreset(
              250,
              mlModel.categoricalValues.paymentMethods.includes('Cash')
                ? 'Cash'
                : mlModel.categoricalValues.paymentMethods[0],
              mlModel.categoricalValues.favoriteDishes.includes('Burger')
                ? 'Burger'
                : mlModel.categoricalValues.favoriteDishes[0],
              'First Time'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          Budget First-Timer ($250)
        </button>
        <button
          type="button"
          onClick={() =>
            applyPreset(
              750,
              mlModel.categoricalValues.paymentMethods.includes('UPI')
                ? 'UPI'
                : mlModel.categoricalValues.paymentMethods[0],
              mlModel.categoricalValues.favoriteDishes.includes('Butter Chicken')
                ? 'Butter Chicken'
                : mlModel.categoricalValues.favoriteDishes[0],
              'Weekly'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          Regular Mid-Tier Diner ($750)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Input Form (Section 16) */}
        <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/60">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Enter Customer Attributes</span>
          </h3>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            {/* Amount Spent Input */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Amount Spent ($ / Currency Unit)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amountSpent}
                onChange={(e) => setAmountSpent(Number(e.target.value))}
                placeholder="e.g. 850"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Continuous numerical input representing transaction value
              </span>
            </div>

            {/* Payment Method Dropdown */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {mlModel.categoricalValues.paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorite Dish Dropdown */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span>Favorite Dish</span>
              </label>
              <select
                value={favoriteDish}
                onChange={(e) => setFavoriteDish(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {mlModel.categoricalValues.favoriteDishes.map((fd) => (
                  <option key={fd} value={fd}>
                    {fd}
                  </option>
                ))}
              </select>
            </div>

            {/* Visit Frequency Dropdown */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-amber-400" />
                <span>Visit Frequency</span>
              </label>
              <select
                value={visitFrequency}
                onChange={(e) => setVisitFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {mlModel.categoricalValues.visitFrequencies.map((vf) => (
                  <option key={vf} value={vf}>
                    {vf}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Predict Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Predict Satisfaction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Prediction Results Display (Section 16) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          {result ? (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Real-Time Model Inference Result
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Computed
                  </span>
                </div>

                {/* Big Result Badge */}
                <div
                  className={`p-6 rounded-2xl border text-center my-2 ${
                    scoreColors[result.predictedScore as SatisfactionLevel]
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    Predicted Feedback Score
                  </div>
                  <div className="text-5xl font-black font-mono my-2 tracking-tight">
                    ★ {result.predictedScore}
                  </div>
                  <div className="text-lg font-bold">
                    Satisfaction Category: {result.categoryLabel}
                  </div>
                </div>

                {/* Category Scale Breakdown */}
                <div className="mt-5 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Random Forest Probability Distribution Across All Classes:
                  </div>
                  {result.probabilities.map((item) => {
                    const isWinner = item.score === result.predictedScore;
                    return (
                      <div key={item.score} className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between items-center text-slate-400">
                          <span className={isWinner ? 'font-bold text-white' : ''}>
                            {item.score}★ ({SATISFACTION_LABELS[item.score as SatisfactionLevel]}):
                          </span>
                          <span
                            className={
                              isWinner ? 'font-bold text-indigo-300' : 'text-slate-400'
                            }
                          >
                            {item.probability.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isWinner ? 'bg-indigo-500' : 'bg-slate-700'
                            }`}
                            style={{ width: `${item.probability}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
                Inference executed via 25 bagging trees with one-hot encoded categorization.
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center text-slate-400">
              <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-base font-semibold text-slate-300 mb-1">
                Awaiting Parameter Submission
              </h4>
              <p className="text-xs max-w-sm">
                Select customer attributes on the left and click "Predict Satisfaction" to view
                real-time Random Forest inference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
