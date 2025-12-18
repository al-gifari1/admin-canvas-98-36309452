import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Block } from '@/types/builder';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

interface CheckoutConfig {
  delivery_fee: number;
  allowed_cities: string[];
  allow_all_locations: boolean;
  free_delivery_message: string;
  free_delivery_threshold: number | null;
}

interface PageData {
  id: string;
  title: string;
  shop_id: string;
  checkout_config: CheckoutConfig | null;
  products: {
    id: string;
    name: string;
    price: number;
    description: string | null;
  } | null;
}

interface PublicCheckoutSectionProps {
  block: Block;
  pageData: PageData;
}

const orderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().trim().min(10, 'Valid phone number required').max(20, 'Phone number too long'),
  address: z.string().trim().min(5, 'Address is required').max(500, 'Address too long'),
  city: z.string().trim().min(1, 'City is required'),
  note: z.string().max(500, 'Note too long').optional(),
});

const DEFAULT_CITIES = [
  'Dhaka',
  'Chittagong',
  'Khulna',
  'Rajshahi',
  'Sylhet',
  'Rangpur',
  'Barisal',
  'Comilla',
  'Gazipur',
  'Narayanganj',
];

export function PublicCheckoutSection({ block, pageData }: PublicCheckoutSectionProps) {
  const navigate = useNavigate();
  const content = block.content.checkout;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!content) return null;

  const checkoutConfig = pageData.checkout_config || {
    delivery_fee: 100,
    allowed_cities: [],
    allow_all_locations: true,
    free_delivery_message: '',
    free_delivery_threshold: null,
  };

  const productPrice = pageData.products?.price || 0;
  const subtotal = productPrice * quantity;
  
  // Calculate delivery fee
  let deliveryFee = checkoutConfig.delivery_fee;
  if (checkoutConfig.free_delivery_threshold && subtotal >= checkoutConfig.free_delivery_threshold) {
    deliveryFee = 0;
  }
  
  const total = subtotal + deliveryFee;

  // Get available cities
  const availableCities = checkoutConfig.allow_all_locations 
    ? DEFAULT_CITIES 
    : checkoutConfig.allowed_cities.length > 0 
      ? checkoutConfig.allowed_cities 
      : DEFAULT_CITIES;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const result = orderSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          shop_id: pageData.shop_id,
          landing_page_id: pageData.id,
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          delivery_address: formData.address.trim(),
          city: formData.city,
          notes: formData.note?.trim() || null,
          amount: total,
          quantity: quantity,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Order placed successfully!');
      navigate(`/thank-you?orderId=${data.id}`);
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="checkout" className="py-12 px-6 bg-secondary/30">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">
            {content.title}
          </h2>
          
          {/* Product Info */}
          {pageData.products && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-foreground">{pageData.products.name}</h3>
              <p className="text-primary font-bold">৳{productPrice.toLocaleString()}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Full Name *
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Phone Number *
              </label>
              <Input
                placeholder="+880 1XXX-XXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                City/Zone *
              </label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger className={errors.city ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-destructive text-xs mt-1">{errors.city}</p>
              )}
            </div>
            
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Delivery Address *
              </label>
              <Textarea
                placeholder="Enter your full delivery address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-destructive text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Order Note (Optional)
              </label>
              <Textarea
                placeholder="Any special instructions?"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={2}
              />
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Subtotal ({quantity} item{quantity > 1 ? 's' : ''})
                </span>
                <span className="text-foreground">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-foreground">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `৳${deliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>
              {deliveryFee === 0 && checkoutConfig.free_delivery_message && (
                <p className="text-xs text-green-600 mb-2">
                  {checkoutConfig.free_delivery_message}
                </p>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">Total</span>
                <span className="text-primary">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-6 text-lg font-semibold mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                content.buttonText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
