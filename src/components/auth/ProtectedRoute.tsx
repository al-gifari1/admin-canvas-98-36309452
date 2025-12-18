import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole, ROLE_ROUTES, ROLE_HIERARCHY } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  minRole?: AppRole;
}

export function ProtectedRoute({ children, allowedRoles, minRole }: ProtectedRouteProps) {
  const { user, role, loading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // No role assigned
  if (!role) {
    return <Navigate to="/auth" replace />;
  }

  // Must change password first
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  // Check minimum role level
  if (minRole && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}

// Redirect authenticated users to their dashboard
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && role) {
    return <Navigate to={ROLE_ROUTES[role]} replace />;
  }

  return <>{children}</>;
}
