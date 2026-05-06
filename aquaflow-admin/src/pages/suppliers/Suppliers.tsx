import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  Download
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
  Badge
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  materialsCount: number;
  lastOrderDate: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'SUP-001',
    name: 'Crystal Clear Plastics',
    contactPerson: 'Arun Varma',
    email: 'arun@crystalclear.com',
    phone: '+91 98765 43210',
    status: 'active',
    materialsCount: 12,
    lastOrderDate: '2026-05-01'
  },
  {
    id: '2',
    code: 'SUP-002',
    name: 'Prime Labels & Tags',
    contactPerson: 'Sita Ram',
    email: 'contact@primelabels.in',
    phone: '+91 87654 32109',
    status: 'active',
    materialsCount: 5,
    lastOrderDate: '2026-04-28'
  },
  {
    id: '3',
    code: 'SUP-003',
    name: 'Duraflow Caps Ltd',
    contactPerson: 'Kevin Peter',
    email: 'kevin@duraflow.com',
    phone: '+91 76543 21098',
    status: 'inactive',
    materialsCount: 8,
    lastOrderDate: '2026-03-15'
  }
];

const SuppliersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Supplier Info',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            {record.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-none">{record.name}</p>
            <p className="text-xs text-slate-500 mt-1">{record.code}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Contact Details',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail className="w-3 h-3 text-slate-400" />
            {record.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3 h-3 text-slate-400" />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Materials',
      dataIndex: 'materialsCount',
      key: 'materialsCount',
      render: (count) => (
        <Badge count={count} overflowCount={99} color="#2563eb">
          <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
            Items
          </div>
        </Badge>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'} className="rounded-full px-3">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      render: (date) => <span className="text-sm text-slate-500 font-medium">{date}</span>
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'View Details', icon: <ExternalLink className="w-4 h-4" /> },
            { key: 'edit', label: 'Edit Supplier', icon: <Edit className="w-4 h-4" /> },
            { key: 'po', label: 'Create PO', icon: <FileText className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400 hover:text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  const handleAddSupplier = () => {
    form.validateFields().then(values => {
      console.log('Success:', values);
      message.success('Supplier added successfully');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Supplier Management
          </h1>
          <p className="text-slate-500 mt-1">Manage your raw material providers and their performance.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />} 
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Supplier
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="shadow-sm border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name, code or contact..." 
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              className="pl-10 h-10 border-slate-200 hover:border-blue-400 focus:border-blue-500 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<Filter className="w-4 h-4" />} className="h-10 border-slate-200">Status: All</Button>
            <Button icon={<Download className="w-4 h-4" />} className="h-10 border-slate-200">Export</Button>
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={mockSuppliers} 
          pagination={{ pageSize: 10 }}
          className="aquaflow-table"
        />
      </Card>

      {/* Add Supplier Modal */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">Add New Supplier</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleAddSupplier}
        onCancel={() => setIsModalOpen(false)}
        okText="Create Supplier"
        cancelText="Cancel"
        width={650}
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-4"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[{ required: true, message: 'Please enter supplier name' }]}
            className="md:col-span-2"
          >
            <Input placeholder="e.g. Crystal Clear Plastics" />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="Contact Person"
            rules={[{ required: true, message: 'Please enter contact person' }]}
          >
            <Input placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Tag color="success">ACTIVE</Tag>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input prefix={<Mail className="w-3 h-3 text-slate-400 mr-2" />} placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input prefix={<Phone className="w-3 h-3 text-slate-400 mr-2" />} placeholder="+91 00000 00000" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Office Address"
            className="md:col-span-2"
          >
            <Input.TextArea rows={3} placeholder="Full address..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
