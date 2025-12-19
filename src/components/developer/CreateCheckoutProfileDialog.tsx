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
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
}

interface ShippingRule {
  label: string;
  cost: number;
}

interface CheckoutProfile {
  id: string;
  name: string;
  shop_id: string;
  address_enabled: boolean;
  city_enabled: boolean;
  notes_enabled: boolean;
  shipping_rules: ShippingRule[];
  free_shipping_enabled: boolean;
  free_shipping_threshold: number | null;
}

interface CreateCheckoutProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: CheckoutProfile | null;
  onSuccess: () => void;
}

export function CreateCheckoutProfileDialog({ 
  open, 
  onOpenChange, 
  profile, 
  onSuccess 
}: CreateCheckoutProfileDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    shop_id: '',
    address_enabled: true,
    city_enabled: true,
    notes_enabled: false,
    shipping_rules: [{ label: 'Inside Dhaka', cost: 60 }] as ShippingRule[],
    free_shipping_enabled: false,
    free_shipping_threshold: '',
  });

  useEffect(() => {
    if (open) {
      fetchShops();
      if (profile) {
        setFormData({
          name: profile.name,
          shop_id: profile.shop_id,
          address_enabled: profile.address_enabled,
          city_enabled: profile.city_enabled,
          notes_enabled: profile.notes_enabled,
          shipping_rules: profile.shipping_rules || [{ label: 'Inside Dhaka', cost: 60 }],
          free_shipping_enabled: profile.free_shipping_enabled,
          free_shipping_threshold: profile.free_shipping_threshold?.toString() || '',
        });
      } else {
        resetForm();
      }
    }
  }, [open, profile]);

  const resetForm = () => {
    setFormData({
      name: '',
      shop_id: '',
      address_enabled: true,
      city_enabled: true,
      notes_enabled: false,
      shipping_rules: [{ label: 'Inside Dhaka', cost: 60 }],
      free_shipping_enabled: false,
      free_shipping_threshold: '',
    });
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
        address_enabled: formData.address_enabled,
        city_enabled: formData.city_enabled,
        notes_enabled: formData.notes_enabled,
        shipping_rules: JSON.parse(JSON.stringify(formData.shipping_rules)),
        free_shipping_enabled: formData.free_shipping_enabled,
        free_shipping_threshold: formData.free_shipping_threshold ? parseFloat(formData.free_shipping_threshold) : null,
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
            Configure checkout form fields and shipping rules
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

          {/* Shipping Rules */}
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
