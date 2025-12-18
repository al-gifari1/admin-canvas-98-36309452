import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';

interface DeveloperClientsProps {
  onUpdate: () => void;
}

export function DeveloperClients({ onUpdate }: DeveloperClientsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your shop owner clients
          </p>
        </div>
        <CreateUserDialog onUserCreated={onUpdate} />
      </div>
      <UsersList onUpdate={onUpdate} filterRole="shop_owner" />
    </div>
  );
}
