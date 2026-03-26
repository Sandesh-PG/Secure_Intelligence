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
  {
    regex: /(?:password|passwd|pwd)\s*(?:=|:|is)\s*[^\s]+/gi,
    label: 'PASSWORD'
  },
  {
    regex: /(?:api[_-]?key|secret[_-]?key|access[_-]?token|token)\s*(?:=|:|is)\s*[^\s]+/gi,
    label: 'API_KEY'
  },
  {
    regex: /\bsk-[A-Za-z0-9\-]{6,}\b/g,
    label: 'API_TOKEN'
  },
  {
    regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    label: 'JWT'
  }
];
  let masked = text;
  for (const { regex, label } of patterns) {
    masked = masked.replace(regex, `[REDACTED:${label}]`);
  }
  return masked;
}

export { applyPolicy };