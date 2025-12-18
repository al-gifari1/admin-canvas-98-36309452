import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export function DeveloperLandingPages() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Landing Pages</h2>
          <p className="text-muted-foreground">
            Create and manage landing pages for your clients
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Landing Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Landing Page Builder
          </CardTitle>
          <CardDescription>
            Coming soon - Drag & drop landing page builder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The landing page builder will allow you to create beautiful single-page checkout 
            landing pages with drag & drop components, tracking integration, and COD/online 
            payment support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
