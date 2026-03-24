const WEIGHTS = { critical: 10, high: 5, medium: 2, low: 1 };

function classifyRisk(findings) {
  const riskScore = findings.reduce((sum, f) => sum + (WEIGHTS[f.risk] || 0), 0);
  let riskLevel;
  if (riskScore >= 10)     riskLevel = 'critical';
  else if (riskScore >= 5) riskLevel = 'high';
  else if (riskScore >= 2) riskLevel = 'medium';
  else if (riskScore >= 1) riskLevel = 'low';
  else                     riskLevel = 'none';
  return { riskScore, riskLevel };
}

export { classifyRisk };