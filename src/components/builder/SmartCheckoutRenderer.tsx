import { useState, useMemo } from 'react';
import { Minus, Plus, Check, Truck } from 'lucide-react';
import { SmartCheckoutContent } from '@/types/builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SmartCheckoutRendererProps {
  content?: SmartCheckoutContent;
  isPreview?: boolean;
}

const defaultContent: SmartCheckoutContent = {
  headline: 'অর্ডার করতে আপনার নাম, ঠিকানা, মোবাইল নাম্বার লিখে অর্ডার কন্ফার্ম করুন',
  submitButtonText: 'অর্ডার কনফার্ম করুন',
  brandColor: '#16a34a',
  products: [
    {
      id: 'product-1',
      name: 'Premium Watch',
      price: 2499,
      oldPrice: 3999,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      sizes: ['M', 'L', 'XL'],
    },
    {
      id: 'product-2',
      name: 'Leather Bag',
      price: 1899,
      oldPrice: 2499,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200',
      sizes: [],
    },
  ],
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

export function SmartCheckoutRenderer({ content, isPreview = false }: SmartCheckoutRendererProps) {
  const merged = { ...defaultContent, ...content };
  const { 
    headline, 
    submitButtonText, 
    brandColor, 
    products, 
    shippingOptions,
    fieldLabels,
    showSizeSelector,
    showQuantity,
  } = merged;

  // State
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach(p => { initial[p.id] = 1; });
    return initial;
  });
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [shippingArea, setShippingArea] = useState<string>(shippingOptions[0]?.id || 'inside-dhaka');
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    district: '',
    thana: '',
    address: '',
  });

  // Calculations
  const selectedProductData = useMemo(() => 
    products.find(p => p.id === selectedProduct), 
    [products, selectedProduct]
  );
  const quantity = quantities[selectedProduct] || 1;
  const subtotal = selectedProductData ? selectedProductData.price * quantity : 0;
  const shippingCost = shippingOptions.find(s => s.id === shippingArea)?.price || 0;
  const total = subtotal + shippingCost;

  // Handlers
  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleInputChange = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order submitted:', {
      product: selectedProductData,
      quantity,
      size: selectedSize,
      shipping: shippingArea,
      total,
      customer: formValues,
    });
  };

  // Dynamic styles using CSS variables
  const brandStyles = {
    '--brand-color': brandColor,
  } as React.CSSProperties;

  return (
    <div className="bg-muted/30 py-8 px-4" style={brandStyles}>
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div 
          className="text-center mb-6 py-3 px-4 rounded-lg text-white font-medium"
          style={{ backgroundColor: brandColor }}
        >
          {headline}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Products + Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Selection */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4">পণ্য নির্বাচন করুন</h3>
                <div className="space-y-3">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedProduct === product.id
                          ? 'border-[var(--brand-color)] bg-[var(--brand-color)]/5'
                          : 'border-border hover:border-muted-foreground/50'
                      )}
                    >
                      {/* Radio */}
                      <div className="flex-shrink-0">
                        <div 
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            selectedProduct === product.id 
                              ? 'border-[var(--brand-color)]' 
                              : 'border-muted-foreground'
                          )}
                        >
                          {selectedProduct === product.id && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: brandColor }}
                            />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="product"
                          value={product.id}
                          checked={selectedProduct === product.id}
                          onChange={() => setSelectedProduct(product.id)}
                          className="sr-only"
                        />
                      </div>

                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="font-bold"
                            style={{ color: brandColor }}
                          >
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.oldPrice && (
                            <span className="text-muted-foreground line-through text-sm">
                              ৳{product.oldPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      {showQuantity && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {quantities[product.id] || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                {/* Size Selector */}
                {showSizeSelector && selectedProductData?.sizes && selectedProductData.sizes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-2">সাইজ নির্বাচন করুন</h4>
                    <div className="flex gap-2">
                      {selectedProductData.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            'px-4 py-2 rounded-md font-medium transition-all',
                            selectedSize === size
                              ? 'text-white'
                              : 'bg-muted text-foreground hover:bg-muted/80'
                          )}
                          style={selectedSize === size ? { backgroundColor: brandColor } : undefined}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Form */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4">আপনার তথ্য দিন</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{fieldLabels.name} *</Label>
                    <Input
                      id="name"
                      value={formValues.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{fieldLabels.phone} *</Label>
                    <Input
                      id="phone"
                      value={formValues.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">{fieldLabels.district}</Label>
                    <Input
                      id="district"
                      value={formValues.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="জেলার নাম"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thana">{fieldLabels.thana}</Label>
                    <Input
                      id="thana"
                      value={formValues.thana}
                      onChange={(e) => handleInputChange('thana', e.target.value)}
                      placeholder="থানার নাম"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">{fieldLabels.address} *</Label>
                    <Textarea
                      id="address"
                      value={formValues.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 border border-border lg:sticky lg:top-4">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5" style={{ color: brandColor }} />
                  অর্ডার সামারি
                </h3>

                {/* Selected Product Preview */}
                {selectedProductData && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={selectedProductData.imageUrl}
                        alt={selectedProductData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {selectedProductData.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        পরিমাণ: {quantity}
                        {selectedSize && ` • সাইজ: ${selectedSize}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মূল্য:</span>
                    <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডেলিভারি চার্জ:</span>
                    <span className="font-medium">৳{shippingCost}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">সর্বমোট:</span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: brandColor }}
                    >
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" />
                    ডেলিভারি এরিয়া
                  </h4>
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                          shippingArea === option.id
                            ? 'border-[var(--brand-color)] bg-[var(--brand-color)]/5'
                            : 'border-border hover:border-muted-foreground/50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                              shippingArea === option.id 
                                ? 'border-[var(--brand-color)]' 
                                : 'border-muted-foreground'
                            )}
                          >
                            {shippingArea === option.id && (
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: brandColor }}
                              />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={shippingArea === option.id}
                            onChange={() => setShippingArea(option.id)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                        <span className="text-sm font-medium">৳{option.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: brandColor }}
                >
                  {submitButtonText}
                </button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  ক্যাশ অন ডেলিভারি • ১০০% নিরাপদ
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
