import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, StatCard } from '@/components/dashboard/DashboardLayout';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';
import { Users, Building2, Code, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    developers: 0,
    shopOwners: 0,
    shops: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, rolesRes, shopsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role'),
        supabase.from('shops').select('*', { count: 'exact', head: true }),
      ]);

      const developers = rolesRes.data?.filter(r => r.role === 'developer').length || 0;
      const shopOwners = rolesRes.data?.filter(r => r.role === 'shop_owner').length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        developers,
        shopOwners,
        shops: shopsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Super Admin Dashboard" 
      description="Global system overview and management"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Developers"
          value={stats.developers}
          description="Active developers"
          icon={<Code className="h-4 w-4" />}
        />
        <StatCard
          title="Shop Owners"
          value={stats.shopOwners}
          description="Registered shop owners"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Shops"
          value={stats.shops}
          description="Total shops"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* User Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">User Management</h2>
          <CreateUserDialog onUserCreated={fetchStats} />
        </div>
        <UsersList onUpdate={fetchStats} />
      </div>
    </DashboardLayout>
  );
}
