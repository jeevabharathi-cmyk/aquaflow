export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'inventory_manager' 
  | 'sales_manager' 
  | 'delivery_manager' 
  | 'admin_staff' 
  | 'supervisor' 
  | 'driver';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mfaRequired: boolean;
}
