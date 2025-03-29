
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const Responses = () => {
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

      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-full bg-medical-100 p-4">
            <MessageSquare className="h-12 w-12 text-medical-500" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Communications Center</h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            View and manage responses from patients, schedule follow-ups, and coordinate with other healthcare providers.
          </p>
          <Button className="mt-6 bg-medical-500 hover:bg-medical-600">Access Communications</Button>
        </div>
      </div>
    </div>
  );
};

export default Responses;
