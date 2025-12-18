import { Block } from '@/types/builder';

interface CheckoutSectionProps {
  block: Block;
  isPreview?: boolean;
}

export function CheckoutSection({ block, isPreview }: CheckoutSectionProps) {
  const content = block.content.checkout;
  
  if (!content) return null;

  return (
    <div id="checkout" className="py-12 px-6 bg-secondary/30">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">
            {content.title}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Full Name
              </label>
              <div className="w-full px-4 py-3 rounded-lg border border-input bg-background text-muted-foreground">
                John Doe
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Phone Number
              </label>
              <div className="w-full px-4 py-3 rounded-lg border border-input bg-background text-muted-foreground">
                +880 1XXX-XXXXXX
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Delivery Address
              </label>
              <div className="w-full px-4 py-3 rounded-lg border border-input bg-background text-muted-foreground h-20">
                123 Main Street, Dhaka
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">৳2,999</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-foreground">৳100</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">Total</span>
                <span className="text-primary">৳3,099</span>
              </div>
            </div>

            <button className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-4">
              {content.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
