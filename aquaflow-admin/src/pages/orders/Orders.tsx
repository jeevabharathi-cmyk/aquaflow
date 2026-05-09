import { useState, useEffect } from 'react';
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
  Divider,
  DatePicker,
  InputNumber
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';

import type { ColumnsType } from 'antd/es/table';

interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
  total: number;
}

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
  items: OrderItem[];
  timeline: {
    placed?: string;
    confirmed?: string;
    dispatched?: string;
    delivered?: string;
  };
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
    driver: 'Vijay Singh',
    items: [
      { name: '1L Premium Mineral Water', sku: 'FP-1L-PREM', qty: 24, price: 20, total: 480 },
      { name: '500ml Standard Water', sku: 'FP-500ML-STD', qty: 60, price: 12, total: 720 }
    ],
    timeline: {
      placed: '10:30 AM',
      confirmed: '10:35 AM',
      dispatched: '11:15 AM',
      delivered: '12:05 PM'
    }
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
    driver: 'Suresh Raina',
    items: [
      { name: '20L Commercial Can', sku: 'FP-20L-COM', qty: 85, price: 100, total: 8500 }
    ],
    timeline: {
      placed: '11:15 AM',
      confirmed: '11:30 AM',
      dispatched: '12:15 PM'
    }
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-003',
    customer: 'Amit Singh',
    amount: 240.00,
    status: 'placed',
    date: 'Today, 12:45 PM',
    slot: 'Evening',
    address: 'Plot 45, MG Road, Camp',
    items: [
      { name: '1L Premium Mineral Water', sku: 'FP-1L-PREM', qty: 12, price: 20, total: 240 }
    ],
    timeline: {
      placed: '12:45 PM'
    }
  },
  {
    id: '4',
    orderNumber: 'ORD-2026-004',
    customer: 'Priya Sharma',
    amount: 1500.00,
    status: 'cancelled',
    date: 'Today, 09:00 AM',
    slot: 'Morning',
    address: 'Flat 12, Sunrise Apts, Wakad',
    items: [
      { name: '1L Premium Mineral Water', sku: 'FP-1L-PREM', qty: 75, price: 20, total: 1500 }
    ],
    timeline: {
      placed: '09:00 AM'
    }
  },
  {
    id: '5',
    orderNumber: 'ORD-2026-005',
    customer: 'Tech Park Cafe',
    amount: 4500.00,
    status: 'confirmed',
    date: 'Today, 01:20 PM',
    slot: 'Afternoon',
    address: 'Hinjewadi Phase 3, Pune',
    items: [
      { name: '500ml Standard Water', sku: 'FP-500ML-STD', qty: 375, price: 12, total: 4500 }
    ],
    timeline: {
      placed: '01:20 PM',
      confirmed: '01:45 PM'
    }
  },
  {
    id: '6',
    orderNumber: 'ORD-2026-006',
    customer: 'Karan Mehra',
    amount: 800.00,
    status: 'processing',
    date: 'Today, 02:00 PM',
    slot: 'Evening',
    address: 'Road No 4, Kalyani Nagar',
    items: [
      { name: '1L Premium Mineral Water', sku: 'FP-1L-PREM', qty: 40, price: 20, total: 800 }
    ],
    timeline: {
      placed: '02:00 PM',
      confirmed: '02:15 PM'
    }
  }
];

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Handle deep linking from search
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const order = orders.find(o => o.id === id);
      if (order) {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
        // Remove param after opening
        searchParams.delete('id');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, orders, setSearchParams]);

  const drivers = [
    { id: 1, name: 'Vijay Singh', status: 'Available' },
    { id: 2, name: 'Suresh Raina', status: 'In Transit' },
    { id: 3, name: 'Amit Kumar', status: 'Available' },
    { id: 4, name: 'Rajesh Patil', status: 'Offline' },
  ];

  const filteredOrders = orders.filter(order => {
    // Tab Filter
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'pending' 
        ? ['placed', 'confirmed', 'processing', 'ready', 'assigned'].includes(order.status)
        : order.status === activeTab;
    
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      order.orderNumber.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      order.address.toLowerCase().includes(term) ||
      order.status.toLowerCase().includes(term)
    );
    
    return matchesTab && matchesSearch;
  });

  const handleCreateOrder = (values: any) => {
    const newOrder: Order = {
      id: (orders.length + 1).toString(),
      orderNumber: values.orderNumber,
      customer: values.customer,
      amount: values.amount,
      status: 'placed',
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      slot: values.slot,
      address: values.address,
      items: [
        { name: 'Custom Order Item', sku: 'CUST-ITEM', qty: 1, price: values.amount, total: values.amount }
      ],
      timeline: {
        placed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
    setOrders([newOrder, ...orders]);
    message.success('Order created successfully!');
    setIsCreateOpen(false);
    form.resetFields();
  };

  const handleAssignDriver = (driverName: string) => {
    message.success(`Assigned ${driverName} to order ${selectedOrder?.orderNumber}`);
    setIsAssignOpen(false);
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AquaFlow Invoice', 20, 25);
    
    // Invoice Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${order.orderNumber}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 60);
    
    // Customer Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.customer, 20, 82);
    doc.text(order.address, 20, 88);
    
    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 105, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, 112);
    doc.text('Qty', 120, 112);
    doc.text('Price', 145, 112);
    doc.text('Total', 175, 112);
    
    // Table Items (Dynamic)
    const subtotal = order.amount / 1.05;
    const gst = order.amount - subtotal;
    
    doc.setFont('helvetica', 'normal');
    doc.text('AquaFlow Premium Water Bundle', 25, 122);
    doc.text('1', 120, 122);
    doc.text(`INR ${subtotal.toFixed(2)}`, 145, 122);
    doc.text(`INR ${subtotal.toFixed(2)}`, 175, 122);
    
    // Financial Breakdown
    doc.setFontSize(9);
    doc.text('Subtotal:', 130, 135);
    doc.text(`INR ${subtotal.toFixed(2)}`, 175, 135);
    doc.text('GST (5%):', 130, 140);
    doc.text(`INR ${gst.toFixed(2)}`, 175, 140);
    
    // Footer Total
    doc.setDrawColor(241, 245, 249);
    doc.line(130, 142, 190, 142);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 130, 150);
    doc.text(`INR ${order.amount.toLocaleString()}`, 175, 150);
    
    // Thank you
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing AquaFlow. For any queries, contact support@aquaflow.com', 105, 170, { align: 'center' });
    
    doc.save(`Invoice_${order.orderNumber}.pdf`);
  };

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
          <Button 
            size="small" 
            type="dashed" 
            icon={<Truck className="w-3 h-3" />} 
            className="text-[10px] font-bold h-7 rounded-lg"
            onClick={() => {
              setSelectedOrder(record);
              setIsAssignOpen(true);
            }}
          >
            ASSIGN
          </Button>
        )
      )
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Dropdown 
          menu={{
            items: [
              { key: 'details', label: 'View Details', icon: <ClipboardList className="w-4 h-4" /> },
              { key: 'tracking', label: 'Track Delivery', icon: <Map className="w-4 h-4" /> },
              { key: 'invoice', label: 'Download Invoice', icon: <FileText className="w-4 h-4" /> },
              { type: 'divider' },
              { key: 'cancel', label: 'Cancel Order', icon: <XCircle className="w-4 h-4" />, danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'details') {
                setSelectedOrder(record);
                setIsDetailsOpen(true);
              } else if (key === 'tracking') {
                navigate('/map');
              } else if (key === 'invoice') {
                message.loading('Generating PDF Invoice...', 1.5).then(() => {
                  generateInvoice(record);
                  message.success('Invoice downloaded successfully');
                });
              } else if (key === 'cancel') {
                Modal.confirm({
                  title: 'Cancel Order',
                  content: `Are you sure you want to cancel order ${record.orderNumber}?`,
                  okText: 'Yes, Cancel',
                  okType: 'danger',
                  cancelText: 'No',
                  centered: true,
                  onOk() {
                    message.success('Order cancelled successfully');
                  }
                });
              }
            }
          }} 
          trigger={['click']}
        >
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
          <Button 
            icon={<Map className="w-4 h-4" />} 
            className="h-11 px-4 rounded-xl border-slate-200 font-semibold flex-1 sm:flex-none"
            onClick={() => navigate('/map')}
          >
            Live Map
          </Button>
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            className="h-11 px-6 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 font-bold flex-1 sm:flex-none"
            onClick={() => setIsCreateOpen(true)}
          >
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
              { key: 'pending', label: <span className="font-bold px-1 sm:px-2">Pending</span> },
              { key: 'dispatched', label: <span className="font-bold px-1 sm:px-2">Dispatched</span> },
              { key: 'delivered', label: <span className="font-bold px-1 sm:px-2">Delivered</span> },
              { key: 'cancelled', label: <span className="font-bold px-1 sm:px-2">Cancelled</span> },
            ]}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 pb-4">
          <div className="relative group w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by Order ID, Customer..." 
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <Dropdown
            menu={{
              items: [
                { key: 'amount-desc', label: 'Amount: High to Low' },
                { key: 'amount-asc', label: 'Amount: Low to High' },
                { type: 'divider' },
                { key: 'newest', label: 'Date: Newest First' },
                { key: 'oldest', label: 'Date: Oldest First' },
              ],
              onClick: ({ key }) => {
                const sortedOrders = [...orders];
                if (key === 'amount-desc') sortedOrders.sort((a, b) => b.amount - a.amount);
                else if (key === 'amount-asc') sortedOrders.sort((a, b) => a.amount - b.amount);
                setOrders(sortedOrders);
                message.info(`Sorted by ${key.replace('-', ' ')}`);
              }
            }}
            trigger={['click']}
          >
            <Button icon={<Filter className="w-4 h-4" />} className="h-11 px-6 border-slate-200 font-bold rounded-xl w-full sm:w-auto text-slate-600">Filters</Button>
          </Dropdown>
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
          dataSource={filteredOrders} 
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
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedOrder?.date.toUpperCase()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedOrder?.slot.toUpperCase()} SLOT</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-[10px] font-black uppercase mb-1">TOTAL AMOUNT</p>
                <p className="text-3xl font-black">₹{selectedOrder?.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Status Timeline */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" /> ORDER PROGRESS
                </h3>
                <Steps
                  current={
                    selectedOrder?.status === 'delivered' ? 4 :
                    selectedOrder?.status === 'dispatched' ? 3 :
                    selectedOrder?.status === 'confirmed' ? 2 :
                    selectedOrder?.status === 'placed' ? 1 : 0
                  }
                  size="small"
                  className="px-2 custom-steps"
                  labelPlacement="vertical"
                  items={[
                    { title: 'Placed', description: selectedOrder?.timeline.placed || 'Pending' },
                    { title: 'Confirmed', description: selectedOrder?.timeline.confirmed || 'Pending' },
                    { title: 'Dispatched', description: selectedOrder?.timeline.dispatched || 'Pending' },
                    { title: 'Delivered', description: selectedOrder?.timeline.delivered || 'Pending' },
                  ]}
                />
              </section>

              {/* Items Table */}
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" /> ORDER ITEMS
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">ITEM DETAILS</th>
                        <th className="p-4 text-center">QTY</th>
                        <th className="p-4 text-right">PRICE</th>
                        <th className="p-4 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedOrder?.items.map((item, i) => (
                        <tr key={i} className="text-sm group hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sku}</p>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700">{item.qty}</td>
                          <td className="p-4 text-right font-bold text-slate-700">₹{item.price.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-blue-600">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              {/* Delivery Info */}
              <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">DELIVERY INFO</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">SHIPPING ADDRESS</p>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedOrder?.address}</p>
                    </div>
                  </div>
                  <Divider className="my-0 border-slate-50" />
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">ASSIGNED PARTNER</p>
                      <p className="text-sm font-bold text-slate-800">{selectedOrder?.driver || 'Not Assigned'}</p>
                      {selectedOrder?.driver && (
                        <Button 
                          type="link" 
                          size="small" 
                          className="p-0 text-xs font-bold h-auto flex items-center gap-1 mt-1"
                          onClick={() => navigate('/map')}
                        >
                          Track on Map
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Summary */}
              <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">FINANCIAL SUMMARY</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold">₹{((selectedOrder?.amount || 0) / 1.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">GST (5%)</span>
                    <span className="font-bold">₹{((selectedOrder?.amount || 0) - ((selectedOrder?.amount || 0) / 1.05)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <Divider className="border-slate-800 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-blue-400">Total</span>
                    <span className="text-2xl font-black text-white">₹{selectedOrder?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-emerald-50/10 border border-emerald-500/20 text-emerald-400 text-center py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
                    PAID via WALLET
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 p-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Create New Order</h3>
              <p className="text-xs text-slate-500 font-medium">Enter customer and delivery details below</p>
            </div>
          </div>
        }
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Create Order"
        okButtonProps={{ 
          className: "bg-blue-600 h-10 px-6 rounded-lg font-bold",
          size: "large"
        }}
        cancelButtonProps={{ 
          className: "h-10 px-6 rounded-lg font-bold",
          size: "large"
        }}
        width={600}
        centered
        className="create-order-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrder}
          initialValues={{ slot: 'Morning' }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="customer"
              label={<span className="font-bold text-slate-700">Customer Name</span>}
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="e.g. John Doe" className="h-10 rounded-lg" />
            </Form.Item>

            <Form.Item
              name="orderNumber"
              label={<span className="font-bold text-slate-700">Order ID</span>}
              initialValue={`ORD-2026-${(orders.length + 1).toString().padStart(3, '0')}`}
            >
              <Input disabled className="h-10 rounded-lg bg-slate-50 text-slate-500 font-bold" />
            </Form.Item>

            <Form.Item
              name="amount"
              label={<span className="font-bold text-slate-700">Total Amount</span>}
              rules={[{ required: true, message: 'Please enter amount' }]}
              initialValue={0}
            >
              <InputNumber 
                prefix={<span className="text-slate-400">₹</span>}
                className="w-full h-10 rounded-lg flex items-center font-bold" 
                placeholder="0.00"
                precision={2}
                step={0.01}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\₹\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="slot"
              label={<span className="font-bold text-slate-700">Delivery Slot</span>}
            >
              <Select className="h-10 rounded-lg">
                <Select.Option value="Morning">Morning (8 AM - 12 PM)</Select.Option>
                <Select.Option value="Afternoon">Afternoon (12 PM - 4 PM)</Select.Option>
                <Select.Option value="Evening">Evening (4 PM - 8 PM)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label={<span className="font-bold text-slate-700">Delivery Address</span>}
              className="md:col-span-2"
              rules={[{ required: true, message: 'Please enter delivery address' }]}
            >
              <Input.TextArea rows={3} placeholder="Full delivery address..." className="rounded-lg" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
      
      {/* Assign Driver Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 p-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Assign Delivery Partner</h3>
              <p className="text-xs text-slate-500 font-medium">Select an available partner for {selectedOrder?.orderNumber}</p>
            </div>
          </div>
        }
        open={isAssignOpen}
        onCancel={() => setIsAssignOpen(false)}
        footer={null}
        width={500}
        centered
        className="assign-driver-modal"
      >
        <div className="space-y-3 mt-6">
          {drivers.map((driver) => (
            <div 
              key={driver.id}
              onClick={() => driver.status !== 'Offline' && handleAssignDriver(driver.name)}
              className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${
                driver.status === 'Offline' 
                  ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                  : 'bg-white border-slate-100 hover:border-blue-500 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar icon={<User />} className={driver.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'} />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{driver.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      driver.status === 'Available' ? 'bg-emerald-500' : 
                      driver.status === 'In Transit' ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />
                    {driver.status}
                  </p>
                </div>
              </div>
              {driver.status !== 'Offline' && (
                <Button size="small" className="opacity-0 group-hover:opacity-100 transition-opacity font-bold rounded-lg border-blue-500 text-blue-600">
                  Select
                </Button>
              )}
            </div>
          ))}
        </div>
      </Modal>


    </div>
  );
};

export default OrdersPage;
