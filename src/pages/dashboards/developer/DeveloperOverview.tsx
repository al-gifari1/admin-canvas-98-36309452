import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Package, ShoppingCart, Loader2 } from 'lucide-react';

interface Stats {
  clients: number;
  landingPages: number;
  products: number;
  orders: number;
}

export function DeveloperOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    clients: 0,
    landingPages: 0,
    products: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get clients (shop owners assigned to this developer)
      const { count: clientsCount } = await supabase
        .from('developer_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', user.id);

      // Get shops for this developer's clients
      const { data: assignments } = await supabase
        .from('developer_assignments')
        .select('shop_owner_id')
        .eq('developer_id', user.id);

      const shopOwnerIds = assignments?.map(a => a.shop_owner_id) || [];

      let landingPagesCount = 0;
      let productsCount = 0;
      let ordersCount = 0;

      if (shopOwnerIds.length > 0) {
        // Get shops owned by these shop owners
        const { data: shops } = await supabase
          .from('shops')
          .select('id')
          .in('owner_id', shopOwnerIds);

        const shopIds = shops?.map(s => s.id) || [];

        if (shopIds.length > 0) {
          // Get landing pages count
          const { count: lpCount } = await supabase
            .from('landing_pages')
            .select('*', { count: 'exact', head: true })
            .in('shop_id', shopIds);
          landingPagesCount = lpCount || 0;

          // Get products count
          const { count: prodCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .in('shop_id', shopIds);
          productsCount = prodCount || 0;

          // Get orders count
          const { count: ordCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('shop_id', shopIds);
          ordersCount = ordCount || 0;
        }
      }

      setStats({
        clients: clientsCount || 0,
        landingPages: landingPagesCount,
        products: productsCount,
        orders: ordersCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clients"
          value={stats.clients}
          description="Shop owners you manage"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Landing Pages"
          value={stats.landingPages}
          description="Total pages created"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Products"
          value={stats.products}
          description="Products configured"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Orders"
          value={stats.orders}
          description="Total orders received"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon }: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
