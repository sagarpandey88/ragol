import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { parse as csvParse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export async function parseFile(filePath: string, fileType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');

  if (ext === 'pdf') {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === 'docx') {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  }

  if (ext === 'csv') {
    const content = await fs.readFile(filePath, 'utf8');
    const records = csvParse(content, { skip_empty_lines: true }) as string[][];
    return records.map((row) => row.join('\t')).join('\n');
  }

  if (ext === 'xlsx') {
    const workbook = XLSX.readFile(filePath);
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(`Sheet: ${sheetName}`, csv);
    }
    return lines.join('\n');
  }

  // txt, md, and anything else
  return fs.readFile(filePath, 'utf8');
}
