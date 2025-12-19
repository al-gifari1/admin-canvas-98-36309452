import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Copy, 
  Trash2,
  Package,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateProductDialog } from '@/components/developer/CreateProductDialog';

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
  is_active: boolean;
  current_stock: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  stock_unit: string;
  owner_type: string;
  shop_id: string;
  created_by: string;
  shop?: { name: string };
}

export function DeveloperProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId);

      if (error) throw error;
      
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, is_active: isActive } : p)
      );
      toast.success(`Product ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: `${product.name} (Copy)`,
          sku: product.sku ? `${product.sku}-copy` : null,
          price: product.price,
          cost_price: product.cost_price,
          main_image: product.main_image,
          is_active: false,
          current_stock: 0,
          low_stock_threshold: product.low_stock_threshold,
          track_inventory: product.track_inventory,
          owner_type: product.owner_type,
          shop_id: product.shop_id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      fetchProducts();
      toast.success('Product duplicated');
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Failed to duplicate product');
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.track_inventory) return null;
    if (product.current_stock === 0) return 'out';
    if (product.current_stock <= product.low_stock_threshold) return 'low';
    return 'in';
  };

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product);
    if (!status) return <Badge variant="outline">No Tracking</Badge>;
    
    switch (status) {
      case 'in':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">In Stock ({product.current_stock})</Badge>;
      case 'low':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Low Stock ({product.current_stock})</Badge>;
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>;
    }
  };

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesSku = product.sku?.toLowerCase().includes(query);
      if (!matchesName && !matchesSku) return false;
    }

    // Owner filter
    if (ownerFilter === 'my' && product.created_by !== user?.id) return false;
    if (ownerFilter === 'assigned' && product.created_by === user?.id) return false;

    // Status filter
    if (statusFilter === 'active' && !product.is_active) return false;
    if (statusFilter === 'inactive' && product.is_active) return false;

    // Stock filter
    const stockStatus = getStockStatus(product);
    if (stockFilter === 'in-stock' && stockStatus !== 'in') return false;
    if (stockFilter === 'low-stock' && stockStatus !== 'low') return false;
    if (stockFilter === 'out-of-stock' && stockStatus !== 'out') return false;

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage products for your clients' shops
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="my">My Products</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product List
            <Badge variant="secondary" className="ml-2">
              {filteredProducts.length} products
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0 
                  ? "Get started by adding your first product"
                  : "Try adjusting your filters"}
              </p>
              {products.length === 0 && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                          {product.main_image ? (
                            <img 
                              src={product.main_image} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.owner_type === 'developer' ? 'default' : 'secondary'}>
                          {product.owner_type === 'developer' ? 'My Product' : 'Client'}
                        </Badge>
                        {product.shop && (
                          <p className="text-xs text-muted-foreground mt-1">{product.shop.name}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(product)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">৳{product.price.toLocaleString()}</p>
                        {product.cost_price > 0 && (
                          <p className="text-xs text-muted-foreground">Cost: ৳{product.cost_price.toLocaleString()}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Product Dialog */}
      <CreateProductDialog
        open={createDialogOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingProduct(null);
          }
        }}
        product={editingProduct}
        onSuccess={() => {
          fetchProducts();
          setCreateDialogOpen(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}
