import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CustomerRecord,
  DatasetSummary,
  DescriptiveStats,
  HypothesisTestResult,
  CustomerBehaviorAnalysis,
  MLMetrics,
  PredictionInput,
  PredictionResult,
  TabType,
} from '../types';
import { validateAndParseCSV } from '../utils/csvParser';
import {
  computeDescriptiveStats,
  performHypothesisTest,
  computeCustomerBehaviorAnalysis,
} from '../utils/mathStats';
import { RandomForestModel } from '../utils/mlEngine';
import { SAMPLE_CSV_CONTENT } from '../data/sampleDataset';

interface DataContextType {
  records: CustomerRecord[];
  summary: DatasetSummary | null;
  descriptiveStats: DescriptiveStats | null;
  hypothesisTest: HypothesisTestResult | null;
  customerBehavior: CustomerBehaviorAnalysis | null;
  mlModel: RandomForestModel | null;
  mlMetrics: MLMetrics | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isLoading: boolean;
  error: string | null;
  warnings: string[];
  clearError: () => void;
  loadCSVText: (csvText: string, fileName: string) => boolean;
  loadSampleData: () => void;
  resetData: () => void;
  predictSatisfaction: (input: PredictionInput) => PredictionResult;
  lastUpdated: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<CustomerRecord[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [descriptiveStats, setDescriptiveStats] = useState<DescriptiveStats | null>(null);
  const [hypothesisTest, setHypothesisTest] = useState<HypothesisTestResult | null>(null);
  const [customerBehavior, setCustomerBehavior] = useState<CustomerBehaviorAnalysis | null>(null);
  const [mlModel, setMlModel] = useState<RandomForestModel | null>(null);
  const [mlMetrics, setMlMetrics] = useState<MLMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const clearError = () => setError(null);

  const processRecords = (newRecords: CustomerRecord[], newSummary: DatasetSummary) => {
    setIsLoading(true);
    try {
      // 1. Descriptive stats
      const stats = computeDescriptiveStats(newRecords);
      setDescriptiveStats(stats);

      // 2. Hypothesis testing (One-Sample Left-Tailed t-test, mu_0 = 3.5, alpha = 0.05)
      const hypResult = performHypothesisTest(newRecords, 3.5);
      setHypothesisTest(hypResult);

      // 3. Customer behavior analysis
      const behavior = computeCustomerBehaviorAnalysis(newRecords);
      setCustomerBehavior(behavior);

      // 4. Random Forest Classifier
      const rf = new RandomForestModel(25, 6, 42);
      const metrics = rf.train(newRecords);
      setMlModel(rf);
      setMlMetrics(metrics);

      // Update state
      setRecords(newRecords);
      setSummary(newSummary);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err: any) {
      console.error('Error processing dataset:', err);
      setError(err?.message || 'An error occurred while analyzing the dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCSVText = (csvText: string, fileName: string): boolean => {
    setIsLoading(true);
    clearError();
    const result = validateAndParseCSV(csvText, fileName);

    if (!result.success || !result.summary) {
      setError(result.errorMessage || 'Failed to process CSV file.');
      setWarnings(result.warnings || []);
      setIsLoading(false);
      return false;
    }

    setWarnings(result.warnings || []);
    processRecords(result.records, result.summary);
    return true;
  };

  const loadSampleData = () => {
    loadCSVText(SAMPLE_CSV_CONTENT, 'restaurant_customer_feedback_sample.csv');
  };

  const resetData = () => {
    setRecords([]);
    setSummary(null);
    setDescriptiveStats(null);
    setHypothesisTest(null);
    setCustomerBehavior(null);
    setMlModel(null);
    setMlMetrics(null);
    setError(null);
    setWarnings([]);
    setLastUpdated(null);
  };

  const predictSatisfaction = (input: PredictionInput): PredictionResult => {
    if (!mlModel || !mlModel.isTrained) {
      throw new Error('Random Forest model is not trained. Please upload a dataset first.');
    }
    return mlModel.predict(input);
  };

  // Automatically load sample data on initial launch so the user sees a complete, rich dashboard immediately!
  useEffect(() => {
    loadSampleData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        records,
        summary,
        descriptiveStats,
        hypothesisTest,
        customerBehavior,
        mlModel,
        mlMetrics,
        activeTab,
        setActiveTab,
        isLoading,
        error,
        warnings,
        clearError,
        loadCSVText,
        loadSampleData,
        resetData,
        predictSatisfaction,
        lastUpdated,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
