import { Button } from "@/components/ui/button";
import { FolderOpen, Search, Plus, User, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
}

interface Folder {
  folder_id: string;
  patient_id: string;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

const Folders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [status, setStatus] = useState("active");
  const [creating, setCreating] = useState(false);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/v1/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients for dropdown
  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/v1/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Create new folder
  const createFolder = async () => {
    if (!selectedPatientId || !createdBy) {
      alert('Please select a patient and enter creator name');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/v1/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          created_by: createdBy,
          status: status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(prev => [...prev, data.data]);
        setIsCreateDialogOpen(false);
        setSelectedPatientId("");
        setCreatedBy("");
        setStatus("active");
      } else {
        const error = await response.json();
        alert(`Error creating folder: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder');
    } finally {
      setCreating(false);
    }
  };

  // Filter folders based on search
  const filteredFolders = folders.filter(folder => {
    const patient = patients.find(p => p.patient_id === folder.patient_id);
    if (!patient) return false;
    const patientName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || 
           folder.folder_id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    fetchFolders();
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading folders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Patient Folders</h1>
          <p className="text-muted-foreground">
            Access organized patient documentation
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className="w-full md:w-[240px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-500 hover:bg-medical-600">
                <Plus className="mr-1 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Patient Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient" className="text-right">
                    Patient
                  </Label>
                  <div className="col-span-3">
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.patient_id} value={patient.patient_id}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="created_by" className="text-right">
                    Created By
                  </Label>
                  <Input
                    id="created_by"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createFolder}
                  disabled={creating || !selectedPatientId || !createdBy}
                  className="bg-medical-500 hover:bg-medical-600"
                >
                  {creating ? "Creating..." : "Create Folder"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="rounded-full bg-medical-100 p-4">
              <FolderOpen className="h-12 w-12 text-medical-500" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No Patient Folders Yet</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Create your first patient folder to organize medical records, test results, and treatment plans.
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6 bg-medical-500 hover:bg-medical-600">
                  Create First Folder
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFolders.map((folder) => {
            const patient = patients.find(p => p.patient_id === folder.patient_id);
            return (
              <Card key={folder.folder_id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-medical-100 p-2">
                        <FolderOpen className="h-5 w-5 text-medical-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ID: {folder.folder_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      folder.status === 'active' ? 'bg-green-100 text-green-800' :
                      folder.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {folder.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Created by: {folder.created_by}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(folder.created_at).toLocaleDateString()}</span>
                    </div>
                    {patient && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredFolders.length === 0 && folders.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No folders found</h3>
            <p className="text-muted-foreground">
              No folders match your search criteria. Try a different search term.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folders;