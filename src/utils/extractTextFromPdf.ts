import fs from 'node:fs';
import pdf from 'pdf-parse';

export async function extractTextFromPdf(pdfPath: string) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
}
