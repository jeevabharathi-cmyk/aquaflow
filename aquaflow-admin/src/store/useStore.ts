import { create } from 'zustand';

export interface RawMaterial {
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

export interface LedgerEntry {
  id: string;
  materialId: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user: string;
  reason: string;
}

export interface BOMItem {
  materialId: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
  bom: BOMItem[];
}

interface AppState {
  materials: RawMaterial[];
  products: Product[];
  ledger: LedgerEntry[];
  
  // Material Actions
  setMaterials: (materials: RawMaterial[]) => void;
  updateMaterialStock: (id: string, quantity: number, type: 'IN' | 'OUT', reason: string) => void;
  addMaterial: (material: RawMaterial) => void;
  updateMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  deleteMaterial: (id: string) => void;
  
  // Product Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Assembly
  assembleProduct: (productId: string, quantity: number) => { success: boolean, message: string };
}

const mockMaterials: RawMaterial[] = [
  { id: '1', sku: 'BOT-1L-CLR', name: '1L Clear PET Bottle', type: 'bottle', unit: 'pcs', stock: 2500, minLevel: 1000, cost: 4.50, lastUpdated: '2 hours ago' },
  { id: '2', sku: 'CAP-STD-RED', name: 'Standard Red Cap', type: 'cap', unit: 'pcs', stock: 800, minLevel: 1500, cost: 0.80, lastUpdated: '5 hours ago' },
  { id: '3', sku: 'LBL-1L-PREM', name: '1L Premium Label', type: 'label', unit: 'pcs', stock: 5000, minLevel: 2000, cost: 1.20, lastUpdated: '1 day ago' },
  { id: '4', sku: 'BOX-12-STD', name: '12-Pack Outer Box', type: 'packaging', unit: 'pcs', stock: 150, minLevel: 200, cost: 12.00, lastUpdated: '3 hours ago' }
];

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'FP-1L-PREM',
    name: '1L Premium Mineral Water',
    category: '1 Litre',
    price: 20.00,
    stock: 450,
    status: 'active',
    image: '/images/products/1l.png',
    bom: [
      { materialId: '1', quantity: 1 },
      { materialId: '2', quantity: 1 },
      { materialId: '3', quantity: 1 },
      { materialId: '4', quantity: 0.08 }
    ]
  },
  {
    id: '2',
    sku: 'FP-500ML-STD',
    name: '500ml Standard Water',
    category: '500ml',
    price: 12.00,
    stock: 1200,
    status: 'active',
    image: '/images/products/500ml.png',
    bom: [
      { materialId: '1', quantity: 1 },
      { materialId: '2', quantity: 1 },
      { materialId: '3', quantity: 1 }
    ]
  },
  {
    id: '3',
    sku: 'FP-20L-JAR',
    name: '20L Drinking Water Jar',
    category: '20 Litre Jars',
    price: 80.00,
    stock: 85,
    status: 'active',
    image: '/images/products/20l.png',
    bom: [
      { materialId: '2', quantity: 1 } // Using a placeholder material id since we don't have 20L jar material in mock
    ]
  }
];

export const useStore = create<AppState>((set, get) => ({
  materials: mockMaterials,
  products: mockProducts,
  ledger: [],
  
  setMaterials: (materials) => set({ materials }),
  
  addMaterial: (material) => set((state) => ({ 
    materials: [material, ...state.materials] 
  })),
  
  updateMaterial: (id, updates) => set((state) => ({
    materials: state.materials.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  
  deleteMaterial: (id) => set((state) => ({
    materials: state.materials.filter(m => m.id !== id),
    ledger: state.ledger.filter(e => e.materialId !== id)
  })),

  updateMaterialStock: (id, quantity, type, reason) => set((state) => {
    const material = state.materials.find(m => m.id === id);
    if (!material) return state;
    
    const newStock = type === 'IN' ? material.stock + quantity : material.stock - quantity;
    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      materialId: id,
      materialName: material.name,
      type,
      quantity,
      date: new Date().toLocaleString(),
      user: 'Admin User',
      reason
    };
    
    return {
      materials: state.materials.map(m => m.id === id ? { ...m, stock: newStock, lastUpdated: 'Just now' } : m),
      ledger: [newEntry, ...state.ledger]
    };
  }),

  setProducts: (products) => set({ products }),
  
  addProduct: (product) => set((state) => ({ 
    products: [product, ...state.products] 
  })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  assembleProduct: (productId, quantity) => {
    const state = get();
    const product = state.products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };
    
    // Check if enough materials
    for (const item of product.bom) {
      const material = state.materials.find(m => m.id === item.materialId);
      if (!material || material.stock < (item.quantity * quantity)) {
        return { success: false, message: `Insufficient stock for ${material?.name || 'unknown component'}` };
      }
    }
    
    // Deduct materials and add product stock
    product.bom.forEach(item => {
      state.updateMaterialStock(item.materialId, item.quantity * quantity, 'OUT', `Assembly: ${product.name}`);
    });
    
    state.updateProduct(productId, { stock: product.stock + quantity });
    
    return { success: true, message: `Successfully assembled ${quantity} units of ${product.name}` };
  }
}));
