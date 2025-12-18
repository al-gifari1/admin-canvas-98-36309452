import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, FileText, ShoppingCart, Store } from 'lucide-react';

interface ShopOwnerOverviewProps {
  shop: { id: string; name: string } | null;
}

export function ShopOwnerOverview({ shop }: ShopOwnerOverviewProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    orderManagers: 0,
    landingPages: 0,
    orders: 0,
  });

  useEffect(() => {
    if (user && shop) {
      fetchStats();
    }
  }, [user, shop]);

  const fetchStats = async () => {
    if (!shop) return;

    try {
      // Fetch staff counts
      const { data: assignments } = await supabase
        .from('shop_assignments')
        .select('user_id')
        .eq('shop_id', shop.id);

      if (assignments && assignments.length > 0) {
        const userIds = assignments.map(a => a.user_id);
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .in('user_id', userIds);

        const employees = roles?.filter(r => r.role === 'employee').length || 0;
        const orderManagers = roles?.filter(r => r.role === 'order_manager').length || 0;

        setStats(prev => ({ ...prev, employees, orderManagers }));
      }

      // Fetch landing pages count
      const { count: landingPagesCount } = await supabase
        .from('landing_pages')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shop.id);

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shop.id);

      setStats(prev => ({
        ...prev,
        landingPages: landingPagesCount || 0,
        orders: ordersCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shop Info */}
      {shop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {shop.name}
            </CardTitle>
            <CardDescription>Your shop dashboard</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Landing Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.landingPages}</div>
            <p className="text-xs text-muted-foreground">Active pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Managers</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderManagers}</div>
            <p className="text-xs text-muted-foreground">Managing orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees}</div>
            <p className="text-xs text-muted-foreground">Shop staff</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
