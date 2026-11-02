import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  parseSpreadsheetBuffer, 
  validateMappedHoldings, 
  generateSampleHoldingsTemplate, 
  exportToExcel,
  VALID_ASSET_CLASSES
} from '../../utils/excelParser';
import { formatINR } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export const SpreadsheetImportWizard: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { clients, importHoldings, navigate } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedSheet, setSelectedSheet] = useState('');

  // Column mappings
  const [mapping, setMapping] = useState<Record<string, string>>({
    clientId: '',
    assetName: '',
    symbol: '',
    assetClass: '',
    quantity: '',
    averagePurchasePrice: '',
    currentPrice: '',
    holdingId: ''
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      const parsed = parseSpreadsheetBuffer(buffer);
      setParsedData(parsed);
      setSelectedSheet(parsed.activeSheet);

      // Auto-match headers if names match common patterns
      const autoMap: Record<string, string> = { ...mapping };
      parsed.headers.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes('client')) autoMap.clientId = h;
        else if (lower.includes('asset') || lower.includes('company') || lower.includes('stock') || lower.includes('security')) autoMap.assetName = h;
        else if (lower.includes('symbol') || lower.includes('isin') || lower.includes('ticker')) autoMap.symbol = h;
        else if (lower.includes('class') || lower.includes('type')) autoMap.assetClass = h;
        else if (lower.includes('qty') || lower.includes('quantity') || lower.includes('shares') || lower.includes('units')) autoMap.quantity = h;
        else if (lower.includes('avg') || lower.includes('purchase') || lower.includes('cost')) autoMap.averagePurchasePrice = h;
        else if (lower.includes('current') || lower.includes('market') || lower.includes('price')) autoMap.currentPrice = h;
        else if (lower.includes('id') && !lower.includes('client')) autoMap.holdingId = h;
      });
      setMapping(autoMap);
      setCurrentStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  // Load sample template for quick testing
  const handleLoadSampleTemplate = () => {
    const sample = generateSampleHoldingsTemplate();
    const headers = Object.keys(sample[0]);
    setFileName('CapitalVest_Standard_Holdings_Template.xlsx');
    setParsedData({
      sheetNames: ['Holdings_Sample'],
      activeSheet: 'Holdings_Sample',
      headers,
      rows: sample,
      totalRows: sample.length
    });
    setSelectedSheet('Holdings_Sample');
    setMapping({
      clientId: 'Client ID',
      assetName: 'Asset Name',
      symbol: 'Symbol / ISIN',
      assetClass: 'Asset Class',
      quantity: 'Quantity',
      averagePurchasePrice: 'Average Purchase Price (INR)',
      currentPrice: 'Current Market Price (INR)',
      holdingId: ''
    });
    setCurrentStep(2);
  };

  // Run validation on Step 5
  const runValidation = () => {
    if (!parsedData) return;
    const clientIds = clients.map(c => c.id);
    const result = validateMappedHoldings(parsedData.rows, mapping, clientIds);
    setValidationResult(result);
    setCurrentStep(5);
  };

  // Commit Import
  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;
    setIsImporting(true);

    const res = await importHoldings(
      validationResult.validRows,
      fileName || 'Spreadsheet Upload',
      fileName.endsWith('.csv') ? 'CSV Upload' : 'Excel Workbook (.xlsx)'
    );

    setIsImporting(false);
    setImportSummary(res);
    setCurrentStep(8);
  };

  const handleDownloadErrors = () => {
    if (!validationResult?.issues) return;
    exportToExcel(validationResult.issues, `Validation_Issues_${fileName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Spreadsheet Data Hub
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Guided Spreadsheet Import Wizard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Step {currentStep} of 8: Reconcile broker statements, demat reports, and Excel spreadsheets
          </p>
        </div>

        <button
          onClick={() => navigate('data-hub')}
          className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
        >
          Return to Data Hub
        </button>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between text-xs">
          {[
            '1. Select File',
            '2. Preview Data',
            '3. Worksheet',
            '4. Map Columns',
            '5. Validate Rows',
            '6. Review Diffs',
            '7. Confirm Commit',
            '8. Import Report'
          ].map((title, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  idx + 1 === currentStep
                    ? 'bg-[#C6A76A] text-[#101C2C]'
                    : idx + 1 < currentStep
                    ? 'bg-[#147D64] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx + 1 < currentStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </span>
              <span className={`text-[11px] font-medium whitespace-nowrap ${idx + 1 === currentStep ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {/* Step 1: Select Source */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-xl mx-auto text-center py-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-[#101C2C] mx-auto flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#C6A76A]" />
            </div>

            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
                Upload Excel Workbook or CSV File
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Supports Microsoft Excel (.xlsx, .xls) and standard Comma Separated (.csv) holding sheets.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-[#C6A76A] transition-colors bg-slate-50/50">
              <input
                type="file"
                id="spreadsheetFile"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="spreadsheetFile"
                className="cursor-pointer inline-flex flex-col items-center space-y-2 text-xs"
              >
                <span className="px-5 py-2.5 bg-[#101C2C] hover:bg-[#172B46] text-white font-semibold rounded-lg shadow-xs transition-colors">
                  Choose File from Computer
                </span>
                <span className="text-slate-400">or drag and drop your spreadsheet here</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 block mb-2">Want to test the wizard with realistic Indian holdings?</span>
              <button
                type="button"
                onClick={handleLoadSampleTemplate}
                className="inline-flex items-center px-4 py-2 bg-emerald-50 text-[#147D64] hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                Load Sample Holdings Template (TCS, HDFC, Infosys, Gold)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview Raw Rows */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#C6A76A]">Step 2: Preview</span>
                <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                  Detected File: {fileName}
                </h3>
                <p className="text-xs text-slate-500">
                  {parsedData.totalRows} data rows and {parsedData.headers.length} columns identified
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0">
                    {parsedData.headers.map((h: string, idx: number) => (
                      <th key={idx} className="py-2.5 px-3 border-b">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.rows.slice(0, 8).map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {parsedData.headers.map((h: string, cIdx: number) => (
                        <td key={cIdx} className="py-2 px-3 text-slate-700 whitespace-nowrap">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Upload
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46]"
              >
                Continue to Worksheet Selection
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Worksheet */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-md mx-auto py-6">
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
              Select Active Worksheet
            </h3>
            <p className="text-xs text-slate-500">
              Choose the tab inside your workbook that contains portfolio holding records.
            </p>

            <div className="space-y-2 pt-2">
              {parsedData.sheetNames.map((sheet: string) => (
                <label
                  key={sheet}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer text-xs ${
                    selectedSheet === sheet ? 'border-[#147D64] bg-emerald-50/40 font-bold' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-slate-800">{sheet}</span>
                  <input
                    type="radio"
                    name="activeSheetRadio"
                    checked={selectedSheet === sheet}
                    onChange={() => setSelectedSheet(sheet)}
                    className="text-[#147D64]"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46]"
              >
                Continue to Column Mapping
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Map Columns */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-[#C6A76A]">Step 4: Schema Alignment</span>
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                Map Spreadsheet Columns to CapitalVest Fields
              </h3>
              <p className="text-xs text-slate-500">
                Match each required holding attribute with the corresponding column header in your file.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              {[
                { key: 'clientId', label: 'Client ID *', required: true, desc: 'Identifies which client owns this asset' },
                { key: 'assetName', label: 'Asset Name *', required: true, desc: 'e.g. Tata Consultancy Services' },
                { key: 'symbol', label: 'Symbol / ISIN', required: false, desc: 'NSE/BSE ticker or fund identifier' },
                { key: 'assetClass', label: 'Asset Class', required: false, desc: 'Equity, Debt, Cash, Gold, REIT' },
                { key: 'quantity', label: 'Quantity / Units *', required: true, desc: 'Positive number of shares/units' },
                { key: 'averagePurchasePrice', label: 'Average Cost Price (INR) *', required: true, desc: 'Cost basis per unit' },
                { key: 'currentPrice', label: 'Current Market Price (INR) *', required: true, desc: 'Latest valuation benchmark' },
                { key: 'holdingId', label: 'Holding ID (Optional)', required: false, desc: 'External reference number' }
              ].map(field => (
                <div key={field.key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-900 mb-0.5">
                    {field.label}
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={e => setMapping({ ...mapping, [field.key]: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Unmapped --</option>
                    {parsedData.headers.map((h: string) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Back
              </button>
              <button
                onClick={runValidation}
                className="px-6 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46] cursor-pointer"
              >
                Validate Spreadsheet Rows
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Validate */}
        {currentStep === 5 && validationResult && (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-[#C6A76A]">Step 5: Quality Audit</span>
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                Spreadsheet Data Validation Audit
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-slate-600 block text-[10px]">Valid Ready Rows</span>
                <span className="text-2xl font-bold text-[#147D64]">{validationResult.validCount}</span>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-slate-600 block text-[10px]">Warnings Handled</span>
                <span className="text-2xl font-bold text-amber-700">{validationResult.warningCount}</span>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-slate-600 block text-[10px]">Invalid / Rejected Rows</span>
                <span className="text-2xl font-bold text-red-600">{validationResult.invalidCount}</span>
              </div>
            </div>

            {/* Issues Log */}
            {validationResult.issues.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-200 p-3 rounded-xl bg-slate-50 text-xs">
                <div className="font-bold text-slate-800 text-[11px] mb-1">Row-by-Row Findings:</div>
                {validationResult.issues.map((issue: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2 rounded flex items-center justify-between text-[11px] ${
                      issue.severity === 'Error' ? 'bg-red-100/60 text-red-800' : 'bg-amber-100/60 text-amber-800'
                    }`}
                  >
                    <span>Row {issue.rowNumber}: {issue.message}</span>
                    <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-white">{issue.severity}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Back to Mapping
              </button>

              <div className="flex space-x-2">
                {validationResult.issues.length > 0 && (
                  <button
                    onClick={handleDownloadErrors}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download Issues Report
                  </button>
                )}
                <button
                  onClick={() => setCurrentStep(6)}
                  disabled={validationResult.validCount === 0}
                  className="px-5 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46] disabled:opacity-50 cursor-pointer"
                >
                  Preview Changes Diff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Preview Changes */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <span className="text-[10px] font-bold uppercase text-[#C6A76A]">Step 6: Diff Preview</span>
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                Preview Database Modifications
              </h3>
              <p className="text-xs text-slate-500">
                The following {validationResult.validRows.length} positions will be committed into the live portfolio database.
              </p>
            </div>

            <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#101C2C] text-white uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Avg Cost (₹)</th>
                    <th className="py-2.5 px-3">Current Price (₹)</th>
                    <th className="py-2.5 px-3">Market Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.validRows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold">{r.clientId}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.assetName}</td>
                      <td className="py-2 px-3">{r.assetClass}</td>
                      <td className="py-2 px-3">{r.quantity}</td>
                      <td className="py-2 px-3">{formatINR(r.averagePurchasePrice)}</td>
                      <td className="py-2 px-3 font-bold">{formatINR(r.currentPrice)}</td>
                      <td className="py-2 px-3 font-bold text-[#147D64]">{formatINR(r.currentMarketValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="px-5 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46] cursor-pointer"
              >
                Proceed to Explicit Confirmation
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Confirm Import */}
        {currentStep === 7 && (
          <div className="space-y-6 max-w-lg mx-auto py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
                Confirm Permanent Import
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are about to commit <strong className="text-slate-900">{validationResult.validRows.length} holding records</strong> into the CapitalVest portfolio database. Existing holdings with matching identifiers will be updated idempotently.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-1">
              <div>• Target Source: <strong>{fileName}</strong></div>
              <div>• Destination: <strong>CapitalVest Live Ledgers</strong></div>
              <div>• Audit: An immutable log will be generated in the Audit Trail.</div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(6)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel / Review
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-6 py-2.5 bg-[#147D64] hover:bg-[#116954] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isImporting ? 'Importing Positions...' : 'Confirm & Commit to Database'}
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Import Report */}
        {currentStep === 8 && importSummary && (
          <div className="space-y-6 max-w-md mx-auto py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#147D64] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
                Import Completed Successfully!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                The database and dependent portfolio dashboards have been refreshed with verified holding records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">New Positions Created</span>
                <strong className="text-lg font-bold text-[#147D64]">+{importSummary.recordsCreated}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Existing Positions Updated</span>
                <strong className="text-lg font-bold text-slate-800">~{importSummary.recordsUpdated}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => navigate('holdings')}
                className="flex-1 py-2.5 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46] cursor-pointer"
              >
                Open Holdings Register
              </button>
              <button
                onClick={() => navigate('dashboard')}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                View Advisor Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
