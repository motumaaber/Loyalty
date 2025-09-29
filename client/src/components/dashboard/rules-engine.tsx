import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { University, Smartphone, Handshake, Plus, Settings } from "lucide-react";

export default function RulesEngine() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ["/api/admin/rules"],
  });

  const updateRuleMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      apiRequest("PUT", `/api/admin/rules/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rules"] });
      toast({
        title: "Rule updated",
        description: "The rule has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive",
      });
    },
  });

  const rules = rulesData?.rules || [];

  const bankingRules = rules.filter(rule => rule.category === "banking");
  const mobileRules = rules.filter(rule => rule.category === "mobile_app");
  const partnerRules = rules.filter(rule => rule.category === "partner");

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    updateRuleMutation.mutate({
      id: ruleId,
      updates: { isActive },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-32 w-full" />
                  ))}
                </div>
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
            <h1 className="text-3xl font-bold text-foreground" data-testid="rules-title">Rules Engine</h1>
            <p className="text-muted-foreground mt-1">Configure earning rules for different banking services</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-rule">
                <Plus className="mr-2" size={16} />
                Add New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input id="ruleName" placeholder="Enter rule name" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banking">Banking Services</SelectItem>
                      <SelectItem value="mobile_app">Mobile App</SelectItem>
                      <SelectItem value="partner">Partner Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points">Points per Unit</Label>
                  <Input id="points" type="number" placeholder="Enter points" />
                </div>
                <Button className="w-full">Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Banking Services Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <University className="text-primary-foreground" size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Banking Services</CardTitle>
                <p className="text-sm text-muted-foreground">Core banking operations</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankingRules.map((rule) => (
                <div key={rule.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground" data-testid={`rule-name-${rule.id}`}>
                      {rule.name}
                    </h4>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      data-testid={`switch-rule-${rule.id}`}
                    />
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points per ETB {rule.unitValue}:</span>
                      <span className="text-foreground font-medium" data-testid={`rule-points-${rule.id}`}>
                        {rule.pointsPerUnit} points
                      </span>
                    </div>
                    {rule.minimumAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Amount:</span>
                        <span className="text-foreground font-medium">ETB {rule.minimumAmount}</span>
                      </div>
                    )}
                    {rule.maximumPoints && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Limit:</span>
                        <span className="text-foreground font-medium">{rule.maximumPoints} points</span>
                      </div>
                    )}
                  </div>
                  <Button variant="link" className="mt-3 p-0 h-auto text-primary" data-testid={`button-edit-${rule.id}`}>
                    Edit Rule
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Smartphone className="text-secondary-foreground" size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Mobile App Usage</CardTitle>
                <p className="text-sm text-muted-foreground">App engagement rewards</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mobileRules.map((rule) => (
                <div key={rule.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points per {rule.unit}:</span>
                      <span className="text-foreground font-medium">{rule.pointsPerUnit} points</span>
                    </div>
                    {rule.conditions?.streak_bonus && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Streak bonus (7 days):</span>
                        <span className="text-foreground font-medium">+{rule.conditions.streak_bonus} points</span>
                      </div>
                    )}
                  </div>
                  <Button variant="link" className="mt-3 p-0 h-auto text-primary">
                    Edit Rule
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partner Services Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Handshake className="text-accent-foreground" size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Partner Services</CardTitle>
                <p className="text-sm text-muted-foreground">Third-party integrations</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partnerRules.map((rule) => (
                <div key={rule.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                    />
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points per ETB {rule.unitValue}:</span>
                      <span className="text-foreground font-medium">{rule.pointsPerUnit} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground font-medium">
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <Button variant="link" className="mt-3 p-0 h-auto text-primary">
                    {rule.isActive ? "Edit Rule" : "Configure"}
                  </Button>
                </div>
              ))}
              
              {partnerRules.length === 0 && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">E-commerce Purchases</h4>
                    <Switch checked={false} />
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points per ETB 100:</span>
                      <span className="text-foreground font-medium">3 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>
                  <Button variant="link" className="mt-3 p-0 h-auto text-primary">
                    Configure
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
