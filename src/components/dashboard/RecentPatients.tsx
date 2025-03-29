
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Status = "stable" | "critical" | "improving" | "observation";

interface Patient {
  id: string;
  name: string;
  age: number;
  admissionDate: Date;
  status: Status;
  diagnosis: string;
}

const patients: Patient[] = [
  {
    id: "P-3821",
    name: "Michael Chen",
    age: 42,
    admissionDate: new Date(2023, 6, 12),
    status: "stable",
    diagnosis: "Hypertension"
  },
  {
    id: "P-4532",
    name: "Sarah Johnson",
    age: 35,
    admissionDate: new Date(2023, 6, 13),
    status: "improving",
    diagnosis: "Post-surgery recovery"
  },
  {
    id: "P-2198",
    name: "Robert Garcia",
    age: 68,
    admissionDate: new Date(2023, 6, 14),
    status: "critical",
    diagnosis: "Pneumonia"
  },
  {
    id: "P-5670",
    name: "Emily Wilson",
    age: 29,
    admissionDate: new Date(2023, 6, 15),
    status: "observation",
    diagnosis: "Migraine"
  },
  {
    id: "P-1087",
    name: "David Thompson",
    age: 54,
    admissionDate: new Date(2023, 6, 16),
    status: "stable",
    diagnosis: "Diabetes follow-up"
  }
];

const getStatusColor = (status: Status) => {
  switch (status) {
    case "stable":
      return "bg-green-100 text-green-800";
    case "critical":
      return "bg-red-100 text-red-800";
    case "improving":
      return "bg-blue-100 text-blue-800";
    case "observation":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RecentPatients = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Admission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Diagnosis</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-muted patient-row">
                  <td className="px-4 py-3 text-sm font-medium">{patient.id}</td>
                  <td className="px-4 py-3 text-sm">{patient.name}</td>
                  <td className="px-4 py-3 text-sm">{patient.age}</td>
                  <td className="px-4 py-3 text-sm">
                    {format(patient.admissionDate, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="outline" className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{patient.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
