const PATTERNS = [
  { type: 'password',     risk: 'critical', regex: /(?:password|passwd|pwd)\s*[=:]\s*(\S+)/gi,                          capture: 1 },
  { type: 'private_key',  risk: 'critical', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,                capture: 0 },
  { type: 'api_key',      risk: 'high',     regex: /(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[=:]\s*([A-Za-z0-9\-_.]{8,})/gi, capture: 1 },
  { type: 'jwt_token',    risk: 'high',     regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, capture: 0 },
  { type: 'aws_key',      risk: 'high',     regex: /\b(AKIA[0-9A-Z]{16})\b/g,                                          capture: 0 },
  { type: 'bearer_token', risk: 'high',     regex: /Authorization:\s*Bearer\s+([A-Za-z0-9\-_.~+/]{10,})/gi,            capture: 1 },
  { type: 'ssn',          risk: 'high',     regex: /\b\d{3}-\d{2}-\d{4}\b/g,                                           capture: 0 },
  { type: 'stack_trace',  risk: 'medium',   regex: /(?:Exception|Error|Traceback|at\s+[\w$.]+\([\w.]+:\d+\))/gm,       capture: 0 },
  { type: 'credit_card',  risk: 'medium',   regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,capture: 0 },
  { type: 'ip_address',   risk: 'medium',   regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\b/g, capture: 0 },
  { type: 'email',        risk: 'low',      regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,               capture: 0 },
  { type: 'phone_number', risk: 'low',      regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g,              capture: 0 },
];

function getLineNumber(text, index) {
  return text.substring(0, index).split('\n').length;
}

function redact(value) {
  if (!value || value.length <= 6) return '***';
  return value.slice(0, 3) + '*'.repeat(value.length - 5) + value.slice(-2);
}

function getLineContext(text, lineNumber) {
  const line = text.split('\n')[lineNumber - 1] || '';
  return line.length > 120 ? line.slice(0, 117) + '...' : line;
}

function runDetection(text, inputType) {
  const findings = [];
  const seen = new Set();

  for (const pattern of PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const lineNumber = getLineNumber(text, match.index);
      const rawValue = pattern.capture === 0 ? match[0] : match[pattern.capture];
      const key = `${pattern.type}:${lineNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({
        type: pattern.type,
        risk: pattern.risk,
        value: redact(rawValue),
        line: lineNumber,
        context: getLineContext(text, lineNumber),
      });
    }
  }

  const ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => ORDER[a.risk] - ORDER[b.risk]);
  return findings;
}

export { runDetection };