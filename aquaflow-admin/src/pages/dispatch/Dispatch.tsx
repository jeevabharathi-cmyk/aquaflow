import React from 'react';
import { 
  Map as MapIcon, 
  Truck, 
  User, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Button, Input, Tag, Card, Badge, Avatar, Tooltip } from 'antd';

const DispatchPage = () => {
  const drivers = [
    { id: 1, name: 'Vijay Singh', status: 'In Transit', location: 'Model Colony, Pune', battery: '85%', orders: 4 },
    { id: 2, name: 'Suresh Raina', status: 'Delivering', location: 'Kothrud, Pune', battery: '42%', orders: 1 },
    { id: 3, name: 'Amit Kumar', status: 'Idle', location: 'Hub Office', battery: '98%', orders: 0 },
    { id: 4, name: 'Rajesh Patil', status: 'Maintenance', location: 'Service Center', battery: '12%', orders: 0 },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <MapIcon className="w-6 h-6 text-blue-600" />
            </div>
            Live Map
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor real-time fleet movement and delivery progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Navigation className="w-4 h-4" />} className="h-11 px-6 rounded-xl border-slate-200 font-bold">Optimize Routes</Button>
          <Button type="primary" className="h-11 px-6 bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-100">Dispatch Fleet</Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1">
        {/* Sidebar: Drivers List */}
        <div className="xl:col-span-1 space-y-4">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input placeholder="Search drivers..." className="pl-10 h-10 rounded-xl border-slate-200 bg-white" />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {drivers.map((driver) => (
              <Card 
                key={driver.id} 
                className="hover:border-blue-200 cursor-pointer transition-all shadow-sm border-slate-100"
                styles={{ body: { padding: '12px' } }}
              >
                <div className="flex items-center gap-3">
                  <Badge dot color={driver.status === 'In Transit' ? 'blue' : driver.status === 'Idle' ? 'green' : 'orange'}>
                    <Avatar shape="square" icon={<User />} className="bg-slate-100 text-slate-400 rounded-lg" />
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{driver.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5" /> {driver.location}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Tag className="rounded-full text-[10px] font-black border-none uppercase px-2 py-0" color={driver.status === 'In Transit' ? 'blue' : 'default'}>
                    {driver.status}
                  </Tag>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500">{driver.orders} Orders</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="xl:col-span-3 min-h-[500px] relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          <img 
            src="/delivery_map_placeholder_1778311879854.png" 
            alt="Live Map" 
            className="w-full h-full object-cover"
          />
          
          {/* Map Overlay Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 space-y-2">
              <Button type="text" icon={<Plus className="w-4 h-4" />} className="h-8 w-8 p-0 flex items-center justify-center" />
              <div className="h-px bg-slate-100 mx-2" />
              <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} className="h-8 w-8 p-0 flex items-center justify-center" />
            </div>
          </div>

          {/* Map Stats Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-4">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Vehicles</p>
                <h4 className="text-xl font-black text-slate-900 leading-none">12 / 15</h4>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">On Time</p>
                <h4 className="text-xl font-black text-slate-900 leading-none">94.2%</h4>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="p-3 bg-orange-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Delayed</p>
                <h4 className="text-xl font-black text-slate-900 leading-none">3</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchPage;

