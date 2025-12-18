import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_ROUTES } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';

export default function NotAuthorized() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (role) {
      navigate(ROLE_ROUTES[role]);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Access Denied</h1>
        <p className="mb-6 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button onClick={handleGoToDashboard} className="gap-2">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
