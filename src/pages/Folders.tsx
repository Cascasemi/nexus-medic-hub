
import { Button } from "@/components/ui/button";
import { FolderOpen, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const Folders = () => {
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
            />
          </div>
          <Button className="bg-medical-500 hover:bg-medical-600">
            <Plus className="mr-1 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="rounded-full bg-medical-100 p-4">
            <FolderOpen className="h-12 w-12 text-medical-500" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Patient Document Management</h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Organize and access patient records, test results, medical history, and treatment plans.
          </p>
          <Button className="mt-6 bg-medical-500 hover:bg-medical-600">Browse Patient Folders</Button>
        </div>
      </div>
    </div>
  );
};

export default Folders;
