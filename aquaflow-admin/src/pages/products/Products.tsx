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
  Trash2,
  Upload as UploadIcon,
  X
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
  Empty,
  Upload,
  Select,
  InputNumber,
  Row,
  Col,
  Switch
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useStore, type Product, type BOMItem, type RawMaterial } from '../../store/useStore';

const ProductsPage = () => {
  const { products, materials, addProduct, updateProduct, deleteProduct, assembleProduct } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');

  // Handle deep linking from search
  React.useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setSelectedProduct(product);
        setIsEditMode(true);
        setIsModalOpen(true);
        // Remove param after opening
        searchParams.delete('id');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, products]);
  const [categoryFilter, setCategoryFilter] = useState('All Products');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const [form] = Form.useForm();
  const [bomForm] = Form.useForm();
  const [assemblyForm] = Form.useForm();

  const categories = ['All Products', '500ml', '1 Litre', '20 Litre Jars', 'Dispenser'];

  const filteredProducts = products.filter(p => {
    // Robust multi-keyword search
    const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim().length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      p.name.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
    
    const matchesCategory = categoryFilter === 'All Products' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesStock = stockFilter === 'all' || 
                         (stockFilter === 'low' ? p.stock < 100 : p.stock >= 100);
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const handleAddProduct = (values: any) => {
    const processedValues = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock || 0),
      image: imageUrl || 'https://via.placeholder.com/150?text=No+Image',
      bom: isEditMode ? selectedProduct?.bom || [] : []
    };

    if (isEditMode && selectedProduct) {
      updateProduct(selectedProduct.id, processedValues);
      message.success('Product updated successfully');
    } else {
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        ...processedValues,
        status: 'active'
      };
      addProduct(newProduct);
      message.success('Product created successfully');
    }
    
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedProduct(null);
    setImageUrl('');
    form.resetFields();
  };

  const handleAction = (key: string, product: Product) => {
    setSelectedProduct(product);
    if (key === 'edit') {
      setIsEditMode(true);
      setImageUrl(product.image);
      form.setFieldsValue(product);
      setIsModalOpen(true);
    } else if (key === 'bom') {
      setIsBOMModalOpen(true);
    } else if (key === 'assemble') {
      setIsAssemblyModalOpen(true);
    } else if (key === 'delete') {
      Modal.confirm({
        title: 'Remove Product',
        content: `Are you sure you want to remove ${product.name}?`,
        okText: 'Delete',
        okType: 'danger',
        onOk: () => {
          deleteProduct(product.id);
          message.success('Product removed');
        }
      });
    }
  };

  const handleBOMUpdate = (values: any) => {
    if (!selectedProduct) return;
    const items = values.items.map((item: any) => ({
      materialId: item.materialId,
      quantity: Number(item.quantity)
    }));
    updateProduct(selectedProduct.id, { bom: items });
    message.success('BOM configuration updated');
    setIsBOMModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAssemble = (values: any) => {
    if (!selectedProduct) return;
    const qty = Number(values.quantity);
    const result = assembleProduct(selectedProduct.id, qty);
    
    if (result.success) {
      message.success(result.message);
      setIsAssemblyModalOpen(false);
      setSelectedProduct(null);
      assemblyForm.resetFields();
    } else {
      message.error(result.message);
    }
  };

  const handleStatusToggle = (checked: boolean, productId: string) => {
    updateProduct(productId, { status: checked ? 'active' : 'inactive' });
    message.success(`Product status updated to ${checked ? 'Active' : 'Inactive'}`);
  };

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
            className="rounded-lg shadow-sm border border-slate-100"
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
          {Number(price).toFixed(2)}
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
          onClick={() => handleAction('bom', record)}
        >
          <Layers className="w-4 h-4" />
          {record.bom.length} Components
          <ChevronRight className="w-3 h-3" />
        </Button>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={record.status === 'active'} 
            onChange={(checked) => handleStatusToggle(checked, record.id)}
            className={record.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}
          />
          <Tag color={record.status === 'active' ? 'success' : 'default'} className="rounded-full px-2 border-none font-bold uppercase text-[9px] tracking-widest m-0">
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={{
          items: [
            { key: 'edit', label: 'Edit Product', icon: <Package className="w-4 h-4" />, onClick: () => handleAction('edit', record) },
            { key: 'bom', label: 'Configure BOM', icon: <Layers className="w-4 h-4" />, onClick: () => handleAction('bom', record) },
            { key: 'assemble', label: 'Assembly Order', icon: <Factory className="w-4 h-4" />, onClick: () => handleAction('assemble', record) },
            { type: 'divider' },
            { key: 'delete', label: 'Remove', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => handleAction('delete', record) },
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
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              setIsEditMode(false);
              setSelectedProduct(null);
              setImageUrl('');
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="h-11 px-6 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 font-bold flex-1 sm:flex-none"
          >
            Create Product
          </Button>
        </div>
      </div>

      {/* Categories & Filter */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <Button 
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full border-none font-semibold shrink-0 transition-all ${
              categoryFilter === cat 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
              : 'bg-white text-slate-600 border border-slate-200 hover:text-blue-600'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden" styles={{ body: { padding: '12px' } }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search products by name or SKU..." 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 h-11 border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
            />
          </div>
          <Dropdown menu={{
            items: [
              {
                key: 'status',
                label: 'Status',
                children: [
                  { key: 'status_all', label: 'All Statuses', onClick: () => setStatusFilter('all') },
                  { key: 'status_active', label: 'Active', onClick: () => setStatusFilter('active') },
                  { key: 'status_inactive', label: 'Inactive', onClick: () => setStatusFilter('inactive') },
                ]
              },
              {
                key: 'stock',
                label: 'Stock Level',
                children: [
                  { key: 'stock_all', label: 'All Stock', onClick: () => setStockFilter('all') },
                  { key: 'stock_low', label: 'Low Stock (< 100)', onClick: () => setStockFilter('low') },
                  { key: 'stock_ok', label: 'Normal Stock (100+)', onClick: () => setStockFilter('ok') },
                ]
              }
            ]
          }} trigger={['click']}>
            <Button icon={<Filter className="w-4 h-4" />} className={`h-11 px-6 font-bold rounded-xl border-slate-200 ${(statusFilter !== 'all' || stockFilter !== 'all') ? 'border-blue-500 text-blue-600 bg-blue-50' : 'text-slate-600'}`}>
              More Filters
            </Button>
          </Dropdown>
        </div>
      </Card>

      {/* List View */}
      {viewType === 'list' && (
        <Card className="shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: 0 } }}>
          <Table 
            columns={columns} 
            dataSource={filteredProducts} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="aquaflow-table"
          />
        </Card>
      )}

      {/* Grid View */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-all duration-300 group overflow-hidden border-slate-200" styles={{ body: { padding: 0 } }}>
              <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <Tag color={product.status === 'active' ? 'success' : 'default'} className="m-0 font-bold border-none shadow-sm rounded-full px-3">{product.status.toUpperCase()}</Tag>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{product.sku}</p>
                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-2 truncate">{product.name}</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Price</span>
                    <span className="text-lg font-black text-slate-900">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stock</span>
                    <span className={`text-lg font-black ${product.stock < 100 ? 'text-orange-500' : 'text-slate-900'}`}>{product.stock}</span>
                  </div>
                </div>
                <Divider className="my-3 opacity-50" />
                <div className="flex items-center justify-between">
                  <Button type="text" className="text-blue-600 font-bold p-0 flex items-center gap-1" onClick={() => handleAction('bom', product)}>
                    <Layers className="w-3.5 h-3.5" />
                    BOM Setup
                  </Button>
                  <Dropdown menu={{
                    items: [
                      { key: 'edit', label: 'Edit', onClick: () => handleAction('edit', product) },
                      { key: 'assemble', label: 'Assemble', onClick: () => handleAction('assemble', product) },
                      { key: 'delete', label: 'Remove', danger: true, onClick: () => handleAction('delete', product) },
                    ]
                  }} trigger={['click']}>
                    <Button icon={<MoreHorizontal className="w-4 h-4" />} type="text" className="text-slate-400" />
                  </Dropdown>
                </div>
              </div>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12">
              <Empty description="No products found matching your filters." />
            </div>
          )}
        </div>
      )}

      {/* Product Modal (Add/Edit) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>{isEditMode ? 'Edit Product' : 'Create New Product'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedProduct(null);
          setImageUrl('');
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText={isEditMode ? 'Save Changes' : 'Create Product'}
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddProduct}
          className="pt-4"
          initialValues={{ category: '1 Litre', status: 'active' }}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <Avatar 
                src={imageUrl} 
                shape="square" 
                size={120} 
                className="rounded-2xl shadow-md border-2 border-white bg-slate-50 flex items-center justify-center overflow-hidden"
                icon={<Package className="w-12 h-12 text-slate-200" />}
              />
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => setImageUrl(e.target?.result as string);
                  reader.readAsDataURL(file);
                  return false;
                }}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer">
                  <UploadIcon className="text-white w-6 h-6" />
                </div>
              </Upload>
              {imageUrl && (
                <Button 
                  icon={<X className="w-3 h-3" />} 
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white border-none shadow-lg"
                  onClick={() => setImageUrl('')}
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-widest">Product Image</p>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. 1L Premium Water" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sku" label="SKU / ID" rules={[{ required: true }]}>
                <Input placeholder="e.g. FP-1L-PREM" className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select className="rounded-lg">
                  {categories.slice(1).map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Base Price (₹)" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-lg" placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock" label="Initial Stock" initialValue={0}>
                <InputNumber min={0} className="w-full rounded-lg" disabled={isEditMode} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select className="rounded-lg">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* BOM Configuration Modal */}
      <Modal
        title={
          <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold block">Bill of Materials</span>
              <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">Configuration for {selectedProduct?.name}</span>
            </div>
          </div>
        }
        open={isBOMModalOpen}
        onCancel={() => setIsBOMModalOpen(false)}
        width={700}
        onOk={() => bomForm.submit()}
        okText="Save BOM Configuration"
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form
          form={bomForm}
          onFinish={handleBOMUpdate}
          layout="vertical"
          className="py-6"
          initialValues={{ items: selectedProduct?.bom.map(b => ({ materialId: b.materialId, quantity: b.quantity })) || [] }}
        >
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={selectedProduct?.image} shape="square" size={56} className="rounded-lg shadow-sm border-2 border-white" />
              <div>
                <p className="font-bold text-slate-900">{selectedProduct?.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct?.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Components</p>
              <p className="text-2xl font-black text-blue-600">{selectedProduct?.bom.length || 0}</p>
            </div>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-white hover:border-blue-200 transition-colors">
                    <Form.Item
                      {...restField}
                      name={[name, 'materialId']}
                      rules={[{ required: true, message: 'Missing component' }]}
                      className="flex-1 m-0"
                      label="Raw Material"
                    >
                      <Select placeholder="Select material" className="w-full">
                        {materials.map(m => (
                          <Select.Option key={m.id} value={m.id}>{m.name} ({m.sku})</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Missing qty' }]}
                      className="w-32 m-0"
                      label="Qty per unit"
                    >
                      <InputNumber min={0.001} step={0.001} className="w-full" placeholder="Qty" />
                    </Form.Item>
                    <Button 
                      icon={<Trash2 className="w-4 h-4" />} 
                      danger 
                      type="text" 
                      onClick={() => remove(name)}
                      className="mt-8"
                    />
                  </div>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add()} 
                  block 
                  icon={<Plus className="w-4 h-4" />}
                  className="h-12 border-slate-200 text-slate-500 rounded-xl"
                >
                  Add Component
                </Button>
              </div>
            )}
          </Form.List>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4">
             <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg">
                <Info className="w-5 h-5" />
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-blue-900">Automatic Inventory Sync</p>
               <p className="text-xs text-blue-700 leading-relaxed">Changes to BOM will be applied to future assembly orders. Existing stock levels are not affected.</p>
             </div>
          </div>
        </Form>
      </Modal>

      {/* Assembly Order Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            <span>New Assembly Order</span>
          </div>
        }
        open={isAssemblyModalOpen}
        onCancel={() => setIsAssemblyModalOpen(false)}
        onOk={() => assemblyForm.submit()}
        okText="Run Assembly"
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <Form
          form={assemblyForm}
          onFinish={handleAssemble}
          layout="vertical"
          className="pt-4"
        >
          <div className="p-4 bg-slate-50 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar src={selectedProduct?.image} shape="square" size={48} className="rounded-lg shadow-sm border border-white" />
                <div>
                  <p className="font-bold text-slate-900 leading-none">{selectedProduct?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedProduct?.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current Stock</p>
                <p className="font-black text-slate-900">{selectedProduct?.stock} units</p>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-200 pt-4 mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Required Inventory (estimate)</p>
              {selectedProduct?.bom.map((item, i) => {
                const material = materials.find(m => m.id === item.materialId);
                return (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{material?.name}</span>
                    <span className="text-slate-900 font-bold">x {item.quantity}</span>
                  </div>
                );
              })}
              {(!selectedProduct?.bom || selectedProduct.bom.length === 0) && (
                <p className="text-xs text-orange-500 font-bold italic">No BOM configured! Configure BOM first.</p>
              )}
            </div>
          </div>

          <Form.Item name="quantity" label="Quantity to Assemble" rules={[{ required: true, message: 'Please enter quantity' }]}>
            <InputNumber min={1} className="w-full h-11 flex items-center rounded-xl" placeholder="Enter number of units..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
