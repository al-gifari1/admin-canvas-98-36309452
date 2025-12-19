import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  XCircle,
  Plus,
  Minus,
  ArrowRightLeft,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  main_image: string | null;
  current_stock: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  shop_id: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  source: string | null;
  supplier: string | null;
  invoice_no: string | null;
  notes: string | null;
  created_at: string;
  done_by: string;
  product?: { name: string; main_image: string | null };
}

export function DeveloperStockInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [stockForm, setStockForm] = useState({
    quantity: '',
    cost_price: '',
    supplier: '',
    invoice_no: '',
    notes: '',
  });
  const [adjustForm, setAdjustForm] = useState({
    new_stock: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch products with inventory tracking
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, main_image, current_stock, low_stock_threshold, track_inventory, shop_id')
        .eq('track_inventory', true)
        .order('current_stock', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch stock movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, main_image)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (movementsError) throw movementsError;
      setMovements(movementsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !stockForm.quantity) {
      toast.error('Please select a product and enter quantity');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const quantity = parseInt(stockForm.quantity);
    const newStock = product.current_stock + quantity;

    try {
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', selectedProduct);

      if (updateError) throw updateError;

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct,
          shop_id: product.shop_id,
          type: 'purchase',
          quantity: quantity,
          previous_stock: product.current_stock,
          new_stock: newStock,
          source: 'manual',
          supplier: stockForm.supplier || null,
          invoice_no: stockForm.invoice_no || null,
          cost_price: stockForm.cost_price ? parseFloat(stockForm.cost_price) : null,
          notes: stockForm.notes || null,
          done_by: user?.id,
        });

      if (movementError) throw movementError;

      toast.success('Stock added successfully');
      setAddStockOpen(false);
      setStockForm({ quantity: '', cost_price: '', supplier: '', invoice_no: '', notes: '' });
      setSelectedProduct('');
      fetchData();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjustForm.new_stock) {
      toast.error('Please select a product and enter new stock');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newStock = parseInt(adjustForm.new_stock);
    const quantity = newStock - product.current_stock;

    try {
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', selectedProduct);

      if (updateError) throw updateError;

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct,
          shop_id: product.shop_id,
          type: 'adjustment',
          quantity: quantity,
          previous_stock: product.current_stock,
          new_stock: newStock,
          source: adjustForm.reason || 'manual',
          notes: adjustForm.notes || null,
          done_by: user?.id,
        });

      if (movementError) throw movementError;

      toast.success('Stock adjusted successfully');
      setAdjustStockOpen(false);
      setAdjustForm({ new_stock: '', reason: '', notes: '' });
      setSelectedProduct('');
      fetchData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.current_stock, 0);
  const lowStockCount = products.filter(p => p.current_stock > 0 && p.current_stock <= p.low_stock_threshold).length;
  const outOfStockCount = products.filter(p => p.current_stock === 0).length;

  const getMovementBadge = (type: string, quantity: number) => {
    switch (type) {
      case 'purchase':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Purchase</Badge>;
      case 'sale':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Sale</Badge>;
      case 'adjustment':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Adjustment</Badge>;
      case 'return':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Return</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stock & Inventory</h2>
          <p className="text-muted-foreground">
            Track inventory levels and stock movements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAdjustStockOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
          <Button onClick={() => setAddStockOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">With inventory tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Products need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Products unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              These products are running low and may need restocking soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {products
                .filter(p => p.current_stock > 0 && p.current_stock <= p.low_stock_threshold)
                .map(product => (
                  <Badge key={product.id} variant="outline" className="border-amber-500/50">
                    {product.name} ({product.current_stock} left)
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Stock Movements
          </CardTitle>
          <CardDescription>
            Track all inventory changes and their sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No movements yet</h3>
              <p className="text-muted-foreground">
                Stock movements will appear here when you add or adjust inventory
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-center">Stock Change</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(movement.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                            {movement.product?.main_image ? (
                              <img 
                                src={movement.product.main_image} 
                                alt={movement.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{movement.product?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMovementBadge(movement.type, movement.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={movement.quantity >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                          {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">{movement.previous_stock}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{movement.new_stock}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.source || 'Manual'}
                        {movement.supplier && ` • ${movement.supplier}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Dialog */}
      <Dialog open={addStockOpen} onOpenChange={setAddStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock (Purchase Entry)</DialogTitle>
            <DialogDescription>
              Record new inventory received from supplier
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="grid gap-2">
              <Label>Product *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Current: {product.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  value={stockForm.cost_price}
                  onChange={(e) => setStockForm(prev => ({ ...prev, cost_price: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={stockForm.supplier}
                  onChange={(e) => setStockForm(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice_no">Invoice No</Label>
                <Input
                  id="invoice_no"
                  value={stockForm.invoice_no}
                  onChange={(e) => setStockForm(prev => ({ ...prev, invoice_no: e.target.value }))}
                  placeholder="INV-001"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={stockForm.notes}
                onChange={(e) => setStockForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddStockOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Correct inventory for damage, loss, or manual count
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="grid gap-2">
              <Label>Product *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Current: {product.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new_stock">New Stock Quantity *</Label>
              <Input
                id="new_stock"
                type="number"
                value={adjustForm.new_stock}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, new_stock: e.target.value }))}
                placeholder="0"
                min="0"
                required
              />
              {selectedProduct && adjustForm.new_stock && (
                <p className="text-sm text-muted-foreground">
                  Change: {parseInt(adjustForm.new_stock) - (products.find(p => p.id === selectedProduct)?.current_stock || 0)} units
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Select 
                value={adjustForm.reason} 
                onValueChange={(value) => setAdjustForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="manual_count">Manual Count</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjust_notes">Notes</Label>
              <Textarea
                id="adjust_notes"
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Explain the adjustment..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAdjustStockOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
