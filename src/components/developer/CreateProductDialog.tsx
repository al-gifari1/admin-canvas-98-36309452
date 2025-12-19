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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Package, DollarSign, Warehouse, Image as ImageIcon } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  slug: string | null;
  price: number;
  cost_price: number;
  discount_price: number | null;
  discount_percentage: number | null;
  category: string | null;
  brand: string | null;
  tags: string[] | null;
  main_image: string | null;
  gallery_images: any;
  short_description: string | null;
  long_description: string | null;
  description: string | null;
  track_inventory: boolean;
  current_stock: number;
  low_stock_threshold: number;
  stock_unit: string;
  owner_type: string;
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
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    category: '',
    brand: '',
    tags: '',
    short_description: '',
    long_description: '',
    price: '',
    cost_price: '',
    discount_price: '',
    discount_percentage: '',
    track_inventory: false,
    current_stock: '0',
    low_stock_threshold: '10',
    stock_unit: 'piece',
    main_image: '',
    shop_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchShops();
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku || '',
          slug: product.slug || '',
          category: product.category || '',
          brand: product.brand || '',
          tags: product.tags?.join(', ') || '',
          short_description: product.short_description || '',
          long_description: product.long_description || product.description || '',
          price: product.price.toString(),
          cost_price: product.cost_price?.toString() || '',
          discount_price: product.discount_price?.toString() || '',
          discount_percentage: product.discount_percentage?.toString() || '',
          track_inventory: product.track_inventory,
          current_stock: product.current_stock.toString(),
          low_stock_threshold: product.low_stock_threshold.toString(),
          stock_unit: product.stock_unit,
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
      sku: '',
      slug: '',
      category: '',
      brand: '',
      tags: '',
      short_description: '',
      long_description: '',
      price: '',
      cost_price: '',
      discount_price: '',
      discount_percentage: '',
      track_inventory: false,
      current_stock: '0',
      low_stock_threshold: '10',
      stock_unit: 'piece',
      main_image: '',
      shop_id: '',
    });
    setActiveTab('basic');
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
        sku: formData.sku || null,
        slug: formData.slug || generateSlug(formData.name),
        category: formData.category || null,
        brand: formData.brand || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        description: formData.short_description || null,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        track_inventory: formData.track_inventory,
        current_stock: parseInt(formData.current_stock) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        stock_unit: formData.stock_unit,
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="gap-2">
                <Package className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2">
                <Warehouse className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
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
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Premium Watch"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU / Code</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="PRD-001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="premium-watch"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Electronics"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Apple"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="watch, premium, gift"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Brief product description..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="long_description">Long Description</Label>
                  <Textarea
                    id="long_description"
                    value={formData.long_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                    placeholder="Detailed product description..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cost_price">Cost Price (Internal)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Your purchase price</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Selling Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Customer-facing price</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discount_price">Discount Price</Label>
                    <Input
                      id="discount_price"
                      type="number"
                      value={formData.discount_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount_percentage">Discount %</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                      placeholder="0"
                      max="100"
                    />
                  </div>
                </div>

                {formData.cost_price && formData.price && (
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm font-medium">Profit Margin</p>
                    <p className="text-2xl font-bold text-primary">
                      ৳{(parseFloat(formData.price) - parseFloat(formData.cost_price)).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((parseFloat(formData.price) - parseFloat(formData.cost_price)) / parseFloat(formData.price) * 100).toFixed(1)}% margin
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label htmlFor="track_inventory">Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable stock tracking and low stock alerts
                    </p>
                  </div>
                  <Switch
                    id="track_inventory"
                    checked={formData.track_inventory}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, track_inventory: checked }))}
                  />
                </div>

                {formData.track_inventory && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current_stock">Current Stock</Label>
                        <Input
                          id="current_stock"
                          type="number"
                          value={formData.current_stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, current_stock: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="stock_unit">Stock Unit</Label>
                      <Select 
                        value={formData.stock_unit} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, stock_unit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="main_image">Main Image URL</Label>
                  <Input
                    id="main_image"
                    value={formData.main_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, main_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to your product image
                  </p>
                </div>

                {formData.main_image && (
                  <div className="aspect-square max-w-[200px] rounded-lg border overflow-hidden">
                    <img 
                      src={formData.main_image} 
                      alt="Product preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}

                <div className="p-4 rounded-lg border border-dashed text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Gallery upload coming soon
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
