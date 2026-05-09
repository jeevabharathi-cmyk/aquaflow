import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Badge,
  Select,
  Switch
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const statusValue = Form.useWatch('status', form);

  const handleStatusToggle = (id: string, checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    message.success(`Supplier status updated to ${newStatus}`);
  };

  const handleAction = (key: string, supplier: Supplier) => {
    setSelectedSupplier(supplier);
    if (key === 'view') {
      setIsViewOpen(true);
    } else if (key === 'edit') {
      setIsEditMode(true);
      setIsModalOpen(true);
      form.setFieldsValue({
        ...supplier,
        status: supplier.status === 'active'
      });
    } else if (key === 'delete') {
      Modal.confirm({
        title: 'Delete Supplier',
        content: `Are you sure you want to delete ${supplier.name}? This action cannot be undone.`,
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
          message.success('Supplier deleted successfully');
        }
      });
    } else if (key === 'po') {
      message.loading('Initializing Purchase Order...', 1.5).then(() => {
        message.success(`PO Draft created for ${supplier.name}`);
      });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      supplier.name.toLowerCase().includes(term) || 
      supplier.code.toLowerCase().includes(term) ||
      supplier.email.toLowerCase().includes(term) ||
      supplier.contactPerson.toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('AquaFlow Supplier Report', 20, 25);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 32);

      // Table
      const tableData = filteredSuppliers.map(s => [
        s.code,
        s.name,
        s.contactPerson,
        s.email,
        s.status.toUpperCase(),
        s.materialsCount.toString()
      ]);

      autoTable(doc, {
        head: [['Code', 'Supplier Name', 'Contact', 'Email', 'Status', 'Items']],
        body: tableData,
        startY: 50,
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { font: 'helvetica', fontSize: 9 },
      });

      doc.save(`Suppliers_Report_${new Date().getTime()}.pdf`);
      message.success('PDF report exported successfully');
    } catch (error) {
      console.error('PDF Export Error:', error);
      message.error('Failed to export PDF. Please try again.');
    }
  };

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
      render: (status, record) => (
        <Switch 
          checked={status === 'active'} 
          onChange={(checked) => handleStatusToggle(record.id, checked)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          style={{ backgroundColor: status === 'active' ? '#22c55e' : '#94a3b8' }}
        />
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
      render: (_, record) => (
        <Dropdown menu={{
          items: [
            { key: 'view', label: 'View Details', icon: <ExternalLink className="w-4 h-4" /> },
            { key: 'edit', label: 'Edit Supplier', icon: <Edit className="w-4 h-4" /> },
            { key: 'po', label: 'Create PO', icon: <FileText className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
          ],
          onClick: ({ key }) => handleAction(key, record)
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400 hover:text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  const handleAddSupplier = () => {
    form.validateFields().then(values => {
      const statusValue = values.status === true || values.status === undefined ? 'active' : 'inactive';
      const processedValues = { ...values, status: statusValue };

      if (isEditMode && selectedSupplier) {
        setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? { ...s, ...processedValues } : s));
        message.success('Supplier updated successfully');
      } else {
        const newSupplier: Supplier = {
          id: (suppliers.length + 1).toString(),
          code: `SUP-${(suppliers.length + 1).toString().padStart(3, '0')}`,
          name: values.name,
          contactPerson: values.contactPerson,
          email: values.email,
          phone: values.phone,
          status: statusValue,
          materialsCount: 0,
          lastOrderDate: 'New'
        };
        setSuppliers([newSupplier, ...suppliers]);
        message.success('Supplier added successfully');
      }
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedSupplier(null);
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
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={() => {
            setIsEditMode(false);
            setSelectedSupplier(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Add New Supplier
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden" styles={{ body: { padding: '16px' } }}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name, code..." 
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              className="pl-10 h-11 border-slate-200 hover:border-blue-400 focus:border-blue-500 rounded-xl w-full bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Dropdown
              menu={{
                items: [
                  { key: 'all', label: 'All Status' },
                  { key: 'active', label: 'Active Only' },
                  { key: 'inactive', label: 'Inactive Only' },
                ],
                onClick: ({ key }) => setStatusFilter(key as any)
              }}
              trigger={['click']}
            >
              <Button icon={<Filter className="w-4 h-4" />} className="flex-1 sm:flex-none h-11 px-6 rounded-xl border-slate-200 font-semibold text-slate-600">
                {statusFilter === 'all' ? 'Status' : statusFilter.toUpperCase()}
              </Button>
            </Dropdown>
            <Button 
              icon={<Download className="w-4 h-4" />} 
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl border-slate-200 font-semibold text-slate-600"
              onClick={exportToPDF}
            >
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={filteredSuppliers} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="aquaflow-table"
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Add/Edit Supplier Modal */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <span className="text-lg font-bold">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleAddSupplier}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          form.resetFields();
        }}
        okText={isEditMode ? "Save Changes" : "Create Supplier"}
        cancelText="Cancel"
        width={650}
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-4"
          initialValues={{ status: true }}
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
            label="Active Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
              className="bg-slate-200"
              style={{ backgroundColor: statusValue === false ? '#94a3b8' : '#22c55e' }}
            />
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
            label="Customer Address"
            className="md:col-span-2"
          >
            <Input.TextArea rows={3} placeholder="Full address..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={null}
        footer={null}
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        width={500}
        centered
        styles={{ body: { padding: 0 } }}
        className="rounded-2xl overflow-hidden"
      >
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black border border-white/10">
              {selectedSupplier?.name.charAt(0)}
            </div>
            <div>
              <Tag color="success" className="mb-1 border-none font-bold uppercase tracking-widest text-[10px]">
                {selectedSupplier?.status}
              </Tag>
              <h2 className="text-xl font-black">{selectedSupplier?.name}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedSupplier?.code}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CONTACT PERSON</p>
              <p className="font-bold text-slate-900">{selectedSupplier?.contactPerson}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MATERIALS SUPPLIED</p>
              <p className="font-bold text-slate-900">{selectedSupplier?.materialsCount} Items</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">EMAIL ADDRESS</p>
                <p className="text-sm font-bold text-slate-800">{selectedSupplier?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PHONE NUMBER</p>
                <p className="text-sm font-bold text-slate-800">{selectedSupplier?.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">LOCATION</p>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  Building 7, Sector 12, Baner, Pune, Maharashtra 411045
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <Button 
              type="primary" 
              icon={<Edit className="w-4 h-4" />} 
              className="flex-1 bg-blue-600 font-bold h-10 rounded-lg"
              onClick={() => {
                setIsViewOpen(false);
                handleAction('edit', selectedSupplier!);
              }}
            >
              Edit Info
            </Button>
            <Button 
              icon={<FileText className="w-4 h-4" />} 
              className="flex-1 font-bold h-10 rounded-lg text-slate-600"
              onClick={() => handleAction('po', selectedSupplier!)}
            >
              Create PO
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
