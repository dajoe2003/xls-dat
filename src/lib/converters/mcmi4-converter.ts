import { parseExcelDateField, formatDateDDMMYYYY } from '@/lib/excel-utils';

export interface MCMI4Data {
  timestamp: string;
  nama: string;
  nomorRM: string;
  nomorHP: string;
  tempatTes: string;
  alamat: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  statusPernikahan?: string;
  pendidikanTerakhir?: string;
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

export function convertToMCMI4DAT(data: MCMI4Data[]): string {
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
    
    // Columns 82-89: Tanggal Tes (DDMMYYYY from timestamp)
    const testDate = parseExcelDateField(participant.timestamp);
    line += testDate ? formatDateDDMMYYYY(testDate) : '00000000';
    
    // Columns 90-95: Jenis Kelamin (6 chars)
    const gender = (participant.jenisKelamin || '').toUpperCase();
    line += padRight(gender, 6);
    
    // Columns 96-106: Status Pernikahan (11 chars)
    const marital = (participant.statusPernikahan || '').toUpperCase();
    line += padRight(marital, 11);
    
    // Columns 107-117: Pendidikan Terakhir (11 chars)
    const education = (participant.pendidikanTerakhir || '').toUpperCase();
    line += padRight(education, 11);
    
    // Columns 118-312: Answers (195 items)
    const answers = (participant.responses || '').split(',').map(convertAnswer).join('');
    line += padRight(answers, 195);
    
    // Column 313: One space
    line += ' ';
    
    datContent += line + '\n';
  });
  
  // Ensure file ends with exactly one newline
  if (data.length > 0) {
    datContent = datContent.replace(/\n+$/, '\n');
  }
  
  return datContent;
}

export function parseMCMI4Excel(rows: any[]): MCMI4Data[] {
  const participants: MCMI4Data[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[2]) continue;
    
    // Columns O-HA (index 14-208) contain the 195 answers
    const responses: string[] = [];
    for (let j = 14; j < 209 && j < row.length; j++) {
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
      tanggalLahir: row[8],  // Column I
      jenisKelamin: row[10] ? row[10].toString() : '',  // Column K
      statusPernikahan: row[11] ? row[11].toString() : '',  // Column L
      pendidikanTerakhir: row[12] ? row[12].toString() : '',  // Column M
      responses: responses.join(','),
    });
  }
  
  return participants;
}
