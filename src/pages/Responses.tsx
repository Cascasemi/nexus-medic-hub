
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Plus, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const Responses = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReportId, setOpenReportId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/reports`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Responses & Communications</h1>
          <p className="text-muted-foreground">
            Manage communications and patient responses
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search communications..."
              className="w-full md:w-[240px] pl-8"
            />
          </div>
          <Button className="bg-medical-500 hover:bg-medical-600">
            <Plus className="mr-1 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Reports</h2>
        {loading ? (
          <div>Loading reports...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : reports.length === 0 ? (
          <div>No reports found.</div>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.report_id} className="border rounded p-4 relative">
                <div className="font-semibold">{report.report_summary?.slice(0, 60) || 'No summary'}...</div>
                <div className="text-xs text-muted-foreground mb-1">Status: {report.status || 'Not Responded'} | Confidential: {report.isconfidential ? 'Yes' : 'No'} | By: {report.created_by || 'N/A'}</div>
                <div className="text-sm text-muted-foreground mb-2">{report.created_at ? new Date(report.created_at).toLocaleString() : ''}</div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                  onClick={() => setOpenReportId(report.report_id)}
                >
                  <Eye className="h-4 w-4 mr-1 inline" /> View Report
                </Button>
                {/* Report Popup */}
                {openReportId === report.report_id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setOpenReportId(null)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <h3 className="text-lg font-bold mb-2">Report Details</h3>
                      <div className="text-sm text-muted-foreground mb-2">{report.created_at ? new Date(report.created_at).toLocaleString() : ''}</div>
                      <div className="mb-2"><b>Status:</b> {report.status || 'Not Responded'}</div>
                      <div className="mb-2"><b>Confidential:</b> {report.isconfidential ? 'Yes' : 'No'}</div>
                      <div className="mb-2"><b>Created By:</b> {report.created_by || 'N/A'}</div>
                      <div className="mb-2"><b>Patient ID:</b> {report.patient_id || 'N/A'}</div>
                      <div className="mb-2"><b>Summary:</b></div>
                      <div className="whitespace-pre-wrap text-base">{report.report_summary || 'No summary.'}</div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Responses;
