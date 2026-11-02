import * as XLSX from 'xlsx';
import { Holding, Client, FinancialGoal, AssetClass } from '../types';

export interface ParsedSheetData {
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ValidationIssue {
  rowNumber: number;
  field: string;
  value: any;
  message: string;
  severity: 'Error' | 'Warning';
}

export interface SpreadsheetValidationResult {
  validCount: number;
  invalidCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  validRows: any[];
}

export const VALID_ASSET_CLASSES: AssetClass[] = [
  'Equity',
  'Debt',
  'Cash & Equivalents',
  'Gold & Precious Metals',
  'Real Estate & REITs',
  'Alternative Investments'
];

/**
 * Parses an Excel (.xlsx, .xls) or CSV file from an ArrayBuffer
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer): ParsedSheetData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const activeSheet = sheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[activeSheet];
  
  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  const headers = rawJson.length > 0 ? Object.keys(rawJson[0]) : [];

  return {
    sheetNames,
    activeSheet,
    headers,
    rows: rawJson,
    totalRows: rawJson.length
  };
}

/**
 * Validates mapped spreadsheet rows against Holding schema
 */
export function validateMappedHoldings(
  rows: any[],
  mapping: Record<string, string>,
  existingClientIds: string[]
): SpreadsheetValidationResult {
  const issues: ValidationIssue[] = [];
  const validRows: any[] = [];
  const seenHoldingIds = new Set<string>();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // spreadsheet 1-indexed header + data
    const rowIssues: ValidationIssue[] = [];

    // Extract values based on user column mapping
    const clientId = String(row[mapping['clientId']] || '').trim();
    const assetName = String(row[mapping['assetName']] || '').trim();
    const symbol = String(row[mapping['symbol']] || '').trim();
    const rawAssetClass = String(row[mapping['assetClass']] || '').trim();
    const rawQuantity = row[mapping['quantity']];
    const rawAvgPrice = row[mapping['averagePurchasePrice']];
    const rawCurrentPrice = row[mapping['currentPrice']];
    const holdingId = String(row[mapping['holdingId']] || `HLD-${Date.now()}-${index}`).trim();

    // 1. Client Reference check
    if (!clientId) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'clientId',
        value: clientId,
        message: 'Client ID is required.',
        severity: 'Error'
      });
    } else if (existingClientIds.length > 0 && !existingClientIds.includes(clientId)) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'clientId',
        value: clientId,
        message: `Client ID "${clientId}" does not exist in registered directory.`,
        severity: 'Warning'
      });
    }

    // 2. Asset Name
    if (!assetName) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'assetName',
        value: assetName,
        message: 'Asset Name is required.',
        severity: 'Error'
      });
    }

    // 3. Asset Class
    let assetClass: AssetClass = 'Equity';
    if (!rawAssetClass) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'assetClass',
        value: rawAssetClass,
        message: 'Asset Class missing; defaulting to Equity.',
        severity: 'Warning'
      });
    } else {
      const match = VALID_ASSET_CLASSES.find(
        ac => ac.toLowerCase() === rawAssetClass.toLowerCase() || rawAssetClass.toLowerCase().includes(ac.toLowerCase())
      );
      if (match) {
        assetClass = match;
      } else {
        rowIssues.push({
          rowNumber: rowNum,
          field: 'assetClass',
          value: rawAssetClass,
          message: `Unknown asset class "${rawAssetClass}". Supported: ${VALID_ASSET_CLASSES.join(', ')}`,
          severity: 'Warning'
        });
        assetClass = 'Alternative Investments';
      }
    }

    // 4. Quantity
    const quantity = Number(rawQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'quantity',
        value: rawQuantity,
        message: 'Quantity must be a positive number.',
        severity: 'Error'
      });
    }

    // 5. Average Purchase Price
    const avgPrice = Number(rawAvgPrice);
    if (isNaN(avgPrice) || avgPrice < 0) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'averagePurchasePrice',
        value: rawAvgPrice,
        message: 'Average Purchase Price must be a valid non-negative number.',
        severity: 'Error'
      });
    }

    // 6. Current Price
    const currentPrice = Number(rawCurrentPrice);
    if (isNaN(currentPrice) || currentPrice < 0) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'currentPrice',
        value: rawCurrentPrice,
        message: 'Current Price must be a valid non-negative number.',
        severity: 'Error'
      });
    }

    // 7. Duplicate Check
    if (seenHoldingIds.has(holdingId)) {
      rowIssues.push({
        rowNumber: rowNum,
        field: 'holdingId',
        value: holdingId,
        message: `Duplicate Holding ID "${holdingId}" in spreadsheet.`,
        severity: 'Error'
      });
    } else {
      seenHoldingIds.add(holdingId);
    }

    if (rowIssues.some(i => i.severity === 'Error')) {
      issues.push(...rowIssues);
    } else {
      issues.push(...rowIssues); // include warnings
      const investedValue = quantity * avgPrice;
      const currentMarketValue = quantity * currentPrice;
      const gainLossAmount = currentMarketValue - investedValue;
      const gainLossPercentage = investedValue > 0 ? (gainLossAmount / investedValue) * 100 : 0;

      validRows.push({
        id: holdingId,
        clientId,
        assetName,
        assetClass,
        symbol: symbol || assetName.substring(0, 8).toUpperCase(),
        quantity,
        averagePurchasePrice: avgPrice,
        currentPrice,
        investedValue,
        currentMarketValue,
        gainLossAmount,
        gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
        lastPriceUpdate: new Date().toISOString().split('T')[0],
        currency: 'INR',
        isManualOrSample: false,
        source: 'Spreadsheet Import'
      });
    }
  });

  const errorCount = issues.filter(i => i.severity === 'Error').length;
  const warningCount = issues.filter(i => i.severity === 'Warning').length;

  return {
    validCount: validRows.length,
    invalidCount: rows.length - validRows.length,
    warningCount,
    issues,
    validRows
  };
}

