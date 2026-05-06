export type PaymentTerms = 'immediate' | 'net7' | 'net15' | 'net30';
export type POStatus = 'draft' | 'approved' | 'shipped' | 'received' | 'cancelled';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  gst_number: string | null;
  payment_terms: PaymentTerms;
  bank_details: {
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: POStatus;
  total_amount: number;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  material_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
}
