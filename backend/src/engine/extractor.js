import mammoth from 'mammoth';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const { default: pdfParse } = await import('pdf-parse');
const libreConvert = promisify(libre.convert);

async function convertDocToDocx(buffer) {
  try {
    return await libreConvert(buffer, '.docx', undefined);
  } catch (err) {
    console.error('DOC → DOCX conversion error:', err.message);
    throw new Error('Failed to convert .doc file. Make sure LibreOffice is installed.');
  }
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractContent(inputType, rawContent, fileMeta = {}) {
  switch (inputType) {
    case 'log':
      return {
        text: rawContent,
        meta: { type: 'log', lineCount: rawContent.split('\n').length },
      };

    case 'sql':
      return { text: rawContent, meta: { type: 'sql' } };

    case 'file': {
      const ext = (fileMeta.ext || '').toLowerCase();

      if (ext === 'pdf') {
        try {
          const buffer = Buffer.isBuffer(rawContent)
            ? rawContent
            : Buffer.from(rawContent, 'binary');
          const data = await pdfParse(buffer);
          return {
            text: data.text,
            meta: { type: 'pdf', pages: data.numpages },
          };
        } catch (err) {
          console.error('PDF parse error:', err.message);
          throw new Error('Failed to parse PDF file.');
        }
      }

      if (ext === 'docx') {
        try {
          const buffer = Buffer.isBuffer(rawContent)
            ? rawContent
            : Buffer.from(rawContent, 'binary');
          const text = await extractFromDocx(buffer);
          return { text, meta: { type: 'docx' } };
        } catch (err) {
          console.error('DOCX parse error:', err.message);
          throw new Error('Failed to parse DOCX file.');
        }
      }

      if (ext === 'doc') {
        try {
          const buffer = Buffer.isBuffer(rawContent)
            ? rawContent
            : Buffer.from(rawContent, 'binary');
          // Convert .doc → .docx in memory, then extract text
          const docxBuffer = await convertDocToDocx(buffer);
          const text = await extractFromDocx(docxBuffer);
          return { text, meta: { type: 'doc' } };
        } catch (err) {
          console.error('DOC parse error:', err.message);
          throw new Error(err.message);
        }
      }

      // .txt / .log uploaded as file — treat as plain text
      return { text: rawContent, meta: { type: ext || 'text' } };
    }

    default:
      return { text: rawContent, meta: { type: inputType } };
  }
}

export { extractContent };