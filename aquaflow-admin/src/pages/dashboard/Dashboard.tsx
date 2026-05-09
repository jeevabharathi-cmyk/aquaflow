import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Card, Button, Table, Tag, Space, Dropdown, message, DatePicker, Modal, Checkbox } from 'antd';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TableProps, MenuProps } from 'antd';

const data = [
  { name: 'Mon', revenue: 4000, orders: 240 },
  { name: 'Tue', revenue: 3000, orders: 198 },
  { name: 'Wed', revenue: 2000, orders: 980 },
  { name: 'Thu', revenue: 2780, orders: 390 },
  { name: 'Fri', revenue: 1890, orders: 480 },
  { name: 'Sat', revenue: 2390, orders: 380 },
  { name: 'Sun', revenue: 3490, orders: 430 },
];

const stats = [
  {
    title: "Total Revenue",
    value: "₹1,24,500",
    change: "+12.5%",
    isPositive: true,
    icon: TrendingUp,
    color: "blue",
    path: "/analytics"
  },
  {
    title: "Active Customers",
    value: "1,240",
    change: "+4.3%",
    isPositive: true,
    icon: Users,
    color: "purple",
    path: "/customers"
  },
  {
    title: "Pending Orders",
    value: "45",
    change: "-2.1%",
    isPositive: false,
    icon: Package,
    color: "orange",
    path: "/orders"
  },
  {
    title: "Avg Delivery Time",
    value: "24m",
    change: "+1.2%",
    isPositive: true,
    icon: Truck,
    color: "green",
    path: "/dispatch"
  }
];

interface OrderRecord {
  key: string;
  orderId: string;
  customer: string;
  amount: string;
  status: 'delivered' | 'pending' | 'processing' | 'cancelled';
  date: string;
}

const columns: TableProps<OrderRecord>['columns'] = [
  {
    title: 'Order ID',
    dataIndex: 'orderId',
    key: 'orderId',
    render: (text: string) => <span className="font-medium text-blue-600">#{text}</span>,
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (text: string) => <span className="font-semibold">₹{text}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      let color = 'default';
      if (status === 'delivered') color = 'success';
      if (status === 'processing') color = 'processing';
      if (status === 'pending') color = 'warning';
      if (status === 'cancelled') color = 'error';
      return <Tag color={color} className="rounded-full px-3">{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
];

const recentOrders: OrderRecord[] = [
  { key: '1', orderId: 'ORD-001', customer: 'Ramesh Kumar', amount: '1,200', status: 'delivered', date: '10 mins ago' },
  { key: '2', orderId: 'ORD-002', customer: 'Priya Sharma', amount: '850', status: 'processing', date: '25 mins ago' },
  { key: '3', orderId: 'ORD-003', customer: 'Amit Singh', amount: '2,400', status: 'pending', date: '1 hour ago' },
  { key: '4', orderId: 'ORD-004', customer: 'Suresh Raina', amount: '1,100', status: 'delivered', date: '2 hours ago' },
];

const AnimatedNumber = ({ value }: { value: string }) => {
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const isCurrency = value.includes('₹');
    const isTime = value.includes('m');
    const formatted = Math.floor(latest).toLocaleString('en-IN');
    
    if (isCurrency) return `₹${formatted}`;
    if (isTime) return `${formatted}m`;
    return formatted;
  });

  React.useEffect(() => {
    const controls = animate(count, numericValue, { duration: 2, ease: "easeOut" });
    return () => controls.stop();
  }, [numericValue]);

  return <motion.span>{rounded}</motion.span>;
};

