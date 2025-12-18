import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';

export function DeveloperCheckout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checkout Profiles</h2>
          <p className="text-muted-foreground">
            Configure checkout forms and payment methods
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
            <CreditCard className="h-5 w-5" />
            Checkout Configuration
          </CardTitle>
          <CardDescription>
            Coming soon - Checkout form builder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure checkout form fields (name, phone, address, city, email), 
            payment methods (Cash on Delivery, Online Payment), and validation rules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
