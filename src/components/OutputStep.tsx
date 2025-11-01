import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table as TableIcon, RotateCcw } from 'lucide-react';
import { useConverter } from '@/contexts/ConverterContext';
import { getCurrentDateTime, createExcelFile } from '@/lib/excel-utils';
import { convertToMMPI2DAT } from '@/lib/converters/mmpi2-converter';
import { convertToMCMI4DAT } from '@/lib/converters/mcmi4-converter';
import { convertToMMPIADAT } from '@/lib/converters/mmpia-converter';
import { convertToMMPRFDAT } from '@/lib/converters/mmprf-converter';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function OutputStep() {
  const { testType, participants, selectedParticipants, resetConverter } = useConverter();
  const navigate = useNavigate();

  const selectedData = selectedParticipants.map(index => participants[index]);

  const handleDownloadDAT = () => {
    try {
      let datContent = '';
      
      switch (testType) {
        case 'MMPI-2':
          datContent = convertToMMPI2DAT(selectedData);
          break;
        case 'MCMI-4':
          datContent = convertToMCMI4DAT(selectedData);
          break;
        case 'MMPI-A':
          datContent = convertToMMPIADAT(selectedData);
          break;
        case 'MMPI-RF':
          datContent = convertToMMPRFDAT(selectedData);
          break;
      }

      const blob = new Blob([datContent], { type: 'text/plain;charset=utf-8' });
      const filename = `${testType}_${getCurrentDateTime()}.dat`;
      saveAs(blob, filename);
      
      toast.success('DAT file downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate DAT file');
    }
  };

  const handleDownloadExcel = () => {
    try {
      const blob = createExcelFile(selectedData, testType);
      const filename = `${testType}_${getCurrentDateTime()}.xlsx`;
      saveAs(blob, filename);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate Excel file');
    }
  };

  const handleStartOver = () => {
    resetConverter();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Download Results</CardTitle>
          <CardDescription>
            {selectedData.length} participant(s) selected for {testType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={handleDownloadDAT}
              className="w-full h-auto py-6 flex-col gap-2"
            >
              <FileText className="h-8 w-8" />
              <span className="text-base font-semibold">Download DAT File</span>
              <span className="text-xs opacity-80">For test scoring software</span>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={handleDownloadExcel}
              className="w-full h-auto py-6 flex-col gap-2"
            >
              <TableIcon className="h-8 w-8" />
              <span className="text-base font-semibold">Download Excel File</span>
              <span className="text-xs opacity-80">Participant information</span>
            </Button>
          </div>

          <div className="pt-4 border-t flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/select')}
              className="flex-1"
            >
              Back to Selection
            </Button>
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
