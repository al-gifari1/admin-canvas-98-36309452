import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Overview', icon: LayoutDashboard, key: 'overview' },
  { title: 'My Landing Pages', icon: FileText, key: 'landing-pages' },
  { title: 'Orders', icon: ShoppingCart, key: 'orders' },
  { title: 'Analytics', icon: BarChart3, key: 'analytics' },
  { title: 'Staff', icon: Users, key: 'staff' },
  { title: 'Settings', icon: Settings, key: 'settings' },
];

interface ShopOwnerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ShopOwnerSidebar({ activeSection, onSectionChange }: ShopOwnerSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shop Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeSection === item.key}
                    onClick={() => onSectionChange(item.key)}
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
    </Sidebar>
  );
}
