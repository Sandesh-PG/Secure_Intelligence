import mammoth from 'mammoth';
import { extractText } from 'unpdf';

async function extractContent(inputType, rawContent, fileBuffer = null, fileName = '') {
  switch (inputType) {
    case 'log':
      return { text: rawContent, meta: { type: 'log', lineCount: rawContent.split('\n').length } };
    case 'sql':
      return { text: rawContent, meta: { type: 'sql' } };
    case 'file':
      return extractFile(fileBuffer, fileName, rawContent);
    case 'text':
    case 'chat':
    default:
      return { text: rawContent, meta: { type: inputType } };
  }
}

async function extractFile(fileBuffer, fileName, fallbackText) {
  const ext = fileName.split('.').pop().toLowerCase();
  try {
    if (ext === 'pdf') return extractPDF(fileBuffer, fileName);
    if (ext === 'docx' || ext === 'doc') return extractDOCX(fileBuffer, fileName);
    return {
      text: fallbackText || fileBuffer?.toString('utf-8') || '',
      meta: { type: 'file', ext, fileName },
    };
  } catch (err) {
    console.error(`File extraction error (${ext}):`, err.message);
    return { text: fallbackText || '', meta: { type: 'file', ext, fileName, extractionError: err.message } };
  }
}

async function extractPDF(buffer, fileName) {
  if (!buffer) throw new Error('No file buffer for PDF extraction');
  const uint8Array = new Uint8Array(buffer);
  const { text, totalPages } = await extractText(uint8Array, { mergePages: true });
  return {
    text,
    meta: { type: 'pdf', fileName, pages: totalPages, wordCount: text.split(/\s+/).length },
  };
}

async function extractDOCX(buffer, fileName) {
  if (!buffer) throw new Error('No file buffer for DOCX extraction');
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    meta: { type: 'docx', fileName, wordCount: result.value.split(/\s+/).length, warnings: result.messages?.length || 0 },
  };
}

export { extractContent };