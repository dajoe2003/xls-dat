import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useConverter } from '@/contexts/ConverterContext';
import { formatDate } from '@/lib/excel-utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function SelectStep() {
  const { participants, selectedParticipants, setSelectedParticipants } = useConverter();
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tempatTesFilter, setTempatTesFilter] = useState<string>('all');

  // Get unique tempat tes values
  const uniqueTempatTes = useMemo(() => {
    return Array.from(new Set(participants.map(p => p.tempatTes))).sort();
  }, [participants]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort participants
  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = participants;
    
    // Apply tempat tes filter
    if (tempatTesFilter !== 'all') {
      filtered = filtered.filter(p => p.tempatTes === tempatTesFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aVal: any = a[sortColumn as keyof typeof a];
      let bVal: any = b[sortColumn as keyof typeof b];
      
      if (sortColumn === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [participants, tempatTesFilter, sortColumn, sortDirection]);

  const toggleParticipant = (index: number) => {
    setSelectedParticipants(
      selectedParticipants.includes(index)
        ? selectedParticipants.filter(i => i !== index)
        : [...selectedParticipants, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map((_, index) => index));
    }
  };

  const handleNext = () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }
    navigate('/output');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <span className="md:hidden">Select</span>
              <span className="hidden md:inline">Select Participants</span>
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
              <Select value={tempatTesFilter} onValueChange={setTempatTesFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueTempatTes.map(tempat => (
                      <SelectItem key={tempat} value={tempat}>
                        {tempat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedParticipants.length === participants.length && participants.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('number')}
                  >
                    No.
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('timestamp')}
                  >
                    Tanggal
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('nama')}
                  >
                    Nama
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSort('tempatTes')}
                  >
                    Lokasi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedParticipants.map((participant) => {
                  const originalIndex = participants.indexOf(participant);
                  return (
                    <TableRow
                      key={originalIndex}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleParticipant(originalIndex)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedParticipants.includes(originalIndex)}
                          onCheckedChange={() => toggleParticipant(originalIndex)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{originalIndex + 1}</TableCell>
                      <TableCell>{formatDate(participant.timestamp)}</TableCell>
                      <TableCell>{participant.nama}</TableCell>
                      <TableCell>{participant.tempatTes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {selectedParticipants.length} of {participants.length} participant(s) selected
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={selectedParticipants.length === 0}
          className="min-w-[200px]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
