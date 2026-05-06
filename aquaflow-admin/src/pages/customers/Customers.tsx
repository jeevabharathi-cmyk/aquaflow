import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  History,
  TrendingUp,
  ShieldCheck,
  Building2,
  UserCheck,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  Table, 
  Button, 
  Input, 
  Tag, 
  Space, 
  Dropdown, 
  Modal, 
  Form, 
  message,
  Card,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  Statistic,
  Progress
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Customer {
  id: string;
  code: string;
  name: string;
  type: 'individual' | 'business' | 'event';
  email: string;
  phone: string;
  balance: number;
  creditLimit: number;
  status: 'active' | 'suspended';
  lastOrder: string;
  joinDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    code: 'CUST-1001',
    name: 'Rahul Deshmukh',
    type: 'individual',
    email: 'rahul.d@gmail.com',
    phone: '+91 99887 76655',
    balance: 150.00,
    creditLimit: 500.00,
    status: 'active',
    lastOrder: '2 days ago',
    joinDate: 'Jan 2026'
  },
  {
    id: '2',
    code: 'CUST-1002',
    name: 'Blue Star Apartments',
    type: 'business',
    email: 'info@bluestar.com',
    phone: '+91 88776 65544',
    balance: -4500.00,
    creditLimit: 10000.00,
    status: 'active',
    lastOrder: 'Yesterday',
    joinDate: 'Feb 2026'
  },
  {
    id: '3',
    code: 'CUST-1003',
    name: 'Meera Textiles Ltd',
    type: 'business',
    email: 'admin@meera.in',
    phone: '+91 77665 54433',
    balance: 0.00,
    creditLimit: 25000.00,
    status: 'suspended',
    lastOrder: '3 weeks ago',
    joinDate: 'March 2026'
  }
];

const CustomersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            className={`shadow-sm font-bold border-none ${
              record.type === 'business' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <p className="font-bold text-slate-900 leading-none">{record.name}</p>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium tracking-tight uppercase">
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{record.code}</span>
              {record.type === 'business' ? (
                <span className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5" /> Corporate</span>
              ) : (
                <span className="flex items-center gap-1"><UserCheck className="w-2.5 h-2.5" /> Retail</span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Phone className="w-3 h-3 text-slate-400" /> {record.phone}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <Mail className="w-3 h-3 text-slate-300" /> {record.email}
          </div>
        </div>
      )
    },
    {
      title: 'Wallet / Credit',
      key: 'balance',
      render: (_, record) => {
        const isDebt = record.balance < 0;
        const absBalance = Math.abs(record.balance);
        const creditUsage = record.creditLimit > 0 ? (absBalance / record.creditLimit) * 100 : 0;
        
        return (
          <div className="min-w-[140px]">
            <div className={`flex items-center gap-1 font-bold ${isDebt ? 'text-red-600' : record.balance > 0 ? 'text-green-600' : 'text-slate-400'}`}>
               <span className="text-xs">₹</span>
               {absBalance.toLocaleString()}
               <span className="text-[10px] font-medium ml-1 uppercase">{isDebt ? 'Due' : 'Credit'}</span>
            </div>
            {isDebt && record.creditLimit > 0 && (
              <div className="mt-1.5">
                <Progress 
                  percent={creditUsage} 
                  showInfo={false} 
                  size="small" 
                  strokeColor={creditUsage > 80 ? '#ef4444' : '#6366f1'} 
                  trailColor="#f1f5f9"
                  className="m-0"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold tracking-tight">LIMIT: ₹{record.creditLimit.toLocaleString()}</p>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'} className="rounded-full px-3 border-none font-bold uppercase text-[10px] tracking-widest">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (date) => <span className="text-sm font-semibold text-slate-700">{date}</span>
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'Customer Portal', icon: <ExternalLink className="w-4 h-4" /> },
            { key: 'wallet', label: 'Wallet Top-up', icon: <CreditCard className="w-4 h-4" /> },
            { key: 'orders', label: 'Order History', icon: <History className="w-4 h-4" /> },
            { key: 'pricing', label: 'Custom Pricing', icon: <IndianRupee className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'suspend', label: 'Suspend Account', icon: <ShieldCheck className="w-4 h-4" />, danger: true },
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400 hover:text-slate-900 transition-colors" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Customer Directory
          </h1>
          <p className="text-slate-500 mt-1">Monitor account health, balances, and customer performance.</p>
        </div>
        <Button 
          type="primary" 
          icon={<UserPlus className="w-4 h-4" />} 
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
          onClick={() => setIsModalOpen(true)}
        >
          Register Customer
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Customers', value: '3,842', trend: '+12%', icon: Users, color: 'blue' },
          { label: 'Total Receivable', value: '₹4.8L', trend: '+5%', icon: CreditCard, color: 'indigo' },
          { label: 'Advance Balance', value: '₹1.2L', trend: '-2%', icon: IndianRupee, color: 'emerald' },
          { label: 'Growth Rate', value: '18.4%', trend: '+4%', icon: TrendingUp, color: 'purple' },
        ].map((m, i) => (
          <Card key={i} className="shadow-sm border-slate-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${m.color}-50 text-${m.color}-600`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">{m.value}</h3>
                  <span className={`text-xs font-bold ${m.trend.startsWith('+') ? 'text-green-500' : 'text-red-400'}`}>{m.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-slate-200 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white/50">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name, ID, phone or email..." 
              className="pl-11 h-11 border-slate-200 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<Filter className="w-4 h-4" />} className="h-11 px-6 font-semibold border-slate-200 rounded-xl">Filters</Button>
            <Button icon={<MessageSquare className="w-4 h-4" />} className="h-11 px-6 font-semibold border-slate-200 rounded-xl">Broadcast</Button>
          </div>
        </div>
        <Table 
          columns={columns} 
          dataSource={mockCustomers} 
          pagination={{ pageSize: 10 }}
          className="aquaflow-table"
        />
      </Card>

      {/* Registration Modal */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
               <UserPlus className="w-6 h-6" />
             </div>
             <span className="text-lg font-bold">Register New Customer</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)} className="rounded-lg h-10 px-6 font-bold">Cancel</Button>,
          <Button key="submit" type="primary" className="bg-blue-600 rounded-lg h-10 px-6 font-bold shadow-blue-200 shadow-lg">Save Profile</Button>,
        ]}
        width={750}
      >
        <Form layout="vertical" className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Form.Item label={<span className="font-bold text-slate-700">Account Type</span>} className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              {['individual', 'business', 'event'].map(type => (
                <button key={type} className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${
                  type === 'individual' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${type === 'individual' ? 'text-blue-600' : 'text-slate-400'}`}>{type}</span>
                </button>
              ))}
            </div>
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-700">Full Name / Entity Name</span>} className="md:col-span-2">
            <Input placeholder="Enter name..." className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-700">Phone Number</span>}>
            <Input prefix={<span className="text-slate-400 font-bold">+91</span>} placeholder="00000 00000" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-700">Email Address</span>}>
            <Input placeholder="email@example.com" className="h-11 rounded-xl" />
          </Form.Item>

          <Divider className="md:col-span-2 my-2" />
          
          <Form.Item label={<span className="font-bold text-slate-700">Credit Limit (₹)</span>}>
            <Input prefix={<span className="text-slate-400">₹</span>} defaultValue={0} className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-700">Payment Terms</span>}>
            <Input placeholder="e.g. Immediate, Net 30" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-slate-700">Default Shipping Address</span>} className="md:col-span-2">
            <Input.TextArea placeholder="Complete address with landmark..." rows={3} className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
