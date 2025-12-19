import { useState } from 'react';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';

interface DeveloperClientsProps {
  onUpdate: () => void;
}

export function DeveloperClients({ onUpdate }: DeveloperClientsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your shop owner clients
          </p>
        </div>
        <CreateUserDialog onUserCreated={handleRefresh} />
      </div>
      <UsersList key={refreshKey} onUpdate={handleRefresh} filterRole="shop_owner" />
    </div>
  );
}
