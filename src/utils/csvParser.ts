import Papa from 'papaparse';
import { CustomerRecord, DatasetSummary, SatisfactionLevel } from '../types';
import { SATISFACTION_LABELS } from './mathStats';

export interface ParseResult {
  success: boolean;
  records: CustomerRecord[];
  summary: DatasetSummary | null;
  errorMessage?: string;
  missingColumns?: string[];
  warnings?: string[];
}

export const REQUIRED_COLUMNS = [
  'USER ID',
  'AMOUNT SPENT ON THAT DAY(20/10/2024)',
  'Payment Method',
  'Feedback Score (1-5)',
  'Favorite Dish',
  'Visit Frequency',
  'DATE',
];

// Normalize column name for robust matching (trim, ignore case, match amount spent variants)
function normalizeCol(col: string): string {
  return col.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function validateAndParseCSV(csvText: string, fileName: string): ParseResult {
  if (!csvText || !csvText.trim()) {
    return {
      success: false,
      records: [],
      summary: null,
      errorMessage: 'The uploaded file is empty. Please upload a valid CSV file.',
    };
  }

  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false, // We will safely parse types ourselves
  });

  if (parsed.errors && parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    return {
      success: false,
      records: [],
      summary: null,
      errorMessage: `CSV Parsing error: ${parsed.errors[0].message} (Row: ${parsed.errors[0].row})`,
    };
  }

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    return {
      success: false,
      records: [],
      summary: null,
      errorMessage: 'The CSV file contains no data rows.',
    };
  }

  const headers = Object.keys(rows[0] || {}).map((h) => h.trim());
  const normalizedHeaders = headers.map(normalizeCol);

  // Column matching map
  const columnMap: Record<string, string | null> = {};
  const missingCols: string[] = [];

  for (const req of REQUIRED_COLUMNS) {
    const normReq = normalizeCol(req);
    // Direct match
    let found = headers.find((h) => normalizeCol(h) === normReq);

    // Flexible fallback for amount spent
    if (!found && normReq.includes('amount spent')) {
      found = headers.find((h) => normalizeCol(h).includes('amount spent'));
    }
    // Flexible fallback for feedback score
    if (!found && (normReq.includes('feedback') || normReq.includes('score'))) {
      found = headers.find((h) => {
        const nh = normalizeCol(h);
        return nh.includes('feedback') || nh.includes('score') || nh.includes('rating');
      });
    }

    if (found) {
      columnMap[req] = found;
    } else {
      missingCols.push(req);
    }
  }

  if (missingCols.length > 0) {
    return {
      success: false,
      records: [],
      summary: null,
      errorMessage: `Required columns are missing from the uploaded CSV: ${missingCols.join(', ')}`,
      missingColumns: missingCols,
    };
  }

  const userIdCol = columnMap['USER ID']!;
  const amountCol = columnMap['AMOUNT SPENT ON THAT DAY(20/10/2024)']!;
  const paymentCol = columnMap['Payment Method']!;
  const scoreCol = columnMap['Feedback Score (1-5)']!;
  const dishCol = columnMap['Favorite Dish']!;
  const freqCol = columnMap['Visit Frequency']!;
  const dateCol = columnMap['DATE']!;

  const validRecords: CustomerRecord[] = [];
  const warnings: string[] = [];
  const missingCounts: Record<string, number> = {};
  headers.forEach((h) => (missingCounts[h] = 0));

  let totalMissingCells = 0;
  const seenRows = new Set<string>();
  let duplicateCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rowNum = idx + 2; // 1-indexed including header row

    // Duplicate detection
    const rowString = JSON.stringify(row);
    if (seenRows.has(rowString)) {
      duplicateCount++;
    } else {
      seenRows.add(rowString);
    }

    // Missing value checks
    headers.forEach((h) => {
      const val = row[h];
      if (val === undefined || val === null || String(val).trim() === '') {
        missingCounts[h] = (missingCounts[h] || 0) + 1;
        totalMissingCells++;
      }
    });

    const rawScore = row[scoreCol];
    if (rawScore === undefined || rawScore === null || String(rawScore).trim() === '') {
      warnings.push(`Row ${rowNum}: Skipped due to missing Feedback Score.`);
      continue;
    }

    const numScore = Number(String(rawScore).trim());
    if (isNaN(numScore) || !Number.isInteger(numScore) || numScore < 1 || numScore > 5) {
      return {
        success: false,
        records: [],
        summary: null,
        errorMessage: `Invalid Feedback Score at Row ${rowNum}: "${rawScore}". Feedback Score must be an integer between 1 and 5.`,
      };
    }

    const rawAmount = row[amountCol];
    let numAmount = Number(String(rawAmount).replace(/[^0-9.-]+/g, ''));
    if (isNaN(numAmount) || numAmount < 0) {
      numAmount = 0;
      warnings.push(`Row ${rowNum}: Non-numeric Amount Spent replaced with 0.`);
    }

    const feedbackScore = numScore as SatisfactionLevel;
    const userId = String(row[userIdCol] || `USER_${rowNum}`).trim();
    const paymentMethod = String(row[paymentCol] || 'Cash').trim();
    const favoriteDish = String(row[dishCol] || 'Chef Special').trim();
    const visitFrequency = String(row[freqCol] || 'Occasional').trim();
    const date = String(row[dateCol] || '20/10/2024').trim();

    validRecords.push({
      userId,
      amountSpent: numAmount,
      paymentMethod,
      feedbackScore,
      favoriteDish,
      visitFrequency,
      date,
      satisfactionCategory: SATISFACTION_LABELS[feedbackScore],
    });
  }

  if (validRecords.length === 0) {
    return {
      success: false,
      records: [],
      summary: null,
      errorMessage: 'The CSV has no valid customer records with Feedback Score between 1 and 5.',
    };
  }

  const columnTypes: Record<string, string> = {
    [userIdCol]: 'String (ID)',
    [amountCol]: 'Numeric (Float/Int)',
    [paymentCol]: 'Categorical (String)',
    [scoreCol]: 'Ordinal (Integer 1-5)',
    [dishCol]: 'Categorical (String)',
    [freqCol]: 'Categorical (String)',
    [dateCol]: 'Date / String',
  };

  const summary: DatasetSummary = {
    fileName,
    totalRows: rows.length,
    totalColumns: headers.length,
    columnNames: headers,
    columnTypes,
    validRecordsCount: validRecords.length,
    missingValuesCount: missingCounts,
    totalMissingCells,
    duplicateRowsCount: duplicateCount,
    uploadTimestamp: new Date().toLocaleTimeString(),
  };

  return {
    success: true,
    records: validRecords,
    summary,
    warnings,
  };
}
