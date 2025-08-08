import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash2, Eye, X, Calendar, User, FileText, Plus, FileCheck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";

// API URL - Environment variable takes precedence
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// If for some reason the environment variable is not available, this will not be used
// as it's already set in the .env file to https://nexus-medi-backend.onrender.com/api/v1

const Test = () => {
  const auth = useAuth();
  const { user, token } = auth;
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    test_type: '',
    test_name: '',
    ordered_date: '',
    ordered_by: user?.id || '',
    test_description: '',
    test_status: 'ordered', // Use lowercase to match database enum
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resultTestId, setResultTestId] = useState(null);
  const [viewResultsId, setViewResultsId] = useState(null);
  const [resultForm, setResultForm] = useState({
    result_value: '',
    result_unit: '',
    reference_range: '',
    result_status: '',
    result_notes: '',
    uploaded_by: user?.id || ''
  });
  const [loadingResult, setLoadingResult] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [loadingTestResults, setLoadingTestResults] = useState({});
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    console.log("User:", user, "Token:", token ? "Present" : "Missing");
    
    // Check if user has appropriate role
    if (!user || (user.role !== 'Lab Technician' && user.role !== 'admin')) {
      console.log("User does not have appropriate role, redirecting");
      toast({ 
        title: 'Access Denied', 
        description: 'You do not have permission to access this page',
        variant: 'destructive'
      });
      navigate('/dashboard');
      return;
    }
    
    // Check if token is available
    if (!token) {
      console.log("No authentication token, redirecting");
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }
    
    // Initialize form with user ID if available
    setForm(prev => ({
      ...prev,
      ordered_by: user?.id || ''
    }));
    
    // Fetch data
    console.log("Starting data fetch operations...");
    fetchPatients();
    
    // Add a small delay before fetching tests to ensure auth is properly initialized
    const testFetchTimer = setTimeout(() => {
      console.log("Now fetching tests...");
      fetchTests();
    }, 500);
    
    return () => {
      clearTimeout(testFetchTimer);
    };
    
    // eslint-disable-next-line
  }, [user, token]);

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients with token:', token?.substring(0, 10) + '...');
      const res = await fetch(`${API_BASE_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication error fetching patients');
          return;
        }
        const errorText = await res.text();
        console.error(`HTTP error! status: ${res.status}`, errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Patients data received:', data);
      if (data.success) setPatients(data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      console.log('Fetching tests with token:', token?.substring(0, 10) + '...');
      console.log('Using API URL:', API_BASE_URL);
      
      // Check if token is available
      if (!token) {
        console.error('No authentication token available for fetchTests');
        toast({ 
          title: 'Authentication Error', 
          description: 'No authentication token available. Please log in again.',
          variant: 'destructive' 
        });
        setLoadingTests(false);
        return;
      }
      
      // Add a timeout to ensure the API call doesn't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Extended to 20 second timeout
      
      console.log('Starting fetch request to:', `${API_BASE_URL}/tests`);
      
      const res = await fetch(`${API_BASE_URL}/tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
        
      clearTimeout(timeoutId);
      console.log('Fetch complete, status:', res.status, 'OK:', res.ok);
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication error fetching tests');
          toast({ 
            title: 'Authentication Error', 
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive' 
          });
          setLoadingTests(false);
          return;
        }
        const errorText = await res.text();
        console.error(`HTTP error! status: ${res.status}`, errorText);
        toast({ 
          title: 'Error Loading Tests', 
          description: `Server returned status: ${res.status}`,
          variant: 'destructive' 
        });
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Tests data received:', data);
      
      if (data.success) {
        console.log('Setting tests array with length:', data.data.length);
        setTests(data.data);
        
        // Fetch results for all tests to have them available
        data.data.forEach(test => {
          fetchTestResults(test.test_id);
        });
      }
      else {
        console.error('Failed to fetch tests:', data.error);
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to load tests data',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Show more specific error information
      let errorMessage = 'Could not connect to the server. Please check your internet connection or try again later.';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: 'Connection Error', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setLoadingTests(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.test_type || !form.test_name || !form.ordered_date) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    if (!token) {
      toast({ title: 'Authentication Error', description: 'You are not logged in', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing && editingId) {
        // Update existing test
        console.log('Updating test with ID:', editingId, 'Data:', form);
        const res = await fetch(`${API_BASE_URL}/tests/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(form),
        });
        
        if (!res.ok) {
          handleApiError(res);
          return;
        }
        
        const data = await res.json();
        console.log('Update response from server:', data);
        if (data.success) {
          toast({ title: 'Test updated', description: 'Test updated successfully' });
          resetForm();
          fetchTests();
        } else {
          toast({ title: 'Error', description: data.error || 'Failed to update test', variant: 'destructive' });
        }
      } else {
        // Create new test
        console.log('Submitting form data:', form);
        const res = await fetch(`${API_BASE_URL}/tests`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(form),
        });
        
        if (!res.ok) {
          handleApiError(res);
          return;
        }
        
        const data = await res.json();
        console.log('Response from server:', data);
        if (data.success) {
          toast({ title: 'Test created', description: 'Test added successfully' });
          resetForm();
          fetchTests();
        } else {
          toast({ title: 'Error', description: data.error || 'Failed to create test', variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Error saving test:', error);
      toast({ title: 'Error', description: 'Failed to save test: ' + error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApiError = async (res) => {
    if (res.status === 401) {
      toast({ 
        title: 'Authentication Error', 
        description: 'Your session has expired. Please log in again.', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Handle other error status codes
    const errorText = await res.text();
    console.error('Error response:', res.status, errorText);
    try {
      const errorData = JSON.parse(errorText);
      toast({ 
        title: 'Error', 
        description: errorData.error || 'Operation failed', 
        variant: 'destructive' 
      });
    } catch (e) {
      toast({ 
        title: 'Error', 
        description: `Server error (${res.status})`, 
        variant: 'destructive' 
      });
    }
  };
  
  const fetchTestResults = async (testId) => {
    // If we're already loading results for this test, don't start another request
    if (loadingTestResults[testId]) return;
    
    // If we already have results for this test, no need to fetch again
    if (testResults[testId]) return testResults[testId];
    
    setLoadingTestResults(prev => ({ ...prev, [testId]: true }));
    
    try {
      console.log(`Fetching results for test ${testId} from ${API_BASE_URL}/tests/${testId}/results`);
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Error fetching test results:', res.status, res.statusText);
        if (res.status === 404) {
          toast({ 
            title: 'API Error', 
            description: 'Test results endpoint not found. The backend may need to be updated.',
            variant: 'destructive' 
          });
        } else {
          handleApiError(res);
        }
        setTestResults(prev => ({ ...prev, [testId]: [] }));
        return [];
      }
      
      const data = await res.json();
      console.log('Test results received:', data);
      
      if (data.success) {
        const results = data.data || [];
        setTestResults(prev => ({ ...prev, [testId]: results }));
        return results;
      } else {
        setTestResults(prev => ({ ...prev, [testId]: [] }));
        return [];
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to fetch test results: ${error.message}`,
        variant: 'destructive' 
      });
      setTestResults(prev => ({ ...prev, [testId]: [] }));
      return [];
    } finally {
      setLoadingTestResults(prev => ({ ...prev, [testId]: false }));
    }
  };
  
  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        handleApiError(res);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Test deleted', description: 'Test deleted successfully' });
        fetchTests();
      } else {
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to delete test', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete test: ' + error.message, 
        variant: 'destructive' 
      });
    }
  };
  
  const handleEdit = (test) => {
    setForm({
      patient_id: test.patient_id || '',
      test_type: test.test_type || '',
      test_name: test.test_name || '',
      ordered_date: test.ordered_date ? test.ordered_date.split('T')[0] : '',
      ordered_by: test.ordered_by || user?.id || '',
      test_description: test.test_description || '',
      test_status: test.test_status || 'ordered',
    });
    setEditingId(test.test_id);
    setIsEditing(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const resetForm = () => {
    setForm({
      patient_id: '',
      test_type: '',
      test_name: '',
      ordered_date: '',
      ordered_by: user?.id || '',
      test_description: '',
      test_status: 'ordered'
    });
    setEditingId(null);
    setIsEditing(false);
  };
  
  const resetResultForm = () => {
    setResultForm({
      result_value: '',
      result_unit: '',
      reference_range: '',
      result_status: '',
      result_notes: '',
      uploaded_by: user?.id || ''
    });
    setResultTestId(null);
  };
  
  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setResultForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResultSelect = (name, value) => {
    setResultForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddResult = (testId) => {
    // Check if results already exist for this test
    if (testResults[testId] && testResults[testId].length > 0) {
      toast({
        title: "Results Exist",
        description: "This test already has results and cannot be modified.",
        variant: "default"
      });
      return;
    }
    
    // Fetch results first to make sure we have the latest data
    if (!testResults[testId]) {
      fetchTestResults(testId).then(() => {
        // If results were found during fetch, prevent opening the dialog
        if (testResults[testId] && testResults[testId].length > 0) {
          toast({
            title: "Results Exist",
            description: "This test already has results and cannot be modified.",
            variant: "default"
          });
          return;
        }
        
        // Otherwise, continue to open the dialog
        setResultTestId(testId);
        setResultForm(prev => ({
          ...prev,
          uploaded_by: user?.id || ''
        }));
      });
    } else {
      // We already have the results data, proceed
      setResultTestId(testId);
      setResultForm(prev => ({
        ...prev,
        uploaded_by: user?.id || ''
      }));
    }
  };
  
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    
    if (!resultForm.result_value) {
      toast({ 
        title: 'Missing fields', 
        description: 'Result value is required', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!token) {
      toast({ 
        title: 'Authentication Error', 
        description: 'You are not logged in', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoadingResult(true);
    
    try {
      console.log(`Submitting result for test ${resultTestId} to ${API_BASE_URL}/tests/${resultTestId}/results`);
      console.log('Result data:', resultForm);
      
      const res = await fetch(`${API_BASE_URL}/tests/${resultTestId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultForm)
      });
      
      if (!res.ok) {
        console.error('Error adding test result:', res.status, res.statusText);
        if (res.status === 404) {
          toast({ 
            title: 'API Error', 
            description: 'Test results endpoint not found. The backend may need to be updated.',
            variant: 'destructive' 
          });
        } else {
          handleApiError(res);
        }
        return;
      }
      
      const data = await res.json();
      console.log('Response from server:', data);
      
      if (data.success) {
        toast({ 
          title: 'Result added', 
          description: 'Test result added successfully' 
        });
        resetResultForm();
        fetchTests();
        
        // Clear cached test results to force a refresh
        if (testResults[resultTestId]) {
          setTestResults(prev => {
            const newResults = { ...prev };
            delete newResults[resultTestId];
            return newResults;
          });
        }
      } else {
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to add test result', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error adding test result:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to add test result: ' + error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoadingResult(false);
    }
  };
  
  const updateTestStatus = async (testId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test_status: status })
      });
      
      if (!res.ok) {
        console.error('Failed to update test status');
        return false;
      }
      
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('Error updating test status:', error);
      return false;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || (user.role !== 'Lab Technician' && user.role !== 'admin')) {
    return <div className="p-6 text-center">Access denied.</div>;
  }
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'ordered': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  // Helper function to render test details
  const renderTestDetails = (test) => {
    if (!test) return null;
    
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Test ID</p>
            <p>{test.test_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Patient ID</p>
            <p>{test.patient_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Test Name</p>
          <p className="font-semibold">{test.test_name}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Test Type</p>
          <p>{test.test_type}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className={`font-medium ${getStatusColor(test.test_status)}`}>{test.test_status}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Ordered Date</p>
            <p>{formatDate(test.ordered_date)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ordered By</p>
            <p>{test.ordered_by || 'N/A'}</p>
          </div>
        </div>
        
        {test.completed_date && (
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Date</p>
            <p>{formatDate(test.completed_date)}</p>
          </div>
        )}
        
        {test.test_description && (
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="whitespace-pre-wrap">{test.test_description}</p>
          </div>
        )}
        
        {test.report_url && (
          <div>
            <p className="text-sm font-medium text-gray-500">Report URL</p>
            <a 
              href={test.report_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Report
            </a>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p>{formatDate(test.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Updated</p>
            <p>{formatDate(test.updated_at)}</p>
          </div>
        </div>
        
        {/* Test Results Section */}
        <div className="mt-4 pt-4 border-t">
          <p className="font-medium text-lg mb-2">Test Results</p>
          
          {loadingTestResults[test.test_id] ? (
            <p className="text-sm text-gray-500">Loading test results...</p>
          ) : testResults[test.test_id] && testResults[test.test_id].length > 0 ? (
            <div className="space-y-3">
              {testResults[test.test_id].map((result, index) => (
                <Card key={result.result_id || index} className="p-3">
                  <div className="font-medium">{result.result_value} {result.result_unit}</div>
                  
                  {result.result_status && (
                    <div className="text-sm">
                      Status: <span className={getResultStatusColor(result.result_status)}>{result.result_status}</span>
                    </div>
                  )}
                  
                  {result.reference_range && (
                    <div className="text-sm">Reference Range: {result.reference_range}</div>
                  )}
                  
                  <div className="text-sm">Date: {formatDate(result.result_date)}</div>
                  
                  {result.uploaded_by && (
                    <div className="text-sm">Uploaded By: {result.uploaded_by}</div>
                  )}
                  
                  {result.result_notes && (
                    <div className="text-sm mt-2 whitespace-pre-wrap">
                      Notes: {result.result_notes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No results available for this test.</p>
          )}
          
          {/* Only show Add Result button if there are no results yet */}
          {(!testResults[test.test_id] || testResults[test.test_id].length === 0) && (
            <Button 
              onClick={() => handleAddResult(test.test_id)}
              className="mt-3 bg-medical-500 hover:bg-medical-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Result
            </Button>
          )}
        </div>
      </>
    );
  };
  
  // Helper function to get result status color
  const getResultStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'normal': return 'text-green-600';
      case 'abnormal': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      case 'inconclusive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };
  
  // Helper function to render test results
  const renderTestResults = (testId) => {
    if (!testId || !testResults[testId]) return null;
    
    const test = tests.find(t => t.test_id === testId);
    if (!test) return null;
    
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{test.test_name}</h3>
          <p className="text-sm text-muted-foreground">Type: {test.test_type}</p>
          <p className="text-sm text-muted-foreground">
            Status: <span className={`font-medium ${getStatusColor(test.test_status)}`}>{test.test_status}</span>
          </p>
        </div>
        
        {loadingTestResults[testId] ? (
          <p className="text-center py-4">Loading results...</p>
        ) : testResults[testId].length > 0 ? (
          <div className="space-y-4">
            {testResults[testId].map((result, index) => (
              <Card key={result.result_id || index} className="p-4">
                <div className="font-semibold text-lg">
                  {result.result_value} {result.result_unit}
                </div>
                
                {result.result_status && (
                  <div className="mt-1">
                    Status: <span className={getResultStatusColor(result.result_status)}>{result.result_status}</span>
                  </div>
                )}
                
                {result.reference_range && (
                  <div className="mt-1">Reference Range: {result.reference_range}</div>
                )}
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p>{formatDate(result.result_date)}</p>
                  </div>
                  
                  {result.uploaded_by && (
                    <div>
                      <p className="text-gray-500">Uploaded By</p>
                      <p>{result.uploaded_by}</p>
                    </div>
                  )}
                </div>
                
                {result.result_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-gray-500 mb-1">Notes</p>
                    <p className="whitespace-pre-wrap">{result.result_notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center py-4">No results available for this test.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Patient Test' : 'Add New Patient Test'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Patient</Label>
              <Select value={form.patient_id} onValueChange={v => handleSelect('patient_id', v)} disabled={isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name} ({p.patient_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Test Type</Label>
              <Input name="test_type" value={form.test_type} onChange={handleChange} required />
            </div>
            <div>
              <Label>Test Name</Label>
              <Input name="test_name" value={form.test_name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Ordered Date</Label>
              <Input name="ordered_date" type="date" value={form.ordered_date} onChange={handleChange} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="test_description" value={form.test_description} onChange={handleChange} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.test_status} onValueChange={v => handleSelect('test_status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="bg-medical-500 hover:bg-medical-600" disabled={loading}>
                {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Test' : 'Add Test')}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Existing Tests</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("Manual refresh triggered");
                fetchTests();
              }}
              disabled={loadingTests}
            >
              {loadingTests ? 'Refreshing...' : 'Refresh Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTests ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-500 mx-auto mb-4"></div>
              <p>Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-6">
              <p>No tests found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adding a new test using the form above, or check your connection to the server.
              </p>
              <div className="mt-4 text-xs text-left p-4 bg-gray-100 rounded overflow-auto max-h-32">
                <p className="font-semibold">Debug information:</p>
                <p>API URL: {API_BASE_URL}</p>
                <p>Authentication: {token ? "Token present" : "No token"}</p>
                <p>User role: {user?.role || "Unknown"}</p>
                <p>Last fetch: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((t) => (
                <Card key={t.test_id} className="p-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{t.test_name}</h3>
                      <div className="text-sm text-muted-foreground">Type: {t.test_type}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: <span className={`font-medium ${getStatusColor(t.test_status)}`}>{t.test_status}</span>
                      </div>
                      <div className="text-xs mt-1">Ordered: {formatDate(t.ordered_date)}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setDetailsId(t.test_id);
                          fetchTestResults(t.test_id);
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(t)}
                        title="Edit test"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700" 
                        onClick={() => handleDelete(t.test_id)}
                        title="Delete test"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {(testResults[t.test_id] && testResults[t.test_id].length > 0) ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-500 hover:text-blue-700" 
                          onClick={() => {
                            setViewResultsId(t.test_id);
                            fetchTestResults(t.test_id);
                          }}
                          title="View results"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-500 hover:text-green-700" 
                          onClick={() => handleAddResult(t.test_id)}
                          title="Add test result"
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Test Details Dialog */}
      <Dialog open={!!detailsId} onOpenChange={(open) => !open && setDetailsId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
            <DialogDescription>
              Detailed information about the test
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {detailsId && tests.find(t => t.test_id === detailsId) && (
              <div className="space-y-3">
                {renderTestDetails(tests.find(t => t.test_id === detailsId))}
              </div>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      {/* Test Result Form Dialog */}
      <Dialog open={!!resultTestId} onOpenChange={(open) => !open && resetResultForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test Result</DialogTitle>
            <DialogDescription>
              Enter the result details for this test
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitResult}>
            <div className="space-y-4 py-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="result_value">Result Value*</Label>
                <Input
                  id="result_value"
                  name="result_value"
                  value={resultForm.result_value}
                  onChange={handleResultChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Required field</p>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="result_unit">Result Unit</Label>
                <Input
                  id="result_unit"
                  name="result_unit"
                  value={resultForm.result_unit}
                  onChange={handleResultChange}
                  placeholder="e.g., mg/dL, mmol/L"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="reference_range">Reference Range</Label>
                <Input
                  id="reference_range"
                  name="reference_range"
                  value={resultForm.reference_range}
                  onChange={handleResultChange}
                  placeholder="e.g., 70-99 mg/dL"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="result_status">Result Status</Label>
                <Select
                  value={resultForm.result_status}
                  onValueChange={(value) => handleResultSelect('result_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="result_notes">Notes</Label>
                <Textarea
                  id="result_notes"
                  name="result_notes"
                  value={resultForm.result_notes}
                  onChange={handleResultChange}
                  placeholder="Additional notes or observations"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={resetResultForm}
                disabled={loadingResult}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-medical-500 hover:bg-medical-600"
                disabled={loadingResult}
              >
                {loadingResult ? 'Saving...' : 'Save Result'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Test Results View Dialog */}
      <Dialog open={!!viewResultsId} onOpenChange={(open) => !open && setViewResultsId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
            <DialogDescription>
              View detailed test results
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {renderTestResults(viewResultsId)}
          </div>
          
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Test; 