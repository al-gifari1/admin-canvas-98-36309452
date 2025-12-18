import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ROLE_LABELS, AppRole } from '@/types/roles';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AppRole;
  status: string;
  created_at: string;
  developer_name?: string;
}

interface Developer {
  user_id: string;
  full_name: string;
  email: string;
}

export function GlobalUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all user roles (shop_owner, order_manager, employee)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['shop_owner', 'order_manager', 'employee']);

      if (!roles || roles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = roles.map(r => r.user_id);
      const roleMap = new Map(roles.map(r => [r.user_id, r.role as AppRole]));

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      // Fetch developers for filter
      const { data: devRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'developer');

      if (devRoles && devRoles.length > 0) {
        const devIds = devRoles.map(r => r.user_id);
        const { data: devProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', devIds);

        setDevelopers(devProfiles || []);
      }

      // Fetch developer assignments to map shop owners to developers
      const { data: assignments } = await supabase
        .from('developer_assignments')
        .select('developer_id, shop_owner_id');

      const shopOwnerToDevMap = new Map(
        assignments?.map(a => [a.shop_owner_id, a.developer_id]) || []
      );

      // Create developer name lookup
      const devNameMap = new Map(
        developers.map(d => [d.user_id, d.full_name || d.email])
      );

      const userList: User[] = profiles?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name || '',
        role: roleMap.get(p.user_id) || 'employee',
        status: p.status || 'active',
        created_at: p.created_at,
        developer_name: devNameMap.get(shopOwnerToDevMap.get(p.user_id) || ''),
      })) || [];

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDeveloper = selectedDeveloper === 'all' || user.developer_name === selectedDeveloper;
    
    return matchesSearch && matchesDeveloper;
  });

  const getRoleBadge = (role: AppRole) => {
    const variants: Record<AppRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      super_admin: 'destructive',
      developer: 'default',
      shop_owner: 'secondary',
      order_manager: 'outline',
      employee: 'outline',
    };
    return <Badge variant={variants[role]}>{ROLE_LABELS[role]}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Global Users</CardTitle>
              <CardDescription>Read-only view of all Shop Owners and Employees (for debugging/support)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Developer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Developers</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev.user_id} value={dev.full_name || dev.email}>
                    {dev.full_name || dev.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedDeveloper !== 'all' 
                ? 'No users found matching your filters' 
                : 'No shop owners or employees yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.developer_name || '-'}</TableCell>
                    <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
