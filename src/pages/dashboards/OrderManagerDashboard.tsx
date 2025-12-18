import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, StatCard } from '@/components/dashboard/DashboardLayout';
import { Package, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderManagerDashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignedShop();
    }
  }, [user]);

  const fetchAssignedShop = async () => {
    if (!user) return;

    try {
      const { data: assignment } = await supabase
        .from('shop_assignments')
        .select('shop_id')
        .eq('user_id', user.id)
        .single();

      if (assignment) {
        const { data: shopData } = await supabase
          .from('shops')
          .select('id, name')
          .eq('id', assignment.shop_id)
          .single();

        if (shopData) {
          setShop(shopData);
        }
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  };

  return (
    <DashboardLayout 
      title="Orders Dashboard" 
      description={shop ? `Managing orders for: ${shop.name}` : 'Loading...'}
    >
      {/* Stats Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Pending Orders"
          value={0}
          description="Awaiting processing"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Processing"
          value={0}
          description="Being prepared"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Today"
          value={0}
          description="Orders fulfilled"
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Orders List Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Orders
          </CardTitle>
          <CardDescription>Manage and process customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No orders to display. Order management features coming soon.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
