import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Code, FileText, ShoppingCart, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalDevelopers: number;
  activeDevelopers: number;
  totalShopOwners: number;
  totalLandingPages: number;
  totalOrders: number;
}

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  user_email?: string;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalDevelopers: 0,
    activeDevelopers: 0,
    totalShopOwners: 0,
    totalLandingPages: 0,
    totalOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [rolesRes, pagesRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('user_roles').select('role, user_id'),
        supabase.from('landing_pages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('user_id, status'),
      ]);

      const developers = rolesRes.data?.filter(r => r.role === 'developer') || [];
      const shopOwners = rolesRes.data?.filter(r => r.role === 'shop_owner') || [];
      
      // Count active developers
      const developerUserIds = developers.map(d => d.user_id);
      const activeDevs = profilesRes.data?.filter(
        p => developerUserIds.includes(p.user_id) && p.status === 'active'
      ).length || 0;

      setStats({
        totalDevelopers: developers.length,
        activeDevelopers: activeDevs,
        totalShopOwners: shopOwners.length,
        totalLandingPages: pagesRes.count || 0,
        totalOrders: ordersRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: logs } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logs && logs.length > 0) {
        // Fetch user emails for the logs
        const userIds = [...new Set(logs.filter(l => l.user_id).map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
        
        setRecentActivity(logs.map(log => ({
          ...log,
          user_email: log.user_id ? emailMap.get(log.user_id) : undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon }: { 
    title: string; 
    value: number | string; 
    subtitle?: string;
    icon: any;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create')) return 'default';
    if (action.includes('update')) return 'secondary';
    if (action.includes('delete')) return 'destructive';
    if (action.includes('login')) return 'outline';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Developers"
          value={stats.totalDevelopers}
          subtitle={`${stats.activeDevelopers} active`}
          icon={Code}
        />
        <StatCard
          title="Shop Owners"
          value={stats.totalShopOwners}
          subtitle="Across all developers"
          icon={Users}
        />
        <StatCard
          title="Landing Pages"
          value={stats.totalLandingPages}
          subtitle="System-wide"
          icon={FileText}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="Global volume"
          icon={ShoppingCart}
        />
        <StatCard
          title="Active Sessions"
          value="-"
          subtitle="Coming soon"
          icon={Activity}
        />
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 10 entries from the global audit log</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionBadgeVariant(entry.action)}>
                        {entry.action}
                      </Badge>
                      <span className="text-sm font-medium">{entry.entity_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.user_email || 'System'} • {entry.details?.message || `${entry.action} on ${entry.entity_type}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
