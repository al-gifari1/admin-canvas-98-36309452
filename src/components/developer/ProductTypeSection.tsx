import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Download, Key, UserCheck } from 'lucide-react';

export interface DigitalConfig {
  fulfillment_type: 'download' | 'license' | 'account';
  expiry_days?: number;
  max_downloads?: number;
  show_on_thankyou?: boolean;
  delivery_mode?: 'per_order' | 'per_item';
  license_keys?: string[];
  requires_email?: boolean;
  duration_days?: number;
  template_key?: string;
}

export interface ProductTypeData {
  product_type: 'physical' | 'digital';
  sku: string;
  stock_quantity: number;
  digital_config: DigitalConfig | null;
}

interface ProductTypeSectionProps {
  data: ProductTypeData;
  onChange: (data: ProductTypeData) => void;
}

export function ProductTypeSection({ data, onChange }: ProductTypeSectionProps) {
  const handleProductTypeChange = (type: 'physical' | 'digital') => {
    onChange({
      ...data,
      product_type: type,
      digital_config: type === 'digital' 
        ? { fulfillment_type: 'download', expiry_days: 0, max_downloads: 0, show_on_thankyou: true }
        : null,
    });
  };

  const handleDigitalConfigChange = (config: Partial<DigitalConfig>) => {
    onChange({
      ...data,
      digital_config: {
        ...data.digital_config!,
        ...config,
      },
    });
  };

  const handleFulfillmentTypeChange = (type: 'download' | 'license' | 'account') => {
    let defaultConfig: DigitalConfig = { fulfillment_type: type };
    
    switch (type) {
      case 'download':
        defaultConfig = { 
          ...defaultConfig, 
          expiry_days: 0, 
          max_downloads: 0, 
          show_on_thankyou: true 
        };
        break;
      case 'license':
        defaultConfig = { 
          ...defaultConfig, 
          delivery_mode: 'per_order', 
          license_keys: [] 
        };
        break;
      case 'account':
        defaultConfig = { 
          ...defaultConfig, 
          requires_email: true, 
          duration_days: 30, 
          template_key: '' 
        };
        break;
    }
    
    onChange({
      ...data,
      digital_config: defaultConfig,
    });
  };

  return (
    <div className="space-y-4">
      {/* Product Type Toggle */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Product Type *</Label>
        <RadioGroup
          value={data.product_type}
          onValueChange={(value) => handleProductTypeChange(value as 'physical' | 'digital')}
          className="grid grid-cols-2 gap-3"
        >
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              data.product_type === 'physical'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <RadioGroupItem value="physical" className="sr-only" />
            <Package className={`h-5 w-5 ${data.product_type === 'physical' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Physical</p>
              <p className="text-xs text-muted-foreground">Shipped product</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              data.product_type === 'digital'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <RadioGroupItem value="digital" className="sr-only" />
            <Download className={`h-5 w-5 ${data.product_type === 'digital' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium">Digital</p>
              <p className="text-xs text-muted-foreground">Downloadable / License</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Physical Inventory Section */}
      {data.product_type === 'physical' && (
        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Physical Inventory
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={data.sku}
                onChange={(e) => onChange({ ...data, sku: e.target.value })}
                placeholder="e.g., SKU-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                min={0}
                value={data.stock_quantity}
                onChange={(e) => onChange({ ...data, stock_quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Digital Settings Section */}
      {data.product_type === 'digital' && data.digital_config && (
        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Download className="h-4 w-4" />
            Digital Settings
          </h4>

          {/* Fulfillment Type */}
          <div className="space-y-2">
            <Label>Fulfillment Type</Label>
            <Select
              value={data.digital_config.fulfillment_type}
              onValueChange={(value) => handleFulfillmentTypeChange(value as 'download' | 'license' | 'account')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="download">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloadable File
                  </div>
                </SelectItem>
                <SelectItem value="license">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    License Key
                  </div>
                </SelectItem>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Account Access
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download Settings */}
          {data.digital_config.fulfillment_type === 'download' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry_days">Expiry Days</Label>
                  <Input
                    id="expiry_days"
                    type="number"
                    min={0}
                    value={data.digital_config.expiry_days ?? 0}
                    onChange={(e) => handleDigitalConfigChange({ expiry_days: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">0 = Never expires</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_downloads">Max Downloads</Label>
                  <Input
                    id="max_downloads"
                    type="number"
                    min={0}
                    value={data.digital_config.max_downloads ?? 0}
                    onChange={(e) => handleDigitalConfigChange({ max_downloads: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">0 = Unlimited</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_on_thankyou"
                  checked={data.digital_config.show_on_thankyou ?? true}
                  onCheckedChange={(checked) => handleDigitalConfigChange({ show_on_thankyou: !!checked })}
                />
                <Label htmlFor="show_on_thankyou" className="text-sm font-normal cursor-pointer">
                  Show download link on Thank You page
                </Label>
              </div>
            </div>
          )}

          {/* License Settings */}
          {data.digital_config.fulfillment_type === 'license' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <Label>Delivery Mode</Label>
                <Select
                  value={data.digital_config.delivery_mode ?? 'per_order'}
                  onValueChange={(value) => handleDigitalConfigChange({ delivery_mode: value as 'per_order' | 'per_item' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_order">Per Order (one key per order)</SelectItem>
                    <SelectItem value="per_item">Per Item (one key per quantity)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_keys">License Keys</Label>
                <Textarea
                  id="license_keys"
                  value={(data.digital_config.license_keys ?? []).join('\n')}
                  onChange={(e) => handleDigitalConfigChange({ 
                    license_keys: e.target.value.split('\n').filter(k => k.trim()) 
                  })}
                  placeholder="Enter one license key per line..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {(data.digital_config.license_keys ?? []).length} keys available
                </p>
              </div>
            </div>
          )}

          {/* Account Access Settings */}
          {data.digital_config.fulfillment_type === 'account' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_email"
                  checked={data.digital_config.requires_email ?? true}
                  onCheckedChange={(checked) => handleDigitalConfigChange({ requires_email: !!checked })}
                />
                <Label htmlFor="requires_email" className="text-sm font-normal cursor-pointer">
                  Requires customer email for account creation
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_days">Access Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min={0}
                    value={data.digital_config.duration_days ?? 30}
                    onChange={(e) => handleDigitalConfigChange({ duration_days: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">0 = Lifetime access</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template_key">Template Key</Label>
                  <Input
                    id="template_key"
                    value={data.digital_config.template_key ?? ''}
                    onChange={(e) => handleDigitalConfigChange({ template_key: e.target.value })}
                    placeholder="e.g., premium-course"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
