import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  CreditCard,
  MapPin,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateCheckoutProfileDialog } from '@/components/developer/CreateCheckoutProfileDialog';

interface ShippingRule {
  label: string;
  cost: number;
}

interface CheckoutProfile {
  id: string;
  name: string;
  shop_id: string;
  address_enabled: boolean;
  city_enabled: boolean;
  notes_enabled: boolean;
  shipping_rules: ShippingRule[];
  free_shipping_enabled: boolean;
  free_shipping_threshold: number | null;
  shop?: { name: string };
}

export function DeveloperCheckout() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<CheckoutProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CheckoutProfile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('checkout_profiles')
        .select(`
          *,
          shop:shops(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse shipping_rules from JSON
      const parsed = (data || []).map(p => ({
        ...p,
        shipping_rules: (p.shipping_rules as unknown as ShippingRule[]) || []
      }));
      
      setProfiles(parsed);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load checkout profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await supabase
        .from('checkout_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      toast.success('Profile deleted');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const getFieldCount = (profile: CheckoutProfile) => {
    let count = 2; // Name and Phone are always required
    if (profile.address_enabled) count++;
    if (profile.city_enabled) count++;
    if (profile.notes_enabled) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checkout Profiles</h2>
          <p className="text-muted-foreground">
            Configure checkout forms and shipping rules
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout Profiles
            <Badge variant="secondary" className="ml-2">
              {profiles.length} profiles
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No checkout profiles</h3>
              <p className="text-muted-foreground mb-4">
                Create your first checkout profile to configure form fields and shipping
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Profile
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Shipping Rules</TableHead>
                    <TableHead>Free Shipping</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>
                        {profile.shop?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{getFieldCount(profile)} fields</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {profile.shipping_rules.slice(0, 2).map((rule, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {rule.label}: ৳{rule.cost}
                            </Badge>
                          ))}
                          {profile.shipping_rules.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.shipping_rules.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.free_shipping_enabled ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <Truck className="h-3 w-3 mr-1" />
                            Above ৳{profile.free_shipping_threshold}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingProfile(profile)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCheckoutProfileDialog
        open={createDialogOpen || !!editingProfile}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingProfile(null);
          }
        }}
        profile={editingProfile}
        onSuccess={() => {
          fetchProfiles();
          setCreateDialogOpen(false);
          setEditingProfile(null);
        }}
      />
    </div>
  );
}
