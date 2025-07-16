import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const FolderView = () => {
  const { folder_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [folder, setFolder] = useState(null);
  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tests, setTests] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  useEffect(() => {
    if (folder_id) {
      fetchFolder();
    }
    // eslint-disable-next-line
  }, [folder_id]);

  const fetchFolder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/folders/${folder_id}`);
      const data = await res.json();
      if (data.success) {
        setFolder(data.folder);
        setPatient(data.patient);
        setNotes(data.notes || []);
        setAttachments(data.attachments || []);
        setTests(data.tests || []);
        setDiagnoses(data.diagnoses || []);
      } else {
        setError(data.error || 'Failed to load folder');
      }
    } catch (err) {
      setError('Error fetching folder');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading folder...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!folder) {
    return <div className="p-6 text-center">Folder not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Folder Details</CardTitle>
          <CardDescription>Folder ID: {folder.folder_id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge>{folder.status}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Created: {formatDate(folder.created_at)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Updated: {formatDate(folder.updated_at)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              Created By: {folder.created_by}
            </div>
          </div>
        </CardContent>
      </Card>
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Patient ID: {patient.patient_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Name: {patient.first_name} {patient.last_name}</div>
              <div>Date of Birth: {formatDate(patient.date_of_birth)}</div>
              <div>Status: {patient.current_status}</div>
              <div>Diagnosis: {patient.current_diagnosis}</div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* You can add more sections for notes, attachments, tests, diagnoses, etc. */}
      {/* Example: */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div>No notes available.</div>
          ) : (
            <ul className="list-disc pl-5">
              {notes.map((note) => (
                <li key={note.id}>{note.content}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div>No attachments available.</div>
          ) : (
            <ul className="list-disc pl-5">
              {attachments.map((att) => (
                <li key={att.id}>{att.file_name}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {/* Add similar cards for tests and diagnoses if needed */}
    </div>
  );
};

export default FolderView; 