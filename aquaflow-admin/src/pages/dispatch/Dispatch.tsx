import React, { useState } from 'react';
import { 
  Map as MapIcon, Truck, User, Navigation, Clock, CheckCircle2, AlertCircle,
  Search, Filter, MoreHorizontal, Plus, Phone, Mail, MapPin, Package, Fuel, Zap
} from 'lucide-react';
import { Button, Input, Tag, Card, Badge, Avatar, Tooltip, Modal, Drawer, Descriptions, message, Form, Select, Table, Divider, Progress } from 'antd';

interface Driver {
  id: number; name: string; status: string; location: string; battery: string; orders: number;
  phone: string; email: string; vehicle: string; licensePlate: string; rating: number; deliveriesToday: number;
}

const mockDrivers: Driver[] = [
  { id: 1, name: 'Vijay Singh', status: 'In Transit', location: 'Model Colony, Pune', battery: '85%', orders: 4, phone: '+91 98765 43210', email: 'vijay@aquaflow.in', vehicle: 'Tata Ace', licensePlate: 'MH-12-AB-1234', rating: 4.8, deliveriesToday: 12 },
  { id: 2, name: 'Suresh Raina', status: 'Delivering', location: 'Kothrud, Pune', battery: '42%', orders: 1, phone: '+91 87654 32109', email: 'suresh@aquaflow.in', vehicle: 'Mahindra Bolero', licensePlate: 'MH-12-CD-5678', rating: 4.5, deliveriesToday: 8 },
  { id: 3, name: 'Amit Kumar', status: 'Idle', location: 'Hub Office', battery: '98%', orders: 0, phone: '+91 76543 21098', email: 'amit@aquaflow.in', vehicle: 'Tata Ace', licensePlate: 'MH-12-EF-9012', rating: 4.9, deliveriesToday: 0 },
  { id: 4, name: 'Rajesh Patil', status: 'Maintenance', location: 'Service Center', battery: '12%', orders: 0, phone: '+91 65432 10987', email: 'rajesh@aquaflow.in', vehicle: 'Ashok Leyland Dost', licensePlate: 'MH-12-GH-3456', rating: 4.2, deliveriesToday: 0 },
];

