import * as React from 'react';
import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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
    user && {
      key: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
    },
    user && {
      type: 'divider',
    },
    {
      key: user ? 'logout' : 'login',
      label: user ? 'Logout' : 'Sign In',
      icon: user ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />,
      danger: !!user,
      onClick: user ? handleLogout : () => navigate('/login'),
    },
  ].filter(Boolean) as MenuProps['items'];

  const notificationItems: MenuProps['items'] = [
    { 
      key: '1', 
      label: (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">New order received (#ORD-005)</span>
          <span className="text-xs text-slate-500">2m ago</span>
        </div>
      )
    },
    { 
      key: '2', 
      label: (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">Supplier Crystal Clear updated status</span>
          <span className="text-xs text-slate-500">1h ago</span>
        </div>
      )
    },
    { 
      key: '3', 
      label: (
        <div className="flex flex-col">
          <span className="font-medium text-red-600">Low stock alert: PET Bottles</span>
          <span className="text-xs text-slate-500">3h ago</span>
        </div>
      ),
      danger: true 
    },
  ];

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-1 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[140px] xs:max-w-xs sm:max-w-md group transition-all duration-300 focus-within:max-w-[200px] sm:focus-within:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2 pl-9 pr-4 text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          trigger={['click']}
        >
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
