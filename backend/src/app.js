import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import analyzeRouter from './routes/analyze.js';

const app = express();
const startTime = Date.now();

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,                  // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down.' },
});
app.use('/analyze', limiter);

// ── Request logging ───────────────────────────────────────────────────────
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── File uploads ──────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.log', '.txt', '.pdf', '.doc', '.docx'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${ext}`));
  }
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/analyze', upload.single('file'), analyzeRouter);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  res.json({
    status: 'ok',
    uptime_seconds: uptimeSec,
    uptime_human: `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      detection_engine: 'online',
      risk_engine: 'online',
      policy_engine: 'online',
      ai_insights: process.env.GROQ_API_KEY ? 'online' : 'degraded (mock)',
    },
  });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

export default app;