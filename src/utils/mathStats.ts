import {
  DescriptiveStats,
  HypothesisTestResult,
  SatisfactionLevel,
  CustomerRecord,
  CustomerBehaviorAnalysis,
  BehaviorGroupMetric,
  SpendingAnalysis,
} from '../types';

export const SATISFACTION_LABELS: Record<SatisfactionLevel, string> = {
  1: 'Very Dissatisfied',
  2: 'Dissatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Very Satisfied',
};

// Log Gamma function using Lanczos approximation (g=7, n=9)
export function logGamma(z: number): number {
  if (z <= 0) return 0;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.138571095856205,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  const g = 7;
  let x = z - 1;
  let a = p[0];
  for (let i = 1; i < p.length; i++) {
    a += p[i] / (x + i);
  }
  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Continued fraction evaluation for regularized incomplete beta function
function betacf(a: number, b: number, x: number): number {
  const MAX_IT = 200;
  const EPS = 3.0e-14;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAX_IT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) <= EPS) break;
  }
  return h;
}

// Regularized incomplete beta function I_x(a, b)
export function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));

  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

// Student's t cumulative distribution function: P(T <= t) given degrees of freedom df
export function studentTCDF(t: number, df: number): number {
  if (df <= 0) return 0;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const ib = incompleteBeta(df / 2.0, 0.5, x);

  if (t < 0) {
    return 0.5 * ib;
  } else {
    return 1.0 - 0.5 * ib;
  }
}

// Quantile / Inverse CDF for Student's t distribution: find t such that studentTCDF(t, df) = p
export function studentTInverseCDF(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  // Symmetric about 0
  if (p > 0.5) {
    return -studentTInverseCDF(1 - p, df);
  }

  // Initial guess using normal approximation
  // Rational approximation for normal quantile
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const q = Math.sqrt(-2 * Math.log(p));
  let z = -q;
  if (df > 2) {
    z = z + (z * z * z + z) / (4 * df);
  }

  // Refine using bisection + Newton hybrid
  let low = -100.0;
  let high = 0.0;
  let guess = Math.max(low, Math.min(high, z));

  for (let i = 0; i < 40; i++) {
    const cdf = studentTCDF(guess, df);
    const err = cdf - p;
    if (Math.abs(err) < 1e-10) break;

    if (err < 0) {
      low = guess;
    } else {
      high = guess;
    }

    // Numerical derivative (PDF of Student's t)
    const pdf =
      Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) /
      (Math.sqrt(df * Math.PI) * Math.pow(1 + (guess * guess) / df, (df + 1) / 2));

    let nextGuess = guess - err / (pdf || 1e-6);
    if (nextGuess <= low || nextGuess >= high) {
      nextGuess = 0.5 * (low + high);
    }
    guess = nextGuess;
  }
  return guess;
}

// Basic Statistics calculations
export function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, v) => acc + v, 0);
  return sum / arr.length;
}

export function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function calculateSampleVariance(arr: number[], meanVal?: number): number {
  if (arr.length <= 1) return 0;
  const mean = meanVal !== undefined ? meanVal : calculateMean(arr);
  const sumSqDiff = arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  return sumSqDiff / (arr.length - 1);
}

export function calculateSampleStdDev(arr: number[], meanVal?: number): number {
  return Math.sqrt(calculateSampleVariance(arr, meanVal));
}

export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const denominator = Math.sqrt(denX * denY);
  if (denominator === 0) return 0;
  return num / denominator;
}

