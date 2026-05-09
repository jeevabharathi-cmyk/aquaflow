import React, { useState } from 'react';
import { 
  Factory, 
  Layers, 
  Plus, 
  Trash2, 
  Info, 
  Package,
  Settings2,
  PlayCircle
} from 'lucide-react';
import { 
  Table, 
  Button, 
  Card, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  message,
  Avatar,
  Tabs,
  Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useStore, type Product } from '../../store/useStore';

const AssemblyPage = () => {
  const { products, materials, updateProduct, assembleProduct, ledger } = useStore();
  const [activeTab, setActiveTab] = useState('bom');
  
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [bomForm] = Form.useForm();
  const [assemblyForm] = Form.useForm();

  const handleOpenBOM = (product: Product) => {
    setSelectedProduct(product);
    bomForm.setFieldsValue({
      items: product.bom?.map(b => ({ materialId: b.materialId, quantity: b.quantity })) || []
    });
    setIsBOMModalOpen(true);
  };

  const handleOpenAssembly = (product: Product) => {
    if (!product.bom || product.bom.length === 0) {
      message.warning('Please configure BOM for this product first.');
      return;
    }
    setSelectedProduct(product);
    assemblyForm.setFieldsValue({ quantity: 1 });
    setIsAssemblyModalOpen(true);
  };

  const handleBOMUpdate = (values: any) => {
    if (!selectedProduct) return;
    const items = values.items?.map((item: any) => ({
      materialId: item.materialId,
      quantity: Number(item.quantity)
    })) || [];
    
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

  const calculateMaxAssembleQuantity = (product: Product) => {
    if (!product.bom || product.bom.length === 0) return 0;
    
    let maxQty = Infinity;
    for (const item of product.bom) {
      const material = materials.find(m => m.id === item.materialId);
      if (!material || item.quantity <= 0) return 0;
      const possibleQty = Math.floor(material.stock / item.quantity);
      if (possibleQty < maxQty) maxQty = possibleQty;
    }
    return maxQty === Infinity ? 0 : maxQty;
  };

  const bomColumns: ColumnsType<Product> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.image} shape="square" size={40} icon={<Package />} className="rounded-lg bg-slate-50" />
          <div>
            <p className="font-bold text-slate-900">{record.name}</p>
            <p className="text-xs text-slate-500 uppercase">{record.sku}</p>
          </div>
        </div>
      )
    },
    {
      title: 'BOM Status',
      key: 'bomStatus',
      render: (_, record) => {
        const isConfigured = record.bom && record.bom.length > 0;
        return (
          <Tag color={isConfigured ? 'blue' : 'default'} className="font-bold rounded-full px-3 border-none">
            {isConfigured ? `${record.bom.length} Components` : 'Not Configured'}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          onClick={() => handleOpenBOM(record)}
          className="text-blue-600 font-bold hover:bg-blue-50"
          icon={<Settings2 className="w-4 h-4" />}
        >
          Configure BOM
        </Button>
      )
    }
  ];

  const assemblyColumns: ColumnsType<Product> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.image} shape="square" size={40} icon={<Package />} className="rounded-lg bg-slate-50" />
          <div>
            <p className="font-bold text-slate-900">{record.name}</p>
            <p className="text-xs text-slate-500 uppercase">{record.sku}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Current Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <span className="font-bold text-slate-900">{stock} units</span>
      )
    },
    {
      title: 'Max Possible',
      key: 'maxPossible',
      render: (_, record) => {
        const max = calculateMaxAssembleQuantity(record);
        return (
          <span className={`font-bold ${max > 0 ? 'text-green-600' : 'text-orange-500'}`}>
            {max} units
          </span>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const canAssemble = calculateMaxAssembleQuantity(record) > 0;
        return (
          <Button 
            type={canAssemble ? "primary" : "default"}
            onClick={() => handleOpenAssembly(record)}
            disabled={!record.bom || record.bom.length === 0}
            className={canAssemble ? "bg-blue-600 font-bold" : ""}
            icon={<PlayCircle className="w-4 h-4" />}
          >
            Run Assembly
          </Button>
        );
      }
    }
  ];

  const assemblyHistory = ledger.filter(l => l.reason.startsWith('Assembly:'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
            BOM & Assembly
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage Bill of Materials and execute production runs.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 rounded-xl" styles={{ body: { padding: '20px' } }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'bom',
              label: (
                <span className="flex items-center gap-2 font-bold px-2">
                  <Layers className="w-4 h-4" />
                  BOM Configuration
                </span>
              ),
              children: (
                <div className="mt-4">
                  <Table 
                    columns={bomColumns} 
                    dataSource={products} 
                    rowKey="id" 
                    pagination={{ pageSize: 10 }} 
                  />
                </div>
              )
            },
            {
              key: 'assembly',
              label: (
                <span className="flex items-center gap-2 font-bold px-2">
                  <Factory className="w-4 h-4" />
                  Assembly Station
                </span>
              ),
              children: (
                <div className="mt-4 space-y-8">
                  <Table 
                    columns={assemblyColumns} 
                    dataSource={products} 
                    rowKey="id" 
                    pagination={{ pageSize: 10 }} 
                  />
                  
                  {assemblyHistory.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Assemblies (from Ledger)</h3>
                      <div className="space-y-3">
                        {assemblyHistory.slice(0, 10).map(entry => (
                          <div key={entry.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Factory className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{entry.reason}</p>
                                <p className="text-xs text-slate-500">{entry.date} by {entry.user}</p>
                              </div>
                            </div>
                            <Tag color="blue" className="m-0 font-bold border-none bg-blue-100 text-blue-700">
                              Deducted {entry.quantity} {materials.find(m => m.id === entry.materialId)?.unit || 'units'} of {entry.materialName}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* BOM Modal */}
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
        >
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={selectedProduct?.image} shape="square" size={56} className="rounded-lg shadow-sm border-2 border-white" />
              <div>
                <p className="font-bold text-slate-900">{selectedProduct?.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct?.sku}</p>
              </div>
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
                  className="h-12 border-slate-200 text-slate-500 rounded-xl font-bold"
                >
                  Add Component
                </Button>
              </div>
            )}
          </Form.List>

          <Alert
            className="mt-6 border-blue-100 bg-blue-50"
            icon={<Info className="text-blue-600" />}
            showIcon
            message={<span className="font-bold text-blue-900">Automatic Inventory Sync</span>}
            description={<span className="text-blue-700">Changes to BOM will be applied to future assembly orders.</span>}
          />
        </Form>
      </Modal>

      {/* Assembly Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            <span>Run Assembly Order</span>
          </div>
        }
        open={isAssemblyModalOpen}
        onCancel={() => setIsAssemblyModalOpen(false)}
        onOk={() => assemblyForm.submit()}
        okText="Execute Assembly"
        okButtonProps={{ 
          className: 'bg-blue-600',
          disabled: selectedProduct ? calculateMaxAssembleQuantity(selectedProduct) === 0 : false
        }}
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
                <Avatar src={selectedProduct?.image} shape="square" size={48} className="rounded-lg shadow-sm border border-white bg-white" />
                <div>
                  <p className="font-bold text-slate-900 leading-none">{selectedProduct?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedProduct?.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Max Possible</p>
                <p className="font-black text-blue-600 text-lg">{selectedProduct ? calculateMaxAssembleQuantity(selectedProduct) : 0}</p>
              </div>
            </div>
            
            <div className="space-y-2 border-t border-slate-200 pt-4 mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Required Inventory (per unit)</p>
              {selectedProduct?.bom?.map((item, i) => {
                const material = materials.find(m => m.id === item.materialId);
                const hasStock = material ? material.stock >= item.quantity : false;
                return (
                  <div key={i} className="flex justify-between text-xs items-center">
                    <span className="text-slate-600 font-medium">{material?.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Stock: {material?.stock}</span>
                      <span className={`font-bold ${hasStock ? 'text-slate-900' : 'text-red-500'}`}>
                        Req: {item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Form.Item 
            name="quantity" 
            label="Quantity to Assemble" 
            rules={[
              { required: true, message: 'Please enter quantity' },
              { 
                validator: async (_, value) => {
                  if (selectedProduct && value > calculateMaxAssembleQuantity(selectedProduct)) {
                    throw new Error('Quantity exceeds available raw materials');
                  }
                }
              }
            ]}
          >
            <InputNumber 
              min={1} 
              max={selectedProduct ? calculateMaxAssembleQuantity(selectedProduct) : 1}
              className="w-full h-11 flex items-center rounded-xl" 
              placeholder="Enter number of units..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssemblyPage;
