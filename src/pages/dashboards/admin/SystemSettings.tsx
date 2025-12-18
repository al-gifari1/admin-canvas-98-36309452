import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings, FileText, Wrench, AlertCircle, Shield, Bell, Users, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemSetting {
  id: string;
  key: string;
  value: { enabled: boolean; limit?: number; hours?: number };
  description: string;
}

type SettingCategory = {
  title: string;
  description: string;
  icon: React.ElementType;
  keys: string[];
};

const SETTING_CATEGORIES: SettingCategory[] = [
  {
    title: 'Platform Control',
    description: 'Core platform settings',
    icon: Settings,
    keys: ['maintenance_mode', 'new_registrations_enabled', 'public_landing_pages'],
  },
  {
    title: 'Developer Limits',
    description: 'Resource limits for developers',
    icon: Users,
    keys: ['unlimited_pages', 'max_shops_per_developer', 'max_products_per_shop'],
  },
  {
    title: 'Order Settings',
    description: 'Order processing configuration',
    icon: ShoppingCart,
    keys: ['auto_confirm_orders', 'allow_cod_payment', 'allow_online_payment'],
  },
  {
    title: 'Security',
    description: 'Security and authentication',
    icon: Shield,
    keys: ['force_password_change', 'session_timeout_hours'],
  },
  {
    title: 'Notifications',
    description: 'Notification preferences',
    icon: Bell,
    keys: ['email_notifications', 'order_notifications'],
  },
];

const SETTING_TITLES: Record<string, string> = {
  maintenance_mode: 'Maintenance Mode',
  new_registrations_enabled: 'Allow New Registrations',
  public_landing_pages: 'Public Landing Pages',
  unlimited_pages: 'Unlimited Pages for Developers',
  max_shops_per_developer: 'Max Shops per Developer',
  max_products_per_shop: 'Max Products per Shop',
  auto_confirm_orders: 'Auto Confirm Orders',
  allow_cod_payment: 'Allow COD Payment',
  allow_online_payment: 'Allow Online Payment',
  force_password_change: 'Force Password Change',
  session_timeout_hours: 'Session Timeout',
  email_notifications: 'Email Notifications',
  order_notifications: 'Order Notifications',
};

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      setSettings((data || []).map(item => ({
        ...item,
        value: item.value as { enabled: boolean; limit?: number; hours?: number },
        description: item.description || '',
      })));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (setting: SystemSetting) => {
    setUpdating(setting.key);
    try {
      const { data: session } = await supabase.auth.getSession();
      const newValue = { ...setting.value, enabled: !setting.value.enabled };

      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: newValue,
          updated_by: session.session?.user.id 
        })
        .eq('key', setting.key);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => 
          s.key === setting.key ? { ...s, value: newValue } : s
        )
      );
      
      toast.success(`${SETTING_TITLES[setting.key] || setting.key} ${newValue.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const handleLimitChange = async (setting: SystemSetting, field: 'limit' | 'hours', value: number) => {
    setUpdating(setting.key);
    try {
      const { data: session } = await supabase.auth.getSession();
      const newValue = { ...setting.value, [field]: value };

      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: newValue,
          updated_by: session.session?.user.id 
        })
        .eq('key', setting.key);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => 
          s.key === setting.key ? { ...s, value: newValue } : s
        )
      );
      
      toast.success(`${SETTING_TITLES[setting.key] || setting.key} updated`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const getSettingsByCategory = (keys: string[]) => {
    return settings.filter(s => keys.includes(s.key));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const maintenanceMode = settings.find(s => s.key === 'maintenance_mode');

  return (
    <div className="space-y-6">
      {maintenanceMode?.value.enabled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Maintenance mode is currently enabled. Regular users may experience limited access.
          </AlertDescription>
        </Alert>
      )}

      {SETTING_CATEGORIES.map((category) => {
        const categorySettings = getSettingsByCategory(category.keys);
        if (categorySettings.length === 0) return null;

        const Icon = category.icon;
        return (
          <Card key={category.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <Label htmlFor={setting.key} className="text-base font-medium">
                      {SETTING_TITLES[setting.key] || setting.key}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                    {setting.value.limit !== undefined && setting.value.enabled && (
                      <div className="mt-2 flex items-center gap-2">
                        <Label className="text-sm">Limit:</Label>
                        <Input
                          type="number"
                          value={setting.value.limit}
                          onChange={(e) => handleLimitChange(setting, 'limit', parseInt(e.target.value) || 0)}
                          className="w-24 h-8"
                          min={1}
                        />
                      </div>
                    )}
                    {setting.value.hours !== undefined && setting.value.enabled && (
                      <div className="mt-2 flex items-center gap-2">
                        <Label className="text-sm">Hours:</Label>
                        <Input
                          type="number"
                          value={setting.value.hours}
                          onChange={(e) => handleLimitChange(setting, 'hours', parseInt(e.target.value) || 1)}
                          className="w-24 h-8"
                          min={1}
                        />
                      </div>
                    )}
                  </div>
                  <Switch
                    id={setting.key}
                    checked={setting.value.enabled}
                    onCheckedChange={() => handleToggle(setting)}
                    disabled={updating === setting.key}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}