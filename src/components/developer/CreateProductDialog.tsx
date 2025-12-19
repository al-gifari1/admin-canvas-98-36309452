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
import { FolderOpen } from 'lucide-react';
import { GalleryPickerDialog } from '@/components/gallery/GalleryPickerDialog';

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  main_image: string | null;
  short_description: string | null;
  shop_id: string;
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
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    price: '',
    main_image: '',
    shop_id: '',
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
          main_image: product.main_image || '',
          shop_id: product.shop_id,
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
      main_image: '',
      shop_id: '',
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
      
      // Set default shop if only one exists
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.shop_id) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        short_description: formData.short_description || null,
        description: formData.short_description || null,
        price: parseFloat(formData.price) || 0,
        main_image: formData.main_image || null,
        shop_id: formData.shop_id,
        owner_type: 'developer',
        created_by: user?.id,
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

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

            {/* Selling Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                required
              />
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

            {/* Product Image */}
            <div className="grid gap-2">
              <Label>Product Image</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.main_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, main_image: e.target.value }))}
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGalleryPickerOpen(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              {formData.main_image && (
                <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={formData.main_image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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

        <GalleryPickerDialog
          open={galleryPickerOpen}
          onOpenChange={setGalleryPickerOpen}
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, main_image: url }));
            setGalleryPickerOpen(false);
          }}
          shopId={formData.shop_id}
        />
      </DialogContent>
    </Dialog>
  );
}
