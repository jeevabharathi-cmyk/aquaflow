import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Archive,
  BarChart2,
  PackageSearch,
  Trash2
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
  Progress,
  Select,
  Row,
  Col,
  Statistic,
  DatePicker
} from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';

interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  type: 'bottle' | 'cap' | 'label' | 'packaging' | 'other';
  unit: string;
  stock: number;
  minLevel: number;
  cost: number;
  lastUpdated: string;
}

const mockMaterials: RawMaterial[] = [
  {
    id: '1',
    sku: 'BOT-1L-CLR',
    name: '1L Clear PET Bottle',
    type: 'bottle',
    unit: 'pcs',
    stock: 2500,
    minLevel: 1000,
    cost: 4.50,
    lastUpdated: '2 hours ago'
  },
  {
    id: '2',
    sku: 'CAP-STD-RED',
    name: 'Standard Red Cap',
    type: 'cap',
    unit: 'pcs',
    stock: 800,
    minLevel: 1500,
    cost: 0.80,
    lastUpdated: '5 hours ago'
  },
  {
    id: '3',
    sku: 'LBL-1L-PREM',
    name: '1L Premium Label',
    type: 'label',
    unit: 'pcs',
    stock: 5000,
    minLevel: 2000,
    cost: 1.20,
    lastUpdated: '1 day ago'
  },
  {
    id: '4',
    sku: 'BOX-12-STD',
    name: '12-Pack Outer Box',
    type: 'packaging',
    unit: 'pcs',
    stock: 150,
    minLevel: 200,
    cost: 12.00,
    lastUpdated: '3 hours ago'
  }
];

interface LedgerEntry {
  id: string;
  materialId: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user: string;
  reason: string;
}

