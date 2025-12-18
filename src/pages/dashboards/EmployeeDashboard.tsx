import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout, StatCard } from '@/components/dashboard/DashboardLayout';
import { Package, Clock, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeDashboard() {
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
      title="Employee Portal" 
      description={shop ? `Working at: ${shop.name}` : 'Loading...'}
    >
      {/* Stats Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Tasks Today"
          value={0}
          description="Assigned tasks"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Completed"
          value={0}
          description="Tasks done"
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Tasks Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My Tasks
          </CardTitle>
          <CardDescription>Your assigned work items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No tasks assigned. Task management features coming soon.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
