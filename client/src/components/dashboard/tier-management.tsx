import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trophy, Edit, Users } from "lucide-react";

interface TierFormData {
  name: string;
  minimumPoints: number;
  multiplier: number;
  benefits: string[];
  color: string;
}

export default function TierManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    minimumPoints: 0,
    multiplier: 1.0,
    benefits: [],
    color: "#C0C0C0",
  });

  const { data: tiersData, isLoading } = useQuery({
    queryKey: ["/api/admin/tiers"],
  });

  const createTierMutation = useMutation({
    mutationFn: (data: TierFormData) =>
      apiRequest("POST", "/api/admin/tiers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tiers"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Tier created",
        description: "The tier has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tier",
        variant: "destructive",
      });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<TierFormData> }) =>
      apiRequest("PUT", `/api/admin/tiers/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tiers"] });
      setIsDialogOpen(false);
      setEditingTier(null);
      resetForm();
      toast({
        title: "Tier updated",
        description: "The tier has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tier",
        variant: "destructive",
      });
    },
  });

  const tiers = tiersData?.tiers || [];

  const resetForm = () => {
    setFormData({
      name: "",
      minimumPoints: 0,
      multiplier: 1.0,
      benefits: [],
      color: "#C0C0C0",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTier) {
      updateTierMutation.mutate({
        id: editingTier.id,
        updates: formData,
      });
    } else {
      createTierMutation.mutate(formData);
    }
  };

  const handleEdit = (tier: any) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      minimumPoints: tier.minimumPoints,
      multiplier: parseFloat(tier.multiplier),
      benefits: tier.benefits,
      color: tier.color,
    });
    setIsDialogOpen(true);
  };

  const handleBenefitsChange = (benefitsText: string) => {
    const benefits = benefitsText.split('\n').filter(b => b.trim() !== '');
    setFormData(prev => ({ ...prev, benefits }));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
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
            <h1 className="text-3xl font-bold text-foreground" data-testid="tiers-title">
              Tier Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure customer tiers and their benefits
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingTier(null); resetForm(); }} data-testid="button-add-tier">
                <Plus className="mr-2" size={16} />
                Add New Tier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTier ? "Edit Tier" : "Create New Tier"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tierName">Tier Name</Label>
                  <Input
                    id="tierName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Gold"
                    required
                    data-testid="input-tier-name"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumPoints">Minimum Points</Label>
                  <Input
                    id="minimumPoints"
                    type="number"
                    value={formData.minimumPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumPoints: parseInt(e.target.value) }))}
                    placeholder="e.g., 5000"
                    required
                    data-testid="input-minimum-points"
                  />
                </div>
                <div>
                  <Label htmlFor="multiplier">Points Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    value={formData.multiplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, multiplier: parseFloat(e.target.value) }))}
                    placeholder="e.g., 1.5"
                    required
                    data-testid="input-multiplier"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Tier Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    data-testid="input-color"
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits.join('\n')}
                    onChange={(e) => handleBenefitsChange(e.target.value)}
                    placeholder="Priority support&#10;1.5x points&#10;Birthday bonus"
                    rows={4}
                    data-testid="textarea-benefits"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createTierMutation.isPending || updateTierMutation.isPending}
                  data-testid="button-submit-tier"
                >
                  {createTierMutation.isPending || updateTierMutation.isPending
                    ? "Saving..." 
                    : editingTier 
                      ? "Update Tier" 
                      : "Create Tier"
                  }
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: tier.color }}
                  >
                    <Trophy className="text-white text-xl" />
                  </div>
                  <div>
                    <CardTitle className="text-xl" data-testid={`tier-name-${tier.id}`}>
                      {tier.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tier.minimumPoints.toLocaleString()}+ points
                    </p>
                  </div>
                </div>
                <Badge variant={tier.isActive ? "default" : "secondary"}>
                  {tier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Points Multiplier:</span>
                  <span className="font-medium text-foreground" data-testid={`tier-multiplier-${tier.id}`}>
                    {tier.multiplier}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Benefits:</span>
                  <span className="font-medium text-foreground">
                    {tier.benefits?.length || 0} items
                  </span>
                </div>
              </div>

              {tier.benefits && tier.benefits.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Benefits:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                    {tier.benefits.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{tier.benefits.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(tier)}
                    data-testid={`button-edit-tier-${tier.id}`}
                  >
                    <Edit className="mr-1" size={14} />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-customers-${tier.id}`}>
                    <Users className="mr-1" size={14} />
                    Customers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tiers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No tiers configured</h3>
          <p className="text-muted-foreground mb-4">
            Create your first customer tier to get started with the loyalty program.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2" size={16} />
            Create First Tier
          </Button>
        </div>
      )}
    </div>
  );
}
