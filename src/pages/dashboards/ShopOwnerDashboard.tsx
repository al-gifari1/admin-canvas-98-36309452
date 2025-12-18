import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ShopOwnerSidebar } from '@/components/shopowner/ShopOwnerSidebar';
import { ShopOwnerOverview } from './shopowner/ShopOwnerOverview';
import { ShopOwnerLandingPages } from './shopowner/ShopOwnerLandingPages';
import { ShopOwnerOrders } from './shopowner/ShopOwnerOrders';
import { ShopOwnerAnalytics } from './shopowner/ShopOwnerAnalytics';
import { ShopOwnerStaff } from './shopowner/ShopOwnerStaff';
import { ShopOwnerSettings } from './shopowner/ShopOwnerSettings';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function ShopOwnerDashboard() {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [shop, setShop] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchShop();
    }
  }, [user]);

  const fetchShop = async () => {
    if (!user) return;

    try {
      const { data: shopData } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (shopData) {
        setShop(shopData);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ShopOwnerOverview shop={shop} />;
      case 'landing-pages':
        return <ShopOwnerLandingPages shop={shop} />;
      case 'orders':
        return <ShopOwnerOrders shop={shop} />;
      case 'analytics':
        return <ShopOwnerAnalytics shop={shop} />;
      case 'staff':
        return <ShopOwnerStaff shop={shop} onUpdate={fetchShop} />;
      case 'settings':
        return <ShopOwnerSettings shop={shop} />;
      default:
        return <ShopOwnerOverview shop={shop} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ShopOwnerSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Shop Panel</h1>
                <p className="text-muted-foreground">
                  {shop ? shop.name : 'Loading...'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
}
