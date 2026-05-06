import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Settings, 
  BarChart3, 
  FileText, 
  History,
  Store,
  Factory,
  Boxes,
  CreditCard,
  Building2
} from 'lucide-react';
import { cn } from '@/utils/cn';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Building2, label: 'Suppliers', path: '/suppliers' },
  { icon: Boxes, label: 'Raw Inventory', path: '/inventory' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Factory, label: 'BOM & Assembly', path: '/assembly' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Truck, label: 'Fleet & Dispatch', path: '/dispatch' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: History, label: 'Audit Log', path: '/audit' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AquaFlow</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">John Doe</p>
            <p className="text-xs text-slate-400 truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
