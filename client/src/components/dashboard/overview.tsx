import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/language-context";
import { Users, Star, Gift, Megaphone, ArrowUp, Download } from "lucide-react";

export default function Overview() {
  const { t } = useLanguage();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const branchMetrics = dashboardData?.branchMetrics || [];
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="dashboard-title">
              {t("dashboard.overview")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("dashboard.monitor")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="30days">
              <SelectTrigger className="w-[180px]" data-testid="select-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-export">
              <Download className="mr-2" size={16} />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("metrics.customers")}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid="metric-customers">
                  {metrics.totalCustomers?.toLocaleString() || 0}
                </p>
                <p className="text-secondary text-sm mt-1">
                  <ArrowUp className="inline mr-1" size={12} />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("metrics.issued")}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid="metric-issued">
                  {metrics.totalPointsIssued?.toLocaleString() || 0}
                </p>
                <p className="text-secondary text-sm mt-1">
                  <ArrowUp className="inline mr-1" size={12} />
                  +8.3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Star className="text-secondary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("metrics.redeemed")}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid="metric-redeemed">
                  {metrics.totalPointsRedeemed?.toLocaleString() || 0}
                </p>
                <p className="text-accent text-sm mt-1">
                  <ArrowUp className="inline mr-1" size={12} />
                  +15.7% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Gift className="text-accent text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("metrics.campaigns")}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid="metric-campaigns">
                  {metrics.activeCampaigns || 0}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  3 ending this week
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <Megaphone className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Points Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Points Activity</CardTitle>
              <Select defaultValue="7days">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-muted-foreground mb-4">📊</div>
                <p className="text-muted-foreground">Points Issued vs Redeemed Chart</p>
                <p className="text-sm text-muted-foreground mt-2">Chart visualization would be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Performing Branches</CardTitle>
              <Button variant="link" className="text-primary" data-testid="button-view-branches">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchMetrics.slice(0, 3).map((branch, index) => (
                <div key={branch.branchId} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-accent'
                    }`}>
                      <span className={`font-bold ${
                        index === 0 ? 'text-primary-foreground' : 
                        index === 1 ? 'text-secondary-foreground' : 'text-accent-foreground'
                      }`}>
                        {branch.branchName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`branch-name-${index}`}>
                        {branch.branchName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {branch.customers} customers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground" data-testid={`branch-points-${index}`}>
                      {(branch.points / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-secondary">+{(Math.random() * 20 + 5).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="link" className="text-primary" data-testid="button-view-activity">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Points</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity, index) => (
                  <tr key={activity.id} className="border-b border-border/50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-bold">
                            {index % 2 === 0 ? 'JD' : 'SA'}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          Customer {activity.customerId.slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-foreground" data-testid={`activity-action-${index}`}>
                      {activity.description}
                    </td>
                    <td className={`py-4 font-medium ${
                      activity.type === 'earn' ? 'text-secondary' : 'text-destructive'
                    }`}>
                      {activity.type === 'earn' ? '+' : '-'}{activity.points}
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
