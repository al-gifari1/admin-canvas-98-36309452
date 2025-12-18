import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Search, 
  MoreHorizontal,
  LayoutDashboard,
  Pencil,
  Copy,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface LandingPageWithShop {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  views_count: number;
  orders_count: number;
  updated_at: string;
  shop_id: string;
  shop: {
    id: string;
    name: string;
  } | null;
}

interface DeveloperLandingPagesProps {
  onNavigate: (tab: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function DeveloperLandingPages({ onNavigate }: DeveloperLandingPagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch landing pages with shop info
  const { data: landingPages, isLoading } = useQuery({
    queryKey: ['developer-landing-pages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get pages created by this developer (includes unassigned pages)
      const { data: myPages, error: myPagesError } = await supabase
        .from('landing_pages')
        .select('id, title, slug, is_published, views_count, orders_count, updated_at, shop_id')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false });

      if (myPagesError) throw myPagesError;

      // Get shops the developer has access to (for shop name lookup)
      const { data: assignments } = await supabase
        .from('developer_assignments')
        .select('shop_owner_id')
        .eq('developer_id', user.id);

      let shops: { id: string; name: string; owner_id: string }[] = [];
      
      if (assignments && assignments.length > 0) {
        const shopOwnerIds = assignments.map(a => a.shop_owner_id);
        const { data: shopsData } = await supabase
          .from('shops')
          .select('id, name, owner_id')
          .in('owner_id', shopOwnerIds);
        shops = shopsData || [];
      }

      // Map shop info to pages
      const pagesWithShop: LandingPageWithShop[] = (myPages || []).map(page => ({
        ...page,
        views_count: page.views_count || 0,
        orders_count: page.orders_count || 0,
        shop: page.shop_id ? shops.find(s => s.id === page.shop_id) || null : null
      }));

      return pagesWithShop;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-landing-pages'] });
      toast({ title: 'Page deleted successfully' });
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    },
    onError: () => {
      toast({ title: 'Failed to delete page', variant: 'destructive' });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (page: LandingPageWithShop) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('landing_pages')
        .insert({
          title: `${page.title} (Copy)`,
          slug: `${page.slug}-copy-${Date.now()}`,
          shop_id: page.shop_id,
          created_by: user.id,
          is_published: false,
          views_count: 0,
          orders_count: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-landing-pages'] });
      toast({ title: 'Page duplicated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to duplicate page', variant: 'destructive' });
    },
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!landingPages) return { totalPages: 0, totalVisitors: 0, totalSales: 0, avgConvRate: 0 };
    
    const publishedPages = landingPages.filter(p => p.is_published).length;
    const totalVisitors = landingPages.reduce((sum, p) => sum + p.views_count, 0);
    const totalSales = landingPages.reduce((sum, p) => sum + p.orders_count, 0);
    const avgConvRate = totalVisitors > 0 ? (totalSales / totalVisitors) * 100 : 0;

    return {
      totalPages: publishedPages,
      totalVisitors,
      totalSales,
      avgConvRate: avgConvRate.toFixed(2),
    };
  }, [landingPages]);

  // Filter and paginate
  const filteredPages = useMemo(() => {
    if (!landingPages) return [];
    return landingPages.filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.shop?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [landingPages, searchQuery]);

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Published</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  const getConversionRate = (views: number, orders: number) => {
    if (views === 0) return '0.00%';
    return `${((orders / views) * 100).toFixed(2)}%`;
  };

  // Dummy revenue calculation (orders * avg order value)
  const getRevenue = (orders: number) => {
    const avgOrderValue = 49.99; // Dummy value
    return `$${(orders * avgOrderValue).toFixed(2)}`;
  };

  const handleDelete = (pageId: string) => {
    setPageToDelete(pageId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      deleteMutation.mutate(pageToDelete);
    }
  };

  const handleEditDesign = (pageId: string) => {
    onNavigate(`builder:${pageId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Pages</h2>
        <p className="text-muted-foreground">
          Monitor and manage all your landing pages
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalPages}</div>
            <p className="text-xs text-muted-foreground">Published pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conv. Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgConvRate}%</div>
            <p className="text-xs text-muted-foreground">Sales / Visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or client..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Page Info</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No pages found matching your search' : 'No landing pages yet'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPages.map((page) => (
                  <TableRow 
                    key={page.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate(`page-dashboard:${page.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            /{page.slug}
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{page.shop?.name || 'Unassigned'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(page.is_published)}</TableCell>
                    <TableCell className="text-right">{page.views_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{getConversionRate(page.views_count, page.orders_count)}</TableCell>
                    <TableCell className="text-right">{page.orders_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{getRevenue(page.orders_count)}</TableCell>
                    <TableCell>{format(new Date(page.updated_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`page-dashboard:${page.id}`);
                          }}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditDesign(page.id);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Design
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            duplicateMutation.mutate(page);
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(page.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the landing page
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
