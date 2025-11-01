import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link2, Upload, ArrowRight } from 'lucide-react';
import { useConverter } from '@/contexts/ConverterContext';
import { fetchGoogleSheet, readLocalExcel } from '@/lib/excel-utils';
import { parseMMPI2Excel } from '@/lib/converters/mmpi2-converter';
import { parseMCMI4Excel } from '@/lib/converters/mcmi4-converter';
import { parseMMPIAExcel } from '@/lib/converters/mmpia-converter';
import { parseMMPRFExcel } from '@/lib/converters/mmprf-converter';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function InputStep() {
  const [inputType, setInputType] = useState<'sheet' | 'file'>('sheet');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { testType, setParticipants } = useConverter();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    
    try {
      let rows: any[] = [];
      
      if (inputType === 'sheet') {
        if (!googleSheetUrl.trim()) {
          toast.error('Please enter a Google Sheet URL');
          setLoading(false);
          return;
        }
        rows = await fetchGoogleSheet(googleSheetUrl);
      } else {
        if (!selectedFile) {
          toast.error('Please select a file');
          setLoading(false);
          return;
        }
        rows = await readLocalExcel(selectedFile);
      }

      // Parse based on test type
      let participants;
      switch (testType) {
        case 'MMPI-2':
          participants = parseMMPI2Excel(rows);
          break;
        case 'MCMI-4':
          participants = parseMCMI4Excel(rows);
          break;
        case 'MMPI-A':
          participants = parseMMPIAExcel(rows);
          break;
        case 'MMPI-RF':
          participants = parseMMPRFExcel(rows);
          break;
      }

      if (participants.length === 0) {
        toast.error('No valid participant data found');
        setLoading(false);
        return;
      }

      setParticipants(participants);
      toast.success(`Successfully loaded ${participants.length} participant(s)`);
      navigate('/select');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all ${
            inputType === 'sheet' ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
          }`}
          onClick={() => setInputType('sheet')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Google Sheet Link</CardTitle>
            </div>
            <CardDescription>
              Paste a link to your Google Sheet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Sheet URL</Label>
              <Input
                id="sheet-url"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                disabled={inputType !== 'sheet'}
              />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            inputType === 'file' ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
          }`}
          onClick={() => setInputType('file')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Upload className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-lg">Upload XLSX File</CardTitle>
            </div>
            <CardDescription>
              Upload a local Excel file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={inputType !== 'file'}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? 'Processing...' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
