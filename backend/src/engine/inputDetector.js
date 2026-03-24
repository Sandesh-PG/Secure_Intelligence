function detectInputType(content) {
  const trimmed = content.trim();
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(trimmed)) return 'sql';
  if (/^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/m.test(trimmed)) return 'log';
  if (/^(INFO|DEBUG|WARN|WARNING|ERROR|FATAL|CRITICAL)\b/im.test(trimmed)) return 'log';
  return 'text';
}

export { detectInputType };