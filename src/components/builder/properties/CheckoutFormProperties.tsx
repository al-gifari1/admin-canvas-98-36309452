import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface CheckoutFormPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function CheckoutFormProperties({ content, onUpdate, tab }: CheckoutFormPropertiesProps) {
  const checkout = content.checkoutForm || { title: 'Complete Your Order', buttonText: 'Place Order', showQuantity: true };

  const updateCheckout = (updates: Partial<typeof checkout>) => {
    onUpdate({
      ...content,
      checkoutForm: { ...checkout, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="checkout-title">Form Title</Label>
          <Input
            id="checkout-title"
            value={checkout.title}
            onChange={(e) => updateCheckout({ title: e.target.value })}
            placeholder="Complete Your Order"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-button">Button Text</Label>
          <Input
            id="checkout-button"
            value={checkout.buttonText}
            onChange={(e) => updateCheckout({ buttonText: e.target.value })}
            placeholder="Place Order"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="checkout-quantity">Show Quantity</Label>
            <p className="text-xs text-muted-foreground">
              Allow customers to select quantity
            </p>
          </div>
          <Switch
            id="checkout-quantity"
            checked={checkout.showQuantity}
            onCheckedChange={(checked) => updateCheckout({ showQuantity: checked })}
          />
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Checkout form styling options coming soon. The form inherits your theme colors.
        </p>
      </div>
    </div>
  );
}
