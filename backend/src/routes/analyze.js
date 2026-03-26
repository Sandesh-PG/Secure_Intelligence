import express from 'express';
import { detectInputType } from '../engine/inputDetector.js';
import { extractContent } from '../engine/extractor.js';
import { runDetection } from '../engine/detectionEngine.js';
import { classifyRisk } from '../engine/riskEngine.js';
import { applyPolicy } from '../engine/policyEngine.js';
import { generateInsights } from '../engine/aiInsights.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let { input_type, content, options = {} } = req.body;
    let fileBuffer = null;
    let fileName = '';

    // ── File upload handling ─────────────────────────────────────────
    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      const ext = fileName.split('.').pop().toLowerCase();

      // Set input type based on extension
      if (ext === 'log') input_type = 'log';
      else if (ext === 'sql') input_type = 'sql';
      else if (['pdf', 'doc', 'docx'].includes(ext)) input_type = 'file';
      else input_type = input_type || 'file';

      // For non-binary files, decode buffer as text fallback
      if (['txt', 'log', 'sql'].includes(ext)) {
        content = fileBuffer.toString('utf-8');
      }
    }

    if (!content && !fileBuffer) {
      return res.status(400).json({ error: 'No content provided. Send "content" field or upload a file.' });
    }

    // ── Pipeline ─────────────────────────────────────────────────────
    const detectedType = input_type || detectInputType(content || '');
    const extracted = await extractContent(detectedType, content || '', fileBuffer, fileName);
    const findings = runDetection(extracted.text, detectedType);
    const { riskScore, riskLevel } = classifyRisk(findings);
    const { action, maskedContent } = applyPolicy(extracted.text, findings, options);
    const insights = await generateInsights(findings, detectedType, riskLevel);

    return res.json({
      summary: insights.summary,
      content_type: detectedType,
      file_meta: extracted.meta || null,
      findings,
      risk_score: riskScore,
      risk_level: riskLevel,
      action,
      ...(options.mask && maskedContent ? { masked_content: maskedContent } : {}),
      insights: insights.bullets,
    });
  } catch (err) {
    next(err);
  }
});

export default router;