import * as dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

const PORT = process.env.PORT || 8000;

console.log('GROQ KEY:', process.env.GROQ_API_KEY ? 'loaded ✅' : 'missing ❌');
app.listen(PORT, () => {
  console.log(`🚀 AI Secure Data Intelligence Platform running on port ${PORT}`);
});