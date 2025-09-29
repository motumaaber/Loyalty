import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Overview from "@/components/dashboard/overview";
import RulesEngine from "@/components/dashboard/rules-engine";
import CampaignManagement from "@/components/dashboard/campaign-management";
import TierManagement from "@/components/dashboard/tier-management";
import CustomerManagement from "@/components/dashboard/customer-management";
import Analytics from "@/components/dashboard/analytics";
import ApiManagement from "@/components/dashboard/api-management";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // Extract section from URL
  const section = location.split("/")[2] || "overview";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === "customer") {
      setLocation("/customer");
    }
  }, [user, loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.role === "customer") {
    return null;
  }

  const renderSection = () => {
    switch (section) {
      case "rules":
        return <RulesEngine />;
      case "campaigns":
        return <CampaignManagement />;
      case "tiers":
        return <TierManagement />;
      case "users":
        return <CustomerManagement />;
      case "analytics":
        return <Analytics />;
      case "api":
        return <ApiManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-background" data-testid="admin-dashboard">
      <Sidebar activeSection={section} />
      <div className="flex-1 overflow-auto">
        {renderSection()}
      </div>
    </div>
  );
}
