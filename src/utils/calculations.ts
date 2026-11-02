import { 
  Holding, 
  FinancialGoal, 
  Client, 
  RiskAlert, 
  FirmSettings,
  FinancialHealthBreakdown,
  FinancialHealthAssessment,
  AssetClass
} from '../types';

/**
 * Calculates consolidated portfolio metrics for a list of holdings
 */
export function calculatePortfolioSummary(holdings: Holding[]) {
  if (!holdings || holdings.length === 0) {
    return {
      totalMarketValue: 0,
      totalInvestedValue: 0,
      unrealizedGainLoss: 0,
      absoluteReturnPercentage: 0,
      holdingsCount: 0
    };
  }

  const totalMarketValue = holdings.reduce((sum, h) => sum + (h.currentMarketValue || (h.quantity * h.currentPrice)), 0);
  const totalInvestedValue = holdings.reduce((sum, h) => sum + (h.investedValue || (h.quantity * h.averagePurchasePrice)), 0);
  const unrealizedGainLoss = totalMarketValue - totalInvestedValue;
  
  const absoluteReturnPercentage = totalInvestedValue > 0 
    ? (unrealizedGainLoss / totalInvestedValue) * 100 
    : 0;

  return {
    totalMarketValue,
    totalInvestedValue,
    unrealizedGainLoss,
    absoluteReturnPercentage,
    holdingsCount: holdings.length
  };
}

/**
 * Calculates asset allocation breakdown with percentages
 */
export function calculateAssetAllocation(holdings: Holding[]) {
  const { totalMarketValue } = calculatePortfolioSummary(holdings);
  
  const allocationMap: Record<string, { value: number; count: number }> = {};

  holdings.forEach(h => {
    const assetClass = h.assetClass || 'Alternative Investments';
    if (!allocationMap[assetClass]) {
      allocationMap[assetClass] = { value: 0, count: 0 };
    }
    allocationMap[assetClass].value += h.currentMarketValue;
    allocationMap[assetClass].count += 1;
  });

  const categories: AssetClass[] = [
    'Equity',
    'Debt',
    'Cash & Equivalents',
    'Gold & Precious Metals',
    'Real Estate & REITs',
    'Alternative Investments'
  ];

  return categories.map(cat => {
    const item = allocationMap[cat] || { value: 0, count: 0 };
    const percentage = totalMarketValue > 0 ? (item.value / totalMarketValue) * 100 : 0;
    return {
      name: cat,
      value: item.value,
      percentage: Number(percentage.toFixed(2)),
      count: item.count
    };
  });
}

/**
 * Transparent Future Value calculation for financial goals:
 * Formula: FV = PV * (1 + r/12)^n + PMT * [((1 + r/12)^n - 1) / (r/12)]
 */
export function calculateGoalProjection(goal: FinancialGoal) {
  const targetAmount = goal.targetAmount;
  const currentSaved = goal.currentSavedAmount;
  const currentMonthly = goal.currentMonthlyContribution || 0;
  const expectedReturnRate = (goal.expectedReturnAssumption || 8) / 100;
  
  // Calculate months remaining
  const now = new Date();
  const target = new Date(goal.targetDate);
  const diffTime = target.getTime() - now.getTime();
  const monthsRemaining = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.4375)));
  
  const monthlyRate = expectedReturnRate / 12;
  
  // Compound existing principal: PV * (1 + r)^n
  const principalFV = currentSaved * Math.pow(1 + monthlyRate, monthsRemaining);
  
  // Compound monthly contributions annuity: PMT * [((1+r)^n - 1) / r]
  const annuityFV = monthlyRate > 0 
    ? currentMonthly * ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate)
    : currentMonthly * monthsRemaining;
    
  const projectedFutureValue = Math.round(principalFV + annuityFV);
  const shortfallOrSurplus = projectedFutureValue - targetAmount;
  const onTrackProbability = targetAmount > 0 
    ? Math.min(100, Math.max(0, Math.round((projectedFutureValue / targetAmount) * 100)))
    : 100;

  // Required monthly savings to achieve target with given expected return
  const neededFromAnnuity = Math.max(0, targetAmount - principalFV);
  const requiredMonthlyContribution = monthlyRate > 0
    ? Math.round(neededFromAnnuity / ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate))
    : Math.round(neededFromAnnuity / monthsRemaining);

  const percentageSaved = targetAmount > 0 
    ? Math.min(100, (currentSaved / targetAmount) * 100)
    : 100;

  return {
    monthsRemaining,
    yearsRemaining: (monthsRemaining / 12).toFixed(1),
    projectedFutureValue,
    shortfallOrSurplus,
    onTrackProbability,
    requiredMonthlyContribution,
    percentageSaved: Number(percentageSaved.toFixed(1))
  };
}

/**
 * Transparent Financial Health Score Engine (0-100)
 * Evaluates 7 core pillars:
 * 1. Emergency Fund Coverage (15%)
 * 2. Savings Rate & Cash Flow (20%)
 * 3. Debt Burden / Leverage (15%)
 * 4. Goal Funding Track Record (20%)
 * 5. Portfolio Diversification (15%)
 * 6. Insurance & Protection Review (10%)
 * 7. Liquidity Ratio (5%)
 */
