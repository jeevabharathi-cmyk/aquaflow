import * as React from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Smartphone,
  Mail,
  CreditCard,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Input, Switch, Divider, Tabs, Avatar, List, Tag } from 'antd';

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          System Settings
        </h1>
        <p className="text-slate-500 mt-1">Configure your portal preferences, security, and integration parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
           {[
             { label: 'General', icon: Settings, active: true },
             { label: 'Profile Settings', icon: User },
             { label: 'Security & Auth', icon: Lock },
             { label: 'Notifications', icon: Bell },
             { label: 'Team Members', icon: Shield },
             { label: 'Billing & Plans', icon: CreditCard },
             { label: 'Integrations', icon: Database },
           ].map((item, i) => (
             <button 
               key={i} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                 item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'
               }`}
             >
               <item.icon className="w-5 h-5" />
               <span className="text-sm">{item.label}</span>
             </button>
           ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Card */}
          <Card className="shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <Avatar size={80} className="bg-blue-100 text-blue-600 font-black text-2xl">JD</Avatar>
                 <div>
                   <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
                   <p className="text-sm text-slate-500">Super Admin • Last login: 2 hours ago</p>
                 </div>
              </div>
              <Button type="primary" className="bg-blue-600 rounded-lg h-10">Edit Profile</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> john.doe@aquaflow.com</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Smartphone className="w-4 h-4 text-slate-400" /> +91 98765 43210</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Work Location</p>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> Main Distribution Hub, Pune</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                <Tag color="success" className="font-bold border-none uppercase tracking-widest text-[10px]">Verified Admin</Tag>
              </div>
            </div>
          </Card>

          {/* System Preferences */}
          <Card className="shadow-sm border-slate-200" title={<span className="font-bold">System Preferences</span>}>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><Bell className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Low Stock Push Notifications</p>
                      <p className="text-xs text-slate-500">Receive alerts when raw materials fall below min-levels.</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
               </div>
               <Divider className="my-0" />
               <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><Globe className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Public Order Tracking</p>
                      <p className="text-xs text-slate-500">Allow customers to track orders without logging in.</p>
                    </div>
                  </div>
                  <Switch />
               </div>
               <Divider className="my-0" />
               <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><Shield className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Enable 2FA for all administrative logins.</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
               </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-sm border-red-100 bg-red-50/30" title={<span className="font-bold text-red-600">Danger Zone</span>}>
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm font-bold text-slate-900">Clear System Audit Logs</p>
                  <p className="text-xs text-slate-500">Permanently delete logs older than 1 year. This action is irreversible.</p>
               </div>
               <Button danger type="primary">Clear Logs</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
