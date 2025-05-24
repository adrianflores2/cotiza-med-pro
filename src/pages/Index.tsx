
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProject } from "@/components/projects/NewProject";
import { ItemAssignment } from "@/components/items/ItemAssignment";
import { QuoterInbox } from "@/components/quoter/QuoterInbox";
import { QuotationComparison } from "@/components/quotations/QuotationComparison";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [userRole, setUserRole] = useState("coordinador"); // coordinador, cotizador, comercial, admin
  const { toast } = useToast();

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard userRole={userRole} />;
      case "projects":
        return <ProjectList onNewProject={() => setCurrentView("new-project")} />;
      case "new-project":
        return <NewProject onBack={() => setCurrentView("projects")} />;
      case "item-assignment":
        return <ItemAssignment />;
      case "quoter-inbox":
        return <QuoterInbox />;
      case "quotation-comparison":
        return <QuotationComparison />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          userRole={userRole} 
          onRoleChange={setUserRole}
          currentView={currentView}
        />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