/**
 * Generates an Excel workbook file and triggers browser download
 */
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-fit column widths
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    worksheet['!cols'] = keys.map(k => ({
      wch: Math.max(k.length + 4, 15)
    }));
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Generates a standard sample spreadsheet template for holdings import
 */
export function generateSampleHoldingsTemplate(): any[] {
  return [
    {
      'Client ID': 'CLI-2026-001',
      'Asset Name': 'Tata Consultancy Services',
      'Symbol / ISIN': 'TCS.NS',
      'Asset Class': 'Equity',
      'Sector': 'Information Technology',
      'Quantity': 120,
      'Average Purchase Price (INR)': 3650.00,
      'Current Market Price (INR)': 4180.50
    },
    {
      'Client ID': 'CLI-2026-001',
      'Asset Name': 'HDFC Nifty 50 Index Fund',
      'Symbol / ISIN': 'INF179K01BE2',
      'Asset Class': 'Equity',
      'Sector': 'Mutual Fund',
      'Quantity': 8500,
      'Average Purchase Price (INR)': 185.40,
      'Current Market Price (INR)': 224.80
    },
    {
      'Client ID': 'CLI-2026-001',
      'Asset Name': 'ICICI Prudential Corporate Bond Fund',
      'Symbol / ISIN': 'INF109K01138',
      'Asset Class': 'Debt',
      'Sector': 'Fixed Income',
      'Quantity': 15000,
      'Average Purchase Price (INR)': 24.50,
      'Current Market Price (INR)': 26.85
    },
    {
      'Client ID': 'CLI-2026-001',
      'Asset Name': 'Nippon India ETF Gold BeES',
      'Symbol / ISIN': 'GOLDBEES.NS',
      'Asset Class': 'Gold & Precious Metals',
      'Sector': 'Commodities',
      'Quantity': 1400,
      'Average Purchase Price (INR)': 58.20,
      'Current Market Price (INR)': 71.40
    },
    {
      'Client ID': 'CLI-2026-002',
      'Asset Name': 'Infosys Limited',
      'Symbol / ISIN': 'INFY.NS',
      'Asset Class': 'Equity',
      'Sector': 'Information Technology',
      'Quantity': 450,
      'Average Purchase Price (INR)': 1420.00,
      'Current Market Price (INR)': 1890.00
    }
  ];
}
