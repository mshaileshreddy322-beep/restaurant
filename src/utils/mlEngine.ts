import {
  CustomerRecord,
  MLMetrics,
  PredictionInput,
  PredictionResult,
  SatisfactionLevel,
} from '../types';
import { SATISFACTION_LABELS } from './mathStats';

// Seeded pseudo-random number generator (Mulberry32) for deterministic reproducibility
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TreeNode {
  isLeaf: boolean;
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  probabilities?: Record<SatisfactionLevel, number>;
  predictedClass?: SatisfactionLevel;
}

interface EncodedDataset {
  featureNames: string[];
  categoricalValues: {
    paymentMethods: string[];
    favoriteDishes: string[];
    visitFrequencies: string[];
  };
  X: number[][];
  y: SatisfactionLevel[];
}

// Calculate Gini Impurity for a set of class labels
function calculateGini(labels: SatisfactionLevel[]): number {
  if (labels.length === 0) return 0;
  const counts: Record<number, number> = {};
  for (const label of labels) {
    counts[label] = (counts[label] || 0) + 1;
  }
  let sumSq = 0;
  for (const count of Object.values(counts)) {
    const p = count / labels.length;
    sumSq += p * p;
  }
  return 1 - sumSq;
}

// Compute class probabilities for leaf
function computeClassProbabilities(labels: SatisfactionLevel[]): Record<SatisfactionLevel, number> {
  const counts: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (labels.length === 0) return counts;

  for (const label of labels) {
    counts[label] = (counts[label] || 0) + 1;
  }

  const probs: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (let c = 1; c <= 5; c++) {
    probs[c as SatisfactionLevel] = counts[c as SatisfactionLevel] / labels.length;
  }
  return probs;
}

// Majority vote class
function majorityClass(labels: SatisfactionLevel[]): SatisfactionLevel {
  const counts: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const label of labels) {
    counts[label] = (counts[label] || 0) + 1;
  }
  let bestClass: SatisfactionLevel = 3;
  let maxCount = -1;
  for (let c = 1; c <= 5; c++) {
    if (counts[c as SatisfactionLevel] > maxCount) {
      maxCount = counts[c as SatisfactionLevel];
      bestClass = c as SatisfactionLevel;
    }
  }
  return bestClass;
}

