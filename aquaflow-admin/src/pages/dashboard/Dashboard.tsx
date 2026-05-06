import * as React from 'react';
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
import { Card, Button, Table, Tag, Space, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
    color: "blue"
  },
  {
    title: "Active Customers",
    value: "1,240",
    change: "+4.3%",
    isPositive: true,
    icon: Users,
    color: "purple"
  },
  {
    title: "Pending Orders",
    value: "45",
    change: "-2.1%",
    isPositive: false,
    icon: Package,
    color: "orange"
  },
  {
    title: "Avg Delivery Time",
    value: "24m",
    change: "+1.2%",
    isPositive: true,
    icon: Truck,
    color: "green"
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

const columns: ColumnsType<OrderRecord> = [
  {
    title: 'Order ID',
    dataIndex: 'orderId',
    key: 'orderId',
    render: (text) => <span className="font-medium text-blue-600">#{text}</span>,
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
    render: (text) => <span className="font-semibold">₹{text}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
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

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Calendar className="w-4 h-4" />}>May 2026</Button>
          <Button icon={<Filter className="w-4 h-4" />}>Filters</Button>
          <Button type="primary" icon={<Download className="w-4 h-4" />}>Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
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
            <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500 transition-all duration-300 w-0 group-hover:w-full`}></div>
          </Card>
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
          <Button type="link" className="font-semibold">View All Orders</Button>
        </div>
      }>
        <Table 
          columns={columns} 
          dataSource={recentOrders} 
          pagination={false}
          className="border-none"
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
