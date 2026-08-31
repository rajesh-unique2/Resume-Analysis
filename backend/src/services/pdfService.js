import pdfParse from 'pdf-parse'

/**
 * Extracts plain text from a resume PDF buffer, entirely locally (no
 * external API call). Works well for text-based PDFs, which covers the
 * vast majority of resumes. Scanned/image-only PDFs won't extract text
 * this way - if you hit that case, the fix would be adding OCR (e.g.
 * tesseract.js), but it's rare enough to skip for a student project.
 *
 * @param {Buffer} fileBuffer - the raw PDF file bytes (from multer memory storage)
 * @returns {Promise<string>} extracted text
 */
export async function extractTextFromResume(fileBuffer) {
  const data = await pdfParse(fileBuffer)
  return data.text
}
