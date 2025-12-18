import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, UserPlus, Ban, KeyRound, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Developer {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  client_count: number;
}

export function DeveloperManagement() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeveloper, setNewDeveloper] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      // Get all developer roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'developer');

      if (!roles || roles.length === 0) {
        setDevelopers([]);
        setLoading(false);
        return;
      }

      const userIds = roles.map(r => r.user_id);

      // Get profiles for these developers
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      // Get client counts (shop owners) for each developer
      const { data: assignments } = await supabase
        .from('developer_assignments')
        .select('developer_id, shop_owner_id');

      const clientCounts = new Map<string, number>();
      assignments?.forEach(a => {
        clientCounts.set(a.developer_id, (clientCounts.get(a.developer_id) || 0) + 1);
      });

      const devs: Developer[] = profiles?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name || '',
        status: p.status || 'active',
        created_at: p.created_at,
        client_count: clientCounts.get(p.user_id) || 0,
      })) || [];

      setDevelopers(devs);
    } catch (error) {
      console.error('Error fetching developers:', error);
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeveloper = async () => {
    if (!newDeveloper.email || !newDeveloper.password) {
      toast.error('Email and password are required');
      return;
    }

    setIsCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: newDeveloper.email,
          password: newDeveloper.password,
          fullName: newDeveloper.full_name,
          role: 'developer',
          creatorId: session.session?.user.id,
          creatorRole: 'super_admin',
        },
      });

      if (response.error) throw response.error;

      toast.success('Developer created successfully');
      setIsCreateOpen(false);
      setNewDeveloper({ email: '', password: '', full_name: '' });
      fetchDevelopers();
    } catch (error: any) {
      console.error('Error creating developer:', error);
      toast.error(error.message || 'Failed to create developer');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Developer ${newStatus === 'active' ? 'activated' : newStatus}`);
      fetchDevelopers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredDevelopers = developers.filter(dev =>
    dev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Developer Management</CardTitle>
              <CardDescription>Manage developer accounts and their permissions</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Developer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Developer</DialogTitle>
                  <DialogDescription>
                    Add a new developer account to the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newDeveloper.full_name}
                      onChange={(e) => setNewDeveloper(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDeveloper.email}
                      onChange={(e) => setNewDeveloper(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="developer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newDeveloper.password}
                      onChange={(e) => setNewDeveloper(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDeveloper} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Developer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search developers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredDevelopers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No developers found matching your search' : 'No developers yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevelopers.map((dev) => (
                  <TableRow key={dev.id}>
                    <TableCell className="font-medium">{dev.full_name || '-'}</TableCell>
                    <TableCell>{dev.email}</TableCell>
                    <TableCell>{getStatusBadge(dev.status)}</TableCell>
                    <TableCell>{dev.client_count}</TableCell>
                    <TableCell>{format(new Date(dev.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {dev.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(dev.user_id, 'active')}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {dev.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(dev.user_id, 'suspended')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toast.info('Password reset feature coming soon')}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
