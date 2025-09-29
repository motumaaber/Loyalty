import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PointsOverview from "@/components/customer/points-overview";
import TierProgress from "@/components/customer/tier-progress";
import RedemptionOptions from "@/components/customer/redemption-options";
import { ArrowLeft } from "lucide-react";

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== "customer") {
      setLocation("/admin");
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

  if (user.role !== "customer") {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen" data-testid="customer-dashboard">
      {/* Customer Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/admin")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-back-admin"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="customer-dashboard-title">
                  Customer Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Welcome to your loyalty portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={(value: "en" | "om" | "am") => setLanguage(value)}>
                <SelectTrigger className="w-[140px]" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="om">Afaan Oromo</SelectItem>
                  <SelectItem value="am">አማርኛ</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <span className="font-medium text-foreground" data-testid="customer-name">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Points Overview */}
        <PointsOverview customerId={user.id} />

        {/* Tier Progress */}
        <TierProgress customerId={user.id} />

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Redeem Points */}
          <RedemptionOptions customerId={user.id} />

          {/* Recent Activity - simplified version for customer view */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-sm">+</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Account transfer</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <span className="text-sm font-medium text-secondary">+250 pts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                  <span className="text-destructive text-sm">-</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Cashback redemption</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <span className="text-sm font-medium text-destructive">-1000 pts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-sm">+</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Bill payment</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <span className="text-sm font-medium text-secondary">+150 pts</span>
              </div>
            </div>
            <Button variant="link" className="w-full mt-4 text-primary" data-testid="button-view-all-transactions">
              View All Transactions
            </Button>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Tier Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <h4 className="font-medium text-foreground">1.5x Points</h4>
              <p className="text-sm text-muted-foreground">On all transactions</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl mb-2">🎁</div>
              <h4 className="font-medium text-foreground">Birthday Bonus</h4>
              <p className="text-sm text-muted-foreground">500 extra points</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl mb-2">📞</div>
              <h4 className="font-medium text-foreground">Priority Support</h4>
              <p className="text-sm text-muted-foreground">Dedicated hotline</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl mb-2">🏷️</div>
              <h4 className="font-medium text-foreground">Exclusive Offers</h4>
              <p className="text-sm text-muted-foreground">Special promotions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
