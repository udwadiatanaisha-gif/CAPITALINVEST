import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client, Holding, FinancialGoal, FinancialHealthAssessment, RiskAlert, FirmSettings } from '../types';
import { formatINR, formatDate, formatPercentage } from './formatters';
import { calculatePortfolioSummary, calculateAssetAllocation } from './calculations';

export interface ClientReportData {
  client: Client;
  holdings: Holding[];
  goals: FinancialGoal[];
  health?: FinancialHealthAssessment;
  alerts?: RiskAlert[];
  settings?: FirmSettings;
  firmSettings?: FirmSettings;
  generatedBy?: string;
}

export function generateClientPdfReport(data: ClientReportData) {

  const { client, holdings, goals, health, alerts = [], settings, generatedBy = 'Tanaisha Udwadia' } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const summary = calculatePortfolioSummary(holdings);
  const allocation = calculateAssetAllocation(holdings);

  // Deep Navy Header Banner
  doc.setFillColor(16, 28, 44); // #101C2C
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent line
  doc.setFillColor(198, 167, 106); // #C6A76A
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPITALVEST', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(198, 167, 106);
  doc.text('BUILDING WEALTH. SECURING GENERATIONS.', margin, 24);

  // Report Title on Right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE WEALTH REPORT', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 225);
  doc.text(`Generated: ${formatDate(new Date())} | Confidential`, pageWidth - margin, 25, { align: 'right' });
  doc.text(`Lead Advisor: ${generatedBy}`, pageWidth - margin, 31, { align: 'right' });

  // Client Details Bar
  let currentY = 52;
  doc.setFillColor(247, 245, 240); // #F7F5F0 Warm ivory
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 2, 2, 'S');

  doc.setTextColor(16, 28, 44);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(client.name, margin + 6, currentY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 102, 119); // Slate text
  doc.text(`Client ID: ${client.clientNumber || client.id}  |  Category: ${client.category}  |  City: ${client.city}`, margin + 6, currentY + 15);
  doc.text(`Risk Profile: ${client.riskProfile}  |  Review Cycle: ${client.preferredReviewFrequency}  |  Next Review: ${formatDate(client.nextReviewDate)}`, margin + 6, currentY + 21);

  // Portfolio Summary Highlights Cards
  currentY = 85;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 28, 44);
  doc.text('PORTFOLIO PERFORMANCE & VALUATION OVERVIEW', margin, currentY);

  currentY += 4;
  const cardWidth = (pageWidth - (margin * 2) - 9) / 4;
  const cardHeight = 22;

  const metrics = [
    { label: 'Total Portfolio Value', value: formatINR(summary.totalMarketValue, true), color: [16, 28, 44] },
    { label: 'Invested Capital', value: formatINR(summary.totalInvestedValue, true), color: [91, 102, 119] },
    { 
      label: 'Unrealized Gain / (Loss)', 
      value: formatINR(summary.unrealizedGainLoss, true), 
      color: summary.unrealizedGainLoss >= 0 ? [20, 125, 100] : [201, 76, 76] 
    },
    { 
      label: 'Absolute Return', 
      value: formatPercentage(summary.absoluteReturnPercentage), 
      color: summary.absoluteReturnPercentage >= 0 ? [20, 125, 100] : [201, 76, 76] 
    }
  ];

  metrics.forEach((m, idx) => {
    const x = margin + (idx * (cardWidth + 3));
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 226, 235);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(91, 102, 119);
    doc.text(m.label, x + 4, currentY + 7);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 4, currentY + 16);
  });

  // Holdings Table
  currentY += cardHeight + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 28, 44);
  doc.text('PORTFOLIO HOLDINGS REGISTER', margin, currentY);

  const holdingsRows = holdings.map(h => [
    h.assetName,
    h.assetClass,
    h.quantity.toLocaleString('en-IN'),
    formatINR(h.averagePurchasePrice),
    formatINR(h.currentPrice),
    formatINR(h.currentMarketValue),
    formatPercentage(h.gainLossPercentage)
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Asset Description', 'Asset Class', 'Qty', 'Avg Cost (₹)', 'Current (₹)', 'Market Value (₹)', 'Return']],
    body: holdingsRows.length > 0 ? holdingsRows : [['No holdings registered', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [23, 43, 70], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin }
  });

  // Check cursor position
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // Add new page if not enough space
  if (finalY > pageHeight - 75) {
    doc.addPage();
    finalY = margin + 10;
  }

  // Asset Allocation & Goals Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 28, 44);
  doc.text('ASSET ALLOCATION BREAKDOWN', margin, finalY);

  const allocRows = allocation.map(a => [
    a.name,
    formatINR(a.value),
    `${a.percentage}%`,
    a.count.toString()
  ]);

  autoTable(doc, {
    startY: finalY + 3,
    head: [['Asset Class', 'Total Value (₹)', 'Portfolio Weight', 'Count']],
    body: allocRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [20, 125, 100], textColor: [255, 255, 255] },
    margin: { left: margin, right: margin }
  });

  finalY = (doc as any).lastAutoTable.finalY + 10;

  if (goals.length > 0) {
    if (finalY > pageHeight - 65) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 28, 44);
    doc.text('FINANCIAL GOALS PROGRESSION', margin, finalY);

    const goalRows = goals.map(g => {
      const progress = g.targetAmount > 0 ? Math.round((g.currentSavedAmount / g.targetAmount) * 100) : 0;
      return [
        g.name,
        g.category,
        formatINR(g.targetAmount),
        formatINR(g.currentSavedAmount),
        formatINR(g.currentMonthlyContribution) + '/mo',
        formatDate(g.targetDate),
        `${progress}% (${g.status})`
      ];
    });

    autoTable(doc, {
      startY: finalY + 3,
      head: [['Goal Milestone', 'Category', 'Target (₹)', 'Saved (₹)', 'Monthly SIP', 'Target Date', 'Status']],
      body: goalRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [16, 28, 44], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin }
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Financial Health & Disclaimers
  if (finalY > pageHeight - 45) {
    doc.addPage();
    finalY = margin + 10;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 28, 44);
  doc.text(`Financial Health Assessment Score: ${health?.overallScore || 82} / 100 (CapitalVest 7-Pillar Evaluation)`, margin, finalY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const disclaimerText = 
    'DISCLAIMER & IMPORTANT DISCLOSURES: This report is prepared solely for informative and financial planning organization purposes. ' +
    'Valuations are derived from recorded holding prices and manually synchronized spreadsheet data. Projected values rely on compound interest assumptions ' +
    'and do not represent guaranteed outcomes. Mutual fund and securities investments are subject to market risks. Please consult your licensed financial advisor ' +
    'for individual regulatory advice. CapitalVest Wealth Management Command Centre. Demo illustrative dataset.';
  
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - (margin * 2));
  doc.text(splitDisclaimer, margin, finalY + 6);

  // Page Numbers
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 150, 165);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text('CapitalVest — Confidential Client Portfolio Statement', margin, pageHeight - 8);
  }

  // Trigger download
  const safeClientName = client.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CapitalVest_Report_${safeClientName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export const generateWealthReportPDF = generateClientPdfReport;
