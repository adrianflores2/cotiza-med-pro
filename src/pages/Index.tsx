import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProject } from "@/components/projects/NewProject";
import { ItemAssignment } from "@/components/items/ItemAssignment";
import { QuoterInbox } from "@/components/quoter/QuoterInbox";
import { QuotationComparison } from "@/components/quotations/QuotationComparison";
import { UserManagement } from "@/components/admin/UserManagement";
import { AssignmentRules } from "@/components/admin/AssignmentRules";
import { SupplierPanel } from "@/components/suppliers/SupplierPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MasterEquipmentPanel } from "@/components/equipment/MasterEquipmentPanel";

const AppContent = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();

  console.log('AppContent: Render state:', { 
    user: user?.email || 'No user', 
    userRole, 
    loading,
    currentView
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
          <p className="mt-2 text-sm text-gray-500">
            Verificando autenticación y cargando datos...
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Si esta pantalla persiste, intenta refrescar la página
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('AppContent: No user, showing login form');
    return <LoginForm />;
  }

  console.log('AppContent: User authenticated, showing main app');

  const renderCurrentView = () => {
    try {
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
        case "master-equipment":
          return <MasterEquipmentPanel userRole={userRole || 'coordinador'} />;
        case "supplier-management":
          return <SupplierPanel />;
        case "user-management":
          return <UserManagement />;
        case "assignment-rules":
          return <AssignmentRules />;
        default:
          return <Dashboard userRole={userRole || 'coordinador'} />;
      }
    } catch (error) {
      console.error('AppContent: Error rendering view:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar la vista. Intenta refrescar la página.",
        variant: "destructive",
      });
      return <Dashboard userRole={userRole || 'coordinador'} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          userRole={userRole || 'coordinador'}
        />
        <SidebarInset className="flex-1">
          <Header 
            userRole={userRole || 'coordinador'} 
            currentView={currentView}
          />
          <main className="flex-1 p-6">
            {renderCurrentView()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
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
