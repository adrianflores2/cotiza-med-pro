
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProject } from "@/components/projects/NewProject";
import { ItemAssignment } from "@/components/items/ItemAssignment";
import { QuoterInbox } from "@/components/quoter/QuoterInbox";
import { QuotationComparison } from "@/components/quotations/QuotationComparison";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const AppContent = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard userRole={userRole || 'coordinador'} />;
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
        return <Dashboard userRole={userRole || 'coordinador'} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userRole={userRole || 'coordinador'}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          userRole={userRole || 'coordinador'} 
          currentView={currentView}
        />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
