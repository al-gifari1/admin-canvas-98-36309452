import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Package, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  product_type: string;
  gallery_images: string[];
  download_url: string | null;
  weight: number | null;
  is_active: boolean;
  version: number;
  shop_id: string;
  shop_name: string;
  created_at: string;
}

export function GlobalProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch all shops for filter
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');

      setShops(shopsData || []);

      if (!productsData || productsData.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const shopNameMap = new Map(shopsData?.map(s => [s.id, s.name]) || []);

      const productList: Product[] = productsData.map(p => ({
        ...p,
        gallery_images: (p.gallery_images as string[]) || [],
        shop_name: shopNameMap.get(p.shop_id) || 'Unknown Shop',
      }));

      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesShop = filterShop === 'all' || product.shop_id === filterShop;
    const matchesType = filterType === 'all' || product.product_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? product.is_active : !product.is_active);

    return matchesSearch && matchesShop && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Global Products</CardTitle>
              <CardDescription>View all products across all shops (read-only)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, shop, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredProducts.length} products
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterShop} onValueChange={setFilterShop}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {(filterShop !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterShop('all');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterShop !== 'all' || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No products found matching your filters' 
                : 'No products yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {product.gallery_images && product.gallery_images.length > 0 ? (
                            <img 
                              src={product.gallery_images[0]} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">v{product.version}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.shop_name}</TableCell>
                    <TableCell>
                      <Badge variant={product.product_type === 'digital' ? 'default' : 'secondary'}>
                        {product.product_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'outline'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(product.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Gallery */}
              {selectedProduct.gallery_images && selectedProduct.gallery_images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.gallery_images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-md overflow-hidden bg-muted">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Shop</p>
                  <p className="font-medium">{selectedProduct.shop_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={selectedProduct.product_type === 'digital' ? 'default' : 'secondary'}>
                    {selectedProduct.product_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedProduct.is_active ? 'default' : 'outline'}>
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {selectedProduct.weight && (
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{selectedProduct.weight} kg</p>
                  </div>
                )}
                {selectedProduct.download_url && (
                  <div>
                    <p className="text-sm text-muted-foreground">Download URL</p>
                    <p className="font-medium text-xs break-all">{selectedProduct.download_url}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedProduct.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">v{selectedProduct.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(selectedProduct.created_at), 'PPpp')}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
