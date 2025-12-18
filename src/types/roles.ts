export type AppRole = 'super_admin' | 'developer' | 'shop_owner' | 'order_manager' | 'employee';

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 5,
  developer: 4,
  shop_owner: 3,
  order_manager: 2,
  employee: 1,
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  developer: 'Developer',
  shop_owner: 'Shop Owner',
  order_manager: 'Order Manager',
  employee: 'Employee',
};

export const ROLE_ROUTES: Record<AppRole, string> = {
  super_admin: '/admin-dashboard',
  developer: '/developer-console',
  shop_owner: '/shop-panel',
  order_manager: '/orders-dashboard',
  employee: '/employee-portal',
};

// What roles each role can create
export const CREATABLE_ROLES: Record<AppRole, AppRole[]> = {
  super_admin: ['developer'],
  developer: ['shop_owner'],
  shop_owner: ['order_manager', 'employee'],
  order_manager: [],
  employee: [],
};