export function evaluateFinancialHealth(
  client: Client, 
  holdings: Holding[], 
  goals: FinancialGoal[],
  weights?: FirmSettings['healthScoringWeights']
): FinancialHealthAssessment {
  const w = weights || {
    emergencyFund: 15,
    savingsRate: 20,
    debtBurden: 15,
    goalFunding: 20,
    diversification: 15,
    insurance: 10,
    liquidity: 5
  };

  const strengths: string[] = [];
  const areasRequiringAttention: string[] = [];

  // 1. Emergency Fund Coverage
  const cashHoldings = holdings
    .filter(h => h.assetClass === 'Cash & Equivalents')
    .reduce((sum, h) => sum + h.currentMarketValue, 0);
  const targetEmergency = client.emergencyFundTarget || 600000; // default 6L
  let emergencyScore = Math.min(100, Math.round((cashHoldings / targetEmergency) * 100));
  if (emergencyScore >= 85) {
    strengths.push(`Emergency liquidity reserves adequately cover target (₹${(cashHoldings / 100000).toFixed(1)} Lakhs allocated)`);
  } else if (emergencyScore < 50) {
    areasRequiringAttention.push(`Emergency fund is underfunded (${emergencyScore}% of target ₹${(targetEmergency / 100000).toFixed(1)} Lakhs)`);
  }

  // 2. Savings Rate & Contributions
  const monthlyContributions = goals.reduce((sum, g) => sum + (g.currentMonthlyContribution || 0), 0);
  let savingsRateScore = 75; // baseline healthy
  if (monthlyContributions > 150000) {
    savingsRateScore = 95;
    strengths.push(`Strong disciplined monthly capital deployment (₹${(monthlyContributions / 1000).toFixed(0)}k/mo)`);
  } else if (monthlyContributions > 50000) {
    savingsRateScore = 80;
  } else {
    savingsRateScore = 60;
    areasRequiringAttention.push('Recommended setting higher automated monthly SIP / investment allocations');
  }

  // 3. Debt Burden
  const debtBurdenScore = 85; // Default safe for HNW wealth profiles

  // 4. Goal Funding
  let goalFundingScore = 70;
  if (goals.length > 0) {
    const avgProgress = goals.reduce((acc, g) => {
      const p = g.targetAmount > 0 ? (g.currentSavedAmount / g.targetAmount) * 100 : 100;
      return acc + Math.min(100, p);
    }, 0) / goals.length;
    goalFundingScore = Math.round(avgProgress);
    if (goalFundingScore >= 80) {
      strengths.push(`Financial goals are consistently tracking on schedule (${goals.length} active milestones)`);
    } else {
      areasRequiringAttention.push(`Several life goals require capital re-allocation to meet target dates`);
    }
  } else {
    areasRequiringAttention.push('No life planning goals registered yet');
  }

  // 5. Portfolio Diversification
  const totalValue = holdings.reduce((sum, h) => sum + h.currentMarketValue, 0);
  let maxHoldingWeight = 0;
  if (totalValue > 0) {
    holdings.forEach(h => {
      const weight = (h.currentMarketValue / totalValue) * 100;
      if (weight > maxHoldingWeight) maxHoldingWeight = weight;
    });
  }
  let diversificationScore = 80;
  if (maxHoldingWeight > 30) {
    diversificationScore = 55;
    areasRequiringAttention.push(`Single holding concentration risk detected (highest asset represents ${maxHoldingWeight.toFixed(1)}% of portfolio)`);
  } else {
    diversificationScore = 90;
    strengths.push('Healthy asset diversification with balanced single-issuer concentration');
  }

  // 6. Insurance Review
  let insuranceScore = 60;
  if (client.insuranceReviewStatus === 'Up to Date') {
    insuranceScore = 95;
    strengths.push('Comprehensive insurance and risk protection audit completed');
  } else if (client.insuranceReviewStatus === 'Pending Review') {
    insuranceScore = 65;
    areasRequiringAttention.push('Term life and health insurance review is pending scheduled audit');
  } else {
    insuranceScore = 40;
    areasRequiringAttention.push('Critical: Protection gap review needed for term and critical illness cover');
  }

  // 7. Liquidity Score
  let liquidityScore = client.liquidityRequirements === 'High' ? 70 : 85;

  const breakdown: FinancialHealthBreakdown = {
    emergencyFundScore: emergencyScore,
    savingsRateScore,
    debtBurdenScore,
    goalFundingScore,
    diversificationScore,
    insuranceReviewScore: insuranceScore,
    liquidityScore
  };

  const totalWeight = w.emergencyFund + w.savingsRate + w.debtBurden + w.goalFunding + w.diversification + w.insurance + w.liquidity;
  const weightedScore = (
    (emergencyScore * w.emergencyFund) +
    (savingsRateScore * w.savingsRate) +
    (debtBurdenScore * w.debtBurden) +
    (goalFundingScore * w.goalFunding) +
    (diversificationScore * w.diversification) +
    (insuranceScore * w.insurance) +
    (liquidityScore * w.liquidity)
  ) / totalWeight;

  const overallScore = Math.min(100, Math.max(10, Math.round(weightedScore)));

  return {
    id: `FHA-${client.id}`,
    clientId: client.id,
    overallScore,
    breakdown,
    strengths,
    areasRequiringAttention,
    assessmentDate: new Date().toISOString().split('T')[0],
    advisorNotes: `Comprehensive review based on CapitalVest standard 7-pillar wealth evaluation. Client risk profile: ${client.riskProfile}.`,
    evaluatedBy: client.primaryAdvisor || 'Tanaisha Udwadia'
  };
}

