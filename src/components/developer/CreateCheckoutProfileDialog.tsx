import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Plus, Trash2, Package, Smartphone, Zap, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  main_image: string | null;
}

interface ShippingRule {
  label: string;
  cost: number;
}

interface PaymentMethods {
  cod: boolean;
  online: boolean;
  bkash: boolean;
  nagad: boolean;
  rocket: boolean;
}

interface CheckoutProfile {
  id: string;
  name: string;
  shop_id: string;
  profile_type: 'physical' | 'digital';
  address_enabled: boolean;
  city_enabled: boolean;
  email_enabled: boolean;
  notes_enabled: boolean;
  shipping_rules: ShippingRule[];
  free_shipping_enabled: boolean;
  free_shipping_threshold: number | null;
  payment_methods: PaymentMethods;
}

interface CreateCheckoutProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: CheckoutProfile | null;
  onSuccess: () => void;
}

const defaultPaymentMethods: PaymentMethods = {
  cod: true,
  online: false,
  bkash: false,
  nagad: false,
  rocket: false,
};

export function CreateCheckoutProfileDialog({ 
  open, 
  onOpenChange, 
  profile, 
  onSuccess 
}: CreateCheckoutProfileDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    shop_id: '',
    profile_type: 'physical' as 'physical' | 'digital',
    address_enabled: true,
    city_enabled: true,
    email_enabled: false,
    notes_enabled: false,
    shipping_rules: [{ label: 'Inside Dhaka', cost: 60 }] as ShippingRule[],
    free_shipping_enabled: false,
    free_shipping_threshold: '',
    payment_methods: { ...defaultPaymentMethods },
  });

  useEffect(() => {
    if (open) {
      fetchShops();
      if (profile) {
        setFormData({
          name: profile.name,
          shop_id: profile.shop_id,
          profile_type: profile.profile_type || 'physical',
          address_enabled: profile.address_enabled,
          city_enabled: profile.city_enabled,
          email_enabled: (profile as any).email_enabled ?? false,
          notes_enabled: profile.notes_enabled,
          shipping_rules: profile.shipping_rules || [{ label: 'Inside Dhaka', cost: 60 }],
          free_shipping_enabled: profile.free_shipping_enabled,
          free_shipping_threshold: profile.free_shipping_threshold?.toString() || '',
          payment_methods: profile.payment_methods || { ...defaultPaymentMethods },
        });
        // Load selected products for edit mode
        setSelectedProductIds((profile as any).product_ids || []);
      } else {
        resetForm();
        setSelectedProductIds([]);
      }
    }
  }, [open, profile]);

  // Fetch products when shop changes
  useEffect(() => {
    if (formData.shop_id) {
      fetchProducts(formData.shop_id);
    } else {
      setProducts([]);
      setSelectedProductIds([]);
    }
  }, [formData.shop_id]);

  const resetForm = () => {
    setFormData({
      name: '',
      shop_id: '',
      profile_type: 'physical',
      address_enabled: true,
      city_enabled: true,
      email_enabled: false,
      notes_enabled: false,
      shipping_rules: [{ label: 'Inside Dhaka', cost: 60 }],
      free_shipping_enabled: false,
      free_shipping_threshold: '',
      payment_methods: { ...defaultPaymentMethods },
    });
    setSelectedProductIds([]);
  };

  const fetchProducts = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, main_image')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId));
  };

  const fetchShops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setShops(data || []);
      
      if (data && data.length === 1 && !formData.shop_id) {
        setFormData(prev => ({ ...prev, shop_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const addShippingRule = () => {
    setFormData(prev => ({
      ...prev,
      shipping_rules: [...prev.shipping_rules, { label: '', cost: 0 }]
    }));
  };

  const removeShippingRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shipping_rules: prev.shipping_rules.filter((_, i) => i !== index)
    }));
  };

  const updateShippingRule = (index: number, field: 'label' | 'cost', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      shipping_rules: prev.shipping_rules.map((rule, i) => 
        i === index ? { ...rule, [field]: field === 'cost' ? Number(value) : value } : rule
      )
    }));
  };

  const updatePaymentMethod = (method: keyof PaymentMethods, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: { ...prev.payment_methods, [method]: checked }
    }));
  };

  const handleProfileTypeChange = (type: 'physical' | 'digital') => {
    setFormData(prev => ({
      ...prev,
      profile_type: type,
      // Reset payment methods based on type
      payment_methods: type === 'physical' 
        ? { cod: true, online: false, bkash: false, nagad: false, rocket: false }
        : { cod: false, online: false, bkash: true, nagad: true, rocket: false },
      // For digital, disable address and city by default, enable email
      address_enabled: type === 'physical',
      city_enabled: type === 'physical',
      email_enabled: type === 'digital',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.shop_id) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        name: formData.name,
        shop_id: formData.shop_id,
        profile_type: formData.profile_type,
        address_enabled: formData.address_enabled,
        city_enabled: formData.city_enabled,
        email_enabled: formData.email_enabled,
        notes_enabled: formData.notes_enabled,
        shipping_rules: formData.profile_type === 'physical' 
          ? JSON.parse(JSON.stringify(formData.shipping_rules))
          : [],
        free_shipping_enabled: formData.profile_type === 'physical' ? formData.free_shipping_enabled : false,
        free_shipping_threshold: formData.profile_type === 'physical' && formData.free_shipping_threshold 
          ? parseFloat(formData.free_shipping_threshold) 
          : null,
        payment_methods: JSON.parse(JSON.stringify(formData.payment_methods)),
        product_ids: selectedProductIds,
        created_by: user?.id,
      };

      if (profile) {
        const { error } = await supabase
          .from('checkout_profiles')
          .update(profileData)
          .eq('id', profile.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
      } else {
        const { error } = await supabase
          .from('checkout_profiles')
          .insert([profileData]);

        if (error) throw error;
        toast.success('Profile created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? 'Edit Checkout Profile' : 'Create Checkout Profile'}</DialogTitle>
          <DialogDescription>
            Configure checkout form fields, payment methods, and shipping rules
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="shop">Shop *</Label>
              <Select 
                value={formData.shop_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shop_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Profile Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard Checkout"
                required
              />
            </div>
          </div>

          {/* Products Selection */}
          {formData.shop_id && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Products in Offer</Label>
              <p className="text-sm text-muted-foreground">
                Select products for this checkout profile
              </p>

              {/* Selected Products */}
              {selectedProductIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border">
                  {selectedProductIds.map(id => {
                    const product = products.find(p => p.id === id);
                    return product ? (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1">
                        {product.name}
                        <button
                          type="button"
                          onClick={() => removeProduct(id)}
                          className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Products List */}
              <ScrollArea className="h-40 rounded-lg border">
                <div className="p-2 space-y-1">
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products found for this shop
                    </p>
                  ) : (
                    products.map(product => (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedProductIds.includes(product.id)
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        {product.main_image && (
                          <img
                            src={product.main_image}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">৳{product.price}</p>
                        </div>
                        {selectedProductIds.includes(product.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Profile Type */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Profile Type</Label>
            <RadioGroup 
              value={formData.profile_type} 
              onValueChange={(value) => handleProfileTypeChange(value as 'physical' | 'digital')}
              className="grid grid-cols-2 gap-4"
            >
              <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.profile_type === 'physical' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="physical" id="physical" />
                <Label htmlFor="physical" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Physical Product</p>
                    <p className="text-xs text-muted-foreground">With shipping & COD</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.profile_type === 'digital' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="digital" id="digital" />
                <Label htmlFor="digital" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Digital Product</p>
                    <p className="text-xs text-muted-foreground">Instant delivery, MFS</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Form Fields</Label>
            <p className="text-sm text-muted-foreground">Name and Phone are always required</p>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor="address_enabled" className="cursor-pointer">Address</Label>
                <Switch
                  id="address_enabled"
                  checked={formData.address_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, address_enabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor="city_enabled" className="cursor-pointer">City</Label>
                <Switch
                  id="city_enabled"
                  checked={formData.city_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, city_enabled: checked }))}
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                formData.profile_type === 'digital' ? 'bg-primary/5 border-primary/30' : ''
              }`}>
                <div>
                  <Label htmlFor="email_enabled" className="cursor-pointer">Email</Label>
                  {formData.profile_type === 'digital' && (
                    <p className="text-xs text-muted-foreground">Recommended for digital delivery</p>
                  )}
                </div>
                <Switch
                  id="email_enabled"
                  checked={formData.email_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_enabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor="notes_enabled" className="cursor-pointer">Order Notes</Label>
                <Switch
                  id="notes_enabled"
                  checked={formData.notes_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notes_enabled: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Payment Methods</Label>
            
            {formData.profile_type === 'physical' ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery (COD)</Label>
                    <p className="text-xs text-muted-foreground">Pay when product is delivered</p>
                  </div>
                  <Switch
                    id="cod"
                    checked={formData.payment_methods.cod}
                    onCheckedChange={(checked) => updatePaymentMethod('cod', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="online" className="cursor-pointer">Online Payment</Label>
                    <p className="text-xs text-muted-foreground">Pay online before delivery</p>
                  </div>
                  <Switch
                    id="online"
                    checked={formData.payment_methods.online}
                    onCheckedChange={(checked) => updatePaymentMethod('online', checked)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Financial Services (MFS)
                </p>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">b</div>
                      <Label htmlFor="bkash" className="cursor-pointer">bKash</Label>
                    </div>
                    <Switch
                      id="bkash"
                      checked={formData.payment_methods.bkash}
                      onCheckedChange={(checked) => updatePaymentMethod('bkash', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">N</div>
                      <Label htmlFor="nagad" className="cursor-pointer">Nagad</Label>
                    </div>
                    <Switch
                      id="nagad"
                      checked={formData.payment_methods.nagad}
                      onCheckedChange={(checked) => updatePaymentMethod('nagad', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                      <Label htmlFor="rocket" className="cursor-pointer">Rocket</Label>
                    </div>
                    <Switch
                      id="rocket"
                      checked={formData.payment_methods.rocket}
                      onCheckedChange={(checked) => updatePaymentMethod('rocket', checked)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Rules - Only for Physical Products */}
          {formData.profile_type === 'physical' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Shipping Rules</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addShippingRule}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.shipping_rules.map((rule, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        value={rule.label}
                        onChange={(e) => updateShippingRule(index, 'label', e.target.value)}
                        placeholder="Label (e.g., Inside Dhaka)"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">৳</span>
                        <Input
                          type="number"
                          value={rule.cost}
                          onChange={(e) => updateShippingRule(index, 'cost', e.target.value)}
                          placeholder="Cost"
                          className="w-24"
                        />
                      </div>
                      {formData.shipping_rules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeShippingRule(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Shipping */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label htmlFor="free_shipping" className="cursor-pointer">Free Shipping</Label>
                    <p className="text-sm text-muted-foreground">Enable free shipping above threshold</p>
                  </div>
                  <Switch
                    id="free_shipping"
                    checked={formData.free_shipping_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, free_shipping_enabled: checked }))}
                  />
                </div>
                
                {formData.free_shipping_enabled && (
                  <div className="grid gap-2">
                    <Label htmlFor="threshold">Free Shipping Threshold (৳)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.free_shipping_threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, free_shipping_threshold: e.target.value }))}
                      placeholder="e.g., 1000"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Digital Product Notice */}
          {formData.profile_type === 'digital' && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Instant Digital Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Digital products will be delivered instantly after payment confirmation via email or download link.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (profile ? 'Update' : 'Create')} Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
