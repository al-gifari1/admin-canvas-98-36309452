import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, X, Eye, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  views_count: number;
  orders_count: number;
  created_at: string;
  shop_id: string;
  product_id: string | null;
  shop_name?: string;
  product_name?: string;
  content: any;
}

interface Shop {
  id: string;
  name: string;
}

export function GlobalLandingPages() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    setLoading(true);
    try {
      // Fetch all shops for filter dropdown
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');

      if (shopsData) {
        setShops(shopsData);
      }

      // Fetch all landing pages
      const { data: pagesData, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with shop and product names
      if (pagesData) {
        const enrichedPages = await Promise.all(
          pagesData.map(async (page) => {
            let shop_name = 'Unknown Shop';
            let product_name = null;

            // Get shop name
            const shop = shopsData?.find(s => s.id === page.shop_id);
            if (shop) {
              shop_name = shop.name;
            }

            // Get product name if exists
            if (page.product_id) {
              const { data: productData } = await supabase
                .from('products')
                .select('name')
                .eq('id', page.product_id)
                .single();
              if (productData) {
                product_name = productData.name;
              }
            }

            return {
              ...page,
              shop_name,
              product_name,
            };
          })
        );
        setLandingPages(enrichedPages);
      }
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = useMemo(() => {
    return landingPages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.shop_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesShop = filterShop === 'all' || page.shop_id === filterShop;
      
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && page.is_published) ||
        (filterStatus === 'draft' && !page.is_published);

      return matchesSearch && matchesShop && matchesStatus;
    });
  }, [landingPages, searchTerm, filterShop, filterStatus]);

  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPages.slice(start, start + itemsPerPage);
  }, [filteredPages, currentPage]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterShop('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterShop !== 'all' || filterStatus !== 'all';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Global Landing Pages
          </CardTitle>
          <CardDescription>
            View all landing pages across all shops ({filteredPages.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, slug, or shop..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={filterShop}
              onValueChange={(value) => {
                setFilterShop(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
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

            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading landing pages...</div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? 'No landing pages match your filters' : 'No landing pages found'}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-xs text-muted-foreground">/{page.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>{page.shop_name}</TableCell>
                        <TableCell>
                          {page.product_name || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_published ? 'default' : 'secondary'}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{page.views_count || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{page.orders_count || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(page.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPage(page)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedPage?.title}
            </DialogTitle>
            <DialogDescription>
              Landing page details and statistics
            </DialogDescription>
          </DialogHeader>
          {selectedPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shop</label>
                  <p className="text-sm">{selectedPage.shop_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p className="text-sm">{selectedPage.product_name || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-mono">/{selectedPage.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm">
                    <Badge variant={selectedPage.is_published ? 'default' : 'secondary'}>
                      {selectedPage.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Views</label>
                  <p className="text-sm">{selectedPage.views_count || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Orders</label>
                  <p className="text-sm">{selectedPage.orders_count || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">
                    {format(new Date(selectedPage.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