// Train a single decision tree with feature bagging and track impurity decreases
function buildTree(
  X: number[][],
  y: SatisfactionLevel[],
  indices: number[],
  depth: number,
  maxDepth: number,
  minSamplesSplit: number,
  numFeaturesToSample: number,
  featureImportances: number[],
  prng: () => number
): TreeNode {
  const currentLabels = indices.map((i) => y[i]);

  // Leaf conditions
  if (
    depth >= maxDepth ||
    indices.length < minSamplesSplit ||
    new Set(currentLabels).size === 1
  ) {
    return {
      isLeaf: true,
      probabilities: computeClassProbabilities(currentLabels),
      predictedClass: majorityClass(currentLabels),
    };
  }

  const currentGini = calculateGini(currentLabels);
  const totalFeatures = X[0].length;

  // Subsample random features (Random Forest feature bagging)
  const allFeatureIndices = Array.from({ length: totalFeatures }, (_, i) => i);
  // Shuffle feature indices using prng
  for (let i = allFeatureIndices.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [allFeatureIndices[i], allFeatureIndices[j]] = [allFeatureIndices[j], allFeatureIndices[i]];
  }
  const sampledFeatures = allFeatureIndices.slice(0, numFeaturesToSample);

  let bestGain = -1;
  let bestFeature = -1;
  let bestThreshold = 0;
  let bestLeftIndices: number[] = [];
  let bestRightIndices: number[] = [];

  for (const f of sampledFeatures) {
    // Unique values for candidate thresholds
    const values = indices.map((i) => X[i][f]);
    const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
    if (uniqueValues.length <= 1) continue;

    for (let i = 0; i < uniqueValues.length - 1; i++) {
      const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
      const left: number[] = [];
      const right: number[] = [];

      for (const idx of indices) {
        if (X[idx][f] <= threshold) {
          left.push(idx);
        } else {
          right.push(idx);
        }
      }

      if (left.length === 0 || right.length === 0) continue;

      const leftGini = calculateGini(left.map((i) => y[i]));
      const rightGini = calculateGini(right.map((i) => y[i]));
      const weightedGini = (left.length / indices.length) * leftGini + (right.length / indices.length) * rightGini;
      const gain = currentGini - weightedGini;

      if (gain > bestGain) {
        bestGain = gain;
        bestFeature = f;
        bestThreshold = threshold;
        bestLeftIndices = left;
        bestRightIndices = right;
      }
    }
  }

  if (bestGain <= 1e-7 || bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
    return {
      isLeaf: true,
      probabilities: computeClassProbabilities(currentLabels),
      predictedClass: majorityClass(currentLabels),
    };
  }

  // Accumulate feature importance (weighted impurity decrease)
  featureImportances[bestFeature] += (indices.length / X.length) * bestGain;

  const leftNode = buildTree(
    X,
    y,
    bestLeftIndices,
    depth + 1,
    maxDepth,
    minSamplesSplit,
    numFeaturesToSample,
    featureImportances,
    prng
  );

  const rightNode = buildTree(
    X,
    y,
    bestRightIndices,
    depth + 1,
    maxDepth,
    minSamplesSplit,
    numFeaturesToSample,
    featureImportances,
    prng
  );

  return {
    isLeaf: false,
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: leftNode,
    right: rightNode,
    probabilities: computeClassProbabilities(currentLabels),
    predictedClass: majorityClass(currentLabels),
  };
}

