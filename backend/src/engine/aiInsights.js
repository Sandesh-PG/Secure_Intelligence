import Groq from 'groq-sdk';

async function generateInsights(findings, inputType, riskLevel) {
  if (!process.env.GROQ_API_KEY) {
    console.warn('No GROQ_API_KEY — falling back to mock');
    return mockInsights(findings, inputType, riskLevel);
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: 'You are a senior security analyst. Always respond with valid JSON only — no markdown, no backticks, no explanation.',
        },
        {
          role: 'user',
          content: buildPrompt(findings, inputType, riskLevel),
        },
      ],
    });

    const raw = completion.choices[0].message.content;
    return parseResponse(raw, findings, inputType, riskLevel);
  } catch (err) {
    console.error('Groq API error:', err.message);
    return mockInsights(findings, inputType, riskLevel);
  }
}

function buildPrompt(findings, inputType, riskLevel) {
  const list = findings.map(f =>
    `- ${f.type} (${f.risk} risk) on line ${f.line}: context="${f.context}"`
  ).join('\n');

  return `You are reviewing an automated security scan.

Input type: ${inputType}
Risk level: ${riskLevel}
Findings:
${list || 'None'}

Respond with this exact JSON structure:
{
  "summary": "one specific sentence about the overall security situation",
  "bullets": ["actionable insight 1", "actionable insight 2"]
}

Rules: 2-5 bullets, specific and actionable, valid JSON only.`;
}

function parseResponse(raw, findings, inputType, riskLevel) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (parsed.summary && Array.isArray(parsed.bullets)) return parsed;
    throw new Error('bad shape');
  } catch {
    console.warn('Failed to parse Groq response, falling back to mock');
    return mockInsights(findings, inputType, riskLevel);
  }
}

function mockInsights(findings, inputType, riskLevel) {
  const counts = findings.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {});
  const bullets = [];

  if (counts.password)     bullets.push(`${counts.password} plaintext password(s) — rotate immediately.`);
  if (counts.api_key)      bullets.push(`${counts.api_key} API key(s) exposed — revoke and reissue.`);
  if (counts.private_key)  bullets.push('Private key detected — revoke and audit all dependent services.');
  if (counts.jwt_token)    bullets.push('JWT tokens in logs — add log scrubbing middleware.');
  if (counts.aws_key)      bullets.push('AWS key found — disable in IAM and check CloudTrail.');
  if (counts.stack_trace)  bullets.push('Stack traces leaked — suppress error details in production.');
  if (counts.credit_card)  bullets.push('Credit card numbers present — review PCI-DSS compliance.');
  if (counts.ssn)          bullets.push('SSNs detected — review HIPAA/PII obligations.');
  if (counts.email)        bullets.push(`${counts.email} email(s) logged — verify data retention policy.`);
  if (bullets.length === 0) bullets.push('No sensitive data detected.');

  const summary = findings.length === 0
    ? `No issues detected in ${inputType} content.`
    : `${riskLevel.toUpperCase()}: ${findings.length} finding(s) in ${inputType} — ${[...new Set(findings.map(f => f.type))].join(', ')}.`;

  return { summary, bullets };
}

export { generateInsights };