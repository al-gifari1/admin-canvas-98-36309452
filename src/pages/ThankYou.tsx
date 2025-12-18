import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We will contact you shortly to confirm your delivery.
          </p>

          {orderId && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-semibold text-foreground text-lg">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Save your Order ID for future reference. Our team will call you within 24 hours.
            </p>
            
            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
