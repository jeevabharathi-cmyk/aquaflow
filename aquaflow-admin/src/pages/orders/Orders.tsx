import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShoppingCart,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  User,
  Package,
  IndianRupee,
  Map,
  ClipboardList,
  ExternalLink,
  FileText
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
  Tabs,
  Steps,
  Select,
  Timeline,
  Avatar,
  Divider
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: 'placed' | 'confirmed' | 'processing' | 'ready' | 'assigned' | 'dispatched' | 'delivered' | 'cancelled';
  date: string;
  slot: string;
  address: string;
  driver?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2026-001',
    customer: 'Rahul Deshmukh',
    amount: 1200.00,
    status: 'delivered',
    date: 'Today, 10:30 AM',
    slot: 'Morning',
    address: 'A-402, Green Valley, Pune',
    driver: 'Vijay Singh'
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-002',
    customer: 'Blue Star Apartments',
    amount: 8500.00,
    status: 'dispatched',
    date: 'Today, 11:15 AM',
    slot: 'Afternoon',
    address: 'Building 7, Sector 12, Baner',
    driver: 'Suresh Raina'
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-003',
    customer: 'Amit Singh',
    amount: 240.00,
    status: 'placed',
    date: 'Today, 12:45 PM',
    slot: 'Evening',
    address: 'Plot 45, MG Road, Camp'
  }
];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'dispatched': return 'processing';
      case 'placed': return 'default';
      case 'cancelled': return 'error';
      case 'confirmed': return 'blue';
      default: return 'warning';
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      key: 'orderNumber',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1" onClick={() => {
            setSelectedOrder(record);
            setIsDetailsOpen(true);
          }}>
            {record.orderNumber}
            <ExternalLink className="w-3 h-3" />
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{record.date}</span>
        </div>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
            {record.customer.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">{record.customer}</p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium truncate max-w-[150px]">
              <MapPin className="w-2.5 h-2.5" /> {record.address}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Slot',
      dataIndex: 'slot',
      key: 'slot',
      render: (slot) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {slot}
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <div className="flex items-center gap-0.5 font-black text-slate-900">
          <span className="text-xs text-slate-400 font-bold">₹</span>
          {amount.toLocaleString()}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3 border-none font-bold text-[10px] uppercase tracking-wider">
          {status}
        </Tag>
      )
    },
    {
      title: 'Fulfillment',
      key: 'fulfillment',
      render: (_, record) => (
        record.driver ? (
          <div className="flex items-center gap-2">
            <Avatar size="small" icon={<User />} className="bg-blue-100 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">{record.driver}</span>
          </div>
        ) : (
          <Button size="small" type="dashed" icon={<Truck className="w-3 h-3" />} className="text-[10px] font-bold h-7 rounded-lg">
            ASSIGN
          </Button>
        )
      )
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Dropdown menu={{
          items: [
            { key: 'details', label: 'View Details', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'tracking', label: 'Track Delivery', icon: <Map className="w-4 h-4" /> },
            { key: 'invoice', label: 'Download Invoice', icon: <FileText className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'cancel', label: 'Cancel Order', icon: <XCircle className="w-4 h-4" />, danger: true },
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400" />
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
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            Orders & Logistics
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time order tracking, scheduling, and fulfillment.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button icon={<Map className="w-4 h-4" />} className="h-11 px-4 rounded-xl border-slate-200 font-semibold flex-1 sm:flex-none">Live Map</Button>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} className="h-11 px-6 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 font-bold flex-1 sm:flex-none">
            Create Order
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4 border-b border-slate-200">
        <div className="overflow-x-auto no-scrollbar -mb-px">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="order-tabs"
            items={[
              { key: 'all', label: <span className="font-bold px-1 sm:px-2">All Orders</span> },
              { key: 'pending', label: <span className="font-bold px-1 sm:px-2">Pending <Badge count={12} offset={[10, 0]} className="scale-75" /></span> },
              { key: 'dispatched', label: <span className="font-bold px-1 sm:px-2">Dispatched</span> },
              { key: 'delivered', label: <span className="font-bold px-1 sm:px-2">Delivered</span> },
              { key: 'cancelled', label: <span className="font-bold px-1 sm:px-2">Cancelled</span> },
            ]}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 pb-4">
          <div className="relative group w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input placeholder="Search by Order ID, Customer..." className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50" />
          </div>
          <Button icon={<Filter className="w-4 h-4" />} className="h-11 px-6 border-slate-200 font-bold rounded-xl w-full sm:w-auto text-slate-600">Filters</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Today's Orders", value: '142', icon: ShoppingCart, color: 'blue' },
          { title: 'In Transit', value: '18', icon: Truck, color: 'orange' },
          { title: 'Successful', value: '114', icon: CheckCircle2, color: 'emerald' },
          { title: 'Issues', value: '3', icon: AlertCircle, color: 'red' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-colors">
             <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
               s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
               s.color === 'orange' ? 'bg-orange-50 text-orange-600' :
               s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
               'bg-red-50 text-red-600'
             }`}>
                <s.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.title}</p>
                <h3 className="text-xl font-black text-slate-900">{s.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <Card styles={{ body: { padding: 0 } }} className="shadow-sm border-slate-200 rounded-xl overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={mockOrders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="aquaflow-table"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={null}
        footer={null}
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        width={850}
        style={{ top: 20 }}
        className="order-details-modal responsive-modal"
      >
        <div className="relative">
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 -m-6 rounded-t-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <Tag className="bg-white/20 border-none text-white font-bold rounded-full px-3 mb-2">#{selectedOrder?.orderNumber}</Tag>
                <h2 className="text-2xl font-black">{selectedOrder?.customer}</h2>
                <div className="flex items-center gap-3 mt-2 text-blue-50 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedOrder?.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedOrder?.slot} Slot</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs font-bold uppercase mb-1">Total Amount</p>
                <p className="text-3xl font-black">₹{selectedOrder?.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Status Timeline */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" /> Order Progress
                </h3>
                <Steps
                  current={selectedOrder?.status === 'delivered' ? 4 : 2}
                  size="small"
                  className="px-2"
                  items={[
                    { title: 'Placed', description: '10:30 AM' },
                    { title: 'Confirmed', description: '10:35 AM' },
                    { title: 'Dispatched', description: '11:15 AM' },
                    { title: 'Delivered', description: '12:05 PM' },
                  ]}
                />
              </section>

              {/* Items Table */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" /> Order Items
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Item Details</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { name: '1L Premium Mineral Water', sku: 'FP-1L-PREM', qty: 24, price: 20, total: 480 },
                        { name: '500ml Standard Water', sku: 'FP-500ML-STD', qty: 60, price: 12, total: 720 },
                      ].map((item, i) => (
                        <tr key={i} className="text-sm">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sku}</p>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700">{item.qty}</td>
                          <td className="p-4 text-right font-bold text-slate-700">₹{item.price}</td>
                          <td className="p-4 text-right font-bold text-blue-600">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              {/* Delivery Info */}
              <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Delivery Info</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-1">Shipping Address</p>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedOrder?.address}</p>
                    </div>
                  </div>
                  <Divider className="my-0" />
                  <div className="flex gap-3">
                    <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-1">Assigned Partner</p>
                      <p className="text-sm font-bold text-slate-800">{selectedOrder?.driver || 'Not Assigned'}</p>
                      {selectedOrder?.driver && <Button type="link" size="small" className="p-0 text-xs font-bold h-auto">Track on Map</Button>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Summary */}
              <section className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold">₹1,142.86</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">GST (5%)</span>
                    <span className="font-bold">₹57.14</span>
                  </div>
                  <Divider className="border-slate-800 my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-blue-400">Total</span>
                    <span className="font-black">₹1,200.00</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Tag color="success" className="w-full text-center py-1 rounded-lg border-none font-black text-xs">PAID via WALLET</Tag>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;
