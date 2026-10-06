import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist/build/pdf.mjs';
import * as XLSX from 'xlsx';

// This is required for pdfjs to work in a non-bundled environment
// @ts-ignore
GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.mjs`;

/**
 * Extracts text content from various file types (PDF, DOCX, XLSX, TXT).
 * @param file The file object to process.
 * @returns A promise that resolves to the extracted text as a string.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    const mimeType = file.type?.toLowerCase() || '';

    const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
    const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx');
    const isExcel = mimeType.includes('spreadsheetml') || mimeType.includes('excel') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isTxt = mimeType === 'text/plain' || fileName.endsWith('.txt');

    if (isPdf) {
        const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // Ensure item.str exists before joining
            text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
        }
        return text;
    } else if (isDocx) {
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        return value;
    } else if (isExcel) {
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        let text = '';
        workbook.SheetNames.forEach(sheetName => {
            text += `--- Hoja: ${sheetName} ---\n`;
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            text += (jsonData as any[][]).map(row => row.join('\t')).join('\n') + '\n';
        });
        return text;
    } else if (isTxt) {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(arrayBuffer);
    }
    // Return empty string for unsupported types to avoid errors
    return '';
};