const DashboardPage = () => {
  const [exportLoading, setExportLoading] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const handleRowClick = (record: OrderRecord) => {
    setSelectedOrder(record);
    setIsDetailModalOpen(true);
  };

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    setExportLoading(true);
    const hide = message.loading('Preparing your report...', 0);
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8FAFC' // slate-50
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`AquaFlow-Executive-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      message.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to generate report. Please try again.');
    } finally {
      hide();
      setExportLoading(false);
    }
  };

  const filterMenu: MenuProps = {
    items: [
      { key: '1', label: <Checkbox>Active Only</Checkbox> },
      { key: '2', label: <Checkbox>Pending Only</Checkbox> },
      { type: 'divider' },
      { key: '3', label: <span className="text-blue-600 font-bold">Apply Filters</span> },
    ]
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 sm:flex-none">
            <DatePicker.RangePicker 
              picker="date" 
              className="w-full h-10 rounded-xl border-slate-200"
              placeholder={['Start', 'End']}
            />
          </div>
          <div className="flex items-center gap-3">
            <Dropdown menu={filterMenu} trigger={['click']}>
              <Button icon={<Filter className="w-4 h-4" />} className="h-10 px-6 rounded-xl border-slate-200 font-semibold flex-1 sm:flex-none">Filters</Button>
            </Dropdown>
            <Button 
              type="primary" 
              icon={<Download className="w-4 h-4" />}
              loading={exportLoading}
              onClick={handleExport}
              className="h-10 px-6 rounded-xl bg-blue-600 shadow-lg shadow-blue-100 font-semibold flex-1 sm:flex-none"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-8">
        {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <NavLink key={i} to={stat.path} className="block">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden group cursor-pointer h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    <AnimatedNumber value={stat.value} />
                  </h3>
                </div>
              <div className={`p-2.5 rounded-xl transition-transform ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                'bg-green-50 text-green-600'
              } group-hover:scale-110`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 w-0 group-hover:w-full ${
                stat.color === 'blue' ? 'bg-blue-500' :
                stat.color === 'purple' ? 'bg-purple-500' :
                stat.color === 'orange' ? 'bg-orange-500' :
                'bg-green-500'
              }`}></div>
            </Card>
          </NavLink>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm" title={
          <div className="flex items-center justify-between py-1">
            <span className="font-bold text-lg">Revenue Growth</span>
            <Space>
              <Tag color="blue">This Week</Tag>
              <Button type="text" icon={<MoreVertical className="w-4 h-4" />} />
            </Space>
          </div>
        }>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="shadow-sm" title={<span className="font-bold text-lg">Orders Overview</span>}>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#0ea5e9" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="shadow-sm" title={
        <div className="flex items-center justify-between py-1">
          <span className="font-bold text-lg">Recent Orders</span>
          <NavLink to="/orders">
            <Button type="link" className="font-semibold text-blue-600 hover:text-blue-700 p-0">View All Orders</Button>
          </NavLink>
        </div>
      }>
        <Table 
          columns={columns} 
          dataSource={recentOrders} 
          pagination={false}
          className="border-none cursor-pointer"
          scroll={{ x: 600 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Order Details - #{selectedOrder?.orderId}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Close</Button>,
          <Button key="print" type="primary" icon={<Download className="w-4 h-4" />}>Download Invoice</Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Name</p>
                <p className="text-base font-bold text-slate-900">{selectedOrder.customer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Status</p>
                <Tag color={
                  selectedOrder.status === 'delivered' ? 'success' :
                  selectedOrder.status === 'processing' ? 'processing' :
                  selectedOrder.status === 'pending' ? 'warning' : 'error'
                } className="rounded-full px-3">
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Amount</p>
                <p className="text-base font-bold text-slate-900">₹{selectedOrder.amount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Date</p>
                <p className="text-base font-bold text-slate-900">{selectedOrder.date}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <p className="text-sm font-bold text-slate-900">Delivery Information</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Address</span>
                  <span className="text-slate-900 font-medium">123, Aqua Street, Chennai</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Contact</span>
                  <span className="text-slate-900 font-medium">+91 98765 43210</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-900">Item Summary</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 flex justify-between text-xs font-bold text-slate-500">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
                <div className="px-4 py-3 flex justify-between text-sm border-t border-slate-100">
                  <span className="font-medium">20L Purified Water Bottle</span>
                  <span>5</span>
                  <span className="font-bold">₹600</span>
                </div>
                <div className="px-4 py-3 flex justify-between text-sm border-t border-slate-100">
                  <span className="font-medium">Delivery Charges</span>
                  <span>-</span>
                  <span className="font-bold">₹100</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default DashboardPage;