const InventoryPage = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>(mockMaterials);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    { id: '1', materialId: '1', materialName: '1L Clear PET Bottle', type: 'IN', quantity: 1000, date: '2026-05-09 10:00', user: 'Admin User', reason: 'Purchase Order' },
    { id: '2', materialId: '2', materialName: 'Standard Red Cap', type: 'OUT', quantity: 200, date: '2026-05-09 11:30', user: 'Production Mgr', reason: 'Assembly Line' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ledgerDateRange, setLedgerDateRange] = useState<any>(null);
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();

  // Dynamic Calculations
  const stats = {
    totalMaterials: materials.length,
    lowStockItems: materials.filter(m => m.stock <= m.minLevel).length,
    totalValue: materials.reduce((acc, m) => acc + (m.stock * m.cost), 0)
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          m.sku.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddMaterial = (values: any) => {
    const processedValues = {
      ...values,
      cost: Number(values.cost),
      minLevel: Number(values.minLevel),
      stock: Number(values.stock ?? (isEditMode ? selectedMaterial?.stock : values.initialStock) ?? 0)
    };

    if (isEditMode && selectedMaterial) {
      setMaterials(prev => prev.map(m => m.id === selectedMaterial.id ? { ...m, ...processedValues } : m));
      message.success('Material updated successfully');
    } else {
      const newMaterial: RawMaterial = {
        id: (materials.length + 1).toString(),
        sku: processedValues.sku,
        name: processedValues.name,
        type: processedValues.type,
        unit: processedValues.unit,
        stock: processedValues.stock,
        minLevel: processedValues.minLevel,
        cost: processedValues.cost,
        lastUpdated: 'Just now'
      };
      setMaterials([newMaterial, ...materials]);
      
      // Add initial stock to ledger if provided
      if (values.initialStock > 0) {
        const newLedgerEntry: LedgerEntry = {
          id: Math.random().toString(36).substr(2, 9),
          materialId: newMaterial.id,
          materialName: newMaterial.name,
          type: 'IN',
          quantity: values.initialStock,
          date: new Date().toLocaleString(),
          user: 'Admin User',
          reason: 'Initial Stock'
        };
        setLedgerEntries([newLedgerEntry, ...ledgerEntries]);
      }
      message.success('Material added successfully');
    }
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedMaterial(null);
    form.resetFields();
  };

  const handleStockUpdate = (values: any) => {
    if (!selectedMaterial) return;
    
    const quantity = Number(values.quantity);
    const type = values.type; // 'IN' or 'OUT'
    
    setMaterials(prev => prev.map(m => {
      if (m.id === selectedMaterial.id) {
        const newStock = type === 'IN' ? m.stock + quantity : m.stock - quantity;
        return { ...m, stock: newStock, lastUpdated: 'Just now' };
      }
      return m;
    }));

    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      type: type,
      quantity: quantity,
      date: new Date().toLocaleString(),
      user: 'Admin User',
      reason: values.reason || 'Manual Update'
    };

    setLedgerEntries([newEntry, ...ledgerEntries]);
    message.success(`Stock ${type === 'IN' ? 'added' : 'removed'} successfully`);
    setIsAddStockOpen(false);
    setSelectedMaterial(null);
    stockForm.resetFields();
  };

  const handleAction = (key: string, material: RawMaterial) => {
    setSelectedMaterial(material);
    if (key === 'edit') {
      setIsEditMode(true);
      form.setFieldsValue(material);
      setIsModalOpen(true);
    } else if (key === 'stock') {
      setIsAddStockOpen(true);
    } else if (key === 'stats') {
      setIsStatsOpen(true);
    } else if (key === 'delete') {
      Modal.confirm({
        title: 'Remove Material',
        content: `Are you sure you want to remove ${material.name}? This will also delete its history.`,
        okText: 'Delete',
        okType: 'danger',
        onOk: () => {
          setMaterials(prev => prev.filter(m => m.id !== material.id));
          setLedgerEntries(prev => prev.filter(e => e.materialId !== material.id));
          message.success('Material removed');
        }
      });
    }
  };

  const columns: ColumnsType<RawMaterial> = [
    {
      title: 'Material Info',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-none">{record.name}</p>
            <p className="text-xs text-slate-500 mt-1">{record.sku}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag className="rounded-md border-none bg-slate-100 text-slate-600 font-medium px-2 py-0.5">
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Stock Status',
      key: 'stock',
      render: (_, record) => {
        const isLow = record.stock <= record.minLevel;
        const percent = Math.min(100, (record.stock / (record.minLevel * 2)) * 100);
        return (
          <div className="w-48">
            <div className="flex justify-between mb-1">
              <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                {record.stock.toLocaleString()} {record.unit}
              </span>
              <span className="text-xs text-slate-400">Min: {record.minLevel}</span>
            </div>
            <Progress 
              percent={percent} 
              showInfo={false} 
              strokeColor={isLow ? '#ef4444' : '#10b981'} 
              size="small"
              className="m-0"
            />
          </div>
        );
      }
    },
    {
      title: 'Unit Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => <span className="font-semibold">₹{Number(cost || 0).toFixed(2)}</span>
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (time) => <span className="text-sm text-slate-500">{time}</span>
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={{
          items: [
            { key: 'stock', label: 'Add Stock', icon: <Plus className="w-4 h-4" /> },
            { key: 'edit', label: 'Edit Material', icon: <Archive className="w-4 h-4" /> },
            { key: 'ledger', label: 'Stock Ledger', icon: <History className="w-4 h-4" />, onClick: () => setIsLedgerOpen(true) },
            { key: 'stats', label: 'Usage Stats', icon: <BarChart2 className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'delete', label: 'Remove', icon: <Trash2 className="w-4 h-4" />, danger: true },
          ],
          onClick: ({ key }) => handleAction(key, record)
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400 hover:text-slate-600" />
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
              <Boxes className="w-6 h-6 text-blue-600" />
            </div>
            Raw Material Inventory
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Track and manage raw materials for water bottle production.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            icon={<History className="w-4 h-4" />} 
            className="h-11 px-4 rounded-xl border-slate-200 font-semibold flex-1 sm:flex-none"
            onClick={() => setIsLedgerOpen(true)}
          >
            Stock Ledger
          </Button>
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            className="h-11 px-6 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 font-bold flex-1 sm:flex-none"
            onClick={() => {
              setIsEditMode(false);
              setSelectedMaterial(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Material
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Materials</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalMaterials}</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.lowStockItems} Items</h3>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{(stats.totalValue / 100000).toFixed(1)} Lakh</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-white/50">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by SKU or name..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50"
            />
          </div>
          <Select 
            defaultValue="all" 
            className="w-full sm:w-40 h-11" 
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'bottle', label: 'Bottles' },
              { value: 'cap', label: 'Caps' },
              { value: 'label', label: 'Labels' },
              { value: 'packaging', label: 'Packaging' },
            ]}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredMaterials} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add Material Modal */}
      <Modal
        title={isEditMode ? "Edit Raw Material" : "Add New Raw Material"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedMaterial(null);
          form.resetFields();
        }}
        width={600}
        okButtonProps={{ className: 'bg-blue-600' }}
        okText={isEditMode ? "Save Changes" : "Create Material"}
      >
        <Form 
          form={form}
          onFinish={handleAddMaterial}
          layout="vertical" 
          className="pt-4 grid grid-cols-2 gap-x-4"
        >
          <Form.Item name="name" label="Material Name" className="col-span-2" rules={[{ required: true }]}>
            <Input placeholder="e.g. 500ml PET Preform" />
          </Form.Item>
          <Form.Item name="sku" label="SKU / Item Code" rules={[{ required: true }]}>
            <Input placeholder="RAW-001" disabled={isEditMode} />
          </Form.Item>
          <Form.Item name="type" label="Material Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Select.Option value="bottle">Bottle</Select.Option>
              <Select.Option value="cap">Cap</Select.Option>
              <Select.Option value="label">Label</Select.Option>
              <Select.Option value="packaging">Packaging</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="unit" label="Unit of Measure" rules={[{ required: true }]}>
            <Select placeholder="Select unit">
              <Select.Option value="pcs">Pieces (pcs)</Select.Option>
              <Select.Option value="kg">Kilograms (kg)</Select.Option>
              <Select.Option value="ltr">Litres (ltr)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cost" label="Unit Cost (₹)" rules={[{ required: true }]}>
            <Input type="number" step="0.01" prefix="₹" />
          </Form.Item>
          <Form.Item name="minLevel" label="Reorder Level" rules={[{ required: true }]}>
            <Input type="number" placeholder="Alert threshold" />
          </Form.Item>
          {!isEditMode && (
            <Form.Item name="initialStock" label="Initial Stock Qty">
              <Input type="number" defaultValue={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        title={`Update Stock: ${selectedMaterial?.name}`}
        open={isAddStockOpen}
        onOk={() => stockForm.submit()}
        onCancel={() => {
          setIsAddStockOpen(false);
          setSelectedMaterial(null);
          stockForm.resetFields();
        }}
        okButtonProps={{ className: 'bg-blue-600' }}
        okText="Update Stock"
      >
        <Form 
          form={stockForm} 
          onFinish={handleStockUpdate} 
          layout="vertical" 
          className="pt-4"
          initialValues={{ type: 'IN', reason: 'Stock Receipt' }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Transaction Type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="IN">Stock In (+)</Select.Option>
                <Select.Option value="OUT">Stock Out (-)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
          </div>
          <Form.Item name="reason" label="Reason / Notes" rules={[{ required: true }]}>
            <Input.TextArea placeholder="e.g. Received from Supplier SUP-001" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Ledger Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Stock Transaction Ledger</span>
          </div>
        }
        open={isLedgerOpen}
        onCancel={() => setIsLedgerOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsLedgerOpen(false)}>Close</Button>
        ]}
        width={800}
      >
        <div className="mb-4 flex justify-end">
          <DatePicker.RangePicker 
            onChange={(dates) => setLedgerDateRange(dates)}
            className="rounded-lg"
          />
        </div>
        <Table 
          dataSource={ledgerEntries.filter(entry => {
            if (!ledgerDateRange) return true;
            const entryDate = new Date(entry.date);
            return entryDate >= ledgerDateRange[0].toDate() && entryDate <= ledgerDateRange[1].toDate();
          })}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Material', dataIndex: 'materialName', key: 'materialName' },
            { 
              title: 'Type', 
              dataIndex: 'type', 
              key: 'type',
              render: (type) => (
                <Tag color={type === 'IN' ? 'green' : 'red'}>
                  {type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                </Tag>
              )
            },
            { 
              title: 'Qty', 
              dataIndex: 'quantity', 
              key: 'quantity',
              render: (qty, record) => (
                <span className={`font-bold ${record.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.type === 'IN' ? '+' : '-'}{qty}
                </span>
              )
            },
            { title: 'User', dataIndex: 'user', key: 'user' },
            { title: 'Reason', dataIndex: 'reason', key: 'reason' },
          ]}
        />
      </Modal>
      {/* Usage Stats Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <span>Inventory Usage & Level Analysis</span>
          </div>
        }
        open={isStatsOpen}
        onCancel={() => setIsStatsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsStatsOpen(false)}>Close</Button>
        ]}
        width={700}
      >
        <div className="space-y-6 pt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Card className="bg-slate-50 border-none">
                <Statistic 
                  title="Inventory Health" 
                  value={((materials.length - stats.lowStockItems) / materials.length * 100).toFixed(1)} 
                  suffix="%" 
                  valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card className="bg-slate-50 border-none">
                <Statistic 
                  title="Items to Reorder" 
                  value={stats.lowStockItems} 
                  valueStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
          
          <div className="h-[300px] w-full mt-4">
            <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Current Stock vs Reorder Levels</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materials}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sku" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                  {materials.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stock <= entry.minLevel ? '#ef4444' : '#2563eb'} />
                  ))}
                </Bar>
                <Bar dataKey="minLevel" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 italic text-center">Blue: Current Stock | Gray: Reorder Level | Red: Low Stock Alert</p>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryPage;
