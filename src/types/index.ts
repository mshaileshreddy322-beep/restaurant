export interface RawCustomerRecord {
  'USER ID': string;
  'AMOUNT SPENT ON THAT DAY(20/10/2024)': string | number;
  'Payment Method': string;
  'Feedback Score (1-5)': string | number;
  'Favorite Dish': string;
  'Visit Frequency': string;
  'DATE': string;
  [key: string]: any;
}

export interface CustomerRecord {
  userId: string;
  amountSpent: number;
  paymentMethod: string;
  feedbackScore: number; // 1, 2, 3, 4, 5
  favoriteDish: string;
  visitFrequency: string;
  date: string;
  satisfactionCategory: string; // 'Very Dissatisfied', etc.
}

export type SatisfactionLevel = 1 | 2 | 3 | 4 | 5;

export interface DatasetSummary {
  fileName: string;
  totalRows: number;
  totalColumns: number;
  columnNames: string[];
  columnTypes: Record<string, string>;
  validRecordsCount: number;
  missingValuesCount: Record<string, number>;
  totalMissingCells: number;
  duplicateRowsCount: number;
  uploadTimestamp: string;
}

export interface DescriptiveStats {
  totalCustomers: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  standardError: number;
  min: number;
  max: number;
  ratingCounts: Record<SatisfactionLevel, number>;
  ratingPercentages: Record<SatisfactionLevel, number>;
}

export interface HypothesisTestResult {
  benchmarkMean: number; // 3.5
  sampleSize: number;
  sampleMean: number;
  sampleStdDev: number;
  standardError: number;
  degreesOfFreedom: number;
  tStatistic: number;
  pValue: number;
  criticalValue: number; // Left-tailed: -t_{alpha, df}
  alpha: number; // 0.05
  confidenceLevel: number; // 0.95
  ciLower: number;
  ciUpper: number;
  decision: 'REJECT_NULL' | 'FAIL_TO_REJECT_NULL';
  conclusionText: string;
  businessInterpretation: string;
}

export interface SpendingAnalysis {
  meanSpending: number;
  minSpending: number;
  maxSpending: number;
  medianSpending: number;
  spendingByRating: { rating: SatisfactionLevel; averageSpending: number; count: number }[];
  correlationWithSatisfaction: number; // Pearson r
}

export interface BehaviorGroupMetric {
  category: string;
  count: number;
  averageSatisfaction: number;
  averageSpending: number;
  percentage: number;
}

export interface CustomerBehaviorAnalysis {
  paymentMethodMetrics: BehaviorGroupMetric[];
  visitFrequencyMetrics: BehaviorGroupMetric[];
  favoriteDishMetrics: BehaviorGroupMetric[];
  spendingAnalysis: SpendingAnalysis;
}

export interface ConfusionMatrix {
  matrix: number[][]; // 5x5 for ratings 1..5
  labels: number[];
}

export interface MLMetrics {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedPrecision: number;
  weightedRecall: number;
  weightedF1: number;
  perClassMetrics: {
    label: number;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
  confusionMatrix: ConfusionMatrix;
  featureImportances: { feature: string; importance: number }[];
  trainSampleSize: number;
  testSampleSize: number;
  featuresUsed: string[];
  trainingTimestamp: string;
}

export interface PredictionInput {
  amountSpent: number;
  paymentMethod: string;
  favoriteDish: string;
  visitFrequency: string;
}

export interface PredictionResult {
  predictedScore: number;
  categoryLabel: string;
  probabilities: { score: number; probability: number }[];
}

export type TabType =
  | 'dashboard'
  | 'dataset'
  | 'satisfaction'
  | 'hypothesis'
  | 'customer'
  | 'ml'
  | 'prediction'
  | 'visualizations'
  | 'conclusion';
