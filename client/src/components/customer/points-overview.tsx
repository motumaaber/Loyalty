import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/language-context";
import { Star, Trophy, Gift } from "lucide-react";

interface PointsOverviewProps {
  customerId: string;
}

export default function PointsOverview({ customerId }: PointsOverviewProps) {
  const { t } = useLanguage();
  
  const { data: balanceData, isLoading } = useQuery({
    queryKey: ["/api/checkBalance", customerId],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-8 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const points = balanceData?.points || {
    availablePoints: 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0
  };
  const tier = balanceData?.tier || { name: "Silver" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-primary text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="available-points-title">
              {t("customer.available")}
            </h3>
            <p className="text-3xl font-bold text-primary" data-testid="available-points-value">
              {points.availablePoints?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">+250 this week</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-secondary text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="tier-status-title">
              {t("customer.tier")}
            </h3>
            <p className="text-2xl font-bold text-secondary" data-testid="tier-status-value">
              {t(`tier.${tier.name?.toLowerCase()}`)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">2,550 points to Platinum</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="text-accent text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="lifetime-earned-title">
              {t("customer.lifetime")}
            </h3>
            <p className="text-2xl font-bold text-accent" data-testid="lifetime-earned-value">
              {points.lifetimeEarned?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Since joining</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
