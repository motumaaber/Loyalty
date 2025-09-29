import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/language-context";

interface TierProgressProps {
  customerId: string;
}

export default function TierProgress({ customerId }: TierProgressProps) {
  const { t } = useLanguage();

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/checkBalance", customerId],
  });

  const { data: tiersData, isLoading: tiersLoading } = useQuery({
    queryKey: ["/api/admin/tiers"],
  });

  if (balanceLoading || tiersLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const points = balanceData?.points || { totalPoints: 0 };
  const currentTier = balanceData?.tier || { name: "Silver", minimumPoints: 0 };
  const tiers = tiersData?.tiers || [];

  // Sort tiers by minimum points
  const sortedTiers = [...tiers].sort((a, b) => a.minimumPoints - b.minimumPoints);
  
  // Find current tier index and next tier
  const currentTierIndex = sortedTiers.findIndex(tier => tier.name === currentTier.name);
  const nextTier = currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : null;
  
  // Calculate progress to next tier
  let progressPercentage = 0;
  let pointsToNext = 0;
  
  if (nextTier) {
    const currentTierPoints = currentTier.minimumPoints || 0;
    const nextTierPoints = nextTier.minimumPoints;
    const customerPoints = points.totalPoints || 0;
    
    pointsToNext = nextTierPoints - customerPoints;
    progressPercentage = Math.min(
      ((customerPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100,
      100
    );
  } else {
    // Already at highest tier
    progressPercentage = 100;
  }

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "silver":
        return "bg-gray-400";
      case "gold":
        return "bg-yellow-400";
      case "platinum":
        return "bg-purple-400";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground" data-testid="tier-progress-title">
          Tier Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isPastTier = tier.minimumPoints < (currentTier.minimumPoints || 0);
            const isFutureTier = tier.minimumPoints > (points.totalPoints || 0);

            return (
              <div key={tier.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    isPastTier || isCurrentTier ? getTierColor(tier.name) : "bg-muted"
                  }`}></div>
                  <span className={`${
                    isCurrentTier 
                      ? "text-secondary font-medium" 
                      : isFutureTier 
                        ? "text-muted-foreground" 
                        : "text-foreground"
                  }`} data-testid={`tier-${tier.name.toLowerCase()}`}>
                    {t(`tier.${tier.name.toLowerCase()}`)} {isCurrentTier && "(Current)"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {tier.minimumPoints === 0 
                    ? "0 points" 
                    : `${tier.minimumPoints.toLocaleString()}+ points`
                  }
                </span>
              </div>
            );
          })}
          
          {nextTier && (
            <>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                  <span className="text-foreground font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" data-testid="tier-progress-bar" />
                <p className="text-xs text-muted-foreground mt-2">
                  {pointsToNext > 0 
                    ? `${pointsToNext.toLocaleString()} points to ${nextTier.name}`
                    : `Congratulations! You've reached ${nextTier.name} tier!`
                  }
                </p>
              </div>
            </>
          )}
          
          {!nextTier && (
            <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
              <p className="text-sm text-secondary font-medium">
                🎉 Congratulations! You've reached the highest tier!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
