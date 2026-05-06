export type MaterialType = 'bottle' | 'cap' | 'label' | 'packaging' | 'other';
export type CostingMethod = 'FIFO' | 'Weighted Average';
export type AdjustmentReason = 'wastage' | 'return' | 'correction' | 'damage';

export interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  type: MaterialType;
  unit: string;
  specifications: Record<string, any> | null;
  stock_qty: number;
  min_stock_level: number;
  current_cost: number;
  costing_method: CostingMethod;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockLedger {
  id: string;
  material_id: string;
  change_qty: number;
  balance_after: number;
  reason: AdjustmentReason | 'purchase' | 'assembly' | 'manual';
  reference_id: string | null; // PO ID or Assembly ID
  performed_by: string;
  notes: string | null;
  created_at: string;
}
