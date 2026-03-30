import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { parse as csvParse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export async function parseFile(fileData: Buffer, fileType: string): Promise<string> {
  if (fileType === 'pdf') {
    const data = await pdfParse(fileData);
    return data.text;
  }

  if (fileType === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer: fileData });
    return value;
  }

  if (fileType === 'csv') {
    const records = csvParse(fileData.toString('utf8'), { skip_empty_lines: true }) as string[][];
    return records.map((row) => row.join('\t')).join('\n');
  }

  if (fileType === 'xlsx') {
    const workbook = XLSX.read(fileData, { type: 'buffer' });
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(`Sheet: ${sheetName}`, csv);
    }
    return lines.join('\n');
  }

  // txt, md, and anything else
  return fileData.toString('utf8');
}
