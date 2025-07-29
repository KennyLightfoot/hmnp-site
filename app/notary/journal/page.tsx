'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface JournalEntry {
  id: string;
  bookingId?: string;
  notaryId: string;
  entryDate: string;
  journalNumber?: number;
  documentType?: string;
  signerName?: string;
  signerIdType?: string;
  signerIdState?: string;
  notarialActType?: string;
  feeCharged?: number;
  location?: string;
  additionalNotes?: string;
  createdAt: string;
  booking?: {
    id: string;
    signerName: string;
    service: {
      name: string;
    };
  };
}

interface NewJournalEntry {
  bookingId?: string;
  documentType: string;
  signerName: string;
  signerIdType: string;
  signerIdState: string;
  notarialActType: string;
  feeCharged: number;
  location: string;
  additionalNotes: string;
}

export default function JournalAuditTrail() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<NewJournalEntry>({
    documentType: '',
    signerName: '',
    signerIdType: '',
    signerIdState: 'TX',
    notarialActType: '',
    feeCharged: 0,
    location: '',
    additionalNotes: ''
  });

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterMonth !== 'all') params.append('month', filterMonth);

      const response = await fetch(`/api/notary/journal-entries?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [searchTerm, filterMonth]);

  const handleCreateEntry = async () => {
    try {
      const response = await fetch('/api/notary/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }

      setCreateDialogOpen(false);
      setNewEntry({
        documentType: '',
        signerName: '',
        signerIdType: '',
        signerIdState: 'TX',
        notarialActType: '',
        feeCharged: 0,
        location: '',
        additionalNotes: ''
      });
      fetchJournalEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry');
    }
  };

  const handleExportJournal = async () => {
    try {
      const response = await fetch('/api/notary/journal-export');
      if (!response.ok) {
        throw new Error('Failed to export journal');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notary-journal-${new Date().getFullYear()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export journal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading journal entries...
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            Notary Journal & Audit Trail
          </h2>
          <p className="text-gray-600 mt-1">
            Texas-compliant notary journal for record keeping and audit compliance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">
                <Plus className="h-4 w-4 mr-1" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
                <DialogDescription>
                  Add a new notarial act to your Texas-compliant journal
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input
                    id="documentType"
                    value={newEntry.documentType}
                    onChange={(e) => setNewEntry({...newEntry, documentType: e.target.value})}
                    placeholder="e.g., Power of Attorney"
                  />
                </div>
                <div>
                  <Label htmlFor="signerName">Signer Name</Label>
                  <Input
                    id="signerName"
                    value={newEntry.signerName}
                    onChange={(e) => setNewEntry({...newEntry, signerName: e.target.value})}
                    placeholder="Full name of signer"
                  />
                </div>
                <div>
                  <Label htmlFor="signerIdType">ID Type</Label>
                  <Select value={newEntry.signerIdType} onValueChange={(value) => setNewEntry({...newEntry, signerIdType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver_license">Driver's License</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="state_id">State ID</SelectItem>
                      <SelectItem value="military_id">Military ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="signerIdState">ID State</Label>
                  <Input
                    id="signerIdState"
                    value={newEntry.signerIdState}
                    onChange={(e) => setNewEntry({...newEntry, signerIdState: e.target.value})}
                    placeholder="TX"
                  />
                </div>
                <div>
                  <Label htmlFor="notarialActType">Notarial Act</Label>
                  <Select value={newEntry.notarialActType} onValueChange={(value) => setNewEntry({...newEntry, notarialActType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select act type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                      <SelectItem value="oath_affirmation">Oath/Affirmation</SelectItem>
                      <SelectItem value="jurat">Jurat</SelectItem>
                      <SelectItem value="copy_certification">Copy Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeCharged">Fee Charged ($)</Label>
                  <Input
                    id="feeCharged"
                    type="number"
                    step="0.01"
                    value={newEntry.feeCharged}
                    onChange={(e) => setNewEntry({...newEntry, feeCharged: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEntry.location}
                    onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
                    placeholder="City, State or address where notarization occurred"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={newEntry.additionalNotes}
                    onChange={(e) => setNewEntry({...newEntry, additionalNotes: e.target.value})}
                    placeholder="Any additional notes about the notarization"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEntry} className="bg-[#A52A2A] hover:bg-[#8B0000]">
                  Create Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleExportJournal}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by signer name, document type, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchJournalEntries} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Journal Summary */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Journal Summary ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#A52A2A]">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {entries.filter(e => e.entryDate.startsWith(currentYear.toString())).length}
                </div>
                <div className="text-sm text-gray-600">This Year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(entries.map(e => e.signerName)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Signers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#002147]">
                  ${entries.reduce((sum, e) => sum + (e.feeCharged || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Fees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No journal entries found
              </h3>
              <p className="text-gray-600">
                Create your first journal entry to maintain Texas compliance records.
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <span className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {entry.journalNumber || index + 1}
                      </span>
                      {entry.signerName}
                    </CardTitle>
                    <CardDescription className="flex items-center text-sm mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(entry.entryDate).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <FileText className="h-3 w-3 mr-1" />
                      {entry.documentType}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {entry.notarialActType?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>ID Type:</strong> {entry.signerIdType?.replace(/_/g, ' ')}
                  </div>
                  <div>
                    <strong>ID State:</strong> {entry.signerIdState}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <strong>Fee:</strong> ${entry.feeCharged?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                {entry.location && (
                  <div className="text-sm">
                    <strong>Location:</strong> {entry.location}
                  </div>
                )}
                
                {entry.additionalNotes && (
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <strong>Notes:</strong> {entry.additionalNotes}
                  </div>
                )}
                
                {entry.booking && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Linked to booking: {entry.booking.id.slice(-8)} - {entry.booking.Service.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 