import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/types/roles';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Target,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronUp,
  ChevronDown,
  Code2,
  Plus,
  List,
  Layers,
  ImageIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreateLandingPageDialog } from './CreateLandingPageDialog';

const menuItems = [
  { id: 'overview', title: 'Overview', icon: LayoutDashboard },
  { id: 'clients', title: 'Clients', icon: Users },
  { id: 'gallery', title: 'Gallery', icon: ImageIcon },
  { id: 'tracking', title: 'Tracking', icon: Target },
  { id: 'checkout', title: 'Checkout', icon: CreditCard },
  { id: 'reports', title: 'Reports', icon: BarChart3 },
];

interface DeveloperSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DeveloperSidebar({ activeTab, onTabChange }: DeveloperSidebarProps) {
  const { user, role, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [landingPagesOpen, setLandingPagesOpen] = useState(
    activeTab === 'landing-pages' || activeTab === 'section-library' || activeTab === 'builder'
  );
  const [productsOpen, setProductsOpen] = useState(
    activeTab === 'products' || activeTab === 'stock-inventory'
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getInitials = (email: string) => {
    return email?.slice(0, 2).toUpperCase() || 'DV';
  };

  const isLandingPagesActive = activeTab === 'landing-pages' || activeTab === 'section-library' || activeTab === 'builder';
  const isProductsActive = activeTab === 'products' || activeTab === 'stock-inventory';

  const handlePageCreated = (pageId: string) => {
    onTabChange(`builder:${pageId}`);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Developer</span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Regular menu items before Landing Pages */}
                {menuItems.slice(0, 2).map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Landing Pages Collapsible Menu */}
                <Collapsible
                  open={landingPagesOpen}
                  onOpenChange={setLandingPagesOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isLandingPagesActive}
                        tooltip="Landing Pages"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Landing Pages</span>
                        {!isCollapsed && (
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => setCreateDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                            <span>Create New</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => onTabChange('landing-pages')}
                            isActive={activeTab === 'landing-pages'}
                          >
                            <List className="h-4 w-4" />
                            <span>Manage Pages</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => onTabChange('section-library')}
                            isActive={activeTab === 'section-library'}
                          >
                            <Layers className="h-4 w-4" />
                            <span>Section Library</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* Products Collapsible Menu */}
                <Collapsible
                  open={productsOpen}
                  onOpenChange={setProductsOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isProductsActive}
                        tooltip="Products"
                      >
                        <Package className="h-4 w-4" />
                        <span>Products</span>
                        {!isCollapsed && (
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => onTabChange('products')}
                            isActive={activeTab === 'products'}
                          >
                            <List className="h-4 w-4" />
                            <span>Manage Products</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => onTabChange('stock-inventory')}
                            isActive={activeTab === 'stock-inventory'}
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Stock & Inventory</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* Remaining menu items */}
                {menuItems.slice(2).map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.email}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {role && ROLE_LABELS[role]}
                        </span>
                      </div>
                    )}
                    {!isCollapsed && <ChevronUp className="ml-auto h-4 w-4" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <CreateLandingPageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPageCreated={handlePageCreated}
      />
    </>
  );
}