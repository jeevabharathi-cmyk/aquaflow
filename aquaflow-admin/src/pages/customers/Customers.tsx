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
  MessageSquare,
  Wallet
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
  Progress,
  Switch,
  Select,
  Drawer,
  Descriptions,
  InputNumber
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useStore, type Customer } from '../../store/useStore';

const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Handle deep linking from search
  React.useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
        setOrdersModalOpen(true); // Open orders/details drawer
        // Remove param after opening
        searchParams.delete('id');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, customers]);
  
  // Feature states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [walletForm] = Form.useForm();
  const [broadcastForm] = Form.useForm();

  const handleRegister = (values: any) => {
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: values.name,
      type: values.type || 'individual',
      email: values.email,
      phone: values.phone,
      balance: 0,
      creditLimit: Number(values.creditLimit) || 0,
      status: 'active',
      lastOrder: 'Never',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    
    addCustomer(newCustomer);
    message.success('Customer registered successfully');
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleStatusToggle = (checked: boolean, customerId: string) => {
    updateCustomer(customerId, { status: checked ? 'active' : 'inactive' });
    message.success(`Status updated to ${checked ? 'Active' : 'Inactive'}`);
  };

  const handleAction = (key: string, customer: Customer) => {
    setSelectedCustomer(customer);
    switch(key) {
      case 'view':
        setPortalModalOpen(true);
        break;
      case 'wallet':
        walletForm.resetFields();
        setWalletModalOpen(true);
        break;
      case 'orders':
        setOrdersModalOpen(true);
        break;
      case 'pricing':
        setPricingModalOpen(true);
        break;
      case 'suspend':
        Modal.confirm({
          title: customer.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account',
          content: `Are you sure you want to ${customer.status === 'suspended' ? 'reactivate' : 'suspend'} ${customer.name}?`,
          okText: customer.status === 'suspended' ? 'Reactivate' : 'Suspend',
          okType: customer.status === 'suspended' ? 'primary' : 'danger',
          onOk: () => {
            updateCustomer(customer.id, { status: customer.status === 'suspended' ? 'active' : 'suspended' });
            message.success(`Account ${customer.status === 'suspended' ? 'reactivated' : 'suspended'} for ${customer.name}`);
          }
        });
        break;
      default:
        break;
    }
  };

  const filteredCustomers = customers.filter(c => {
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      c.name.toLowerCase().includes(term) || 
      c.code.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.status.toLowerCase().includes(term)
    );
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleBroadcast = (values: any) => {
    message.success(`Broadcast message sent to ${values.target} customers`);
    setBroadcastModalOpen(false);
    broadcastForm.resetFields();
  };

  const handleWalletTopup = (values: any) => {
    if (selectedCustomer) {
      const amount = Number(values.amount);
      const newBalance = values.transactionType === 'credit' 
        ? selectedCustomer.balance + amount 
        : selectedCustomer.balance - amount;
        
      updateCustomer(selectedCustomer.id, { balance: newBalance });
      message.success(`Successfully recorded ${values.transactionType} to wallet for ₹${amount}`);
      setWalletModalOpen(false);
    }
  };

  const handlePricing = () => {
    message.success('Custom pricing updated successfully');
    setPricingModalOpen(false);
  };

  const mockOrderColumns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="blue">{s}</Tag> }
  ];
  const mockOrders = [
    { id: 'ORD-001', date: '2026-05-08', amount: '₹1,200', status: 'Delivered' },
    { id: 'ORD-002', date: '2026-05-01', amount: '₹800', status: 'Delivered' },
    { id: 'ORD-003', date: '2026-04-15', amount: '₹2,500', status: 'Delivered' }
  ];

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
      key: 'status',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={record.status === 'active'} 
            onChange={(checked) => handleStatusToggle(checked, record.id)}
            disabled={record.status === 'suspended'}
            className={record.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}
          />
          <Tag color={record.status === 'active' ? 'success' : record.status === 'suspended' ? 'error' : 'default'} className="rounded-full px-2 border-none font-bold uppercase text-[9px] tracking-widest m-0">
            {record.status}
          </Tag>
        </div>
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
      render: (_, record) => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'Customer Portal', icon: <ExternalLink className="w-4 h-4" />, onClick: () => handleAction('view', record) },
            { key: 'wallet', label: 'Wallet Top-up', icon: <CreditCard className="w-4 h-4" />, onClick: () => handleAction('wallet', record) },
            { key: 'orders', label: 'Order History', icon: <History className="w-4 h-4" />, onClick: () => handleAction('orders', record) },
            { key: 'pricing', label: 'Custom Pricing', icon: <IndianRupee className="w-4 h-4" />, onClick: () => handleAction('pricing', record) },
            { type: 'divider' },
            { key: 'suspend', label: 'Suspend Account', icon: <ShieldCheck className="w-4 h-4" />, danger: true, onClick: () => handleAction('suspend', record) },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            Customer Directory
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor account health, balances, and customer performance.</p>
        </div>
        <Button 
          type="primary" 
          icon={<UserPlus className="w-4 h-4" />} 
          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-xl font-bold w-full lg:w-auto"
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Register Customer
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Customers', value: customers.length.toLocaleString(), trend: '+12%', icon: Users, color: 'blue' },
          { label: 'Total Receivable', value: '₹4.8L', trend: '+5%', icon: CreditCard, color: 'indigo' },
          { label: 'Advance Balance', value: '₹1.2L', trend: '-2%', icon: IndianRupee, color: 'emerald' },
          { label: 'Growth Rate', value: '18.4%', trend: '+4%', icon: TrendingUp, color: 'purple' },
        ].map((m, i) => (
          <Card key={i} className="shadow-sm border-slate-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                m.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                m.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                m.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-purple-50 text-purple-600'
              }`}>
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
      <Card className="shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white/50">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name, ID, phone or email..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-11 h-11 border-slate-200 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<Filter className="w-4 h-4" />} className="h-11 px-6 font-semibold border-slate-200 rounded-xl" onClick={() => setFilterDrawerOpen(true)}>Filters</Button>
            <Button icon={<MessageSquare className="w-4 h-4" />} className="h-11 px-6 font-semibold border-slate-200 rounded-xl" onClick={() => setBroadcastModalOpen(true)}>Broadcast</Button>
          </div>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredCustomers} 
          rowKey="id"
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
        onOk={() => form.submit()}
        okText="Save Profile"
        okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold shadow-blue-200 shadow-lg' }}
        cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }}
        width={750}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleRegister}
          className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6"
          initialValues={{ type: 'individual' }}
        >
          <Form.Item name="type" label={<span className="font-bold text-slate-700">Account Type</span>} className="md:col-span-2">
            <Select className="h-11 rounded-xl">
              <Select.Option value="individual">Individual / Retail</Select.Option>
              <Select.Option value="business">Business / Corporate</Select.Option>
              <Select.Option value="event">Event Management</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="name" label={<span className="font-bold text-slate-700">Full Name / Entity Name</span>} rules={[{ required: true, message: 'Please enter name' }]} className="md:col-span-2">
            <Input placeholder="Enter name..." className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item name="phone" label={<span className="font-bold text-slate-700">Phone Number</span>} rules={[{ required: true, message: 'Please enter phone' }]}>
            <Input prefix={<span className="text-slate-400 font-bold">+91</span>} placeholder="00000 00000" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item name="email" label={<span className="font-bold text-slate-700">Email Address</span>} rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="email@example.com" className="h-11 rounded-xl" />
          </Form.Item>

          <Divider className="md:col-span-2 my-2" />
          
          <Form.Item name="creditLimit" label={<span className="font-bold text-slate-700">Credit Limit (₹)</span>}>
            <Input prefix={<span className="text-slate-400">₹</span>} defaultValue={0} className="h-11 rounded-xl" type="number" />
          </Form.Item>

          <Form.Item name="paymentTerms" label={<span className="font-bold text-slate-700">Payment Terms</span>}>
            <Input placeholder="e.g. Immediate, Net 30" className="h-11 rounded-xl" />
          </Form.Item>

          <Form.Item name="address" label={<span className="font-bold text-slate-700">Default Shipping Address</span>} className="md:col-span-2">
            <Input.TextArea placeholder="Complete address with landmark..." rows={3} className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ──── Filter Drawer ──── */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Filter className="w-5 h-5" /></div>
            <span className="font-bold text-lg">Filter Customers</span>
          </div>
        }
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        width={360}
      >
        <div className="space-y-6">
          <div>
            <p className="font-bold text-slate-700 mb-2 text-sm">Customer Type</p>
            <Select value={filterType} onChange={(v) => setFilterType(v)} className="w-full h-11 rounded-xl">
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="individual">Individual / Retail</Select.Option>
              <Select.Option value="business">Business / Corporate</Select.Option>
              <Select.Option value="event">Event Management</Select.Option>
            </Select>
          </div>

          <div>
            <p className="font-bold text-slate-700 mb-2 text-sm">Status</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'inactive', 'suspended'].map(s => (
                <Button 
                  key={s} 
                  onClick={() => setFilterStatus(s)} 
                  className={`rounded-full capitalize font-semibold text-xs ${filterStatus === s ? 'shadow-md' : ''}`}
                  type={filterStatus === s ? 'primary' : 'default'}
                >
                  {s === 'all' ? 'All' : s}
                </Button>
              ))}
            </div>
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button block className="h-10 rounded-xl font-bold" onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchText(''); }}>Reset All</Button>
            <Button type="primary" block className="h-10 rounded-xl font-bold bg-blue-600" onClick={() => setFilterDrawerOpen(false)}>Apply</Button>
          </div>
        </div>
      </Drawer>

      {/* ──── Broadcast Modal ──── */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
            <span className="text-lg font-bold">Broadcast Message</span>
          </div>
        }
        open={broadcastModalOpen}
        onCancel={() => setBroadcastModalOpen(false)}
        onOk={() => broadcastForm.submit()}
        okText="Send Broadcast"
        okButtonProps={{ className: 'bg-purple-600 rounded-lg h-10 px-6 font-bold' }}
        cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }}
        width={600}
      >
        <Form form={broadcastForm} layout="vertical" onFinish={handleBroadcast} className="pt-4">
          <Form.Item name="target" label={<span className="font-bold text-slate-700">Send To</span>} rules={[{ required: true }]} initialValue="all">
            <Select className="h-11 rounded-xl">
              <Select.Option value="all">All Customers ({customers.length})</Select.Option>
              <Select.Option value="active">Active Customers ({customers.filter(c => c.status === 'active').length})</Select.Option>
              <Select.Option value="business">Business Accounts ({customers.filter(c => c.type === 'business').length})</Select.Option>
              <Select.Option value="individual">Individual Accounts ({customers.filter(c => c.type === 'individual').length})</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="channel" label={<span className="font-bold text-slate-700">Channel</span>} initialValue="sms">
            <Select className="h-11 rounded-xl">
              <Select.Option value="sms">SMS</Select.Option>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="whatsapp">WhatsApp</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="message" label={<span className="font-bold text-slate-700">Message</span>} rules={[{ required: true, message: 'Please enter a message' }]}>
            <Input.TextArea rows={4} placeholder="Type your broadcast message here..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ──── Customer Portal Modal ──── */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ExternalLink className="w-6 h-6" /></div>
            <span className="text-lg font-bold">Customer Portal — {selectedCustomer?.name}</span>
          </div>
        }
        open={portalModalOpen}
        onCancel={() => setPortalModalOpen(false)}
        footer={<Button onClick={() => setPortalModalOpen(false)} className="rounded-lg h-10 px-6 font-bold">Close</Button>}
        width={700}
      >
        {selectedCustomer && (
          <div className="pt-4 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar size={64} className={`font-bold text-2xl border-none shadow-md ${selectedCustomer.type === 'business' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {selectedCustomer.name.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Tag className="m-0 rounded-full border-none font-bold text-[10px] uppercase tracking-wider" color="blue">{selectedCustomer.code}</Tag>
                  <Tag className="m-0 rounded-full border-none font-bold text-[10px] uppercase tracking-wider" color={selectedCustomer.status === 'active' ? 'success' : 'error'}>{selectedCustomer.status}</Tag>
                </p>
              </div>
            </div>
            <Descriptions bordered column={2} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Type"><span className="capitalize font-semibold">{selectedCustomer.type}</span></Descriptions.Item>
              <Descriptions.Item label="Joined">{selectedCustomer.joinDate}</Descriptions.Item>
              <Descriptions.Item label="Phone"><span className="font-medium">{selectedCustomer.phone}</span></Descriptions.Item>
              <Descriptions.Item label="Email"><span className="font-medium">{selectedCustomer.email}</span></Descriptions.Item>
              <Descriptions.Item label="Wallet Balance"><span className={`font-bold ${selectedCustomer.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>₹{Math.abs(selectedCustomer.balance).toLocaleString()}{selectedCustomer.balance < 0 ? ' (Due)' : ''}</span></Descriptions.Item>
              <Descriptions.Item label="Credit Limit"><span className="font-bold">₹{selectedCustomer.creditLimit.toLocaleString()}</span></Descriptions.Item>
              <Descriptions.Item label="Last Order" span={2}>{selectedCustomer.lastOrder}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ──── Wallet Top-up Modal ──── */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><CreditCard className="w-6 h-6" /></div>
            <div>
              <span className="text-lg font-bold block">Wallet Top-up</span>
              <span className="text-xs text-slate-500">{selectedCustomer?.name} — Current: ₹{Math.abs(selectedCustomer?.balance || 0).toLocaleString()}</span>
            </div>
          </div>
        }
        open={walletModalOpen}
        onCancel={() => setWalletModalOpen(false)}
        onOk={() => walletForm.submit()}
        okText="Process Transaction"
        okButtonProps={{ className: 'bg-green-600 rounded-lg h-10 px-6 font-bold' }}
        cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }}
        width={500}
      >
        <Form form={walletForm} layout="vertical" onFinish={handleWalletTopup} className="pt-4" initialValues={{ transactionType: 'credit' }}>
          <Form.Item name="transactionType" label={<span className="font-bold text-slate-700">Transaction Type</span>}>
            <Select className="h-11 rounded-xl">
              <Select.Option value="credit">Credit (Add Balance)</Select.Option>
              <Select.Option value="debit">Debit (Reduce Balance)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label={<span className="font-bold text-slate-700">Amount (₹)</span>} rules={[{ required: true, message: 'Please enter amount' }]}>
            <InputNumber min={1} className="w-full h-11 rounded-xl" placeholder="Enter amount..." prefix="₹" />
          </Form.Item>
          <Form.Item name="notes" label={<span className="font-bold text-slate-700">Notes</span>}>
            <Input.TextArea rows={2} placeholder="e.g. Advance payment, Refund..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ──── Order History Modal ──── */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><History className="w-6 h-6" /></div>
            <div>
              <span className="text-lg font-bold block">Order History</span>
              <span className="text-xs text-slate-500">{selectedCustomer?.name} — {selectedCustomer?.code}</span>
            </div>
          </div>
        }
        open={ordersModalOpen}
        onCancel={() => setOrdersModalOpen(false)}
        footer={<Button onClick={() => setOrdersModalOpen(false)} className="rounded-lg h-10 px-6 font-bold">Close</Button>}
        width={700}
      >
        <div className="pt-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="shadow-none border-slate-100" styles={{ body: { padding: 16 } }}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-2xl font-black text-slate-900">3</p>
            </Card>
            <Card className="shadow-none border-slate-100" styles={{ body: { padding: 16 } }}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Spent</p>
              <p className="text-2xl font-black text-slate-900">₹4,500</p>
            </Card>
            <Card className="shadow-none border-slate-100" styles={{ body: { padding: 16 } }}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Last Order</p>
              <p className="text-2xl font-black text-slate-900">{selectedCustomer?.lastOrder}</p>
            </Card>
          </div>
          <Table columns={mockOrderColumns} dataSource={mockOrders} rowKey="id" pagination={false} size="small" className="rounded-xl overflow-hidden" />
        </div>
      </Modal>

      {/* ──── Custom Pricing Modal ──── */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><IndianRupee className="w-6 h-6" /></div>
            <div>
              <span className="text-lg font-bold block">Custom Pricing</span>
              <span className="text-xs text-slate-500">Override base prices for {selectedCustomer?.name}</span>
            </div>
          </div>
        }
        open={pricingModalOpen}
        onCancel={() => setPricingModalOpen(false)}
        onOk={handlePricing}
        okText="Save Pricing"
        okButtonProps={{ className: 'bg-indigo-600 rounded-lg h-10 px-6 font-bold' }}
        cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }}
        width={600}
      >
        <div className="pt-4 space-y-4">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3 text-sm">
            <IndianRupee className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className="text-indigo-800">Set custom product prices for this customer. Leave blank to use the default base price.</p>
          </div>
          {[
            { name: '1L Premium Mineral Water', base: 20.00 },
            { name: '500ml Standard Water', base: 12.00 },
            { name: '20L Drinking Water Jar', base: 80.00 }
          ].map((product, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Base: ₹{product.base.toFixed(2)}</p>
              </div>
              <InputNumber 
                min={0} 
                placeholder={`₹${product.base.toFixed(2)}`}
                className="w-32 rounded-lg"
                prefix="₹"
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
