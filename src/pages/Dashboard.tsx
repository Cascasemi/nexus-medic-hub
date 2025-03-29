
import { ActivitySquare, Users, UserCheck, FileText } from "lucide-react";
import { StatisticCard } from "@/components/dashboard/StatisticCard";
import { PatientEntryChart } from "@/components/dashboard/PatientEntryChart";
import { PatientDemographicsChart } from "@/components/dashboard/PatientDemographicsChart";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your patients today
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="bg-medical-100 text-medical-700 px-4 py-2 rounded-md inline-flex items-center">
            <ActivitySquare className="mr-2" size={18} />
            <span className="font-medium">Medical Dashboard</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Patients"
          value="1,284"
          description="92 new this month"
          icon={<Users size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatisticCard
          title="Active Cases" 
          value="432"
          description="18 admitted this week"
          icon={<UserCheck size={20} />}
          trend={{ value: 4, isPositive: true }}
        />
        <StatisticCard
          title="Critical Cases"
          value="28"
          description="3 less than last week"
          icon={<ActivitySquare size={20} />}
          trend={{ value: 8, isPositive: false }}
        />
        <StatisticCard
          title="Medical Records"
          value="4,320"
          description="128 updated today"
          icon={<FileText size={20} />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PatientEntryChart />
        <PatientDemographicsChart />
      </div>

      <RecentPatients />
    </div>
  );
};

export default Dashboard;
