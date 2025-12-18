import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Calendar, User } from 'lucide-react';

interface ShopData {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  owner_name?: string;
}

interface ShopsListProps {
  onUpdate: () => void;
}

export function ShopsList({ onUpdate }: ShopsListProps) {
  const { user } = useAuth();
  const [shops, setShops] = useState<ShopData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, [user]);

  const fetchShops = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch shops
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (shopsError) throw shopsError;

      // Get owner names from profiles
      const ownerIds = [...new Set(shopsData?.map(s => s.owner_id) || [])];
      
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', ownerIds);

        const shopsWithOwners = shopsData?.map(shop => ({
          ...shop,
          owner_name: profiles?.find(p => p.user_id === shop.owner_id)?.full_name || 
                      profiles?.find(p => p.user_id === shop.owner_id)?.email || 
                      'Unknown',
        })) || [];

        setShops(shopsWithOwners);
      } else {
        setShops(shopsData || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No shops found. Shops are created when you add a Shop Owner.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <Card key={shop.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{shop.name}</h3>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              {shop.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {shop.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {shop.owner_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(shop.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
