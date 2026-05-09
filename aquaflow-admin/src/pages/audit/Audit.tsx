import * as React from 'react';
import { useState } from 'react';
import {
  History, Search, Filter, Package, AlertTriangle, MoreHorizontal,
  ShieldAlert, User, Clock, Database, Download, Calendar, Eye, Copy, Trash2, Flag
} from 'lucide-react';
import {
  Card, Table, Tag, Input, Button, Avatar, Badge, Statistic, Dropdown, Modal,
  Select, DatePicker, Descriptions, message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface AuditRecord {
  key: string; id: string; actor: string; role: string; action: string;
  entity: string; timestamp: string; ip: string; status: 'success' | 'warning' | 'failure';
}

const mockAudit: AuditRecord[] = [
  { key: '1', id: 'LOG-8821', actor: 'John Doe', role: 'Super Admin', action: 'Modified BOM', entity: 'Product: FP-1L-PREM', timestamp: 'Today, 02:30 PM', ip: '192.168.1.1', status: 'success' },
  { key: '2', id: 'LOG-8820', actor: 'Arun Varma', role: 'Inventory Manager', action: 'Received PO', entity: 'PO-202605-001', timestamp: 'Today, 11:15 AM', ip: '192.168.1.45', status: 'success' },
  { key: '3', id: 'LOG-8819', actor: 'System', role: 'Service Role', action: 'Daily Aggregation', entity: 'Daily Summary', timestamp: 'Today, 00:30 AM', ip: 'localhost', status: 'success' },
  { key: '4', id: 'LOG-8818', actor: 'Sita Ram', role: 'Admin Staff', action: 'Unauthorized Access Attempt', entity: 'Settings: Billing', timestamp: 'Yesterday, 06:45 PM', ip: '103.24.12.8', status: 'failure' },
  { key: '5', id: 'LOG-8817', actor: 'John Doe', role: 'Super Admin', action: 'Updated Pricing', entity: 'Product: FP-500ML-STD', timestamp: 'Yesterday, 03:10 PM', ip: '192.168.1.1', status: 'success' },
  { key: '6', id: 'LOG-8816', actor: 'Arun Varma', role: 'Inventory Manager', action: 'Stock Adjustment', entity: 'Material: BOT-1L-CLR', timestamp: 'Yesterday, 10:00 AM', ip: '192.168.1.45', status: 'warning' },
  { key: '7', id: 'LOG-8815', actor: 'System', role: 'Service Role', action: 'Backup Completed', entity: 'Database Backup', timestamp: '2 days ago', ip: 'localhost', status: 'success' },
  { key: '8', id: 'LOG-8814', actor: 'Priya Sharma', role: 'Sales Rep', action: 'Created Order', entity: 'ORD-2026-0542', timestamp: '2 days ago', ip: '10.0.0.88', status: 'success' },
];

const AuditPage = () => {
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditRecord | null>(null);

  const uniqueActions = [...new Set(mockAudit.map(a => a.action))];
  const uniqueUsers = [...new Set(mockAudit.map(a => a.actor))];

  const filtered = mockAudit.filter(r => {
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchSearch = searchTerms.length === 0 || searchTerms.every(term => 
      r.actor.toLowerCase().includes(term) || 
      r.action.toLowerCase().includes(term) || 
      r.entity.toLowerCase().includes(term) || 
      r.id.toLowerCase().includes(term)
    );
    const matchAction = filterAction === 'all' || r.action === filterAction;
    const matchUser = filterUser === 'all' || r.actor === filterUser;
    return matchSearch && matchAction && matchUser;
  });

  const handleExportCSV = () => {
    const header = 'ID,Actor,Role,Action,Entity,Timestamp,IP,Status\n';
    const rows = filtered.map(r => `${r.id},${r.actor},${r.role},${r.action},${r.entity},${r.timestamp},${r.ip},${r.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `AquaFlow_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    message.success('Audit log exported as CSV');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('AquaFlow — Audit Trail Report', 14, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${now}  |  Total Entries: ${filtered.length}`, 14, 26);

    autoTable(doc, {
      startY: 42,
      head: [['ID', 'Actor', 'Role', 'Action', 'Entity', 'Timestamp', 'IP', 'Status']],
      body: filtered.map(r => [r.id, r.actor, r.role, r.action, r.entity, r.timestamp, r.ip, r.status.toUpperCase()]),
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`AquaFlow_AuditLog_${now.replace(/ /g, '_')}.pdf`);
    message.success('Audit log exported as PDF');
  };

  const handleRowAction = (key: string, record: AuditRecord) => {
    setSelectedLog(record);
    switch (key) {
      case 'view': setDetailOpen(true); break;
      case 'copy':
        navigator.clipboard.writeText(`${record.id} | ${record.action} | ${record.actor} | ${record.timestamp}`);
        message.success('Log entry copied to clipboard'); break;
      case 'flag':
        message.warning(`Log ${record.id} flagged for review`); break;
      case 'exportPdf':
        const doc = new jsPDF();
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text(`Audit Log Detail — ${record.id}`, 14, 20);
        autoTable(doc, {
          startY: 30,
          body: [['ID', record.id], ['Actor', `${record.actor} (${record.role})`], ['Action', record.action],
            ['Entity', record.entity], ['Timestamp', record.timestamp], ['IP', record.ip], ['Status', record.status.toUpperCase()]],
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: { 0: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        });
        doc.save(`AuditLog_${record.id}.pdf`);
        message.success(`Exported ${record.id} as PDF`); break;
    }
  };

  const columns: ColumnsType<AuditRecord> = [
    {
      title: 'Activity Log', key: 'activity',
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar icon={r.actor === 'System' ? <Database className="w-4 h-4" /> : <User className="w-4 h-4" />} className={r.actor === 'System' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'} />
          <div>
            <p className="font-bold text-slate-900 leading-none">{r.action}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{r.entity}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Performed By', key: 'actor',
      render: (_, r) => (<div><p className="font-semibold text-slate-700 text-sm">{r.actor}</p><p className="text-[10px] text-slate-400 font-medium">{r.role}</p></div>)
    },
    {
      title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp',
      render: (t) => (<div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock className="w-3.5 h-3.5 text-slate-300" />{t}</div>)
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => <Badge status={s === 'success' ? 'success' : s === 'failure' ? 'error' : 'warning'} text={<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s}</span>} />
    },
    { title: 'IP Address', dataIndex: 'ip', key: 'ip', render: (ip) => <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-bold">{ip}</code> },
    {
      title: '', key: 'actions',
      render: (_, r) => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => handleRowAction('view', r) },
            { key: 'copy', label: 'Copy to Clipboard', icon: <Copy className="w-4 h-4" />, onClick: () => handleRowAction('copy', r) },
            { key: 'exportPdf', label: 'Export as PDF', icon: <Download className="w-4 h-4" />, onClick: () => handleRowAction('exportPdf', r) },
            { type: 'divider' },
            { key: 'flag', label: 'Flag for Review', icon: <Flag className="w-4 h-4" />, danger: true, onClick: () => handleRowAction('flag', r) },
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} className="text-slate-300" />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><History className="w-6 h-6 text-blue-600" /> Audit Trails</h1>
          <p className="text-slate-500 mt-1">Traceability log for all system activities and security events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Calendar className="w-4 h-4" />} onClick={() => setRangeOpen(true)}>Select Range</Button>
          <Dropdown menu={{ items: [
            { key: 'csv', label: 'Export CSV', icon: <Download className="w-4 h-4" />, onClick: handleExportCSV },
            { key: 'pdf', label: 'Export PDF', icon: <Download className="w-4 h-4" />, onClick: handleExportPDF },
          ]}} trigger={['click']}>
            <Button icon={<Download className="w-4 h-4" />} className="h-10 font-bold border-slate-200">Export ▾</Button>
          </Dropdown>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-100"><Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Logs (24h)</span>} value={filtered.length} prefix={<History className="w-4 h-4 mr-2 text-blue-500" />} /></Card>
        <Card className="shadow-sm border-slate-100"><Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">Security Alerts</span>} value={filtered.filter(r => r.status === 'failure').length} valueStyle={{ color: '#ef4444' }} prefix={<ShieldAlert className="w-4 h-4 mr-2" />} /></Card>
        <Card className="shadow-sm border-slate-100"><Statistic title={<span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Tasks</span>} value={filtered.filter(r => r.actor === 'System').length} prefix={<Database className="w-4 h-4 mr-2 text-indigo-500" />} /></Card>
      </div>

      {/* Filter Bar */}
      <Card styles={{ body: { padding: '12px 16px' } }} className="shadow-sm border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search logs by actor, action or entity..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-10 h-10 border-slate-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterAction} onChange={v => setFilterAction(v)} className="w-44 h-10" popupMatchSelectWidth={false}>
              <Select.Option value="all">All Actions</Select.Option>
              {uniqueActions.map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
            </Select>
            <Select value={filterUser} onChange={v => setFilterUser(v)} className="w-40 h-10" popupMatchSelectWidth={false}>
              <Select.Option value="all">All Users</Select.Option>
              {uniqueUsers.map(u => <Select.Option key={u} value={u}>{u}</Select.Option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card styles={{ body: { padding: 0 } }} className="shadow-sm border-slate-200 overflow-hidden">
        <Table columns={columns} dataSource={filtered} pagination={{ pageSize: 15 }} className="aquaflow-table" />
      </Card>

      {/* Select Range Modal */}
      <Modal title="Select Date Range" open={rangeOpen} onCancel={() => setRangeOpen(false)} footer={[
        <Button key="reset" onClick={() => { setDateRange(null); setRangeOpen(false); }}>Reset</Button>,
        <Button key="apply" type="primary" className="bg-blue-600" onClick={() => { setRangeOpen(false); message.success('Date range applied'); }}>Apply</Button>
      ]}>
        <div className="py-6 flex justify-center">
          <RangePicker value={dateRange} onChange={d => setDateRange(d as any)} className="w-full h-11 rounded-xl" />
        </div>
      </Modal>

      {/* Log Detail Modal */}
      <Modal
        title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Eye className="w-6 h-6" /></div><div><span className="text-lg font-bold block">Log Detail</span><span className="text-xs text-slate-500">{selectedLog?.id}</span></div></div>}
        open={detailOpen} onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)} className="rounded-lg h-10 px-6 font-bold">Close</Button>} width={550}
      >
        {selectedLog && (
          <div className="pt-4 space-y-5">
            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Log ID"><span className="font-mono font-bold">{selectedLog.id}</span></Descriptions.Item>
              <Descriptions.Item label="Action"><span className="font-bold">{selectedLog.action}</span></Descriptions.Item>
              <Descriptions.Item label="Entity">{selectedLog.entity}</Descriptions.Item>
              <Descriptions.Item label="Performed By">{selectedLog.actor} <Tag className="ml-2 rounded-full border-none text-[10px] font-bold" color="blue">{selectedLog.role}</Tag></Descriptions.Item>
              <Descriptions.Item label="Timestamp">{selectedLog.timestamp}</Descriptions.Item>
              <Descriptions.Item label="IP Address"><code className="bg-slate-50 px-2 py-0.5 rounded">{selectedLog.ip}</code></Descriptions.Item>
              <Descriptions.Item label="Status"><Badge status={selectedLog.status === 'success' ? 'success' : 'error'} text={<span className="font-bold uppercase">{selectedLog.status}</span>} /></Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditPage;
