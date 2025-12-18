import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS, AppRole } from '@/types/roles';
import { User, Mail } from 'lucide-react';

interface UserData {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role?: AppRole;
}

interface UsersListProps {
  onUpdate: () => void;
  filterRole?: AppRole;
}

export function UsersList({ onUpdate, filterRole }: UsersListProps) {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [role, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role as AppRole | undefined,
      })) || [];

      // Filter by role if specified
      const filteredUsers = filterRole 
        ? usersWithRoles.filter(u => u.role === filterRole)
        : usersWithRoles;

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No users found. Create a new user to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.full_name || 'No name'}</p>
                  {user.role && (
                    <Badge variant="secondary" className="text-xs">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