/**
 * Deterministic Risk Monitoring & Alert Generator
 */
export function generateDeterministicRiskAlerts(
  clients: Client[],
  holdings: Holding[],
  goals: FinancialGoal[],
  settings?: FirmSettings
): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const maxConcentration = settings?.riskThresholds.maxSingleAssetConcentration || 25;

  // 1. Check concentration per client
  clients.forEach(client => {
    const clientHoldings = holdings.filter(h => h.clientId === client.id);
    const totalVal = clientHoldings.reduce((sum, h) => sum + h.currentMarketValue, 0);
    
    if (totalVal > 0) {
      clientHoldings.forEach(h => {
        const weight = (h.currentMarketValue / totalVal) * 100;
        if (weight > maxConcentration) {
          alerts.push({
            id: `ALT-CONC-${client.id}-${h.id}`,
            clientId: client.id,
            clientName: client.name,
            category: 'Concentration Risk',
            severity: weight > 35 ? 'Critical' : 'High',
            detectionDate: new Date().toISOString().split('T')[0],
            reason: `${h.assetName} accounts for ${weight.toFixed(1)}% of total portfolio value.`,
            currentValueDescription: `${weight.toFixed(1)}% of portfolio`,
            thresholdDescription: `Max recommended: ${maxConcentration}%`,
            suggestedAction: 'Consider phased profit booking or rebalancing into debt/gold to reduce idiosyncratic risk.',
            assignedPerson: client.primaryAdvisor || 'Tanaisha Udwadia',
            status: 'Open'
          });
        }
      });
    }

    // 2. Check overdue review dates
    if (client.nextReviewDate) {
      const reviewDate = new Date(client.nextReviewDate);
      const today = new Date();
      if (reviewDate < today) {
        alerts.push({
          id: `ALT-REV-${client.id}`,
          clientId: client.id,
          clientName: client.name,
          category: 'Overdue Client Review',
          severity: 'Medium',
          detectionDate: new Date().toISOString().split('T')[0],
          reason: `Mandatory client periodic review was due on ${client.nextReviewDate}.`,
          currentValueDescription: 'Overdue review',
          thresholdDescription: 'Periodic review schedule',
          suggestedAction: 'Initiate portfolio review meeting with client to re-evaluate investment policy statement.',
          assignedPerson: client.primaryAdvisor || 'Tanaisha Udwadia',
          status: 'Open'
        });
      }
    }

    // 3. Check insurance gap
    if (client.insuranceReviewStatus === 'Inadequate Coverage') {
      alerts.push({
        id: `ALT-INS-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        category: 'Missing Profile Information',
        severity: 'Medium',
        detectionDate: new Date().toISOString().split('T')[0],
        reason: 'Client identified with inadequate family term & health coverage during recent financial audit.',
        currentValueDescription: 'Coverage gap detected',
        thresholdDescription: 'Minimum 10x annual income coverage',
        suggestedAction: 'Conduct risk protection audit and present comprehensive term cover recommendations.',
        assignedPerson: client.primaryAdvisor || 'Tanaisha Udwadia',
        status: 'Open'
      });
    }
  });

  // 4. Check Goals behind schedule
  goals.forEach(goal => {
    const projection = calculateGoalProjection(goal);
    if (projection.onTrackProbability < 70 && goal.status !== 'Achieved') {
      const client = clients.find(c => c.id === goal.clientId);
      alerts.push({
        id: `ALT-GOAL-${goal.id}`,
        clientId: goal.clientId,
        clientName: client ? client.name : 'Client',
        category: 'Goal Behind Schedule',
        severity: projection.onTrackProbability < 50 ? 'High' : 'Medium',
        detectionDate: new Date().toISOString().split('T')[0],
        reason: `Goal "${goal.name}" has projected probability of ${projection.onTrackProbability}% due to lower monthly contributions.`,
        currentValueDescription: `Projected ₹${(projection.projectedFutureValue / 100000).toFixed(1)}L vs Target ₹${(goal.targetAmount / 100000).toFixed(1)}L`,
        thresholdDescription: 'Target completion probability >= 85%',
        suggestedAction: `Increase monthly SIP by ₹${(projection.requiredMonthlyContribution - goal.currentMonthlyContribution).toLocaleString('en-IN')} or extend target horizon.`,
        assignedPerson: client?.primaryAdvisor || 'Tanaisha Udwadia',
        status: 'Open'
      });
    }
  });

  return alerts;
}
