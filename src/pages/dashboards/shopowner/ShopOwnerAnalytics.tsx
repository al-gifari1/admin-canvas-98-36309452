import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface ShopOwnerAnalyticsProps {
  shop: { id: string; name: string } | null;
}

export function ShopOwnerAnalytics({ shop }: ShopOwnerAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Track your landing page performance</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground text-center">
            View detailed analytics for your landing pages and campaigns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
