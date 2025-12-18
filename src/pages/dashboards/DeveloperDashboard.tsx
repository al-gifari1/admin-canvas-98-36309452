import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DeveloperSidebar } from '@/components/developer/DeveloperSidebar';
import { DeveloperOverview } from './developer/DeveloperOverview';
import { DeveloperClients } from './developer/DeveloperClients';
import { DeveloperLandingPages } from './developer/DeveloperLandingPages';
import { DeveloperProducts } from './developer/DeveloperProducts';
import { DeveloperTracking } from './developer/DeveloperTracking';
import { DeveloperCheckout } from './developer/DeveloperCheckout';
import { DeveloperReports } from './developer/DeveloperReports';

export default function DeveloperDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpdate = () => {
    // Trigger refresh when data changes
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DeveloperOverview />;
      case 'clients':
        return <DeveloperClients onUpdate={handleUpdate} />;
      case 'landing-pages':
        return <DeveloperLandingPages />;
      case 'products':
        return <DeveloperProducts />;
      case 'tracking':
        return <DeveloperTracking />;
      case 'checkout':
        return <DeveloperCheckout />;
      case 'reports':
        return <DeveloperReports />;
      default:
        return <DeveloperOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DeveloperSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
