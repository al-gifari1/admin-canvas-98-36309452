import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, StatCard } from '@/components/dashboard/DashboardLayout';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';
import { Users, Package, ClipboardList, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShopOwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    orderManagers: 0,
  });
  const [shop, setShop] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchShopAndStats();
    }
  }, [user]);

  const fetchShopAndStats = async () => {
    if (!user) return;

    try {
      // Fetch shop owned by this user
      const { data: shopData } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (shopData) {
        setShop(shopData);

        // Fetch staff assigned to this shop
        const { data: assignments } = await supabase
          .from('shop_assignments')
          .select('user_id')
          .eq('shop_id', shopData.id);

        if (assignments) {
          const userIds = assignments.map(a => a.user_id);
          
          if (userIds.length > 0) {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .in('user_id', userIds);

            const employees = roles?.filter(r => r.role === 'employee').length || 0;
            const orderManagers = roles?.filter(r => r.role === 'order_manager').length || 0;

            setStats({ employees, orderManagers });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Shop Panel" 
      description={shop ? `Managing: ${shop.name}` : 'Loading...'}
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Order Managers"
          value={stats.orderManagers}
          description="Managing orders"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          title="Employees"
          value={stats.employees}
          description="Shop staff"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Shop Info */}
      {shop && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {shop.name}
            </CardTitle>
            <CardDescription>Your assigned shop</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Staff Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Staff Management</h2>
          <CreateUserDialog onUserCreated={fetchShopAndStats} shopId={shop?.id} />
        </div>
        <UsersList onUpdate={fetchShopAndStats} />
      </div>
    </DashboardLayout>
  );
}
