import * as React from 'react';
import { useState } from 'react';
import {
  Settings, User, Lock, Bell, Shield, Database, Globe, Smartphone,
  Mail, CreditCard, Building2, ChevronRight, Save, Upload, Trash2,
  Plus, Eye, EyeOff, Check, X, Key
} from 'lucide-react';
import { Card, Button, Input, Switch, Divider, Avatar, Tag, Modal, Form, Select, message, Descriptions } from 'antd';

const tabs = [
  { label: 'General', icon: Settings },
  { label: 'Profile Settings', icon: User },
  { label: 'Security & Auth', icon: Lock },
  { label: 'Notifications', icon: Bell },
  { label: 'Team Members', icon: Shield },
  { label: 'Billing & Plans', icon: CreditCard },
  { label: 'Integrations', icon: Database },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General');

  // General prefs
  const [lowStock, setLowStock] = useState(true);
  const [publicTracking, setPublicTracking] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  // Profile
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm] = Form.useForm();
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john.doe@aquaflow.com', phone: '+91 98765 43210', location: 'Main Distribution Hub, Pune', role: 'Super Admin' });

  // Security
  const [changePassModal, setChangePassModal] = useState(false);
  const [passForm] = Form.useForm();
  const [showPass, setShowPass] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [orderNotif, setOrderNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);
  const [securityNotif, setSecurityNotif] = useState(true);

  // Team
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [memberForm] = Form.useForm();
  const [members, setMembers] = useState([
    { name: 'John Doe', email: 'john.doe@aquaflow.com', role: 'Super Admin', status: 'active' },
    { name: 'Arun Varma', email: 'arun@aquaflow.com', role: 'Inventory Manager', status: 'active' },
    { name: 'Priya Sharma', email: 'priya@aquaflow.com', role: 'Sales Rep', status: 'active' },
    { name: 'Sita Ram', email: 'sita@aquaflow.com', role: 'Admin Staff', status: 'inactive' },
  ]);

  const handleProfileSave = (v: any) => {
    setProfile({ ...profile, ...v });
    message.success('Profile updated successfully');
    setProfileModal(false);
  };

  const handleChangePass = () => {
    message.success('Password changed successfully');
    setChangePassModal(false);
    passForm.resetFields();
  };

  const handleAddMember = (v: any) => {
    setMembers([...members, { ...v, status: 'active' }]);
    message.success(`${v.name} added to team`);
    setAddMemberModal(false);
    memberForm.resetFields();
  };

  const handleRemoveMember = (email: string) => {
    Modal.confirm({
      title: 'Remove Team Member',
      content: 'Are you sure you want to remove this member?',
      okType: 'danger',
      onOk: () => { setMembers(members.filter(m => m.email !== email)); message.success('Member removed'); }
    });
  };

  const renderPrefRow = (icon: React.ReactNode, title: string, desc: string, checked: boolean, onChange: (v: boolean) => void) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        </div>
        <Switch checked={checked} onChange={(c) => { onChange(c); message.success(`${title} ${c ? 'enabled' : 'disabled'}`); }} />
      </div>
      <Divider className="my-0" />
    </>
  );

  const [memberSearch, setMemberSearch] = useState('');
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
    m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <Avatar size={80} className="bg-blue-100 text-blue-600 font-black text-2xl shadow-inner">{profile.name.split(' ').map(n => n[0]).join('')}</Avatar>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{profile.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{profile.role} • Last login: 2 hours ago</p>
                  </div>
                </div>
                <Button type="primary" className="bg-blue-600 rounded-xl h-11 px-6 font-bold shadow-lg shadow-blue-100" onClick={() => { profileForm.setFieldsValue(profile); setProfileModal(true); }}>Edit Profile</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p><p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {profile.email}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p><p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Smartphone className="w-4 h-4 text-slate-400" /> {profile.phone}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p><p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {profile.location}</p></div>
              </div>
            </Card>
            <Card className="shadow-sm border-slate-200" title={<span className="font-bold">System Preferences</span>}>
              <div className="space-y-6">
                {renderPrefRow(<Bell className="w-5 h-5 text-slate-600" />, 'Low Stock Push Notifications', 'Receive alerts when raw materials fall below min-levels.', lowStock, setLowStock)}
                {renderPrefRow(<Globe className="w-5 h-5 text-slate-600" />, 'Public Order Tracking', 'Allow customers to track orders without logging in.', publicTracking, setPublicTracking)}
                {renderPrefRow(<Shield className="w-5 h-5 text-slate-600" />, 'Two-Factor Authentication', 'Require 2FA for all administrative logins.', twoFA, setTwoFA)}
                {renderPrefRow(<Database className="w-5 h-5 text-slate-600" />, 'Auto Backup', 'Automatically backup data every 24 hours.', autoBackup, setAutoBackup)}
              </div>
            </Card>
            <Card className="shadow-sm border-red-100 bg-red-50/30" title={<span className="font-bold text-red-600">Danger Zone</span>}>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-slate-900">Clear System Audit Logs</p><p className="text-xs text-slate-500">Permanently delete logs older than 1 year.</p></div>
                <Button danger type="primary" className="h-10 px-6 rounded-lg font-bold" onClick={() => Modal.confirm({ title: 'Clear Logs', content: 'This will permanently delete all audit logs older than 1 year. This action cannot be undone.', okType: 'danger', okText: 'Clear Logs', onOk: () => message.success('Audit logs cleared') })}>Clear Logs</Button>
              </div>
            </Card>
          </div>
        );

      case 'Profile Settings':
        return (
          <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Edit Profile Details</span>}>
            <Form layout="vertical" initialValues={profile} onFinish={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 max-w-3xl">
              <Form.Item name="name" label={<span className="font-bold text-slate-700">Full Name</span>} rules={[{ required: true }]}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item name="email" label={<span className="font-bold text-slate-700">Email Address</span>} rules={[{ required: true, type: 'email' }]}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item name="phone" label={<span className="font-bold text-slate-700">Phone</span>}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item name="location" label={<span className="font-bold text-slate-700">Location</span>}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item className="md:col-span-2">
                <Button type="primary" htmlType="submit" icon={<Save className="w-4 h-4" />} className="bg-blue-600 rounded-xl h-11 px-8 font-bold shadow-lg shadow-blue-100">Save Changes</Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'Security & Auth':
        return (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Security Controls</span>}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-bold text-slate-900">Account Password</p><p className="text-xs text-slate-500 font-medium">Last changed 30 days ago</p></div>
                  <Button icon={<Key className="w-4 h-4" />} className="h-10 px-6 rounded-lg font-bold" onClick={() => { passForm.resetFields(); setChangePassModal(true); }}>Update Password</Button>
                </div>
                <Divider className="my-0" />
                {renderPrefRow(<Shield className="w-5 h-5 text-slate-600" />, 'Two-Factor Authentication', 'Add an extra layer of security to your account.', twoFA, setTwoFA)}
                {renderPrefRow(<Smartphone className="w-5 h-5 text-slate-600" />, 'Biometric Login', 'Use fingerprint or face ID on supported devices.', false, () => message.info('Biometric login is platform dependent'))}
              </div>
            </Card>
            <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Login History</span>}>
              <div className="space-y-4">
                {[
                  { device: 'Chrome on Windows', ip: '192.168.1.1', time: 'Active Now', current: true },
                  { device: 'Safari on iPhone 15', ip: '103.2.4.12', time: '2 hours ago', current: false },
                  { device: 'Firefox on macOS', ip: '172.16.0.4', time: 'Yesterday, 10:45 PM', current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{s.device}</p>
                      <p className="text-[11px] text-slate-400 font-medium">IP: {s.ip} • {s.time}</p>
                    </div>
                    {s.current ? <Tag color="success" className="border-none font-bold text-[10px] uppercase tracking-widest">Current Session</Tag> : <Button size="small" type="text" className="text-[10px] font-bold text-red-500 hover:bg-red-50">Revoke</Button>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Notifications':
        return (
          <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Manage Alerts</span>}>
            <div className="space-y-6">
              {renderPrefRow(<Mail className="w-5 h-5 text-slate-600" />, 'Email Notifications', 'Get summarized updates in your inbox.', emailNotif, setEmailNotif)}
              {renderPrefRow(<Smartphone className="w-5 h-5 text-slate-600" />, 'Push Notifications', 'Real-time alerts on your mobile and desktop.', orderNotif, setOrderNotif)}
              <Divider className="my-0" />
              <div className="space-y-1 pb-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Critical Alert Subscriptions</h4>
                <p className="text-[11px] text-slate-400">Control which events trigger high-priority alerts.</p>
              </div>
              {renderPrefRow(<CreditCard className="w-5 h-5 text-slate-600" />, 'Inventory & Stock Alerts', 'Notifications for low stock and stock receipts.', lowStock, setLowStock)}
              {renderPrefRow(<Smartphone className="w-5 h-5 text-slate-600" />, 'Payment Confirmations', 'Alerts for successful or failed incoming payments.', paymentNotif, setPaymentNotif)}
              {renderPrefRow(<Shield className="w-5 h-5 text-slate-600" />, 'Security & Access', 'Alerts for logins from new devices.', securityNotif, setSecurityNotif)}
            </div>
          </Card>
        );

      case 'Team Members':
        return (
          <div className="space-y-6">
            <Card 
              className="shadow-sm border-slate-200" 
              title={<span className="font-bold">Active Directory</span>} 
              extra={<Button type="primary" icon={<Plus className="w-4 h-4" />} className="bg-blue-600 rounded-xl font-bold h-10 px-6 shadow-lg shadow-blue-100" onClick={() => { memberForm.resetFields(); setAddMemberModal(true); }}>Add Member</Button>}
            >
              <div className="mb-6 relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Filter members by name, email or role..." 
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>
              <div className="space-y-3">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Shield className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">No team members found</p>
                  </div>
                ) : (
                  filteredMembers.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <Badge dot color={m.status === 'active' ? '#22c55e' : '#94a3b8'} offset={[-2, 32]}>
                          <Avatar size={48} className="bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 shadow-sm">{m.name.charAt(0)}</Avatar>
                        </Badge>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{m.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag className="rounded-full border-none font-bold text-[10px] uppercase tracking-widest px-3 py-0.5" color={m.role === 'Super Admin' ? 'blue' : 'default'}>{m.role}</Tag>
                        {m.role !== 'Super Admin' && (
                          <Dropdown menu={{
                            items: [
                              { key: 'edit', label: 'Edit Permissions', icon: <User className="w-3.5 h-3.5" /> },
                              { key: 'status', label: m.status === 'active' ? 'Deactivate' : 'Activate', icon: <Smartphone className="w-3.5 h-3.5" />, onClick: () => {
                                const newMembers = [...members];
                                newMembers[members.findIndex(member => member.email === m.email)].status = m.status === 'active' ? 'inactive' : 'active';
                                setMembers(newMembers);
                                message.success(`${m.name} status updated`);
                              }},
                              { type: 'divider' },
                              { key: 'remove', label: 'Remove From Team', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: () => handleRemoveMember(m.email) },
                            ]
                          }} trigger={['click']}>
                            <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-300 hover:text-slate-600" />
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        );

      case 'Billing & Plans':
        return (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Current Plan</span>}>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div>
                  <Tag color="blue" className="border-none font-black text-xs uppercase mb-2">Business Pro</Tag>
                  <h3 className="text-2xl font-black text-slate-900">₹4,999<span className="text-sm font-normal text-slate-400">/month</span></h3>
                  <p className="text-xs text-slate-500 mt-1">Next billing: June 1, 2026</p>
                </div>
                <Button className="rounded-xl font-bold" onClick={() => message.info('Plan upgrade modal would open here')}>Upgrade Plan</Button>
              </div>
            </Card>
            <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Billing History</span>}>
              {[
                { date: 'May 1, 2026', amount: '₹4,999', status: 'Paid' },
                { date: 'Apr 1, 2026', amount: '₹4,999', status: 'Paid' },
                { date: 'Mar 1, 2026', amount: '₹4,999', status: 'Paid' },
              ].map((b, i) => (
                <div key={i} className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                  <span className="text-sm font-semibold text-slate-700">{b.date}</span>
                  <span className="font-bold text-slate-900">{b.amount}</span>
                  <Tag color="success" className="border-none font-bold text-[10px] uppercase">{b.status}</Tag>
                </div>
              ))}
            </Card>
          </div>
        );

      case 'Integrations':
        return (
          <Card className="shadow-sm border-slate-200" title={<span className="font-bold">Connected Services</span>}>
            <div className="space-y-4">
              {[
                { name: 'Supabase', desc: 'Database & Auth backend', connected: true },
                { name: 'Razorpay', desc: 'Payment gateway integration', connected: false },
                { name: 'Google Maps', desc: 'Fleet tracking & delivery maps', connected: true },
                { name: 'WhatsApp Business', desc: 'Customer notifications', connected: false },
                { name: 'Tally ERP', desc: 'Accounting sync', connected: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${s.connected ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}><Database className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                  <Button type={s.connected ? 'default' : 'primary'} className={`rounded-xl font-bold ${!s.connected ? 'bg-blue-600' : ''}`} onClick={() => message.success(`${s.name} ${s.connected ? 'disconnected' : 'connected'} successfully`)}>
                    {s.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        );

      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3"><Settings className="w-8 h-8 text-blue-600" /> System Settings</h1>
        <p className="text-slate-500 mt-1">Configure your portal preferences, security, and integration parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((item, i) => (
            <button key={i} onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.label ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3">{renderContent()}</div>
      </div>

      {/* Edit Profile Modal */}
      <Modal title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User className="w-6 h-6" /></div><span className="text-lg font-bold">Edit Profile</span></div>} open={profileModal} onCancel={() => setProfileModal(false)} onOk={() => profileForm.submit()} okText="Save" okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold' }} width={500}>
        <Form form={profileForm} layout="vertical" onFinish={handleProfileSave} className="pt-4">
          <Form.Item name="name" label={<span className="font-bold text-slate-700">Full Name</span>} rules={[{ required: true }]}><Input className="h-11 rounded-xl" /></Form.Item>
          <Form.Item name="email" label={<span className="font-bold text-slate-700">Email</span>} rules={[{ required: true, type: 'email' }]}><Input className="h-11 rounded-xl" /></Form.Item>
          <Form.Item name="phone" label={<span className="font-bold text-slate-700">Phone</span>}><Input className="h-11 rounded-xl" /></Form.Item>
          <Form.Item name="location" label={<span className="font-bold text-slate-700">Location</span>}><Input className="h-11 rounded-xl" /></Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Key className="w-6 h-6" /></div><span className="text-lg font-bold">Change Password</span></div>} open={changePassModal} onCancel={() => setChangePassModal(false)} onOk={() => passForm.submit()} okText="Update Password" okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold' }} width={450}>
        <Form form={passForm} layout="vertical" onFinish={handleChangePass} className="pt-4">
          <Form.Item name="current" label={<span className="font-bold text-slate-700">Current Password</span>} rules={[{ required: true }]}><Input.Password className="h-11 rounded-xl" /></Form.Item>
          <Form.Item name="new" label={<span className="font-bold text-slate-700">New Password</span>} rules={[{ required: true, min: 8, message: 'Min 8 characters' }]}><Input.Password className="h-11 rounded-xl" /></Form.Item>
          <Form.Item name="confirm" label={<span className="font-bold text-slate-700">Confirm New Password</span>} dependencies={['new']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, v) => v && v === getFieldValue('new') ? Promise.resolve() : Promise.reject('Passwords do not match') })]}><Input.Password className="h-11 rounded-xl" /></Form.Item>
        </Form>
      </Modal>

      {/* Add Member Modal */}
      <Modal title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Plus className="w-6 h-6" /></div><span className="text-lg font-bold">Add Team Member</span></div>} open={addMemberModal} onCancel={() => setAddMemberModal(false)} onOk={() => memberForm.submit()} okText="Add Member" okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold' }} width={500}>
        <Form form={memberForm} layout="vertical" onFinish={handleAddMember} className="pt-4">
          <Form.Item name="name" label={<span className="font-bold text-slate-700">Full Name</span>} rules={[{ required: true }]}><Input className="h-11 rounded-xl" placeholder="Enter name..." /></Form.Item>
          <Form.Item name="email" label={<span className="font-bold text-slate-700">Email</span>} rules={[{ required: true, type: 'email' }]}><Input className="h-11 rounded-xl" placeholder="email@aquaflow.com" /></Form.Item>
          <Form.Item name="role" label={<span className="font-bold text-slate-700">Role</span>} rules={[{ required: true }]}>
            <Select className="h-11 rounded-xl" placeholder="Select role...">
              {['Admin Staff', 'Inventory Manager', 'Sales Rep', 'Fleet Manager', 'Accountant'].map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
