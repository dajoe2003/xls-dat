export interface MMPIAData {
  timestamp: string;
  nama: string;
  nomorRM: string;
  nomorHP: string;
  tempatTes: string;
  alamat: string;
  tanggalLahir?: string;
  waktuMulai?: string;
  jenisKelamin?: string;
  statusPernikahan?: string;
  pendidikanTerakhir?: string;
  responses: string;
}

// Convert Excel serial date number to JavaScript Date
function excelSerialToDate(serial: number): Date {
  const epoch = new Date(1899, 11, 31); // Changed from 30 to 31 to fix off-by-one day issue
  const intPart = Math.floor(serial);
  const fracPart = serial - intPart;
  const milliseconds = intPart * 24 * 60 * 60 * 1000 + fracPart * 24 * 60 * 60 * 1000;
  return new Date(epoch.getTime() + milliseconds);
}

// Convert Excel time (fraction of day) to HH:MM string
function excelTimeToString(value: any): string {
  if (typeof value === 'number' && value < 1) {
    const totalSeconds = Math.round(value * 24 * 60 * 60);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  if (typeof value === 'string') {
    // Handle formats like "13:17" or "1:17:00 PM"
    const timeMatch = value.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2];
      // Check if PM
      if (value.toLowerCase().includes('pm') && parseInt(hours) < 12) {
        return `${String(parseInt(hours) + 12).padStart(2, '0')}:${minutes}`;
      }
      return `${hours}:${minutes}`;
    }
  }
  if (value instanceof Date) {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return '';
}

// Convert timestamp to ISO format for display
function convertTimestamp(value: any): string {
  if (typeof value === 'number' && value >= 10000) {
    return excelSerialToDate(value).toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return '';
}

// Format date for DAT file (MMDDYY)
function formatDateMMDDYY(value: any): string {
  let date: Date | null = null;
  
  if (typeof value === 'number' && value >= 10000) {
    date = excelSerialToDate(value);
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  }
  
  if (date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}${day}${year}`;
  }
  return '';
}

// Extract time from timestamp (HHMM format)
function extractTimeHHMM(value: any): string {
  let date: Date | null = null;
  
  if (typeof value === 'number' && value >= 10000) {
    date = excelSerialToDate(value);
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  }
  
  if (date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`;
  }
  return '0000';
}

export function convertToMMPIADAT(data: MMPIAData[]): string {
  let datContent = '';
  
  data.forEach((participant) => {
    let line = '';
    
    // Columns 1-40: Fixed text
    line += '000000000000000000000 Y 0000 #0001    N ';
    
    // Columns 41-65: Nama (25 chars)
    const nama = (participant.nama || '').substring(0, 25).padEnd(25, ' ');
    line += nama;
    
    // Columns 66-73: Nomor RM (8 digits)
    const nomorRM = (participant.nomorRM || '').padStart(8, '0').substring(0, 8);
    line += nomorRM;
    
    // Columns 74-75: Fixed "XX"
    line += 'XX';
    
    // Columns 76-81: Tanggal Lahir (MMDDYY)
    const tanggalLahir = formatDateMMDDYY(participant.tanggalLahir || '').padEnd(6, '0');
    line += tanggalLahir;
    
    // Columns 82-85: Waktu Mulai (HHMM)
    const waktuMulaiStr = excelTimeToString(participant.waktuMulai);
    const waktuMulai = waktuMulaiStr.replace(':', '').substring(0, 4).padEnd(4, '0');
    line += waktuMulai;
    
    // Columns 86-89: End Time from timestamp (HHMM)
    const endTime = extractTimeHHMM(participant.timestamp);
    line += endTime;
    
    // Columns 90-95: Jenis Kelamin (6 chars)
    const jenisKelamin = (participant.jenisKelamin || '').substring(0, 6).padEnd(6, ' ');
    line += jenisKelamin;
    
    // Columns 96-106: Status Pernikahan (11 chars)
    const statusPernikahan = (participant.statusPernikahan || '').substring(0, 11).padEnd(11, ' ');
    line += statusPernikahan;
    
    // Columns 107-115: Pendidikan Terakhir (9 chars)
    const pendidikan = (participant.pendidikanTerakhir || '').substring(0, 9).padEnd(9, ' ');
    line += pendidikan;
    
    // Columns 116-594: Responses (478 items, Ya=+, Tidak=-)
    let responses = participant.responses || '';
    responses = responses.replace(/Ya/gi, '+').replace(/Tidak/gi, '-');
    responses = responses.substring(0, 479).padEnd(479, ' ');
    line += responses;
    
    // Column 595: One space
    line += ' ';
    
    // Ensure exactly 686 characters (pad or truncate)
    line = line.substring(0, 686).padEnd(686, ' ');
    
    datContent += line + '\n';
  });
  
  // Ensure file ends with exactly one newline
  if (data.length > 0) {
    datContent = datContent.replace(/\n+$/, '\n');
  }
  
  return datContent;
}

export function parseMMPIAExcel(rows: any[]): MMPIAData[] {
  const participants: MMPIAData[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[2]) continue;
    
    let responses = '';
    // Columns N onwards (index 13+) contain answers
    for (let j = 13; j < row.length; j++) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        responses += row[j].toString();
      }
    }
    
    participants.push({
      timestamp: convertTimestamp(row[0]),
      nama: row[2] ? row[2].toString() : '',
      nomorRM: row[3] ? row[3].toString() : '',
      nomorHP: row[4] ? row[4].toString() : '',
      tempatTes: row[5] ? row[5].toString() : '',
      alamat: row[6] ? row[6].toString() : '',
      tanggalLahir: row[7] || '',
      waktuMulai: row[8] || '',
      jenisKelamin: row[9] ? row[9].toString() : '',
      statusPernikahan: row[10] ? row[10].toString() : '',
      pendidikanTerakhir: row[11] ? row[11].toString() : '',
      responses: responses,
    });
  }
  
  return participants;
}
