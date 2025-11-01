import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TestType = 'MMPI-2' | 'MCMI-4' | 'MMPI-A' | 'MMPI-RF';

interface ParticipantData {
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

interface ConverterContextType {
  testType: TestType;
  setTestType: (type: TestType) => void;
  participants: ParticipantData[];
  setParticipants: (data: ParticipantData[]) => void;
  selectedParticipants: number[];
  setSelectedParticipants: (indices: number[]) => void;
  resetConverter: () => void;
}

const ConverterContext = createContext<ConverterContextType | undefined>(undefined);

export function ConverterProvider({ children }: { children: ReactNode }) {
  const [testType, setTestType] = useState<TestType>('MMPI-2');
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  const resetConverter = () => {
    setParticipants([]);
    setSelectedParticipants([]);
  };

  return (
    <ConverterContext.Provider
      value={{
        testType,
        setTestType,
        participants,
        setParticipants,
        selectedParticipants,
        setSelectedParticipants,
        resetConverter,
      }}
    >
      {children}
    </ConverterContext.Provider>
  );
}

export function useConverter() {
  const context = useContext(ConverterContext);
  if (!context) {
    throw new Error('useConverter must be used within ConverterProvider');
  }
  return context;
}
