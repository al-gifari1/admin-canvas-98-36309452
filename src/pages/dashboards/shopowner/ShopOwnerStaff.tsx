import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UsersList } from '@/components/users/UsersList';

interface ShopOwnerStaffProps {
  shop: { id: string; name: string } | null;
  onUpdate: () => void;
}

export function ShopOwnerStaff({ shop, onUpdate }: ShopOwnerStaffProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Manage your order managers and employees</p>
        </div>
        <CreateUserDialog onUserCreated={onUpdate} shopId={shop?.id} />
      </div>
      <UsersList onUpdate={onUpdate} />
    </div>
  );
}
