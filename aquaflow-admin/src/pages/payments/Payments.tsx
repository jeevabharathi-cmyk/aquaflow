import React, { useState } from 'react';
import {
  IndianRupee, Search, Filter, Plus, MoreHorizontal, Download, ArrowUpRight, ArrowDownLeft,
  CheckCircle2, Clock, XCircle, CreditCard, Wallet, Receipt, TrendingUp, Eye, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table, Button, Input, Tag, Card, Avatar, Modal, Form, Select, InputNumber,
  message, Dropdown, Descriptions, Divider, DatePicker, Tabs, Statistic
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Payment {
  id: string;
  date: string;
  customer: string;
  type: 'incoming' | 'outgoing';
  method: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  notes: string;
}

const mockPayments: Payment[] = [
  { id: 'PAY-001', date: '2026-05-09', customer: 'Blue Star Apartments', type: 'incoming', method: 'UPI', amount: 12500, status: 'completed', reference: 'UPI-REF-78234', notes: 'Monthly subscription' },
  { id: 'PAY-002', date: '2026-05-09', customer: 'Rahul Deshmukh', type: 'incoming', method: 'Cash', amount: 450, status: 'completed', reference: 'CASH-0509', notes: 'Walk-in purchase' },
  { id: 'PAY-003', date: '2026-05-08', customer: 'Meera Textiles Ltd', type: 'incoming', method: 'Bank Transfer', amount: 28000, status: 'pending', reference: 'NEFT-93847', notes: 'Bulk order advance' },
  { id: 'PAY-004', date: '2026-05-08', customer: 'Aqua Supplies Co.', type: 'outgoing', method: 'Bank Transfer', amount: 45000, status: 'completed', reference: 'NEFT-83721', notes: 'Raw material purchase' },
  { id: 'PAY-005', date: '2026-05-07', customer: 'Priya Sharma', type: 'incoming', method: 'UPI', amount: 680, status: 'failed', reference: 'UPI-FAIL-221', notes: 'Payment timeout' },
  { id: 'PAY-006', date: '2026-05-07', customer: 'Hotel Grand Pune', type: 'incoming', method: 'Cheque', amount: 18500, status: 'pending', reference: 'CHQ-44210', notes: 'Post-dated cheque' },
  { id: 'PAY-007', date: '2026-05-06', customer: 'Vehicle Fuel Station', type: 'outgoing', method: 'Cash', amount: 3200, status: 'completed', reference: 'CASH-0506', notes: 'Fleet fuel expense' },
];

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [form] = Form.useForm();

  const filtered = payments.filter(p => {
    const s = searchText.toLowerCase();
    const matchSearch = p.customer.toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || p.reference.toLowerCase().includes(s);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchType = filterType === 'all' || p.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalIncoming = payments.filter(p => p.type === 'incoming' && p.status === 'completed').reduce((a, b) => a + b.amount, 0);
  const totalOutgoing = payments.filter(p => p.type === 'outgoing' && p.status === 'completed').reduce((a, b) => a + b.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0);

  const handleRecord = (values: any) => {
    const newPayment: Payment = {
      id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      customer: values.customer,
      type: values.type,
      method: values.method,
      amount: Number(values.amount),
      status: values.status || 'completed',
      reference: values.reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: values.notes || ''
    };
    setPayments([newPayment, ...payments]);
    message.success('Payment recorded successfully');
    setRecordModalOpen(false);
    form.resetFields();
  };

  const handleRetry = (payment: Payment) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'completed' as const } : p));
    message.success(`Payment ${payment.id} marked as completed`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AquaFlow', 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Report', 14, 24);
    doc.text(`Generated: ${now}`, 14, 30);

    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Received: Rs ${totalIncoming.toLocaleString()}`, 14, 54);
    doc.text(`Total Paid Out: Rs ${totalOutgoing.toLocaleString()}`, 80, 54);
    doc.text(`Pending: Rs ${totalPending.toLocaleString()}`, 150, 54);
    doc.text(`Net Balance: Rs ${(totalIncoming - totalOutgoing).toLocaleString()}`, 14, 60);
    doc.text(`Total Transactions: ${filtered.length}`, 80, 60);

    // Table
    autoTable(doc, {
      startY: 68,
      head: [['ID', 'Date', 'Customer', 'Type', 'Method', 'Amount', 'Status', 'Reference']],
      body: filtered.map(p => [
        p.id, p.date, p.customer, p.type === 'incoming' ? 'Received' : 'Paid',
        p.method, `Rs ${p.amount.toLocaleString()}`, p.status, p.reference
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`AquaFlow_Payments_${now.replace(/ /g, '_')}.pdf`);
    message.success('Payment report downloaded as PDF');
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'Transaction', key: 'tx',
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${r.type === 'incoming' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {r.type === 'incoming' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">{r.customer}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 font-bold flex items-center gap-1.5">
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{r.id}</span>
              {r.date}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Method', dataIndex: 'method', key: 'method',
      render: (m) => <Tag className="rounded-full border-none font-bold text-[10px] uppercase tracking-wider px-2" color="blue">{m}</Tag>
    },
    {
      title: 'Amount', key: 'amount',
      render: (_, r) => (
        <span className={`font-black text-base ${r.type === 'incoming' ? 'text-green-600' : 'text-red-500'}`}>
          {r.type === 'incoming' ? '+' : '-'}₹{r.amount.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Status', key: 'status',
      render: (_, r) => {
        const cfg = r.status === 'completed' ? { color: 'success', icon: <CheckCircle2 className="w-3 h-3" /> }
          : r.status === 'pending' ? { color: 'warning', icon: <Clock className="w-3 h-3" /> }
          : { color: 'error', icon: <XCircle className="w-3 h-3" /> };
        return <Tag color={cfg.color as any} icon={cfg.icon} className="rounded-full border-none font-bold text-[10px] uppercase tracking-wider px-2">{r.status}</Tag>;
      }
    },
    {
      title: 'Reference', dataIndex: 'reference', key: 'ref',
      render: (ref) => <span className="text-xs font-mono text-slate-500">{ref}</span>
    },
    {
      title: '', key: 'actions',
      render: (_, r) => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { setSelectedPayment(r); setDetailModalOpen(true); } },
            ...(r.status === 'failed' ? [{ key: 'retry', label: 'Retry / Mark Paid', icon: <RefreshCw className="w-4 h-4" />, onClick: () => handleRetry(r) }] : []),
            ...(r.status === 'pending' ? [{ key: 'confirm', label: 'Confirm Payment', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleRetry(r) }] : []),
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400" />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><IndianRupee className="w-6 h-6 text-blue-600" /></div>
            Payments
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Track all incoming and outgoing transactions.</p>
        </div>
        <div className="flex gap-3">
          <Button icon={<Download className="w-4 h-4" />} className="h-11 px-6 rounded-xl border-slate-200 font-bold" onClick={handleExportPDF}>Export PDF</Button>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} className="h-11 px-6 bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-100" onClick={() => { form.resetFields(); setRecordModalOpen(true); }}>Record Payment</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Received', value: `₹${(totalIncoming / 1000).toFixed(1)}K`, icon: ArrowDownLeft, color: 'emerald', trend: '+8%' },
          { label: 'Total Paid Out', value: `₹${(totalOutgoing / 1000).toFixed(1)}K`, icon: ArrowUpRight, color: 'red', trend: '-3%' },
          { label: 'Pending', value: `₹${(totalPending / 1000).toFixed(1)}K`, icon: Clock, color: 'amber', trend: `${payments.filter(p => p.status === 'pending').length} txns` },
          { label: 'Net Balance', value: `₹${((totalIncoming - totalOutgoing) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'blue', trend: '+12%' },
        ].map((m, i) => (
          <Card key={i} className="shadow-sm border-slate-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${m.color}-50 text-${m.color}-600`}><m.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">{m.value}</h3>
                  <span className="text-xs font-bold text-slate-400">{m.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white/50">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by customer, ID, or reference..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-11 h-11 border-slate-200 rounded-xl bg-slate-50/50" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onChange={v => setFilterType(v)} className="w-36 h-11 rounded-xl">
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="incoming">Incoming</Select.Option>
              <Select.Option value="outgoing">Outgoing</Select.Option>
            </Select>
            <Select value={filterStatus} onChange={v => setFilterStatus(v)} className="w-36 h-11 rounded-xl">
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </div>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }} className="aquaflow-table" />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Receipt className="w-6 h-6" /></div><span className="text-lg font-bold">Record Payment</span></div>}
        open={recordModalOpen} onCancel={() => setRecordModalOpen(false)} onOk={() => form.submit()}
        okText="Save Payment" okButtonProps={{ className: 'bg-blue-600 rounded-lg h-10 px-6 font-bold' }}
        cancelButtonProps={{ className: 'rounded-lg h-10 px-6 font-bold' }} width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleRecord} className="pt-4 grid grid-cols-2 gap-x-6" initialValues={{ type: 'incoming', method: 'UPI', status: 'completed' }}>
          <Form.Item name="type" label={<span className="font-bold text-slate-700">Type</span>}>
            <Select className="h-11 rounded-xl">
              <Select.Option value="incoming">Incoming (Received)</Select.Option>
              <Select.Option value="outgoing">Outgoing (Paid)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="method" label={<span className="font-bold text-slate-700">Method</span>}>
            <Select className="h-11 rounded-xl">
              {['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Card'].map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="customer" label={<span className="font-bold text-slate-700">Customer / Vendor</span>} rules={[{ required: true, message: 'Required' }]} className="col-span-2">
            <Input placeholder="Enter name..." className="h-11 rounded-xl" />
          </Form.Item>
          <Form.Item name="amount" label={<span className="font-bold text-slate-700">Amount (₹)</span>} rules={[{ required: true, message: 'Required' }]}>
            <InputNumber min={1} className="w-full h-11 rounded-xl" prefix="₹" placeholder="0.00" />
          </Form.Item>
          <Form.Item name="status" label={<span className="font-bold text-slate-700">Status</span>}>
            <Select className="h-11 rounded-xl">
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reference" label={<span className="font-bold text-slate-700">Reference ID</span>}>
            <Input placeholder="Auto-generated if blank" className="h-11 rounded-xl" />
          </Form.Item>
          <Form.Item name="notes" label={<span className="font-bold text-slate-700">Notes</span>}>
            <Input placeholder="e.g. Monthly order payment" className="h-11 rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Detail Modal */}
      <Modal
        title={<div className="pb-4 border-b border-slate-100 flex items-center gap-3"><div className={`p-2.5 rounded-xl ${selectedPayment?.type === 'incoming' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{selectedPayment?.type === 'incoming' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}</div><div><span className="text-lg font-bold block">{selectedPayment?.id}</span><span className="text-xs text-slate-500">{selectedPayment?.date}</span></div></div>}
        open={detailModalOpen} onCancel={() => setDetailModalOpen(false)}
        footer={<Button onClick={() => setDetailModalOpen(false)} className="rounded-lg h-10 px-6 font-bold">Close</Button>} width={550}
      >
        {selectedPayment && (
          <div className="pt-4 space-y-5">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">{selectedPayment.type === 'incoming' ? 'Amount Received' : 'Amount Paid'}</p>
              <h2 className={`text-4xl font-black ${selectedPayment.type === 'incoming' ? 'text-green-600' : 'text-red-500'}`}>
                {selectedPayment.type === 'incoming' ? '+' : '-'}₹{selectedPayment.amount.toLocaleString()}
              </h2>
            </div>
            <Descriptions bordered column={1} size="small" className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Customer">{selectedPayment.customer}</Descriptions.Item>
              <Descriptions.Item label="Method"><Tag color="blue" className="m-0 rounded-full border-none font-bold">{selectedPayment.method}</Tag></Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={selectedPayment.status === 'completed' ? 'success' : selectedPayment.status === 'pending' ? 'warning' : 'error'} className="m-0 rounded-full border-none font-bold uppercase">{selectedPayment.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Reference"><span className="font-mono">{selectedPayment.reference}</span></Descriptions.Item>
              <Descriptions.Item label="Notes">{selectedPayment.notes || '—'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
