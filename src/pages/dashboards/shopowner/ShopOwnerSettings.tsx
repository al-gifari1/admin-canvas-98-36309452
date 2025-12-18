import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface ShopOwnerSettingsProps {
  shop: { id: string; name: string } | null;
}

export function ShopOwnerSettings({ shop }: ShopOwnerSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Configure your shop settings</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
          <p className="text-muted-foreground text-center">
            Configure shop details, notifications, and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
