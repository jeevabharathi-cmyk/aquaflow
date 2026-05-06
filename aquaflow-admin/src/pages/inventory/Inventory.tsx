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
  Select
} from 'antd';
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

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

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
      render: (cost) => <span className="font-semibold">₹{cost.toFixed(2)}</span>
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
      render: () => (
        <Dropdown menu={{
          items: [
            { key: 'edit', label: 'Edit Material', icon: <Archive className="w-4 h-4" /> },
            { key: 'ledger', label: 'Stock Ledger', icon: <History className="w-4 h-4" /> },
            { key: 'stats', label: 'Usage Stats', icon: <BarChart2 className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'delete', label: 'Remove', icon: <Trash2 className="w-4 h-4" />, danger: true },
          ]
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} className="text-slate-400 hover:text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Raw Material Inventory
          </h1>
          <p className="text-slate-500 mt-1">Track and manage raw materials for water bottle production.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<History className="w-4 h-4" />}>Stock Ledger</Button>
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            className="h-10 px-6 bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            Add Material
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Materials</p>
              <h3 className="text-2xl font-bold text-slate-900">24</h3>
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
              <h3 className="text-2xl font-bold text-red-600">3 Items</h3>
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
              <h3 className="text-2xl font-bold text-slate-900">₹4.2 Lakh</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-slate-200 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by SKU or name..." 
              className="pl-10 h-10 border-slate-200 rounded-lg"
            />
          </div>
          <Select 
            defaultValue="all" 
            className="w-full md:w-40 h-10" 
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'bottle', label: 'Bottles' },
              { value: 'cap', label: 'Caps' },
              { value: 'label', label: 'Labels' },
            ]}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={mockMaterials} 
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add Material Modal */}
      <Modal
        title="Add New Raw Material"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form layout="vertical" className="pt-4 grid grid-cols-2 gap-x-4">
          <Form.Item name="name" label="Material Name" className="col-span-2" rules={[{ required: true }]}>
            <Input placeholder="e.g. 500ml PET Preform" />
          </Form.Item>
          <Form.Item name="sku" label="SKU / Item Code" rules={[{ required: true }]}>
            <Input placeholder="RAW-001" />
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
          <Form.Item name="initialStock" label="Initial Stock Qty">
            <Input type="number" defaultValue={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
