export interface MMPI2Data {
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
  // Excel dates are days since 1899-12-30
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 24 * 60 * 60 * 1000);
}

// Convert Excel time fraction to HHMM format
function excelTimeToString(value: any): string {
  if (typeof value === 'number') {
    // Handle time as fraction of day (0 to 1)
    if (value < 1) {
      const totalSeconds = Math.round(value * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
    }
    // Handle Excel serial date with time component
    if (value >= 1) {
      const date = excelSerialToDate(value);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
    }
  }
  if (typeof value === 'string') {
    // Parse formats like "13:17", "1:17:00 PM", "13.17"
    const match = value.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      // Check for PM (12-hour format)
      if (value.toUpperCase().includes('PM') && hours < 12) {
        hours += 12;
      } else if (value.toUpperCase().includes('AM') && hours === 12) {
        hours = 0;
      }
      return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
    }
  }
  if (value instanceof Date) {
    const hours = value.getHours();
    const minutes = value.getMinutes();
    return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
  }
  return '0000';
}

// Convert date string or serial to DDMMYYYY format
function formatDateToDDMMYYYY(value: any): string {
  let date: Date;
  
  if (typeof value === 'number' && value > 10000) {
    date = excelSerialToDate(value);
  } else if (typeof value === 'string') {
    // Try parsing MM/DD/YYYY or other formats
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else {
    return '01011900';
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

// Extract time from timestamp (HHMM format) - handles Excel serial dates
function extractTimeFromTimestamp(value: any): string {
  if (typeof value === 'number') {
    // Excel serial date number (days since 1899-12-30)
    if (value >= 10000) {
      const date = excelSerialToDate(value);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}${minutes}`;
    }
    // Small number, treat as time fraction
    if (value < 1) {
      const totalSeconds = Math.round(value * 24 * 60 * 60);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      return `${hours}${minutes}`;
    }
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}${minutes}`;
    }
  }
  if (value instanceof Date) {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`;
  }
  return '0000';
}

export function convertToMMPI2DAT(data: MMPI2Data[]): string {
  let datContent = '';
  
  data.forEach((participant) => {
    // Columns 1-40: Fixed text
    let line = '000000000000000000000 Y 0000 #0001    N ';
    
    // Columns 41-65: Nama (25 chars)
    const nama = (participant.nama || '').substring(0, 25).padEnd(25, ' ');
    line += nama;
    
    // Columns 66-73: Nomor RM (8 digits, pad with zeros)
    const nomorRM = (participant.nomorRM || '').substring(0, 8).padStart(8, '0');
    line += nomorRM;
    
    // Columns 74-81: Tanggal Lahir (DDMMYYYY)
    const tanggalLahir = formatDateToDDMMYYYY(participant.tanggalLahir || '');
    line += tanggalLahir;
    
    // Columns 82-85: Waktu Mulai (HHMM)
    const waktuMulai = excelTimeToString(participant.waktuMulai || '').substring(0, 4).padStart(4, '0');
    line += waktuMulai;
    
    // Columns 86-89: End Time from Timestamp (HHMM)
    const endTime = extractTimeFromTimestamp(participant.timestamp).substring(0, 4).padStart(4, '0');
    line += endTime;
    
    // Columns 90-95: Jenis Kelamin (6 chars)
    const jenisKelamin = (participant.jenisKelamin || '').substring(0, 6).padEnd(6, ' ');
    line += jenisKelamin;
    
    // Columns 96-106: Status Pernikahan (11 chars)
    const statusPernikahan = (participant.statusPernikahan || '').substring(0, 11).padEnd(11, ' ');
    line += statusPernikahan;
    
    // Columns 107-117: Pendidikan Terakhir (11 chars)
    const pendidikan = (participant.pendidikanTerakhir || '').substring(0, 11).padEnd(11, ' ');
    line += pendidikan;
    
    // Columns 118-685: Answers (568 chars - convert Ya/Tidak to +/-)
    let answers = participant.responses || '';
    answers = answers.replace(/Ya/gi, '+').replace(/Tidak/gi, '-');
    answers = answers.substring(0, 568).padEnd(568, ' ');
    line += answers;
    
    // Column 686: Space and newline
    line += ' \n';
    
    datContent += line;
  });
  
  // Ensure file ends with exactly one newline
  if (data.length > 0) {
    datContent = datContent.replace(/\n+$/, '\n');
  }
  
  return datContent;
}

export function parseMMPI2Excel(rows: any[]): MMPI2Data[] {
  const participants: MMPI2Data[] = [];
  
  // Skip header row, start from row 1 (index 1)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[2]) continue; // Skip if no name
    
    // Concatenate responses from columns N onwards (index 13)
    let responses = '';
    for (let j = 13; j < row.length; j++) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        responses += row[j].toString();
      }
    }
    
    // Convert timestamp to ISO format if it's an Excel serial date
    let timestamp = row[0] || '';
    if (typeof row[0] === 'number' && row[0] >= 10000) {
      timestamp = excelSerialToDate(row[0]).toISOString();
    } else if (row[0] instanceof Date) {
      timestamp = row[0].toISOString();
    }
    
    participants.push({
      timestamp: timestamp,                       // Column A
      nama: row[2] ? row[2].toString() : '',      // Column C
      nomorRM: row[3] ? row[3].toString() : '',   // Column D
      nomorHP: row[4] ? row[4].toString() : '',   // Column E
      tempatTes: row[5] ? row[5].toString() : '', // Column F
      alamat: row[6] ? row[6].toString() : '',    // Column G
      tanggalLahir: row[7] || '',                 // Column H
      waktuMulai: row[8] || '',                   // Column I
      jenisKelamin: row[9] ? row[9].toString() : '', // Column J
      statusPernikahan: row[10] ? row[10].toString() : '', // Column K
      pendidikanTerakhir: row[11] ? row[11].toString() : '', // Column L
      responses: responses,
    });
  }
  
  return participants;
}
