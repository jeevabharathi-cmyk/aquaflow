export type ProductStatus = 'active' | 'inactive';
export type AssemblyStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  packaging_unit: number;
  unit_label: string;
  base_price: number;
  gst_percent: number;
  hsn_code: string | null;
  image_url: string | null;
  finished_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BOM {
  id: string;
  product_id: string;
  version: number;
  is_active: boolean;
  labour_cost: number;
  water_cost: number;
  electricity_cost: number;
  other_overhead: number;
  total_material_cost: number;
  total_production_cost: number;
  created_at: string;
}

export interface BOMItem {
  id: string;
  bom_id: string;
  material_id: string;
  quantity: number;
  unit_cost: number;
}

export interface AssemblyOrder {
  id: string;
  assembly_number: string;
  product_id: string;
  bom_id: string;
  quantity: number;
  status: AssemblyStatus;
  assembled_by: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}
