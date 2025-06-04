import { useState, useEffect } from "react";
import { ActivitySquare, Users, UserCheck, FileText } from "lucide-react";
import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { PatientEntryChart } from "@/components/dashboard/PatientEntryChart";
import { PatientDemographicsChart } from "@/components/dashboard/PatientDemographicsChart";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/axiosConfig";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    activeCases: 0,
    criticalCases: 0,
    medicalRecords: 0,
    patientEntries: [],
    demographics: [],
    recentPatients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? "System Overview" 
              : user?.role === 'doctor'
              ? "Your Patient Cases"
              : "Today's Activities"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="bg-medical-100 text-medical-700 px-4 py-2 rounded-md inline-flex items-center">
            <ActivitySquare className="mr-2" size={18} />
            <span className="font-medium">
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Medical Dashboard'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Patients"
          value={dashboardData.totalPatients.toLocaleString()}
          description={`${Math.floor(dashboardData.totalPatients/12)} new this month`}
          icon={<Users size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatisticCard
          title="Active Cases" 
          value={dashboardData.activeCases}
          description={`${Math.floor(dashboardData.activeCases/24)} admitted this week`}
          icon={<UserCheck size={20} />}
          trend={{ value: 4, isPositive: true }}
        />
        <StatisticCard
          title="Critical Cases"
          value={dashboardData.criticalCases}
          description="3 less than last week"
          icon={<ActivitySquare size={20} />}
          trend={{ value: 8, isPositive: dashboardData.criticalCases < 30 }}
        />
        <StatisticCard
          title="Medical Records"
          value={dashboardData.medicalRecords.toLocaleString()}
          description="128 updated today"
          icon={<FileText size={20} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatientEntryChart data={dashboardData.patientEntries} />
        <PatientDemographicsChart data={dashboardData.demographics} />
      </div>

      <RecentPatients patients={dashboardData.recentPatients} />
    </div>
  );
};

export default Dashboard;