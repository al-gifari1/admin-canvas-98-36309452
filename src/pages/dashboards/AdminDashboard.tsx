import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminOverview } from './admin/AdminOverview';
import { DeveloperManagement } from './admin/DeveloperManagement';
import { GlobalUsers } from './admin/GlobalUsers';
import { GlobalProducts } from './admin/GlobalProducts';
import { GlobalLandingPages } from './admin/GlobalLandingPages';
import { GlobalOrders } from './admin/GlobalOrders';
import { SystemSettings } from './admin/SystemSettings';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const tabTitles: Record<string, string> = {
  overview: 'Overview',
  developers: 'Developer Management',
  users: 'Global Users',
  products: 'Products',
  'landing-pages': 'Landing Pages',
  orders: 'Orders',
  settings: 'System Settings',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'developers':
        return <DeveloperManagement />;
      case 'users':
        return <GlobalUsers />;
      case 'products':
        return <GlobalProducts />;
      case 'landing-pages':
        return <GlobalLandingPages />;
      case 'orders':
        return <GlobalOrders />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{tabTitles[activeTab]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
