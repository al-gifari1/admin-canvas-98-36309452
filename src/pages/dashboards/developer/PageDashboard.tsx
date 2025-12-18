import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  ArrowLeft, 
  Paintbrush, 
  ExternalLink, 
  Clock, 
  BarChart3, 
  MousePointerClick,
  Lightbulb,
  Plus,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PageDashboardProps {
  pageId: string;
  onBack: () => void;
  onOpenBuilder: () => void;
}

interface CheckoutConfig {
  delivery_fee: number;
  free_delivery_threshold: number | null;
  free_delivery_message: string;
  allow_all_locations: boolean;
  allowed_cities: string[];
}

interface TrackingProfile {
  id: string;
  name: string;
  facebook_pixel_id: string | null;
  google_tag_manager_id: string | null;
}

export function PageDashboard({ pageId, onBack, onOpenBuilder }: PageDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newProfileDialogOpen, setNewProfileDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newPixelId, setNewPixelId] = useState('');

  // Fetch page data
  const { data: page, isLoading: pageLoading } = useQuery({
    queryKey: ['landing-page', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*, shops(id, name)')
        .eq('id', pageId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch tracking profiles for the shop
  const { data: trackingProfiles } = useQuery({
    queryKey: ['tracking-profiles', page?.shop_id],
    queryFn: async () => {
      if (!page?.shop_id) return [];
      const { data, error } = await supabase
        .from('tracking_profiles')
        .select('id, name, facebook_pixel_id, google_tag_manager_id')
        .eq('shop_id', page.shop_id);
      
      if (error) throw error;
      return data as TrackingProfile[];
    },
    enabled: !!page?.shop_id,
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await supabase
        .from('landing_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page', pageId] });
      toast({ title: 'Changes saved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to save changes', variant: 'destructive' });
    },
  });

  // Create tracking profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!page?.shop_id) throw new Error('No shop assigned');

      const { data, error } = await supabase
        .from('tracking_profiles')
        .insert({
          name: newProfileName,
          facebook_pixel_id: newPixelId || null,
          shop_id: page.shop_id,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-assign to current page
      await supabase
        .from('landing_pages')
        .update({ tracking_profile_id: data.id, updated_at: new Date().toISOString() })
        .eq('id', pageId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-profiles', page?.shop_id] });
      queryClient.invalidateQueries({ queryKey: ['landing-page', pageId] });
      setNewProfileDialogOpen(false);
      setNewProfileName('');
      setNewPixelId('');
      toast({ title: 'Tracking profile created and assigned' });
    },
    onError: () => {
      toast({ title: 'Failed to create tracking profile', variant: 'destructive' });
    },
  });

  // Form state for configuration
  const [configForm, setConfigForm] = useState<Partial<{ title: string; slug: string }>>({});
  const [checkoutForm, setCheckoutForm] = useState<Partial<CheckoutConfig>>({});

  // Initialize forms when page loads
  const defaultCheckoutConfig: CheckoutConfig = {
    delivery_fee: 0,
    free_delivery_threshold: null,
    free_delivery_message: '',
    allow_all_locations: true,
    allowed_cities: [],
  };
  
  const checkoutConfig: CheckoutConfig = page?.checkout_config 
    ? { ...defaultCheckoutConfig, ...(page.checkout_config as unknown as Partial<CheckoutConfig>) }
    : defaultCheckoutConfig;

  // Funnel data (mock - in production would come from analytics)
  const funnelData = [
    { step: 'Page View', value: page?.views_count || 0, fill: 'hsl(var(--primary))' },
    { step: 'Scroll 50%', value: Math.floor((page?.views_count || 0) * 0.65), fill: 'hsl(var(--primary) / 0.8)' },
    { step: 'Add to Cart', value: Math.floor((page?.views_count || 0) * 0.25), fill: 'hsl(var(--primary) / 0.6)' },
    { step: 'Order Placed', value: page?.orders_count || 0, fill: 'hsl(var(--primary) / 0.4)' },
  ];

  const incompleteOrders = funnelData[2].value - funnelData[3].value;
  const conversionRate = page?.views_count ? ((page?.orders_count || 0) / page.views_count * 100).toFixed(2) : '0.00';

  // Smart suggestions based on data
  const getSuggestion = () => {
    const rate = parseFloat(conversionRate);
    if (rate < 2) {
      return {
        type: 'warning',
        message: `Conversion rate is ${conversionRate}%. Consider adding a "Free Delivery" message or urgency elements to improve conversions.`
      };
    }
    if (incompleteOrders > page?.orders_count! * 2) {
      return {
        type: 'info',
        message: `${incompleteOrders} visitors added to cart but didn't complete. Try simplifying your checkout form or adding trust badges.`
      };
    }
    return {
      type: 'success',
      message: 'Your page is performing well! Keep monitoring and A/B testing to maintain growth.'
    };
  };

  const suggestion = getSuggestion();

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Page not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                      Pages
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{page.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={page.is_published ? 'default' : 'secondary'}>
                  {page.is_published ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-sm text-muted-foreground">/{page.slug}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href={`/${page.shops?.name?.toLowerCase().replace(/\s+/g, '-') || 'preview'}/${page.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Page
              </a>
            </Button>
            <Button onClick={onOpenBuilder}>
              <Paintbrush className="mr-2 h-4 w-4" />
              Open Builder
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="insights">Insights & Performance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="checkout">Checkout Logic</TabsTrigger>
        </TabsList>

        {/* Tab A: Insights & Performance */}
        <TabsContent value="insights" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>
                Track visitor journey from page view to purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" width={100} />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{incompleteOrders}</strong> incomplete orders (visitors who added to cart but didn't complete purchase)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Avg. Time on Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2m 30s</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Bounce Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35%</div>
                <p className="text-xs text-muted-foreground">-5% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  Top Clicked Element
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">Float Order Button</div>
                <p className="text-xs text-muted-foreground">150 clicks this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Smart Suggestions */}
          <Card className={`border-l-4 ${
            suggestion.type === 'warning' ? 'border-l-yellow-500' :
            suggestion.type === 'success' ? 'border-l-green-500' : 'border-l-blue-500'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Smart Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{suggestion.message}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab B: Configuration & Tracking */}
        <TabsContent value="configuration" className="space-y-6">
          {/* Tracking Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Profile</CardTitle>
              <CardDescription>
                Assign a tracking profile to capture analytics data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {page.shop_id ? (
                <>
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Select Tracking Profile</Label>
                      <Select
                        value={page.tracking_profile_id || ''}
                        onValueChange={(value) => updatePageMutation.mutate({ tracking_profile_id: value || null })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a profile..." />
                        </SelectTrigger>
                        <SelectContent>
                          {trackingProfiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                              {profile.facebook_pixel_id && ' (FB)'}
                              {profile.google_tag_manager_id && ' (GTM)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog open={newProfileDialogOpen} onOpenChange={setNewProfileDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Tracking Profile</DialogTitle>
                          <DialogDescription>
                            Create a new tracking profile and auto-assign it to this page.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="profile-name">Profile Name</Label>
                            <Input
                              id="profile-name"
                              value={newProfileName}
                              onChange={(e) => setNewProfileName(e.target.value)}
                              placeholder="e.g., Summer Campaign"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pixel-id">Facebook Pixel ID</Label>
                            <Input
                              id="pixel-id"
                              value={newPixelId}
                              onChange={(e) => setNewPixelId(e.target.value)}
                              placeholder="e.g., 123456789012345"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => createProfileMutation.mutate()}
                            disabled={!newProfileName || createProfileMutation.isPending}
                          >
                            {createProfileMutation.isPending ? 'Creating...' : 'Create & Assign'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Assign this page to a client first to configure tracking.
                </p>
              )}
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update page title and URL slug
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  defaultValue={page.title}
                  onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-slug">URL Slug</Label>
                <Input
                  id="page-slug"
                  defaultValue={page.slug}
                  onChange={(e) => setConfigForm({ ...configForm, slug: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => {
                  if (Object.keys(configForm).length > 0) {
                    updatePageMutation.mutate(configForm);
                    setConfigForm({});
                  }
                }}
                disabled={Object.keys(configForm).length === 0 || updatePageMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab C: Checkout Logic */}
        <TabsContent value="checkout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure delivery fees and free delivery thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery-fee">Base Delivery Fee</Label>
                  <Input
                    id="delivery-fee"
                    type="number"
                    defaultValue={checkoutConfig.delivery_fee}
                    onChange={(e) => setCheckoutForm({ 
                      ...checkoutForm, 
                      delivery_fee: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="e.g., 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-threshold">Free Delivery Threshold</Label>
                  <Input
                    id="free-threshold"
                    type="number"
                    defaultValue={checkoutConfig.free_delivery_threshold || ''}
                    onChange={(e) => setCheckoutForm({ 
                      ...checkoutForm, 
                      free_delivery_threshold: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    placeholder="e.g., 2000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="free-message">Free Delivery Message</Label>
                <Input
                  id="free-message"
                  defaultValue={checkoutConfig.free_delivery_message}
                  onChange={(e) => setCheckoutForm({ 
                    ...checkoutForm, 
                    free_delivery_message: e.target.value 
                  })}
                  placeholder="e.g., Congratulations! You get free shipping."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Rules</CardTitle>
              <CardDescription>
                Control which locations can place orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow All Locations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable delivery to all locations
                  </p>
                </div>
                <Switch
                  checked={checkoutForm.allow_all_locations ?? checkoutConfig.allow_all_locations}
                  onCheckedChange={(checked) => setCheckoutForm({ 
                    ...checkoutForm, 
                    allow_all_locations: checked 
                  })}
                />
              </div>
              
              {!(checkoutForm.allow_all_locations ?? checkoutConfig.allow_all_locations) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="allowed-cities">Allowed Cities (comma-separated)</Label>
                    <Input
                      id="allowed-cities"
                      defaultValue={checkoutConfig.allowed_cities.join(', ')}
                      onChange={(e) => setCheckoutForm({ 
                        ...checkoutForm, 
                        allowed_cities: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., Dhaka, Chittagong, Sylhet"
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={() => {
                  if (Object.keys(checkoutForm).length > 0) {
                    const updatedConfig = { ...checkoutConfig, ...checkoutForm };
                    updatePageMutation.mutate({ checkout_config: updatedConfig });
                    setCheckoutForm({});
                  }
                }}
                disabled={Object.keys(checkoutForm).length === 0 || updatePageMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Checkout Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
