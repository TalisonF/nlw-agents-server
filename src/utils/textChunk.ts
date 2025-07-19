export function chunkText(text: string, chunkSize = 500, overlapSize = 50) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);
    chunks.push(chunk);
    start += chunkSize - overlapSize;
    if (start < 0) {
      start = 0;
    }
  }
  return chunks;
}
