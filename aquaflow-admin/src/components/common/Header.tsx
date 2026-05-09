import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, LogOut, User, Menu, Package, ShoppingCart, Users, Truck, CreditCard, BarChart3, Settings, History, Warehouse, Box, X } from 'lucide-react';
import { Dropdown, message, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface SearchItem {
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [user, setUser] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { customers = [], products = [] } = useStore();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build searchable index from all modules
  const searchIndex: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];

    // Pages / Navigation
    const pages = [
      { title: 'Dashboard', subtitle: 'Overview & analytics', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" />, color: 'blue' },
      { title: 'Orders', subtitle: 'Manage customer orders', path: '/orders', icon: <ShoppingCart className="w-4 h-4" />, color: 'indigo' },
      { title: 'Suppliers', subtitle: 'Supplier management', path: '/suppliers', icon: <Truck className="w-4 h-4" />, color: 'emerald' },
      { title: 'Raw Inventory', subtitle: 'Raw material stock', path: '/inventory', icon: <Warehouse className="w-4 h-4" />, color: 'amber' },
      { title: 'Products', subtitle: 'Product catalog', path: '/products', icon: <Package className="w-4 h-4" />, color: 'purple' },
      { title: 'BOM & Assembly', subtitle: 'Bill of materials', path: '/assembly', icon: <Box className="w-4 h-4" />, color: 'rose' },
      { title: 'Customers', subtitle: 'Customer directory', path: '/customers', icon: <Users className="w-4 h-4" />, color: 'blue' },
      { title: 'Fleet & Dispatch', subtitle: 'Live map & drivers', path: '/map', icon: <Truck className="w-4 h-4" />, color: 'emerald' },
      { title: 'Payments', subtitle: 'Transaction history', path: '/payments', icon: <CreditCard className="w-4 h-4" />, color: 'green' },
      { title: 'Analytics', subtitle: 'Performance reports', path: '/analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'indigo' },
      { title: 'Settings', subtitle: 'System configuration', path: '/settings', icon: <Settings className="w-4 h-4" />, color: 'slate' },
      { title: 'Audit Log', subtitle: 'Activity trails', path: '/audit', icon: <History className="w-4 h-4" />, color: 'orange' },
    ];
    pages.forEach(p => items.push({ ...p, category: 'Pages' }));

    // Customers from store
    customers.forEach(c => items.push({
      title: c.name,
      subtitle: `${c.code} • ${c.type} • ${c.email}`,
      category: 'Customers',
      icon: <Users className="w-4 h-4" />,
      path: `/customers?id=${c.id}`,
      color: 'blue'
    }));

    // Products from store
    products.forEach(p => items.push({
      title: p.name,
      subtitle: `${p.sku} • ₹${p.price} • Stock: ${p.stock}`,
      category: 'Products',
      icon: <Package className="w-4 h-4" />,
      path: `/products?id=${p.id}`,
      color: 'purple'
    }));

    // Quick actions
    const actions = [
      { title: 'Create New Order', subtitle: 'Quick action', path: '/orders', icon: <ShoppingCart className="w-4 h-4" />, color: 'indigo' },
      { title: 'Register Customer', subtitle: 'Quick action', path: '/customers', icon: <Users className="w-4 h-4" />, color: 'blue' },
      { title: 'Record Payment', subtitle: 'Quick action', path: '/payments', icon: <CreditCard className="w-4 h-4" />, color: 'green' },
      { title: 'Export Reports', subtitle: 'Analytics & PDF', path: '/analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'indigo' },
      { title: 'Add Product', subtitle: 'Quick action', path: '/products', icon: <Package className="w-4 h-4" />, color: 'purple' },
      { title: 'Dispatch Fleet', subtitle: 'Quick action', path: '/map', icon: <Truck className="w-4 h-4" />, color: 'emerald' },
    ];
    actions.forEach(a => items.push({ ...a, category: 'Quick Actions' }));

    return items;
  }, [customers, products]);

  const results = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    return searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchText, searchIndex]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    results.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    setSearchText('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    user && { key: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    user && { type: 'divider' },
    {
      key: user ? 'logout' : 'login',
      label: user ? 'Logout' : 'Sign In',
      icon: user ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />,
      danger: !!user,
      onClick: user ? handleLogout : () => navigate('/login'),
    },
  ].filter(Boolean) as MenuProps['items'];

  const notificationItems: MenuProps['items'] = [
    { key: '1', label: (<div className="flex flex-col"><span className="font-medium text-slate-900">New order received (#ORD-005)</span><span className="text-xs text-slate-500">2m ago</span></div>) },
    { key: '2', label: (<div className="flex flex-col"><span className="font-medium text-slate-900">Supplier Crystal Clear updated status</span><span className="text-xs text-slate-500">1h ago</span></div>) },
    { key: '3', label: (<div className="flex flex-col"><span className="font-medium text-red-600">Low stock alert: PET Bottles</span><span className="text-xs text-slate-500">3h ago</span></div>), danger: true },
  ];

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';
  const showDropdown = isFocused && searchText.trim().length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-1 sm:gap-4 flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600 shrink-0">
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div ref={searchRef} className="relative w-full max-w-[140px] xs:max-w-xs sm:max-w-md group transition-all duration-300 focus-within:max-w-[200px] sm:focus-within:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, customers, products..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setSearchText(''); setIsFocused(false); inputRef.current?.blur(); }
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
            }}
            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2 pl-9 pr-8 text-sm transition-all outline-none"
          />
          {searchText && (
            <button onClick={() => { setSearchText(''); inputRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 z-10">
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/50 max-h-[420px] overflow-y-auto z-50">
              {results.length === 0 ? (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No results for "{searchText}"</p>
                  <p className="text-xs text-slate-300 mt-1">Try a different keyword</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</p>
                    </div>
                    {items.map((item, i) => (
                      <button
                        key={`${category}-${i}`}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <div className={`p-2 rounded-lg bg-${item.color}-50 text-${item.color}-600 shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                        <Tag className="rounded-full border-none text-[9px] font-bold px-1.5 m-0 shrink-0" color="default">{category}</Tag>
                      </button>
                    ))}
                  </div>
                ))
              )}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold mr-1">Enter</kbd> to select first •
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold mx-1">Esc</kbd> to close
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
          <button className="p-2 hover:bg-slate-50 rounded-xl relative text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </Dropdown>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <button className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-3 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.email?.split('@')[0] || 'Admin User'}</p>
              <p className="text-[11px] text-slate-500 font-medium">Administrator</p>
            </div>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
