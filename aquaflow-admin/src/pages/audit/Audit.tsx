import * as React from 'react';
import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  MapPin,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MoreHorizontal,
  Plus,
  Trash2,
  ShieldAlert,
  User,
  Clock,
  Database,
  Download,
  Calendar
} from 'lucide-react';
import { 
  Card, 
  Table, 
  Tag, 
  Input, 
  Button, 
  Space, 
  Avatar, 
  Badge,
  Statistic 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface AuditRecord {
  key: string;
  id: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'failure';
}

const mockAudit: AuditRecord[] = [
  {
    key: '1',
    id: 'LOG-8821',
    actor: 'John Doe',
    role: 'Super Admin',
    action: 'Modified BOM',
    entity: 'Product: FP-1L-PREM',
    timestamp: 'Today, 02:30 PM',
    ip: '192.168.1.1',
    status: 'success'
  },
  {
    key: '2',
    id: 'LOG-8820',
    actor: 'Arun Varma',
    role: 'Inventory Manager',
    action: 'Received PO',
    entity: 'PO-202605-001',
    timestamp: 'Today, 11:15 AM',
    ip: '192.168.1.45',
    status: 'success'
  },
  {
    key: '3',
    id: 'LOG-8819',
    actor: 'System',
    role: 'Service Role',
    action: 'Daily Aggregation',
    entity: 'Daily Summary',
    timestamp: 'Today, 00:30 AM',
    ip: 'localhost',
    status: 'success'
  },
  {
    key: '4',
    id: 'LOG-8818',
    actor: 'Sita Ram',
    role: 'Admin Staff',
    action: 'Unauthorized Access Attempt',
    entity: 'Settings: Billing',
    timestamp: 'Yesterday, 06:45 PM',
    ip: '103.24.12.8',
    status: 'failure'
  }
];

const AuditPage = () => {
  const columns: ColumnsType<AuditRecord> = [
    {
      title: 'Activity Log',
      key: 'activity',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={record.actor === 'System' ? <Database className="w-4 h-4" /> : <User className="w-4 h-4" />} 
            className={record.actor === 'System' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}
          />
          <div>
            <p className="font-bold text-slate-900 leading-none">{record.action}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{record.entity}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Performed By',
      key: 'actor',
      render: (_, record) => (
        <div>
          <p className="font-semibold text-slate-700 text-sm">{record.actor}</p>
          <p className="text-[10px] text-slate-400 font-medium">{record.role}</p>
        </div>
      )
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-300" />
          {time}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'success' ? 'success' : status === 'failure' ? 'error' : 'warning'} 
          text={<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{status}</span>}
        />
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip) => <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-bold">{ip}</code>
    },
    {
      title: '',
      key: 'actions',
      render: () => <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} className="text-slate-300" />
    }
  ];

  return (
    <div className="space-y-6">
       {/* Page Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Audit Trails
          </h1>
          <p className="text-slate-500 mt-1">Traceability log for all system activities and security events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Calendar className="w-4 h-4" />}>Select Range</Button>
          <Button icon={<Download className="w-4 h-4" />} className="h-10 font-bold border-slate-200">Export CSV</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="shadow-sm border-slate-100">
            <Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Logs (24h)</span>} value={1420} prefix={<History className="w-4 h-4 mr-2 text-blue-500" />} />
         </Card>
         <Card className="shadow-sm border-slate-100">
            <Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Alerts</span>} value={3} valueStyle={{color: '#ef4444'}} prefix={<ShieldAlert className="w-4 h-4 mr-2" />} />
         </Card>
         <Card className="shadow-sm border-slate-100">
            <Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Tasks</span>} value={48} prefix={<Database className="w-4 h-4 mr-2 text-indigo-500" />} />
         </Card>
      </div>

      {/* Filter Bar */}
      <Card bodyStyle={{ padding: '12px 16px' }} className="shadow-sm border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
             <Input placeholder="Search logs by actor, action or entity..." className="pl-10 h-10 border-slate-200 rounded-lg" />
           </div>
           <div className="flex items-center gap-2">
              <Button icon={<Filter className="w-4 h-4" />}>Filter by Action</Button>
              <Button icon={<Filter className="w-4 h-4" />}>Filter by User</Button>
           </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card bodyStyle={{ padding: 0 }} className="shadow-sm border-slate-200 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={mockAudit} 
          pagination={{ pageSize: 15 }}
          className="aquaflow-table"
        />
      </Card>
    </div>
  );
};

export default AuditPage;
