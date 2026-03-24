/**
 * Simple integration test — no test runner needed.
 * Run: node tests/test.js
 */

import app from '../src/app.js';
import http from 'node:http';

const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  console.log('🧪 Running tests...\n');

  let passed = 0;
  let failed = 0;

  async function post(path, body) {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (e) {
      console.log(`  ❌ ${name}: ${e.message}`);
      failed++;
    }
  }

  function assert(condition, msg) {
    if (!condition) throw new Error(msg);
  }

  // ── Test 1: Health check ──────────────────────────────────────────
  await test('GET /health returns ok', async () => {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    assert(data.status === 'ok', 'Expected status ok');
  });

  // ── Test 2: Spec example log ──────────────────────────────────────
  await test('Log with password + api_key + email → critical risk', async () => {
    const logContent = `2026-03-10 10:00:01 INFO User login
email=admin@company.com
password=admin123
api_key=sk-prod-xyz123456
ERROR stack trace: NullPointerException at service.java:45`;

    const result = await post('/analyze', {
      input_type: 'log',
      content: logContent,
      options: { mask: false, block_high_risk: false, log_analysis: true },
    });

    assert(result.findings.length > 0, 'Expected findings');
    assert(result.risk_level === 'critical' || result.risk_level === 'high', `Expected critical/high, got ${result.risk_level}`);
    assert(result.findings.some(f => f.type === 'password'), 'Expected password finding');
    assert(result.findings.some(f => f.type === 'email'), 'Expected email finding');
    assert(result.insights && result.insights.length > 0, 'Expected insights');
  });

  // ── Test 3: Masking ───────────────────────────────────────────────
  await test('Mask option redacts sensitive values', async () => {
    const result = await post('/analyze', {
      input_type: 'text',
      content: 'password=supersecret123',
      options: { mask: true },
    });
    assert(result.action === 'masked', 'Expected action=masked');
    assert(result.masked_content, 'Expected masked_content in response');
    assert(!result.masked_content.includes('supersecret123'), 'Original password should be masked');
  });

  // ── Test 4: Clean content ─────────────────────────────────────────
  await test('Clean content returns no findings and risk_level=none', async () => {
    const result = await post('/analyze', {
      input_type: 'text',
      content: 'Hello world. Everything looks good. No sensitive data here.',
    });
    assert(result.findings.length === 0, 'Expected no findings');
    assert(result.risk_level === 'none', `Expected none, got ${result.risk_level}`);
  });

  // ── Test 5: JWT detection ─────────────────────────────────────────
  await test('JWT token in log is detected as high risk', async () => {
    const result = await post('/analyze', {
      input_type: 'log',
      content: '2026-01-01 12:00:00 DEBUG token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    });
    assert(result.findings.some(f => f.type === 'jwt_token'), 'Expected jwt_token finding');
  });

  // ── Test 6: Auto input type detection ────────────────────────────
  await test('Input type auto-detected as log when not specified', async () => {
    const result = await post('/analyze', {
      content: '2026-01-01 10:00:00 INFO Server started\n2026-01-01 10:00:01 ERROR Failed to connect',
    });
    assert(result.content_type === 'log', `Expected log, got ${result.content_type}`);
  });

  // ── Summary ───────────────────────────────────────────────────────
  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
