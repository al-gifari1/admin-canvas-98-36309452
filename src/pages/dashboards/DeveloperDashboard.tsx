import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, StatCard } from '@/components/dashboard/DashboardLayout';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';
import { ShopsList } from '@/components/shops/ShopsList';
import { Users, Building2, Store } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    shopOwners: 0,
    shops: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [assignmentsRes, shopsRes] = await Promise.all([
        supabase.from('developer_assignments').select('*', { count: 'exact', head: true })
          .eq('developer_id', user.id),
        supabase.from('shops').select('*', { count: 'exact', head: true })
          .eq('created_by', user.id),
      ]);

      setStats({
        shopOwners: assignmentsRes.count || 0,
        shops: shopsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Developer Console" 
      description="Manage your shop owners and their shops"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Shop Owners"
          value={stats.shopOwners}
          description="Created by you"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Shops"
          value={stats.shops}
          description="Total shops created"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Shop Owners</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shop Owners</h2>
            <CreateUserDialog onUserCreated={fetchStats} />
          </div>
          <UsersList onUpdate={fetchStats} filterRole="shop_owner" />
        </TabsContent>
        
        <TabsContent value="shops" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shops</h2>
          </div>
          <ShopsList onUpdate={fetchStats} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
