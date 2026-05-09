import * as React from 'react';
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Package,
  Layers,
  Factory,
  ArrowRight,
  ChevronRight,
  Info,
  DollarSign,
  Box,
  LayoutGrid,
  List,
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
  Tabs,
  Avatar,
  Divider,
  Empty
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
  bomItems: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'FP-1L-PREM',
    name: '1L Premium Mineral Water',
    category: '1 Litre',
    price: 20.00,
    stock: 450,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1560344820-143890226693?w=100&h=100&fit=crop',
    bomItems: 4
  },
  {
    id: '2',
    sku: 'FP-500ML-STD',
    name: '500ml Standard Water',
    category: '500ml',
    price: 12.00,
    stock: 1200,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1548919973-5dea585f396a?w=100&h=100&fit=crop',
    bomItems: 3
  },
  {
    id: '3',
    sku: 'FP-20L-JAR',
    name: '20L Drinking Water Jar',
    category: '20 Litre',
    price: 80.00,
    stock: 85,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1523362628242-f513a005271b?w=100&h=100&fit=crop',
    bomItems: 2
  }
];

const ProductsPage = () => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns: ColumnsType<Product> = [
    {
      title: 'Product Details',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <Avatar 
            src={record.image} 
            shape="square" 
            size={48} 
            icon={<Package />} 
            className="rounded-lg shadow-sm"
          />
          <div>
            <p className="font-bold text-slate-900 leading-none">{record.name}</p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
              <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{record.sku}</span>
              • {record.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Base Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <div className="flex items-center gap-1 font-bold text-slate-900">
          <span className="text-slate-400 text-xs">₹</span>
          {price.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Finished Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <div className="flex flex-col gap-1">
          <span className={`font-bold ${stock < 100 ? 'text-orange-500' : 'text-slate-700'}`}>
            {stock.toLocaleString()} units
          </span>
          {stock < 100 && (
            <Tag color="warning" className="text-[10px] font-bold border-none bg-orange-50 text-orange-600 m-0 w-fit">LOW STOCK</Tag>
          )}
        </div>
      )
    },
    {
      title: 'BOM Status',
      key: 'bom',
      render: (_, record) => (
        <Button 
          type="text" 
          size="small"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 h-8"
          onClick={() => {
            setSelectedProduct(record);
            setIsBOMModalOpen(true);
          }}
        >
          <Layers className="w-4 h-4" />
          {record.bomItems} Components
          <ChevronRight className="w-3 h-3" />
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'} className="rounded-full px-3 font-semibold border-none">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <Dropdown menu={{
          items: [
            { key: 'edit', label: 'Edit Product', icon: <Package className="w-4 h-4" /> },
            { key: 'bom', label: 'Configure BOM', icon: <Layers className="w-4 h-4" /> },
            { key: 'assemble', label: 'Assembly Order', icon: <Factory className="w-4 h-4" /> },
            { type: 'divider' },
            { key: 'delete', label: 'Remove', icon: <Trash2 className="w-4 h-4" />, danger: true },
          ]
        }} trigger={['click']}>
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
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            Product Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage finished goods and their manufacturing requirements.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Space.Compact className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm flex-1 sm:flex-none justify-center">
            <Button 
              type={viewType === 'list' ? 'primary' : 'text'} 
              icon={<List className="w-4 h-4" />} 
              onClick={() => setViewType('list')}
              className={`h-9 px-4 rounded-lg flex-1 sm:flex-none ${viewType === 'list' ? 'bg-blue-600 shadow-md shadow-blue-100' : 'text-slate-500'}`}
            />
            <Button 
              type={viewType === 'grid' ? 'primary' : 'text'} 
              icon={<LayoutGrid className="w-4 h-4" />} 
              onClick={() => setViewType('grid')}
              className={`h-9 px-4 rounded-lg flex-1 sm:flex-none ${viewType === 'grid' ? 'bg-blue-600 shadow-md shadow-blue-100' : 'text-slate-500'}`}
            />
          </Space.Compact>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} className="h-11 px-6 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 font-bold flex-1 sm:flex-none">
            Create Product
          </Button>
        </div>
      </div>

      {/* Categories & Filter */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
        <Button className="rounded-full bg-blue-600 text-white border-none shadow-sm hover:bg-blue-700 font-semibold shrink-0">All Products</Button>
        <Button className="rounded-full bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-semibold shrink-0">500ml</Button>
        <Button className="rounded-full bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-semibold shrink-0">1 Litre</Button>
        <Button className="rounded-full bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-semibold shrink-0">20 Litre Jars</Button>
        <Button className="rounded-full bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 font-semibold shrink-0">Dispenser</Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden" styles={{ body: { padding: '12px' } }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search products by name or SKU..." 
              className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
            />
          </div>
          <Button icon={<Filter className="w-4 h-4" />} className="h-11 px-6 font-bold rounded-xl border-slate-200 text-slate-600">More Filters</Button>
        </div>
      </Card>

      {/* List View */}
      {viewType === 'list' && (
        <Card className="shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
          <Table 
            columns={columns} 
            dataSource={mockProducts} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="aquaflow-table"
          />
        </Card>
      )}

      {/* Grid View */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-all duration-300 group overflow-hidden" styles={{ body: { padding: 0 } }}>
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <Tag color="success" className="m-0 font-bold border-none shadow-sm">{product.status.toUpperCase()}</Tag>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{product.sku}</p>
                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-2">{product.name}</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Price</span>
                    <span className="text-xl font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Stock</span>
                    <span className={`text-lg font-bold ${product.stock < 100 ? 'text-orange-500' : 'text-slate-900'}`}>{product.stock}</span>
                  </div>
                </div>
                <Divider className="my-3" />
                <div className="flex items-center justify-between">
                  <Button type="text" className="text-blue-600 font-bold p-0" onClick={() => {
                    setSelectedProduct(product);
                    setIsBOMModalOpen(true);
                  }}>BOM Setup</Button>
                  <Button icon={<MoreHorizontal className="w-4 h-4" />} type="text" className="text-slate-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* BOM Configuration Modal */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold block">Bill of Materials</span>
              <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">Configuration for {selectedProduct?.sku}</span>
            </div>
          </div>
        }
        open={isBOMModalOpen}
        onCancel={() => setIsBOMModalOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsBOMModalOpen(false)}>Close</Button>,
          <Button key="edit" type="primary" className="bg-blue-600">Update BOM</Button>
        ]}
      >
        <div className="py-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={selectedProduct?.image} shape="square" size={56} className="rounded-lg shadow-sm" />
              <div>
                <p className="font-bold text-slate-900">{selectedProduct?.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct?.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Est. Material Cost</p>
              <p className="text-2xl font-black text-slate-900">₹8.50</p>
            </div>
          </div>

          <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            Required Components
            <Badge count={selectedProduct?.bomItems} className="bg-blue-100 text-blue-600 shadow-none px-2 rounded font-bold" />
          </h5>

          <div className="space-y-3">
            {[
              { name: '1L PET Preform', qty: 1, unit: 'pcs', cost: 4.50 },
              { name: 'Standard Red Cap', qty: 1, unit: 'pcs', cost: 0.80 },
              { name: '1L Premium Label', qty: 1, unit: 'pcs', cost: 1.20 },
              { name: 'Outer Wrap / Box (shared)', qty: 0.08, unit: 'pcs', cost: 2.00 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Box className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">Unit Cost: ₹{item.cost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium uppercase">Qty per unit</p>
                    <p className="font-bold text-slate-900">{item.qty} {item.unit}</p>
                  </div>
                  <div className="text-right w-20">
                    <p className="text-xs text-slate-400 font-medium uppercase">Total</p>
                    <p className="font-bold text-blue-600">₹{(item.qty * item.cost).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4">
             <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg">
                <Info className="w-5 h-5" />
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-blue-900">Automatic Price Recalculation</p>
               <p className="text-xs text-blue-700 leading-relaxed">Updating raw material costs in the inventory will automatically reflect in this product's estimated cost.</p>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
