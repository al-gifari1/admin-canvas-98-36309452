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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  sale_price?: number | null;
  main_image: string | null;
  short_description: string | null;
  shop_id: string;
  product_type?: string;
  sizes?: string[] | null;
  download_url?: string | null;
}

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function CreateProductDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess 
}: CreateProductDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    price: '',
    sale_price: '',
    main_image: '',
    shop_id: '',
    product_type: 'physical',
    sizes: '',
    download_url: '',
  });

  useEffect(() => {
    if (open) {
      fetchShops();
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug || '',
          short_description: product.short_description || '',
          price: product.price.toString(),
          sale_price: product.sale_price?.toString() || '',
          main_image: product.main_image || '',
          shop_id: product.shop_id,
          product_type: product.product_type || 'physical',
          sizes: product.sizes?.join(', ') || '',
          download_url: product.download_url || '',
        });
      } else {
        resetForm();
      }
    }
  }, [open, product]);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      price: '',
      sale_price: '',
      main_image: '',
      shop_id: '',
      product_type: 'physical',
      sizes: '',
      download_url: '',
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const calculateDiscount = () => {
    const price = parseFloat(formData.price);
    const salePrice = parseFloat(formData.sale_price);
    if (price && salePrice && salePrice < price) {
      return Math.round(((price - salePrice) / price) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const sizesArray = formData.sizes 
        ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : null;

      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        short_description: formData.short_description || null,
        description: formData.short_description || null,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        main_image: formData.main_image || null,
        shop_id: formData.shop_id || null,
        product_type: formData.product_type,
        sizes: sizesArray,
        download_url: formData.product_type === 'digital' ? formData.download_url : null,
        owner_type: 'developer',
        created_by: user?.id,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const discount = calculateDiscount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product details' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Shop Selection */}
            <div className="grid gap-2">
              <Label htmlFor="shop">Shop</Label>
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

            {/* Product Type */}
            <div className="grid gap-2">
              <Label>Product Type *</Label>
              <Select 
                value={formData.product_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Product</SelectItem>
                  <SelectItem value="digital">Digital Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Product name"
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Regular Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sale_price">
                  Sale Price
                  {discount > 0 && (
                    <span className="ml-2 text-xs text-emerald-600 font-medium">
                      ({discount}% off)
                    </span>
                  )}
                </Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="short_description">Description</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="Brief product description..."
                rows={2}
              />
            </div>

            {/* Sizes - Only for Physical */}
            {formData.product_type === 'physical' && (
              <div className="grid gap-2">
                <Label htmlFor="sizes">Sizes</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                  placeholder="S, M, L, XL (comma separated)"
                />
                <p className="text-xs text-muted-foreground">Enter sizes separated by commas</p>
              </div>
            )}

            {/* Download URL - Only for Digital */}
            {formData.product_type === 'digital' && (
              <div className="grid gap-2">
                <Label htmlFor="download_url">Download Link</Label>
                <Input
                  id="download_url"
                  value={formData.download_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, download_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Product Image */}
            <div className="grid gap-2">
              <Label>Product Image</Label>
              <ImageUpload
                value={formData.main_image}
                onChange={(url) => setFormData(prev => ({ ...prev, main_image: url }))}
                bucket="product-images"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update' : 'Create')} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
