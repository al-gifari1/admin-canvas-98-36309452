import { useState, useEffect, useCallback } from 'react';
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
import { GalleryPickerDialog } from '@/components/gallery/GalleryPickerDialog';
import { ProductTypeSection, ProductTypeData, DigitalConfig } from './ProductTypeSection';
import { Upload, Image as ImageIcon, FolderOpen, X, Loader2 } from 'lucide-react';

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
  shop_id: string | null;
  product_type?: string;
  sizes?: string[] | null;
  download_url?: string | null;
  sku?: string | null;
  current_stock?: number | null;
  digital_config?: DigitalConfig | null;
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
  const [uploading, setUploading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    price: '',
    sale_price: '',
    main_image: '',
    shop_id: '',
  });

  const [productTypeData, setProductTypeData] = useState<ProductTypeData>({
    product_type: 'physical',
    sku: '',
    stock_quantity: 0,
    digital_config: null,
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
          shop_id: product.shop_id || '',
        });
        setProductTypeData({
          product_type: (product.product_type as 'physical' | 'digital') || 'physical',
          sku: product.sku || '',
          stock_quantity: product.current_stock || 0,
          digital_config: product.digital_config || null,
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
    });
    setProductTypeData({
      product_type: 'physical',
      sku: '',
      stock_quantity: 0,
      digital_config: null,
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

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, main_image: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleGallerySelect = (url: string) => {
    setFormData(prev => ({ ...prev, main_image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const productData: any = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        short_description: formData.short_description || null,
        description: formData.short_description || null,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        main_image: formData.main_image || null,
        shop_id: formData.shop_id || null,
        product_type: productTypeData.product_type,
        sku: productTypeData.sku || null,
        current_stock: productTypeData.stock_quantity,
        digital_config: productTypeData.digital_config,
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
    <>
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
                    <SelectValue placeholder="Select a shop (optional)" />
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
                      <span className="ml-2 text-xs text-primary font-medium">
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

              {/* Product Type Section */}
              <ProductTypeSection
                data={productTypeData}
                onChange={setProductTypeData}
              />

              {/* Product Image - Enhanced */}
              <div className="grid gap-2">
                <Label>Product Image</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-all ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.main_image ? (
                    <div className="relative p-4">
                      <div className="relative aspect-video max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
                        <img
                          src={formData.main_image}
                          alt="Product"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex justify-center gap-2 mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setGalleryOpen(true)}
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Gallery
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Drag & drop an image here, or
                          </p>
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setGalleryOpen(true)}
                            >
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Browse Gallery
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>
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

      <GalleryPickerDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={handleGallerySelect}
        shopId={formData.shop_id}
      />
    </>
  );
}
