import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download, Calendar } from "lucide-react";

export default function Analytics() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
  });

  const metrics = dashboardData?.metrics || {};

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
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="analytics-title">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Detailed insights into your loyalty program performance
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
            <Button data-testid="button-export-analytics">
              <Download className="mr-2" size={16} />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="customer" data-testid="tab-customer">Customer Analytics</TabsTrigger>
          <TabsTrigger value="points" data-testid="tab-points">Points Analysis</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaign Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Program Growth</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-growth">
                      +24.5%
                    </p>
                    <p className="text-secondary text-sm mt-1">
                      <TrendingUp className="inline mr-1" size={12} />
                      vs last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Engagement Rate</p>
                    <p className="text-2xl font-bold text-foreground">87.2%</p>
                    <p className="text-accent text-sm mt-1">
                      <TrendingUp className="inline mr-1" size={12} />
                      +3.1% this week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Redemption Rate</p>
                    <p className="text-2xl font-bold text-foreground">73.8%</p>
                    <p className="text-destructive text-sm mt-1">
                      <TrendingDown className="inline mr-1" size={12} />
                      -1.2% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <PieChart className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Avg Lifetime Value</p>
                    <p className="text-2xl font-bold text-foreground">ETB 2,450</p>
                    <p className="text-secondary text-sm mt-1">
                      <TrendingUp className="inline mr-1" size={12} />
                      +8.7% vs last quarter
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl font-bold">₿</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Points Activity Trend</span>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2" size={14} />
                    Last 30 Days
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Points Earned vs Redeemed</p>
                    <p className="text-sm text-muted-foreground">Interactive chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Tier Breakdown</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Silver: 45%</span>
                        <span>Gold: 35%</span>
                      </div>
                      <div className="flex justify-center">
                        <span>Platinum: 20%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">New Customer Registrations</p>
                    <p className="text-2xl font-bold text-foreground mt-2">+342 this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-muted-foreground">Retention Analysis</p>
                    <p className="text-2xl font-bold text-foreground mt-2">91.2% retention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Issuance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Banking Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mobile App Usage</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Partner Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redemption Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cashback</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vouchers</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Airtime</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-muted-foreground">Campaign ROI Analysis</p>
                    <p className="text-2xl font-bold text-foreground mt-2">285% avg ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium">Summer Savings Boost</span>
                    <span className="text-sm text-secondary font-bold">+340% ROI</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium">New Year Welcome</span>
                    <span className="text-sm text-accent font-bold">+275% ROI</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium">Referral Bonus</span>
                    <span className="text-sm text-primary font-bold">+245% ROI</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