// Predict single sample through a decision tree
function predictTree(node: TreeNode, x: number[]): Record<SatisfactionLevel, number> {
  if (node.isLeaf || node.featureIndex === undefined || node.threshold === undefined) {
    return node.probabilities || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  if (x[node.featureIndex] <= node.threshold) {
    return predictTree(node.left!, x);
  } else {
    return predictTree(node.right!, x);
  }
}

export class RandomForestModel {
  private trees: TreeNode[] = [];
  public featureNames: string[] = [];
  public categoricalValues = {
    paymentMethods: [] as string[],
    favoriteDishes: [] as string[],
    visitFrequencies: [] as string[],
  };
  public metrics: MLMetrics | null = null;
  public isTrained: boolean = false;

  private numTrees: number;
  private maxDepth: number;
  private seed: number;

  constructor(numTrees: number = 20, maxDepth: number = 6, seed: number = 42) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.seed = seed;
  }

  // One-Hot Encode Dataset
  public encodeRecords(records: CustomerRecord[]): EncodedDataset {
    const paymentMethods = Array.from(new Set(records.map((r) => r.paymentMethod))).filter(Boolean).sort();
    const favoriteDishes = Array.from(new Set(records.map((r) => r.favoriteDish))).filter(Boolean).sort();
    const visitFrequencies = Array.from(new Set(records.map((r) => r.visitFrequency))).filter(Boolean).sort();

    const featureNames: string[] = ['Amount Spent'];
    paymentMethods.forEach((pm) => featureNames.push(`Payment: ${pm}`));
    favoriteDishes.forEach((fd) => featureNames.push(`Dish: ${fd}`));
    visitFrequencies.forEach((vf) => featureNames.push(`Frequency: ${vf}`));

    const X: number[][] = [];
    const y: SatisfactionLevel[] = [];

    for (const r of records) {
      const row: number[] = [r.amountSpent];

      paymentMethods.forEach((pm) => row.push(r.paymentMethod === pm ? 1 : 0));
      favoriteDishes.forEach((fd) => row.push(r.favoriteDish === fd ? 1 : 0));
      visitFrequencies.forEach((vf) => row.push(r.visitFrequency === vf ? 1 : 0));

      X.push(row);
      y.push(r.feedbackScore as SatisfactionLevel);
    }

    return {
      featureNames,
      categoricalValues: {
        paymentMethods,
        favoriteDishes,
        visitFrequencies,
      },
      X,
      y,
    };
  }

  // Train Random Forest on 80/20 train/test split with fixed random seed
  public train(records: CustomerRecord[]): MLMetrics {
    if (records.length < 5) {
      throw new Error('Need at least 5 records to train the Random Forest model.');
    }

    const prng = createPRNG(this.seed);
    const encoded = this.encodeRecords(records);
    this.featureNames = encoded.featureNames;
    this.categoricalValues = encoded.categoricalValues;

    const n = encoded.X.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    // Seeded shuffle for train/test split
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 80% train, 20% test
    const trainSize = Math.max(1, Math.floor(n * 0.8));
    const trainIndices = indices.slice(0, trainSize);
    const testIndices = indices.slice(trainSize);

    // If test set is empty due to very small n, use last sample
    const actualTestIndices = testIndices.length > 0 ? testIndices : [trainIndices[trainIndices.length - 1]];

    this.trees = [];
    const featureImportances = new Array(this.featureNames.length).fill(0);
    const numFeaturesToSample = Math.max(1, Math.floor(Math.sqrt(this.featureNames.length)));

    // Train trees with bootstrap sampling
    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sample of size trainSize with replacement
      const bootstrapIndices: number[] = [];
      for (let b = 0; b < trainIndices.length; b++) {
        const randIdx = Math.floor(prng() * trainIndices.length);
        bootstrapIndices.push(trainIndices[randIdx]);
      }

      const tree = buildTree(
        encoded.X,
        encoded.y,
        bootstrapIndices,
        0,
        this.maxDepth,
        3,
        numFeaturesToSample,
        featureImportances,
        prng
      );
      this.trees.push(tree);
    }

    // Normalize feature importances
    const totalImp = featureImportances.reduce((a, b) => a + b, 0);
    const normalizedImportances = this.featureNames.map((name, idx) => ({
      feature: name,
      importance: totalImp > 0 ? Number(((featureImportances[idx] / totalImp) * 100).toFixed(2)) : 0,
    })).sort((a, b) => b.importance - a.importance);

    // Evaluate on test set
    // Confusion Matrix 5x5: matrix[actual - 1][predicted - 1]
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    let correctCount = 0;

    for (const testIdx of actualTestIndices) {
      const xTest = encoded.X[testIdx];
      const actualY = encoded.y[testIdx];

      const predProbs = this.predictProbabilities(xTest);
      let bestClass: SatisfactionLevel = 1;
      let maxProb = -1;

      for (let c = 1; c <= 5; c++) {
        const p = predProbs[c as SatisfactionLevel];
        if (p > maxProb) {
          maxProb = p;
          bestClass = c as SatisfactionLevel;
        }
      }

      matrix[actualY - 1][bestClass - 1] += 1;
      if (actualY === bestClass) {
        correctCount += 1;
      }
    }

    const testTotal = actualTestIndices.length;
    const accuracy = testTotal > 0 ? Number((correctCount / testTotal).toFixed(4)) : 0;

    // Calculate Per-Class Precision, Recall, F1
    const perClassMetrics: {
      label: number;
      precision: number;
      recall: number;
      f1: number;
      support: number;
    }[] = [];

    let macroP = 0;
    let macroR = 0;
    let macroF1 = 0;
    let weightedP = 0;
    let weightedR = 0;
    let weightedF1 = 0;

    for (let c = 1; c <= 5; c++) {
      const classIdx = c - 1;
      const tp = matrix[classIdx][classIdx];
      let rowSum = 0; // Actual instances of class c (Support)
      let colSum = 0; // Predicted instances of class c

      for (let j = 0; j < 5; j++) rowSum += matrix[classIdx][j];
      for (let i = 0; i < 5; i++) colSum += matrix[i][classIdx];

      const prec = colSum > 0 ? tp / colSum : 0;
      const rec = rowSum > 0 ? tp / rowSum : 0;
      const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;

      perClassMetrics.push({
        label: c,
        precision: Number(prec.toFixed(4)),
        recall: Number(rec.toFixed(4)),
        f1: Number(f1.toFixed(4)),
        support: rowSum,
      });

      macroP += prec;
      macroR += rec;
      macroF1 += f1;

      weightedP += prec * rowSum;
      weightedR += rec * rowSum;
      weightedF1 += f1 * rowSum;
    }

    macroP /= 5;
    macroR /= 5;
    macroF1 /= 5;

    weightedP = testTotal > 0 ? weightedP / testTotal : 0;
    weightedR = testTotal > 0 ? weightedR / testTotal : 0;
    weightedF1 = testTotal > 0 ? weightedF1 / testTotal : 0;

    this.metrics = {
      accuracy,
      macroPrecision: Number(macroP.toFixed(4)),
      macroRecall: Number(macroR.toFixed(4)),
      macroF1: Number(macroF1.toFixed(4)),
      weightedPrecision: Number(weightedP.toFixed(4)),
      weightedRecall: Number(weightedR.toFixed(4)),
      weightedF1: Number(weightedF1.toFixed(4)),
      perClassMetrics,
      confusionMatrix: {
        matrix,
        labels: [1, 2, 3, 4, 5],
      },
      featureImportances: normalizedImportances,
      trainSampleSize: trainIndices.length,
      testSampleSize: actualTestIndices.length,
      featuresUsed: this.featureNames,
      trainingTimestamp: new Date().toLocaleTimeString(),
    };

    this.isTrained = true;
    return this.metrics;
  }

  // Predict class probabilities by averaging tree outputs
  private predictProbabilities(x: number[]): Record<SatisfactionLevel, number> {
    const avgProbs: Record<SatisfactionLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (this.trees.length === 0) return avgProbs;

    for (const tree of this.trees) {
      const p = predictTree(tree, x);
      for (let c = 1; c <= 5; c++) {
        avgProbs[c as SatisfactionLevel] += p[c as SatisfactionLevel];
      }
    }

    for (let c = 1; c <= 5; c++) {
      avgProbs[c as SatisfactionLevel] /= this.trees.length;
    }
    return avgProbs;
  }

  // Predict from user form input
  public predict(input: PredictionInput): PredictionResult {
    if (!this.isTrained || this.trees.length === 0) {
      throw new Error('Model is not yet trained. Please upload a dataset first.');
    }

    // Construct feature vector
    const x: number[] = [Number(input.amountSpent) || 0];

    this.categoricalValues.paymentMethods.forEach((pm) => {
      x.push(input.paymentMethod.trim().toLowerCase() === pm.trim().toLowerCase() ? 1 : 0);
    });

    this.categoricalValues.favoriteDishes.forEach((fd) => {
      x.push(input.favoriteDish.trim().toLowerCase() === fd.trim().toLowerCase() ? 1 : 0);
    });

    this.categoricalValues.visitFrequencies.forEach((vf) => {
      x.push(input.visitFrequency.trim().toLowerCase() === vf.trim().toLowerCase() ? 1 : 0);
    });

    const probs = this.predictProbabilities(x);

    let bestScore: SatisfactionLevel = 3;
    let maxP = -1;

    const probList: { score: number; probability: number }[] = [];
    for (let c = 1; c <= 5; c++) {
      const p = probs[c as SatisfactionLevel];
      probList.push({ score: c, probability: Number((p * 100).toFixed(1)) });
      if (p > maxP) {
        maxP = p;
        bestScore = c as SatisfactionLevel;
      }
    }

    return {
      predictedScore: bestScore,
      categoryLabel: SATISFACTION_LABELS[bestScore],
      probabilities: probList,
    };
  }
}
