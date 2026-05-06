import * as React from 'react';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Activity,
  ChevronDown
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
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, Button, Select, Space, Row, Col, Statistic, DatePicker, Segmented, Progress } from 'antd';

const { RangePicker } = DatePicker;

const revenueData = [
  { name: 'Jan', revenue: 45000, cost: 32000, profit: 13000 },
  { name: 'Feb', revenue: 52000, cost: 34000, profit: 18000 },
  { name: 'Mar', revenue: 48000, cost: 31000, profit: 17000 },
  { name: 'Apr', revenue: 61000, cost: 38000, profit: 23000 },
  { name: 'May', revenue: 55000, cost: 35000, profit: 20000 },
  { name: 'Jun', revenue: 67000, cost: 42000, profit: 25000 },
];

const categoryData = [
  { name: '1L Premium', value: 45, color: '#3b82f6' },
  { name: '500ml Std', value: 30, color: '#60a5fa' },
  { name: '20L Jars', value: 20, color: '#93c5fd' },
  { name: 'Other', value: 5, color: '#bfdbfe' },
];

const AnalyticsPage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Performance Analytics
          </h1>
          <p className="text-slate-500 mt-1">Deep insights into revenue, growth, and operational efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <RangePicker className="h-10 rounded-lg" />
          <Button icon={<Download className="w-4 h-4" />} className="h-10 font-bold border-slate-200">Export PDF</Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Gross Revenue', value: '₹4.85L', trend: '+14.2%', icon: IndianRupee, color: 'blue' },
          { title: 'Total Orders', value: '1,240', trend: '+8.5%', icon: ShoppingCart, color: 'indigo' },
          { title: 'Customer Acquisition', value: '84', trend: '+12.1%', icon: Users, color: 'emerald' },
          { title: 'Profit Margin', value: '28.4%', trend: '-1.2%', icon: Activity, color: 'purple' },
        ].map((m, i) => (
          <Card key={i} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{m.title}</p>
                <h3 className="text-2xl font-black text-slate-900">{m.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-${m.color}-50 text-${m.color}-600`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${m.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
               {m.trend.startsWith('+') ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
               {m.trend}
               <span className="text-slate-400 font-medium">since last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Trend Area Chart */}
      <Card className="shadow-sm border-slate-200" title={
        <div className="flex items-center justify-between py-1">
          <span className="font-bold text-lg">Revenue vs Cost Analysis</span>
          <Segmented options={['Daily', 'Weekly', 'Monthly', 'Yearly']} defaultValue="Monthly" />
        </div>
      }>
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Category Distribution */}
        <Col xs={24} lg={10}>
          <Card className="shadow-sm border-slate-200 h-full" title={<span className="font-bold text-lg">Sales by Category</span>}>
            <div className="h-[300px] w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-3xl font-black text-slate-900 leading-none">1.2k</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Units</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Product Performance Bar Chart */}
        <Col xs={24} lg={14}>
          <Card className="shadow-sm border-slate-200 h-full" title={<span className="font-bold text-lg">Product Profitability</span>}>
            <div className="h-[380px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={40} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="profit" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Operational Efficiency */}
      <Card className="shadow-sm border-slate-200" title={<span className="font-bold text-lg">Operational Efficiency Metrics</span>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">On-Time Delivery</p>
                  <h4 className="text-2xl font-black text-slate-900">96.8%</h4>
                </div>
                <span className="text-green-500 font-bold text-xs flex items-center gap-1 mb-1"><ArrowUpRight className="w-3 h-3" /> 2.1%</span>
             </div>
             <Progress percent={96.8} status="active" strokeColor="#10b981" showInfo={false} />
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Turnover</p>
                  <h4 className="text-2xl font-black text-slate-900">12.4x</h4>
                </div>
                <span className="text-green-500 font-bold text-xs flex items-center gap-1 mb-1"><ArrowUpRight className="w-3 h-3" /> 0.8x</span>
             </div>
             <Progress percent={74} status="active" strokeColor="#3b82f6" showInfo={false} />
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Returns Rate</p>
                  <h4 className="text-2xl font-black text-slate-900">0.42%</h4>
                </div>
                <span className="text-red-500 font-bold text-xs flex items-center gap-1 mb-1"><ArrowDownRight className="w-3 h-3" /> 0.05%</span>
             </div>
             <Progress percent={15} status="active" strokeColor="#ef4444" showInfo={false} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