const DispatchPage = () => {
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dispatchForm] = Form.useForm();

  const filteredDrivers = drivers.filter(d => {
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      d.name.toLowerCase().includes(term) || 
      d.location.toLowerCase().includes(term)
    );
    return matchesSearch;
  });

  const handleDriverClick = (driver: Driver) => { setSelectedDriver(driver); setDrawerOpen(true); };

  const statusColor = (s: string) => s === 'In Transit' ? 'blue' : s === 'Delivering' ? 'orange' : s === 'Idle' ? 'green' : 'default';

  const handleOptimize = () => {
    message.loading({ content: 'Optimizing routes...', key: 'opt', duration: 2 });
    setTimeout(() => { message.success({ content: 'Routes optimized! 3 routes updated for efficiency.', key: 'opt' }); setOptimizeOpen(false); }, 2000);
  };

  const handleDispatch = (values: any) => {
    message.success(`Dispatched ${values.driver} with ${values.priority} priority`);
    setDispatchOpen(false);
    dispatchForm.resetFields();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><MapIcon className="w-6 h-6 text-blue-600" /></div>
            Live Map
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor real-time fleet movement and delivery progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Navigation className="w-4 h-4" />} className="h-11 px-6 rounded-xl border-slate-200 font-bold" onClick={() => setOptimizeOpen(true)}>Optimize Routes</Button>
          <Button type="primary" className="h-11 px-6 bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-100" onClick={() => { dispatchForm.resetFields(); setDispatchOpen(true); }}>Dispatch Fleet</Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1">
        {/* Sidebar: Drivers List */}
        <div className="xl:col-span-1 space-y-4">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search drivers..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-10 h-10 rounded-xl border-slate-200 bg-white" />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id} className={`hover:border-blue-300 cursor-pointer transition-all shadow-sm ${selectedDriver?.id === driver.id ? 'border-blue-400 bg-blue-50/30' : 'border-slate-100'}`} styles={{ body: { padding: '12px' } }} onClick={() => handleDriverClick(driver)}>
                <div className="flex items-center gap-3">
                  <Badge dot color={statusColor(driver.status) as any}>
                    <Avatar shape="square" icon={<User />} className="bg-slate-100 text-slate-400 rounded-lg" />
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{driver.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Navigation className="w-2.5 h-2.5" /> {driver.location}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Tag className="rounded-full text-[10px] font-black border-none uppercase px-2 py-0" color={statusColor(driver.status)}>{driver.status}</Tag>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-500">{driver.orders} Orders</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="xl:col-span-3 min-h-[500px] relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          <img src="/delivery_map_placeholder_1778311879854.png" alt="Live Map" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 space-y-2">
              <Button type="text" icon={<Plus className="w-4 h-4" />} className="h-8 w-8 p-0 flex items-center justify-center" />
              <div className="h-px bg-slate-100 mx-2" />
              <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} className="h-8 w-8 p-0 flex items-center justify-center" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4">
            {[
              { icon: Truck, label: 'Active Vehicles', value: '12 / 15', color: 'blue' },
              { icon: CheckCircle2, label: 'On Time', value: '94.2%', color: 'emerald' },
              { icon: AlertCircle, label: 'Delayed', value: '3', color: 'orange' },
            ].map((s, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl flex items-center gap-4 flex-1 min-w-[200px]">
                <div className={`p-3 bg-${s.color}-50 rounded-xl`}><s.icon className={`w-5 h-5 text-${s.color}-600`} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <h4 className="text-xl font-black text-slate-900 leading-none">{s.value}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── Driver Detail Drawer ──── */}
      <Drawer title={<div className="flex items-center gap-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div><span className="font-bold text-lg">{selectedDriver?.name}</span></div>} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={420}>
        {selectedDriver && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar size={64} icon={<User />} className="bg-blue-100 text-blue-600 rounded-xl shadow-md" />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900">{selectedDriver.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Tag color={statusColor(selectedDriver.status)} className="m-0 rounded-full border-none font-bold text-[10px] uppercase">{selectedDriver.status}</Tag>
                  <span className="text-xs text-slate-400">⭐ {selectedDriver.rating}</span>
                </div>
              </div>
            </div>

            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label={<span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</span>}>{selectedDriver.phone}</Descriptions.Item>
              <Descriptions.Item label={<span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>}>{selectedDriver.email}</Descriptions.Item>
              <Descriptions.Item label={<span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Location</span>}>{selectedDriver.location}</Descriptions.Item>
              <Descriptions.Item label={<span className="flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Vehicle</span>}>{selectedDriver.vehicle} ({selectedDriver.licensePlate})</Descriptions.Item>
            </Descriptions>

            <div className="grid grid-cols-3 gap-3">
              <Card className="shadow-none border-slate-100 text-center" styles={{ body: { padding: 12 } }}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Orders</p>
                <p className="text-2xl font-black text-slate-900">{selectedDriver.orders}</p>
              </Card>
              <Card className="shadow-none border-slate-100 text-center" styles={{ body: { padding: 12 } }}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Today</p>
                <p className="text-2xl font-black text-slate-900">{selectedDriver.deliveriesToday}</p>
              </Card>
              <Card className="shadow-none border-slate-100 text-center" styles={{ body: { padding: 12 } }}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Battery</p>
                <p className={`text-2xl font-black ${parseInt(selectedDriver.battery) < 30 ? 'text-red-500' : 'text-green-600'}`}>{selectedDriver.battery}</p>
              </Card>
            </div>

            <Divider className="my-2" />
            <div className="flex gap-3">
              <Button icon={<Phone className="w-4 h-4" />} block className="h-10 rounded-xl font-bold" onClick={() => message.info(`Calling ${selectedDriver.name}...`)}>Call</Button>
              <Button icon={<Navigation className="w-4 h-4" />} type="primary" block className="h-10 rounded-xl font-bold bg-blue-600" onClick={() => message.info(`Tracking ${selectedDriver.name} on map`)}>Track</Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ──── Optimize Routes Modal ──── */}
      <Modal title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Navigation className="w-6 h-6" /></div><span className="text-lg font-bold">Optimize Routes</span></div>} open={optimizeOpen} onCancel={() => setOptimizeOpen(false)} footer={null} width={550}>
        <div className="pt-4 space-y-5">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <p className="text-sm text-emerald-800 font-semibold">AI-powered route optimization considers traffic, delivery windows, and vehicle capacity to reduce total travel time.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Routes', value: '4', sub: 'Currently running' },
              { label: 'Pending Deliveries', value: '18', sub: 'Awaiting dispatch' },
              { label: 'Est. Time Saved', value: '~35 min', sub: 'After optimization' },
              { label: 'Fuel Savings', value: '~12%', sub: 'Estimated reduction' },
            ].map((s, i) => (
              <Card key={i} className="shadow-none border-slate-100" styles={{ body: { padding: 14 } }}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-xl font-black text-slate-900">{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
              </Card>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button block className="h-10 rounded-xl font-bold" onClick={() => setOptimizeOpen(false)}>Cancel</Button>
            <Button type="primary" block className="h-10 rounded-xl font-bold bg-emerald-600" onClick={handleOptimize}>Run Optimization</Button>
          </div>
        </div>
      </Modal>

      {/* ──── Dispatch Fleet Modal ──── */}
      <Modal title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Truck className="w-6 h-6" /></div><span className="text-lg font-bold">Dispatch Fleet</span></div>} open={dispatchOpen} onCancel={() => setDispatchOpen(false)} onOk={() => dispatchForm.submit()} okText="Dispatch Now" okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold' }} cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }} width={550}>
        <Form form={dispatchForm} layout="vertical" onFinish={handleDispatch} className="pt-4" initialValues={{ priority: 'normal' }}>
          <Form.Item name="driver" label={<span className="font-bold text-slate-700">Assign Driver</span>} rules={[{ required: true, message: 'Select a driver' }]}>
            <Select className="h-11 rounded-xl" placeholder="Select driver...">
              {drivers.filter(d => d.status === 'Idle').map(d => (
                <Select.Option key={d.id} value={d.name}>{d.name} — {d.vehicle} ({d.licensePlate})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="area" label={<span className="font-bold text-slate-700">Delivery Area</span>} rules={[{ required: true }]}>
            <Select className="h-11 rounded-xl" placeholder="Select area...">
              {['Kothrud', 'Model Colony', 'Hinjewadi', 'Baner', 'Wakad', 'Aundh'].map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="priority" label={<span className="font-bold text-slate-700">Priority</span>}>
            <Select className="h-11 rounded-xl">
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="high">High Priority</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label={<span className="font-bold text-slate-700">Notes</span>}>
            <Input.TextArea rows={2} placeholder="Special instructions..." className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DispatchPage;