// Descriptive Statistics for Customer Feedback
export function computeDescriptiveStats(records: CustomerRecord[]): DescriptiveStats {
  const scores = records.map((r) => r.feedbackScore);
  const n = scores.length;

  if (n === 0) {
    return {
      totalCustomers: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      variance: 0,
      standardError: 0,
      min: 0,
      max: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const mean = calculateMean(scores);
  const median = calculateMedian(scores);
  const variance = calculateSampleVariance(scores, mean);
  const stdDev = Math.sqrt(variance);
  const standardError = n > 0 ? stdDev / Math.sqrt(n) : 0;
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  const ratingCounts: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  scores.forEach((s) => {
    const lvl = s as SatisfactionLevel;
    if (ratingCounts[lvl] !== undefined) {
      ratingCounts[lvl]++;
    }
  });

  const ratingPercentages: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (Object.keys(ratingCounts) as unknown as SatisfactionLevel[]).forEach((lvl) => {
    ratingPercentages[lvl] = (ratingCounts[lvl] / n) * 100;
  });

  return {
    totalCustomers: n,
    mean: Number(mean.toFixed(4)),
    median,
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    standardError: Number(standardError.toFixed(4)),
    min,
    max,
    ratingCounts,
    ratingPercentages,
  };
}

// One-Sample Left-Tailed t-Test
// H0: mu >= 3.5
// H1: mu < 3.5
// Significance level alpha = 0.05
export function performHypothesisTest(records: CustomerRecord[], benchmarkMean: number = 3.5): HypothesisTestResult {
  const scores = records.map((r) => r.feedbackScore);
  const n = scores.length;
  const alpha = 0.05;

  if (n < 2) {
    return {
      benchmarkMean,
      sampleSize: n,
      sampleMean: n === 1 ? scores[0] : 0,
      sampleStdDev: 0,
      standardError: 0,
      degreesOfFreedom: Math.max(0, n - 1),
      tStatistic: 0,
      pValue: 1,
      criticalValue: -1.645,
      alpha,
      confidenceLevel: 0.95,
      ciLower: 0,
      ciUpper: 0,
      decision: 'FAIL_TO_REJECT_NULL',
      conclusionText: 'Sample size is too small to perform a statistically valid t-test (requires n >= 2).',
      businessInterpretation: 'Insufficient data points collected.',
    };
  }

  const sampleMean = calculateMean(scores);
  const sampleStdDev = calculateSampleStdDev(scores, sampleMean);
  const standardError = sampleStdDev / Math.sqrt(n);
  const df = n - 1;

  // t-statistic = (x_bar - mu_0) / SE
  const tStatistic = standardError > 0 ? (sampleMean - benchmarkMean) / standardError : 0;

  // Left-tailed p-value = P(T <= tStatistic)
  const pValue = studentTCDF(tStatistic, df);

  // Critical value for left-tailed test at alpha = 0.05
  // t_crit = t_{alpha, df} (negative value)
  const criticalValue = studentTInverseCDF(alpha, df);

  // 95% Two-sided Confidence Interval for population mean
  // t_{0.025, df}
  const tAlphaHalf = Math.abs(studentTInverseCDF(0.025, df));
  const ciMargin = tAlphaHalf * standardError;
  const ciLower = sampleMean - ciMargin;
  const ciUpper = sampleMean + ciMargin;

  // Decision rule: Left-tailed test rejects H0 if tStatistic < criticalValue (or pValue < alpha)
  const decision: 'REJECT_NULL' | 'FAIL_TO_REJECT_NULL' =
    pValue < alpha ? 'REJECT_NULL' : 'FAIL_TO_REJECT_NULL';

  let conclusionText = '';
  let businessInterpretation = '';

  if (decision === 'REJECT_NULL') {
    conclusionText = `At the α = 0.05 significance level, the calculated t-statistic (${tStatistic.toFixed(4)}) is less than the critical value (${criticalValue.toFixed(4)}), yielding a p-value of ${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}. Therefore, we REJECT the null hypothesis (H₀).`;
    businessInterpretation = `There is statistically significant evidence to conclude that the population mean customer satisfaction is below the industry benchmark of 3.5. Restaurant management must intervene to improve food quality, staff hospitality, and service turnaround time.`;
  } else {
    conclusionText = `At the α = 0.05 significance level, the calculated t-statistic (${tStatistic.toFixed(4)}) is greater than or equal to the critical value (${criticalValue.toFixed(4)}), yielding a p-value of ${pValue.toFixed(4)} (≥ 0.05). Therefore, we FAIL TO REJECT the null hypothesis (H₀).`;
    businessInterpretation = `There is insufficient statistical evidence to conclude that customer satisfaction is below the 3.5 benchmark. The restaurant is currently meeting or maintaining acceptable operational satisfaction standards.`;
  }

  return {
    benchmarkMean,
    sampleSize: n,
    sampleMean: Number(sampleMean.toFixed(4)),
    sampleStdDev: Number(sampleStdDev.toFixed(4)),
    standardError: Number(standardError.toFixed(4)),
    degreesOfFreedom: df,
    tStatistic: Number(tStatistic.toFixed(4)),
    pValue: Number(pValue.toFixed(5)),
    criticalValue: Number(criticalValue.toFixed(4)),
    alpha,
    confidenceLevel: 0.95,
    ciLower: Number(ciLower.toFixed(4)),
    ciUpper: Number(ciUpper.toFixed(4)),
    decision,
    conclusionText,
    businessInterpretation,
  };
}

// Customer Behavior Analysis
export function computeCustomerBehaviorAnalysis(records: CustomerRecord[]): CustomerBehaviorAnalysis {
  const n = records.length;
  if (n === 0) {
    return {
      paymentMethodMetrics: [],
      visitFrequencyMetrics: [],
      favoriteDishMetrics: [],
      spendingAnalysis: {
        meanSpending: 0,
        minSpending: 0,
        maxSpending: 0,
        medianSpending: 0,
        spendingByRating: [],
        correlationWithSatisfaction: 0,
      },
    };
  }

  const groupData = (key: keyof CustomerRecord) => {
    const map = new Map<string, { count: number; totalScore: number; totalSpending: number }>();

    records.forEach((r) => {
      const val = String(r[key] || 'Unknown').trim();
      const existing = map.get(val) || { count: 0, totalScore: 0, totalSpending: 0 };
      existing.count += 1;
      existing.totalScore += r.feedbackScore;
      existing.totalSpending += r.amountSpent;
      map.set(val, existing);
    });

    const result: BehaviorGroupMetric[] = [];
    map.forEach((data, category) => {
      result.push({
        category,
        count: data.count,
        averageSatisfaction: Number((data.totalScore / data.count).toFixed(2)),
        averageSpending: Number((data.totalSpending / data.count).toFixed(2)),
        percentage: Number(((data.count / n) * 100).toFixed(1)),
      });
    });

    return result.sort((a, b) => b.count - a.count);
  };

  const paymentMethodMetrics = groupData('paymentMethod');
  const visitFrequencyMetrics = groupData('visitFrequency');
  const favoriteDishMetrics = groupData('favoriteDish');

  // Spending analysis
  const spendings = records.map((r) => r.amountSpent);
  const scores = records.map((r) => r.feedbackScore);

  const meanSpending = calculateMean(spendings);
  const medianSpending = calculateMedian(spendings);
  const minSpending = spendings.length > 0 ? Math.min(...spendings) : 0;
  const maxSpending = spendings.length > 0 ? Math.max(...spendings) : 0;
  const correlationWithSatisfaction = calculatePearsonCorrelation(spendings, scores);

  const spendingByRating: { rating: SatisfactionLevel; averageSpending: number; count: number }[] = [];
  ([1, 2, 3, 4, 5] as SatisfactionLevel[]).forEach((rating) => {
    const matched = records.filter((r) => r.feedbackScore === rating);
    const avg = matched.length > 0 ? calculateMean(matched.map((m) => m.amountSpent)) : 0;
    spendingByRating.push({
      rating,
      averageSpending: Number(avg.toFixed(2)),
      count: matched.length,
    });
  });

  return {
    paymentMethodMetrics,
    visitFrequencyMetrics,
    favoriteDishMetrics,
    spendingAnalysis: {
      meanSpending: Number(meanSpending.toFixed(2)),
      medianSpending: Number(medianSpending.toFixed(2)),
      minSpending: Number(minSpending.toFixed(2)),
      maxSpending: Number(maxSpending.toFixed(2)),
      spendingByRating,
      correlationWithSatisfaction: Number(correlationWithSatisfaction.toFixed(4)),
    },
  };
}
