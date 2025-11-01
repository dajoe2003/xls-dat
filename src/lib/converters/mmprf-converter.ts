import { parseExcelDateField, formatDateDDMMYYYY } from '@/lib/excel-utils';

export interface MMPRFData {
  timestamp: string;
  nama: string;
  nomorRM: string;
  nomorHP: string;
  tempatTes: string;
  alamat: string;
  tanggalLahir?: string;
  tesDimulaiPukul?: string;
  jenisKelamin?: string;
  statusPernikahan?: string;
  pendidikanTerakhir?: string;
  pekerjaan?: string;
  responses: string;
}

function padRight(str: string, length: number): string {
  return str.substring(0, length).padEnd(length, ' ');
}

function padLeft(str: string, length: number, char: string = '0'): string {
  return str.substring(0, length).padStart(length, char);
}

function convertAnswer(answer: string): string {
  const normalized = answer.trim().toLowerCase();
  if (normalized === 'ya' || normalized === 'y') return '+';
  if (normalized === 'tidak' || normalized === 't') return '-';
  return ' ';
}

function parseTime(value: any): string {
  // Step 1: Handle empty/null
  if (!value) return '0000';
  
  const trimmed = typeof value === 'string' ? value.trim() : value;
  if (trimmed === '') return '0000';
  
  // Step 2: Handle Date objects (from cellDates: true in XLSX)
  if (trimmed instanceof Date) {
    const hours = padLeft(trimmed.getHours().toString(), 2, '0');
    const minutes = padLeft(trimmed.getMinutes().toString(), 2, '0');
    return hours + minutes;
  }
  
  // Step 3: Handle numeric (Excel/Sheets time serial)
  if (typeof trimmed === 'number') {
    const t = trimmed % 1; // Time-of-day portion only
    const totalMinutes = Math.round(t * 24 * 60);
    let HH = Math.floor(totalMinutes / 60) % 24;
    let MM = totalMinutes % 60;
    return padLeft(HH.toString(), 2, '0') + padLeft(MM.toString(), 2, '0');
  }
  
  // Step 3: Handle string
  let str = trimmed.toString().trim();
  
  // Remove leading single quote
  if (str.startsWith("'")) {
    str = str.substring(1);
  }
  
  // Replace dots with colons
  str = str.replace(/\./g, ':');
  str = str.trim();
  
  // Try regex match: HH:MM or HH:MM:SS with optional AM/PM
  const timeRegex = /^\s*([0-2]?\d):?([0-5]?\d)(?::([0-5]?\d))?\s*(AM|PM|am|pm)?\s*$/i;
  let match = timeRegex.exec(str);
  
  // If no match, try plain digits like "1317"
  if (!match) {
    const plainDigitsRegex = /^(\d{3,4})$/;
    const plainMatch = plainDigitsRegex.exec(str);
    if (plainMatch) {
      const digits = plainMatch[1];
      if (digits.length === 3) {
        // e.g., "705" -> "07:05"
        str = '0' + digits[0] + ':' + digits.substring(1);
      } else {
        // e.g., "1317" -> "13:17"
        str = digits.substring(0, 2) + ':' + digits.substring(2);
      }
      match = timeRegex.exec(str);
    }
  }
  
  if (match) {
    let hour = parseInt(match[1], 10);
    let minute = parseInt(match[2], 10);
    let second = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4] ? match[4].toUpperCase() : null;
    
    // Handle AM/PM conversion
    if (ampm) {
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
    }
    
    // Round seconds >= 30 up to next minute
    if (second >= 30) {
      minute += 1;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    
    // Handle hour overflow
    hour = hour % 24;
    
    return padLeft(hour.toString(), 2, '0') + padLeft(minute.toString(), 2, '0');
  }
  
  // Parse error - return 0000
  return '0000';
}

function extractTimeFromDate(date: Date): string {
  const hours = padLeft(date.getHours().toString(), 2, '0');
  const minutes = padLeft(date.getMinutes().toString(), 2, '0');
  return hours + minutes;
}

export function convertToMMPRFDAT(data: MMPRFData[]): string {
  let datContent = '';
  
  data.forEach((participant) => {
    let line = '';
    
    // Columns 1-40: Fixed text
    line += '000000000000000000000 Y 0000 #0001    N ';
    
    // Columns 41-65: Nama (25 chars)
    line += padRight(participant.nama || '', 25);
    
    // Columns 66-73: Nomor RM (8 digits)
    line += padLeft(participant.nomorRM || '', 8, '0');
    
    // Columns 74-81: Tanggal Lahir (DDMMYYYY)
    const birthDate = parseExcelDateField(participant.tanggalLahir);
    if (birthDate) birthDate.setDate(birthDate.getDate() + 1);
    line += birthDate ? formatDateDDMMYYYY(birthDate) : '00000000';
    
    // Columns 82-85: Tes dimulai pukul (hhmm)
    line += parseTime(participant.tesDimulaiPukul);
    
    // Columns 86-89: End Time from timestamp (hhmm)
    const endDate = parseExcelDateField(participant.timestamp);
    line += endDate ? extractTimeFromDate(endDate) : '0000';
    
    // Columns 90-95: Jenis Kelamin (6 chars)
    const gender = (participant.jenisKelamin || '').toUpperCase();
    line += padRight(gender, 6);
    
    // Columns 96-106: Status Pernikahan (11 chars)
    const marital = (participant.statusPernikahan || '').toUpperCase();
    line += padRight(marital, 11);
    
    // Columns 107-117: Pendidikan Terakhir (11 chars)
    const education = (participant.pendidikanTerakhir || '').toUpperCase();
    line += padRight(education, 11);
    
    // Columns 118-145: Pekerjaan (28 chars)
    line += padRight(participant.pekerjaan || '', 28);
    
    // Columns 146-483: Answers (338 items)
    const answers = (participant.responses || '').split(',').map(convertAnswer).join('');
    line += padRight(answers, 338);
    
    // Column 484: One space
    line += ' ';
    
    datContent += line + '\n';
  });
  
  // Ensure file ends with exactly one newline
  if (data.length > 0) {
    datContent = datContent.replace(/\n+$/, '\n');
  }
  
  return datContent;
}

export function parseMMPRFExcel(rows: any[]): MMPRFData[] {
  const participants: MMPRFData[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[2]) continue;
    
    // Columns N-MM (index 13-350) contain the 338 answers
    const responses: string[] = [];
    for (let j = 13; j < 351 && j < row.length; j++) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        responses.push(row[j].toString());
      }
    }
    
    participants.push({
      timestamp: row[0],  // Column A
      nama: row[2] ? row[2].toString() : '',  // Column C
      nomorRM: row[3] ? row[3].toString() : '',  // Column D
      nomorHP: row[4] ? row[4].toString() : '',  // Column E
      tempatTes: row[5] ? row[5].toString() : '',  // Column F
      alamat: row[6] ? row[6].toString() : '',  // Column G
      tanggalLahir: row[7],  // Column H
      tesDimulaiPukul: row[8],  // Column I
      jenisKelamin: row[9] ? row[9].toString() : '',  // Column J
      statusPernikahan: row[10] ? row[10].toString() : '',  // Column K
      pendidikanTerakhir: row[11] ? row[11].toString() : '',  // Column L
      pekerjaan: row[12] ? row[12].toString() : '',  // Column M
      responses: responses.join(','),
    });
  }
  
  return participants;
}
