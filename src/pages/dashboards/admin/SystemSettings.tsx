import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, FileText, Wrench, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemSetting {
  id: string;
  key: string;
  value: { enabled: boolean };
  description: string;
}

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
        value: item.value as { enabled: boolean },
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
      const newValue = { enabled: !setting.value.enabled };

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
      
      toast.success(`${setting.description} ${newValue.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const getSettingIcon = (key: string) => {
    switch (key) {
      case 'unlimited_pages':
        return FileText;
      case 'maintenance_mode':
        return Wrench;
      default:
        return Settings;
    }
  };

  const getSettingTitle = (key: string) => {
    switch (key) {
      case 'unlimited_pages':
        return 'Allow Developers to create unlimited pages';
      case 'maintenance_mode':
        return 'System Maintenance Mode';
      default:
        return key;
    }
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Global platform configurations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No settings configured</p>
          ) : (
            settings.map((setting) => {
              const Icon = getSettingIcon(setting.key);
              return (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor={setting.key} className="text-base font-medium">
                        {getSettingTitle(setting.key)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={setting.key}
                    checked={setting.value.enabled}
                    onCheckedChange={() => handleToggle(setting)}
                    disabled={updating === setting.key}
                  />
                </div>
              );
            })
          )}

          {/* Placeholder for future settings */}
          <div className="border-t pt-6 mt-6">
            <h3 className="font-medium mb-4 text-muted-foreground">Coming Soon</h3>
            <div className="space-y-4 opacity-50">
              <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Configure system-wide email settings</p>
                  </div>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">API Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Control API usage limits per tenant</p>
                  </div>
                </div>
                <Switch disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
