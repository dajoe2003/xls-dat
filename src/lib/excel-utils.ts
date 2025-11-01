import * as XLSX from 'xlsx';

export async function fetchGoogleSheet(url: string): Promise<any[]> {
  try {
    // Convert Google Sheets URL to export format
    let exportUrl = url;
    
    if (url.includes('docs.google.com/spreadsheets')) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const sheetId = match[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
      }
    }
    
    const response = await fetch(exportUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    // Use raw: true to preserve numeric values for proper time/date conversion
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });
    
    return data as any[];
  } catch (error) {
    throw new Error('Failed to fetch Google Sheet. Please check the URL and make sure it\'s publicly accessible.');
  }
}

export function readLocalExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        // Use raw: true to preserve numeric values for proper time/date conversion
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });
        resolve(rows as any[]);
      } catch (error) {
        reject(new Error('Failed to read Excel file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function formatDate(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return timestamp;
  }
}

export function excelDateToDate(serial: number): Date {
  // Excel dates are days since 1899-12-30
  const excelEpoch = new Date(1899, 11, 30);
  const milliseconds = serial * 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + milliseconds);
}

export function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

export function parseExcelDateField(value: any): Date | null {
  if (!value) return null;
  
  // If it's a number >= 10000, treat as Excel serial date
  if (typeof value === 'number' && value >= 10000) {
    return excelDateToDate(value);
  }
  
  // If it's already a Date object
  if (value instanceof Date) {
    return value;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
}

export function getCurrentDateTime(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
}

export function createExcelFile(participants: any[], testType: string): Blob {
  const exportData = participants.map((p, index) => ({
    'Number': index + 1,
    'Tanggal Tes': formatDate(p.timestamp),
    'Nama': p.nama,
    'Nomor RM': p.nomorRM,
    'Nomor HP': p.nomorHP,
    'Tempat Tes': p.tempatTes,
    'Alamat': p.alamat,
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Auto-fit columns
  const cols = [
    { wch: 8 },  // Number
    { wch: 15 }, // Tanggal Tes
    { wch: 25 }, // Nama
    { wch: 15 }, // Nomor RM
    { wch: 15 }, // Nomor HP
    { wch: 20 }, // Tempat Tes
    { wch: 30 }, // Alamat
  ];
  worksheet['!cols'] = cols;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, testType);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
