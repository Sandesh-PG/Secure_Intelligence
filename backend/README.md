# AI Secure Data Intelligence Platform — Backend

> Node.js / Express | Modular Detection Engine | Mock AI Insights (LLM-ready)

---

## Quick Start

```bash
npm install
npm start          # production
npm run dev        # nodemon watch mode
npm test           # run integration tests
```

Server starts on **port 3000** by default (`PORT` env var to override).

---

## API

### `POST /analyze`

**JSON body:**
```json
{
  "input_type": "text | file | sql | chat | log",
  "content": "...raw content...",
  "options": {
    "mask": true,
    "block_high_risk": false,
    "log_analysis": true
  }
}
```

`input_type` is optional — the engine will auto-detect from content.

**Multipart file upload:**
```
POST /analyze
Content-Type: multipart/form-data

file=<file>
```

**Response:**
```json
{
  "summary": "CRITICAL: log contains 3 finding(s)...",
  "content_type": "log",
  "findings": [
    { "type": "password", "risk": "critical", "value": "adm***23", "line": 3, "context": "password=admin123" },
    { "type": "api_key",  "risk": "high",     "value": "sk-***yz", "line": 4, "context": "api_key=sk-prod-xyz" },
    { "type": "email",    "risk": "low",       "value": "adm***om", "line": 2, "context": "email=admin@company.com" }
  ],
  "risk_score": 16,
  "risk_level": "critical",
  "action": "flagged",
  "insights": [
    "1 plaintext password found — rotate immediately and audit access logs.",
    "1 API key exposed — revoke and reissue via your secrets manager.",
    "1 email address logged — ensure this is compliant with your data retention policy."
  ]
}
```

---

## Architecture

```
src/
├── server.js               Entry point
├── app.js                  Express setup, middleware, multer
├── routes/
│   └── analyze.js          POST /analyze — orchestrates the pipeline
└── engine/
    ├── inputDetector.js    Auto-detect input type from content
    ├── extractor.js        Normalize content per type
    ├── detectionEngine.js  Regex patterns for all sensitive data types
    ├── riskEngine.js       Scoring + risk level classification
    ├── policyEngine.js     Masking + block-high-risk enforcement
    └── aiInsights.js       Mock AI insights (LLM hook ready)
```

### Processing Pipeline

```
Input (JSON body or file upload)
  ↓ Validation
  ↓ Input type detection (auto or explicit)
  ↓ Content extraction / normalization
  ↓ Detection Engine (regex patterns)
  ↓ Risk Engine (score + level)
  ↓ Policy Engine (mask / block)
  ↓ AI Insights (mock → real LLM)
  ↓ Response
```

---

## Detection Patterns

| Type           | Risk     | Description                        |
|----------------|----------|------------------------------------|
| password       | critical | password= / passwd= / pwd=         |
| private_key    | critical | PEM private key blocks             |
| api_key        | high     | api_key= / secret_key= patterns    |
| jwt_token      | high     | eyJ... JWT format                  |
| aws_key        | high     | AKIA... AWS access key format      |
| bearer_token   | high     | Authorization: Bearer ...          |
| ssn            | high     | ###-##-#### Social Security        |
| stack_trace    | medium   | Exception / Error / at Class:line  |
| credit_card    | medium   | Luhn-valid card number formats     |
| ip_address     | medium   | IPv4 addresses                     |
| email          | low      | Standard email addresses           |
| phone_number   | low      | US phone number formats            |

---

## Swapping in a Real LLM

Open `src/engine/aiInsights.js` and uncomment the `callLLM` section at the bottom.
Set `ANTHROPIC_API_KEY` (or your provider's key) as an environment variable.
The function signature and return shape stay the same — no other files change.
