import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Package, Zap, MapPin, Settings, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CourierConfigDialog, CourierProvider } from '@/components/developer/CourierConfigDialog';

interface Shop {
  id: string;
  name: string;
}

interface CourierConfig {
  id: string;
  shop_id: string;
  provider_name: CourierProvider;
  api_credentials: Record<string, string>;
  is_active: boolean;
  test_mode: boolean;
}

const courierProviders: {
  id: CourierProvider;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'pathao',
    name: 'Pathao',
    description: 'Popular courier service with wide coverage across Bangladesh',
    icon: Truck,
  },
  {
    id: 'redx',
    name: 'Redx',
    description: 'Fast and reliable delivery service with real-time tracking',
    icon: Package,
  },
  {
    id: 'steadfast',
    name: 'Steadfast',
    description: 'Affordable courier with excellent customer support',
    icon: Zap,
  },
  {
    id: 'paperfly',
    name: 'Paperfly',
    description: 'Nationwide logistics with flexible delivery options',
    icon: MapPin,
  },
];

export function DeveloperCourier() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [configs, setConfigs] = useState<CourierConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CourierProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');

      if (error) {
        toast.error('Failed to fetch shops');
        return;
      }

      setShops(data || []);
      if (data && data.length > 0) {
        setSelectedShopId(data[0].id);
      }
      setIsLoading(false);
    };

    fetchShops();
  }, [user]);

  // Fetch courier configs when shop changes
  useEffect(() => {
    const fetchConfigs = async () => {
      if (!selectedShopId) return;

      // Use type assertion since the table was just created and types aren't updated yet
      const { data, error } = await (supabase
        .from('courier_configs' as any)
        .select('*')
        .eq('shop_id', selectedShopId) as any);

      if (error) {
        console.error('Error fetching configs:', error);
        return;
      }

      // Cast the data properly
      const typedConfigs: CourierConfig[] = (data || []).map((config: any) => ({
        id: config.id,
        shop_id: config.shop_id,
        provider_name: config.provider_name as CourierProvider,
        api_credentials: config.api_credentials as Record<string, string>,
        is_active: config.is_active,
        test_mode: config.test_mode,
      }));

      setConfigs(typedConfigs);
    };

    fetchConfigs();
  }, [selectedShopId]);

  const getConfigForProvider = (providerId: CourierProvider) => {
    return configs.find((c) => c.provider_name === providerId);
  };

  const handleConfigure = (providerId: CourierProvider) => {
    setSelectedProvider(providerId);
    setDialogOpen(true);
  };

  const handleSaveConfig = async (config: {
    api_credentials: Record<string, string>;
    is_active: boolean;
    test_mode: boolean;
  }) => {
    if (!selectedShopId || !selectedProvider || !user) return;

    setIsSaving(true);
    try {
      const existingConfig = getConfigForProvider(selectedProvider);

      if (existingConfig) {
        // Update existing
        const { error } = await (supabase
          .from('courier_configs' as any)
          .update({
            api_credentials: config.api_credentials,
            is_active: config.is_active,
            test_mode: config.test_mode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConfig.id) as any);

        if (error) throw error;
        toast.success('Configuration updated successfully');
      } else {
        // Insert new
        const { error } = await (supabase
          .from('courier_configs' as any)
          .insert({
            shop_id: selectedShopId,
            provider_name: selectedProvider,
            api_credentials: config.api_credentials,
            is_active: config.is_active,
            test_mode: config.test_mode,
            created_by: user.id,
          }) as any);

        if (error) throw error;
        toast.success('Configuration saved successfully');
      }

      // Refresh configs
      const { data } = await (supabase
        .from('courier_configs' as any)
        .select('*')
        .eq('shop_id', selectedShopId) as any);

      const typedConfigs: CourierConfig[] = (data || []).map((c: any) => ({
        id: c.id,
        shop_id: c.shop_id,
        provider_name: c.provider_name as CourierProvider,
        api_credentials: c.api_credentials as Record<string, string>,
        is_active: c.is_active,
        test_mode: c.test_mode,
      }));

      setConfigs(typedConfigs);
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courier Management</h1>
          <p className="text-muted-foreground">Configure delivery integrations for your shops</p>
        </div>

        {shops.length > 1 && (
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select shop" />
            </SelectTrigger>
            <SelectContent>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Shops Available</h3>
            <p className="text-muted-foreground text-center">
              Create a shop first to configure courier integrations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courierProviders.map((provider) => {
            const config = getConfigForProvider(provider.id);
            const isConnected = config?.is_active;
            const Icon = provider.icon;

            return (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <Badge
                          variant={isConnected ? 'default' : 'secondary'}
                          className={isConnected ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {isConnected ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not Configured'
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{provider.description}</CardDescription>
                  {config?.test_mode && isConnected && (
                    <Badge variant="outline" className="mb-3">
                      Test Mode
                    </Badge>
                  )}
                  <Button
                    variant={isConnected ? 'outline' : 'default'}
                    className="w-full"
                    onClick={() => handleConfigure(provider.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {isConnected ? 'Update Configuration' : 'Configure'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CourierConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={selectedProvider}
        existingConfig={selectedProvider ? getConfigForProvider(selectedProvider) : null}
        onSave={handleSaveConfig}
        isSaving={isSaving}
      />
    </div>
  );
}
