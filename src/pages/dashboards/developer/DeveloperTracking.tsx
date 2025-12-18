import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';

export function DeveloperTracking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tracking Profiles</h2>
          <p className="text-muted-foreground">
            Configure tracking pixels and analytics for landing pages
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tracking Integration
          </CardTitle>
          <CardDescription>
            Coming soon - Pixel & Analytics setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set up Facebook Pixel, TikTok Pixel, Google Ads, Google Tag Manager, 
            and custom tracking scripts for your clients' landing pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
