import { Block, SmartCheckoutContent } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Package, AlertCircle } from 'lucide-react';

interface SmartCheckoutPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const defaultContent: SmartCheckoutContent = {
  headline: 'অর্ডার করতে আপনার নাম, ঠিকানা, মোবাইল নাম্বার লিখে অর্ডার কন্ফার্ম করুন',
  submitButtonText: 'অর্ডার কনফার্ম করুন',
  brandColor: '#16a34a',
  products: [],
  shippingOptions: [
    { id: 'inside-dhaka', label: 'ঢাকার ভিতরে', price: 60 },
    { id: 'outside-dhaka', label: 'ঢাকার বাহিরে', price: 120 },
  ],
  fieldLabels: {
    name: 'আপনার নাম',
    phone: 'মোবাইল নাম্বার',
    district: 'জেলা',
    thana: 'থানা',
    address: 'সম্পূর্ণ ঠিকানা',
  },
  showSizeSelector: true,
  showQuantity: true,
};

export function SmartCheckoutProperties({ content, onUpdate, tab }: SmartCheckoutPropertiesProps) {
  const smartCheckout = content.smartCheckout || defaultContent;

  const updateSmartCheckout = (updates: Partial<SmartCheckoutContent>) => {
    onUpdate({
      ...content,
      smartCheckout: { ...smartCheckout, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-6">
        {/* Products Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Products</Label>
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Product Selection</p>
            <p className="text-xs text-muted-foreground">
              Currently using demo products. Database integration coming soon.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Connect to your product database to display real products on the checkout form.
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <Label htmlFor="headline">Headline Text</Label>
          <Textarea
            id="headline"
            value={smartCheckout.headline}
            onChange={(e) => updateSmartCheckout({ headline: e.target.value })}
            rows={2}
            placeholder="Enter headline..."
          />
        </div>

        {/* Submit Button Text */}
        <div className="space-y-2">
          <Label htmlFor="submitButton">Submit Button Text</Label>
          <Input
            id="submitButton"
            value={smartCheckout.submitButtonText}
            onChange={(e) => updateSmartCheckout({ submitButtonText: e.target.value })}
            placeholder="অর্ডার কনফার্ম করুন"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showQuantity" className="text-sm">Show Quantity Controls</Label>
              <p className="text-xs text-muted-foreground">Allow customers to change quantity</p>
            </div>
            <Switch
              id="showQuantity"
              checked={smartCheckout.showQuantity}
              onCheckedChange={(checked) => updateSmartCheckout({ showQuantity: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showSizeSelector" className="text-sm">Show Size Selector</Label>
              <p className="text-xs text-muted-foreground">Show size options for products</p>
            </div>
            <Switch
              id="showSizeSelector"
              checked={smartCheckout.showSizeSelector}
              onCheckedChange={(checked) => updateSmartCheckout({ showSizeSelector: checked })}
            />
          </div>
        </div>

        {/* Shipping Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Shipping Options</Label>
          <div className="space-y-2">
            {smartCheckout.shippingOptions.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...smartCheckout.shippingOptions];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateSmartCheckout({ shippingOptions: newOptions });
                  }}
                  placeholder="Label"
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">৳</span>
                  <Input
                    type="number"
                    value={option.price}
                    onChange={(e) => {
                      const newOptions = [...smartCheckout.shippingOptions];
                      newOptions[index] = { ...option, price: parseInt(e.target.value) || 0 };
                      updateSmartCheckout({ shippingOptions: newOptions });
                    }}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'style') {
    return (
      <div className="space-y-6">
        {/* Brand Color */}
        <div className="space-y-2">
          <Label htmlFor="brandColor">Brand Color</Label>
          <p className="text-xs text-muted-foreground mb-2">
            This color will be used for buttons, accents, and highlights
          </p>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border border-border cursor-pointer overflow-hidden"
              style={{ backgroundColor: smartCheckout.brandColor }}
            >
              <input
                type="color"
                value={smartCheckout.brandColor}
                onChange={(e) => updateSmartCheckout({ brandColor: e.target.value })}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={smartCheckout.brandColor}
              onChange={(e) => updateSmartCheckout({ brandColor: e.target.value })}
              placeholder="#16a34a"
              className="flex-1 font-mono"
            />
          </div>
          {/* Color Presets */}
          <div className="flex gap-2 mt-2">
            {['#16a34a', '#2563eb', '#dc2626', '#f59e0b', '#8b5cf6', '#06b6d4'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateSmartCheckout({ brandColor: color })}
                className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Advanced tab - placeholder
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Advanced settings coming soon
        </p>
      </div>
    </div>
  );
}
