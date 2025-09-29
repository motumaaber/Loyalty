import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Banknote, ShoppingBag, Smartphone, CheckCircle } from "lucide-react";

interface RedemptionOptionsProps {
  customerId: string;
}

export default function RedemptionOptions({ customerId }: RedemptionOptionsProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const { data: balanceData } = useQuery({
    queryKey: ["/api/checkBalance", customerId],
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { customerId: string; rewardId: string }) =>
      apiRequest("POST", "/api/redeemPoints", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkBalance", customerId] });
      setShowConfirmDialog(false);
      setSelectedReward(null);
      toast({
        title: "Redemption successful",
        description: "Your points have been redeemed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption failed",
        description: error.message || "Failed to redeem points",
        variant: "destructive",
      });
    },
  });

  const rewards = rewardsData?.rewards || [];
  const availablePoints = balanceData?.points?.availablePoints || 0;

  const handleRedemption = (reward: any) => {
    if (availablePoints < reward.cost) {
      toast({
        title: "Insufficient points",
        description: `You need ${reward.cost - availablePoints} more points for this reward`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const confirmRedemption = () => {
    if (selectedReward) {
      redeemMutation.mutate({
        customerId,
        rewardId: selectedReward.id,
      });
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "cashback":
        return <Banknote className="text-accent" />;
      case "voucher":
        return <ShoppingBag className="text-secondary" />;
      case "airtime":
        return <Smartphone className="text-primary" />;
      default:
        return <CheckCircle />;
    }
  };

  if (rewardsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground" data-testid="redemption-title">
            {t("redeem.title") || "Redeem Points"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.map((reward) => {
              const canAfford = availablePoints >= reward.cost;
              
              return (
                <div 
                  key={reward.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    canAfford 
                      ? "border-border hover:bg-muted/50 cursor-pointer" 
                      : "border-border bg-muted/20 opacity-60"
                  }`}
                  onClick={() => canAfford && handleRedemption(reward)}
                  data-testid={`reward-${reward.type}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center">
                        {getRewardIcon(reward.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {t(`redeem.${reward.type}`) || reward.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground" data-testid={`reward-cost-${reward.type}`}>
                        {reward.cost} pts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        = ETB {parseFloat(reward.value).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  
                  {!canAfford && (
                    <div className="mt-2 text-xs text-destructive">
                      Need {reward.cost - availablePoints} more points
                    </div>
                  )}
                </div>
              );
            })}
            
            {rewards.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">🎁</div>
                <p className="text-muted-foreground">No rewards available at the moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {getRewardIcon(selectedReward.type)}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {selectedReward.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedReward.description}
                </p>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Points to redeem:</span>
                  <span className="font-medium text-foreground">{selectedReward.cost} points</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-medium text-foreground">ETB {parseFloat(selectedReward.value).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining points:</span>
                  <span className="font-medium text-foreground">
                    {(availablePoints - selectedReward.cost).toLocaleString()} points
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                  data-testid="button-cancel-redemption"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmRedemption}
                  disabled={redeemMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-redemption"
                >
                  {redeemMutation.isPending ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
