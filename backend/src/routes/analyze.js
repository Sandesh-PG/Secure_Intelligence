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
    let fileMeta = {};

    if (req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      fileMeta = { ext };

      // For PDF/DOCX pass raw buffer; for text-based files decode to string
      if (['pdf', 'docx', 'doc'].includes(ext)) {
        content = req.file.buffer;          // keep as Buffer for parsers
        input_type = 'file';
      } else {
        content = req.file.buffer.toString('utf-8');
        input_type = ext === 'log' ? 'log' : (input_type || 'file');
      }
    }

    if (!content) {
      return res.status(400).json({ error: 'No content provided.' });
    }

    const detectedType = input_type || detectInputType(content);
    const extracted = await extractContent(detectedType, content, fileMeta);
    const findings = runDetection(extracted.text, detectedType);
    const { riskScore, riskLevel } = classifyRisk(findings);
    const { action, maskedContent } = applyPolicy(extracted.text, findings, options);
    const insights = await generateInsights(findings, detectedType, riskLevel);

    return res.json({
      summary: insights.summary,
      content_type: detectedType,
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