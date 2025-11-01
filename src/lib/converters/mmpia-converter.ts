export interface MMPIAData {
  timestamp: string;
  nama: string;
  nomorRM: string;
  nomorHP: string;
  tempatTes: string;
  alamat: string;
  responses: string;
}

// Convert Excel serial date number to JavaScript Date
function excelSerialToDate(serial: number): Date {
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 24 * 60 * 60 * 1000);
}

// Convert timestamp to ISO format for display
function convertTimestamp(value: any): string {
  if (typeof value === 'number' && value >= 10000) {
    // Excel serial date
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

export function convertToMMPIADAT(data: MMPIAData[]): string {
  let datContent = '';
  
  data.forEach((participant) => {
    const responses = participant.responses || '';
    datContent += responses + '\n';
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
    for (let j = 7; j < row.length; j++) {
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
      responses: responses,
    });
  }
  
  return participants;
}
