import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  ShoppingCart, 
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
import { AdminOverview } from './admin/AdminOverview';
import { DeveloperManagement } from './admin/DeveloperManagement';
import { GlobalUsers } from './admin/GlobalUsers';
import { GlobalOrders } from './admin/GlobalOrders';
import { SystemSettings } from './admin/SystemSettings';
import { ROLE_LABELS } from '@/types/roles';

export default function AdminDashboard() {
  const { user, role, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Global platform management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{role && ROLE_LABELS[role]}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="developers" className="gap-2">
              <Users className="h-4 w-4 hidden sm:block" />
              Developers
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Globe className="h-4 w-4 hidden sm:block" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4 hidden sm:block" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4 hidden sm:block" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="developers">
            <DeveloperManagement />
          </TabsContent>

          <TabsContent value="users">
            <GlobalUsers />
          </TabsContent>

          <TabsContent value="orders">
            <GlobalOrders />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
