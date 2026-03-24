function applyPolicy(text, findings, options = {}) {
  const { mask = false, block_high_risk = false } = options;
  const hasCritical = findings.some(f => f.risk === 'critical');
  const hasHigh = findings.some(f => f.risk === 'high');

  if (block_high_risk && (hasCritical || hasHigh)) {
    const err = new Error('Content blocked: high-risk findings detected.');
    err.status = 403;
    throw err;
  }

  if (mask && findings.length > 0) {
    return { action: 'masked', maskedContent: maskContent(text) };
  }

  return { action: findings.length === 0 ? 'allowed' : 'flagged', maskedContent: null };
}

function maskContent(text) {
  const patterns = [
    { regex: /(?:password|passwd|pwd)\s*[=:]\s*\S+/gi,              label: 'PASSWORD' },
    { regex: /(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[=:]\s*\S+/gi, label: 'API_KEY' },
    { regex: /Authorization:\s*Bearer\s+\S+/gi,                      label: 'BEARER_TOKEN' },
    { regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, label: 'JWT' },
    { regex: /\b(AKIA[0-9A-Z]{16})\b/g,                              label: 'AWS_KEY' },
  ];
  let masked = text;
  for (const { regex, label } of patterns) {
    masked = masked.replace(regex, `[REDACTED:${label}]`);
  }
  return masked;
}

export { applyPolicy };