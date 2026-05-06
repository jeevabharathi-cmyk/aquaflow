-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN (
                    'customer','driver','dispatcher','supervisor',
                    'inventory_manager','sales_manager','delivery_manager',
                    'admin','super_admin')),
  full_name       TEXT NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  email           TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS (extended info)
-- ============================================================
CREATE TABLE public.customers (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id),
  customer_code   TEXT UNIQUE NOT NULL,   -- CUST-00123
  account_type    TEXT DEFAULT 'individual' CHECK (account_type IN
                    ('individual','business','event_organizer')),
  company_name    TEXT,
  gstin           TEXT,
  advance_balance NUMERIC(10,2) DEFAULT 0.00,
  credit_limit    NUMERIC(10,2) DEFAULT 0.00,
  total_due       NUMERIC(10,2) DEFAULT 0.00,
  payment_terms   TEXT DEFAULT 'immediate'
                  CHECK (payment_terms IN ('immediate','net7','net15','net30')),
  preferred_slot  TEXT,
  notes           TEXT,
  registered_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DELIVERY ZONES
-- ============================================================
CREATE TABLE public.delivery_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  polygon         JSONB,   -- GeoJSON polygon
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DELIVERY ADDRESSES
-- ============================================================
CREATE TABLE public.addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES public.customers(id),
  label           TEXT DEFAULT 'Home',
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  state           TEXT NOT NULL,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  zone_id         UUID REFERENCES public.delivery_zones(id),
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE public.suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_code   TEXT UNIQUE NOT NULL,  -- SUP-001
  name            TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  gst_number      TEXT,
  payment_terms   TEXT,
  bank_details    JSONB,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RAW MATERIALS
-- ============================================================
CREATE TABLE public.raw_materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,   -- BOT-1L-CLR, CAP-STD-RED
  name            TEXT NOT NULL,
  material_type   TEXT NOT NULL CHECK (material_type IN
                    ('bottle','cap','label','packaging','other')),
  unit_of_measure TEXT NOT NULL DEFAULT 'piece',
  specifications  JSONB,   -- dimensions, colour, size, etc.
  current_cost    NUMERIC(10,4) DEFAULT 0,
  costing_method  TEXT DEFAULT 'weighted_avg'
                  CHECK (costing_method IN ('fifo','weighted_avg')),
  stock_qty       INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,   -- reorder threshold
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATERIAL-SUPPLIER (Many-to-Many)
-- ============================================================
CREATE TABLE public.material_suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id),
  unit_cost       NUMERIC(10,4) NOT NULL,
  lead_time_days  INTEGER,
  min_order_qty   INTEGER DEFAULT 1,
  is_preferred    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(material_id, supplier_id)
);

-- ============================================================
-- COMPATIBILITY RULES (BOM enforcement)
-- ============================================================
CREATE TABLE public.compatibility_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_sku      TEXT NOT NULL REFERENCES public.raw_materials(sku),
  cap_sku         TEXT NOT NULL REFERENCES public.raw_materials(sku),
  label_sku       TEXT REFERENCES public.raw_materials(sku),
  is_compatible   BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE public.purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number       TEXT UNIQUE NOT NULL,   -- PO-20260503-001
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','approved','shipped','received','cancelled')),
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_date   DATE,
  received_date   DATE,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  approved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE public.purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id           UUID NOT NULL REFERENCES public.purchase_orders(id),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost       NUMERIC(10,4) NOT NULL,
  line_total      NUMERIC(12,2) NOT NULL,
  received_qty    INTEGER DEFAULT 0
);

-- ============================================================
-- STOCK LEDGER (Audit trail for every stock movement)
-- ============================================================
CREATE TABLE public.stock_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity_change INTEGER NOT NULL,  -- positive = in, negative = out
  reason          TEXT NOT NULL CHECK (reason IN (
                    'po_receipt','assembly_deduction','adjustment',
                    'wastage','return','correction')),
  reference_type  TEXT,   -- 'purchase_order', 'assembly_order', 'adjustment'
  reference_id    UUID,
  balance_after   INTEGER NOT NULL,
  performed_by    UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (Finished goods)
-- ============================================================
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,   -- FP-1L-PREM
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,   -- '500ml','1L','2L','5L','20L'
  packaging_unit  INTEGER DEFAULT 1,  -- 1 for single, 12 for box of 12
  unit_label      TEXT DEFAULT 'bottle',
  base_price      NUMERIC(10,2) NOT NULL,
  gst_percent     NUMERIC(4,2) DEFAULT 0,
  hsn_code        TEXT,
  image_url       TEXT,
  finished_stock  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BILL OF MATERIALS
-- ============================================================
CREATE TABLE public.product_bom (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  material_id     UUID NOT NULL REFERENCES public.raw_materials(id),
  quantity_per_unit NUMERIC(10,4) NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, material_id, version)
);

-- ============================================================
-- COST VERSIONS (Computed cost snapshots)
-- ============================================================
CREATE TABLE public.cost_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  version         INTEGER NOT NULL,
  material_cost   NUMERIC(10,4) NOT NULL,
  overhead_cost   NUMERIC(10,4) DEFAULT 0,
  total_cost      NUMERIC(10,4) NOT NULL,
  effective_date  DATE NOT NULL,
  is_active       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, version)
);

-- ============================================================
-- ASSEMBLY ORDERS
-- ============================================================
CREATE TABLE public.assembly_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_number TEXT UNIQUE NOT NULL,   -- ASM-20260503-001
  product_id      UUID NOT NULL REFERENCES public.products(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  status          TEXT DEFAULT 'planned'
                  CHECK (status IN ('planned','in_progress','completed','cancelled')),
  bom_version     INTEGER NOT NULL,
  assembled_by    UUID REFERENCES public.profiles(id),
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_code    TEXT UNIQUE NOT NULL,   -- VEH-001
  registration    TEXT UNIQUE NOT NULL,
  vehicle_type    TEXT NOT NULL CHECK (vehicle_type IN ('truck','van','auto','bike')),
  capacity_kg     NUMERIC(8,2),
  capacity_litres NUMERIC(8,2),
  status          TEXT DEFAULT 'available'
                  CHECK (status IN ('available','in_transit','maintenance','inactive')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DRIVERS (extended partner info)
-- ============================================================
CREATE TABLE public.drivers (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id),
  driver_code     TEXT UNIQUE NOT NULL,   -- DRV-001
  license_number  TEXT,
  vehicle_id      UUID REFERENCES public.vehicles(id),
  zone_ids        UUID[],
  max_daily_load  INTEGER DEFAULT 30,
  is_online       BOOLEAN DEFAULT FALSE,
  current_lat     NUMERIC(10,8),
  current_lng     NUMERIC(11,8),
  last_location_at TIMESTAMPTZ,
  total_earnings  NUMERIC(10,2) DEFAULT 0.00,
  joined_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,   -- ORD-20260503-0001
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  address_id      UUID NOT NULL REFERENCES public.addresses(id),
  driver_id       UUID REFERENCES public.drivers(id),
  vehicle_id      UUID REFERENCES public.vehicles(id),
  dispatcher_id   UUID REFERENCES public.profiles(id),
  created_by_role TEXT,  -- 'customer', 'supervisor', 'admin'
  
  status          TEXT NOT NULL DEFAULT 'placed'
                  CHECK (status IN ('placed','confirmed','processing',
                                    'ready_to_ship','assigned','dispatched',
                                    'delivered','failed','cancelled','returned')),
  
  scheduled_date  DATE NOT NULL,
  scheduled_slot  TEXT CHECK (scheduled_slot IN ('morning','afternoon','evening','any')),
  
  subtotal        NUMERIC(10,2) NOT NULL,
  gst_amount      NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,
  total_weight_kg NUMERIC(8,2),   -- for vehicle planning
  total_volume_l  NUMERIC(8,2),
  
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','partial','refunded')),
  payment_method  TEXT CHECK (payment_method IN ('cash','online','wallet','advance','credit')),
  
  delivery_notes  TEXT,
  failure_reason  TEXT,
  cancel_reason   TEXT,
  
  placed_at       TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  processing_at   TIMESTAMPTZ,
  ready_at        TIMESTAMPTZ,
  assigned_at     TIMESTAMPTZ,
  dispatched_at   TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  
  proof_photo_url TEXT,
  proof_otp       TEXT,
  is_proof_verified BOOLEAN DEFAULT FALSE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  product_name    TEXT NOT NULL,     -- snapshot at order time
  product_sku     TEXT NOT NULL,
  unit_price      NUMERIC(10,2) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  line_total      NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- DELIVERY TRACKING (GPS history)
-- ============================================================
CREATE TABLE public.delivery_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id),
  driver_id       UUID NOT NULL REFERENCES public.drivers(id),
  latitude        NUMERIC(10,8) NOT NULL,
  longitude       NUMERIC(11,8) NOT NULL,
  speed           NUMERIC(6,2),
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE NOT NULL,   -- INV-20260503-0001
  order_id        UUID REFERENCES public.orders(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  subtotal        NUMERIC(10,2) NOT NULL,
  gst_amount      NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) NOT NULL,
  amount_paid     NUMERIC(10,2) DEFAULT 0,
  amount_due      NUMERIC(10,2),
  status          TEXT DEFAULT 'unpaid'
                  CHECK (status IN ('unpaid','partial','paid','overdue','cancelled')),
  pdf_url         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES public.invoices(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  amount          NUMERIC(10,2) NOT NULL,
  payment_method  TEXT NOT NULL,
  gateway_ref     TEXT,    -- Razorpay payment ID
  gateway_status  TEXT,
  collected_by    UUID REFERENCES public.profiles(id),
  payment_date    TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE public.wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  order_id        UUID REFERENCES public.orders(id),
  type            TEXT NOT NULL CHECK (type IN ('topup','deduction','refund','adjustment')),
  amount          NUMERIC(10,2) NOT NULL,
  balance_after   NUMERIC(10,2) NOT NULL,
  gateway_ref     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  plan_name       TEXT NOT NULL,
  product_id      UUID REFERENCES public.products(id),
  quantity_per_delivery INTEGER NOT NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('daily','alternate','weekly','custom')),
  custom_days     INTEGER[],
  delivery_slot   TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE,
  price_per_delivery NUMERIC(10,2) NOT NULL,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','paused','cancelled','expired')),
  next_delivery   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER PRICING (Overrides base_price)
-- ============================================================
CREATE TABLE public.customer_pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES public.customers(id),
  customer_group  TEXT,  -- for group-level pricing
  product_id      UUID NOT NULL REFERENCES public.products(id),
  custom_price    NUMERIC(10,2) NOT NULL,
  discount_type   TEXT CHECK (discount_type IN ('percent','absolute')),
  discount_value  NUMERIC(10,2),
  valid_from      DATE,
  valid_to        DATE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- SUPERVISOR-CUSTOMER MAPPING
-- ============================================================
CREATE TABLE public.supervisor_customer_map (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id   UUID NOT NULL REFERENCES public.profiles(id),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supervisor_id, customer_id)
);

-- ============================================================
-- NOTIFICATIONS LOG
-- ============================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT,
  data            JSONB,
  is_read         BOOLEAN DEFAULT FALSE,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (Immutable)
-- ============================================================
CREATE TABLE public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICE CHANGE AUDIT
-- ============================================================
CREATE TABLE public.price_change_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  customer_id     UUID REFERENCES public.customers(id),
  old_price       NUMERIC(10,2),
  new_price       NUMERIC(10,2) NOT NULL,
  effective_date  DATE NOT NULL,
  changed_by      UUID REFERENCES public.profiles(id),
  approved_by     UUID REFERENCES public.profiles(id),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY SUMMARY (Aggregation)
-- ============================================================
CREATE TABLE public.daily_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date    DATE NOT NULL UNIQUE,
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count    INTEGER DEFAULT 0,
  cancelled_count INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  cash_collected  NUMERIC(12,2) DEFAULT 0,
  online_collected NUMERIC(12,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  active_drivers  INTEGER DEFAULT 0,
  avg_delivery_time_mins INTEGER,
  total_units_delivered INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count    INTEGER DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  cash_collected  NUMERIC(12,2) DEFAULT 0,
  online_collected NUMERIC(12,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,
  best_selling_product_id UUID REFERENCES public.products(id),
  raw_material_cost NUMERIC(12,2) DEFAULT 0,
  gross_margin    NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- ============================================================
-- YEARLY SUMMARY
-- ============================================================
CREATE TABLE public.yearly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year            INTEGER NOT NULL UNIQUE,
  total_orders    INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  total_revenue   NUMERIC(14,2) DEFAULT 0,
  gst_collected   NUMERIC(12,2) DEFAULT 0,
  new_customers   INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,
  avg_monthly_revenue NUMERIC(12,2),
  total_raw_material_cost NUMERIC(14,2) DEFAULT 0,
  gross_profit    NUMERIC(14,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.customer_monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  order_count     INTEGER DEFAULT 0,
  total_units     INTEGER DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  total_paid      NUMERIC(10,2) DEFAULT 0,
  balance_due     NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, year, month)
);

-- ============================================================
-- DRIVER DAILY SUMMARY
-- ============================================================
CREATE TABLE public.driver_daily_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID NOT NULL REFERENCES public.drivers(id),
  summary_date    DATE NOT NULL,
  total_assigned  INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed    INTEGER DEFAULT 0,
  cash_collected  NUMERIC(10,2) DEFAULT 0,
  avg_delivery_mins INTEGER,
  km_traveled     NUMERIC(8,2),
  earnings        NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, summary_date)
);

-- ============================================================
-- PRODUCT MONTHLY SUMMARY
-- ============================================================
CREATE TABLE public.product_monthly_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  units_sold      INTEGER DEFAULT 0,
  revenue         NUMERIC(10,2) DEFAULT 0,
  material_cost   NUMERIC(10,2) DEFAULT 0,
  gross_margin    NUMERIC(10,2) DEFAULT 0,
  UNIQUE(product_id, year, month)
);

-- ============================================================
-- CRITICAL INDEXES
-- ============================================================
CREATE INDEX idx_orders_customer_date ON orders(customer_id, scheduled_date);
CREATE INDEX idx_orders_driver_status ON orders(driver_id, status);
CREATE INDEX idx_orders_status_date ON orders(status, scheduled_date);
CREATE INDEX idx_stock_ledger_material ON stock_ledger(material_id, created_at DESC);
CREATE INDEX idx_raw_materials_type ON raw_materials(material_type);
CREATE INDEX idx_daily_summary_date ON daily_summary(summary_date);
CREATE INDEX idx_monthly_summary_ym ON monthly_summary(year, month);
CREATE INDEX idx_customer_monthly ON customer_monthly_summary(customer_id, year, month);
CREATE INDEX idx_driver_daily ON driver_daily_summary(driver_id, summary_date);
CREATE INDEX idx_delivery_locations_order ON delivery_locations(order_id, recorded_at DESC);

-- ============================================================
-- RLS ENABLEMENT
-- ============================================================
DO $$ 
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || tbl || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin','super_admin') FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin','super_admin','inventory_manager','sales_manager',
                  'delivery_manager','dispatcher','supervisor')
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_driver_or_above()
RETURNS BOOLEAN AS $$
  SELECT role NOT IN ('customer') FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "orders_select" ON public.orders FOR SELECT
USING (
  customer_id = auth.uid()
  OR driver_id = auth.uid()
  OR public.is_staff()
);

CREATE POLICY "orders_insert" ON public.orders FOR INSERT
WITH CHECK (
  customer_id = auth.uid()
  OR public.is_staff()
);

CREATE POLICY "orders_update" ON public.orders FOR UPDATE
USING (
  (driver_id = auth.uid() AND public.get_my_role() = 'driver')
  OR public.is_staff()
);

CREATE POLICY "raw_materials_select" ON public.raw_materials FOR SELECT
USING (public.is_staff());

CREATE POLICY "raw_materials_write" ON public.raw_materials FOR ALL
USING (public.get_my_role() IN ('inventory_manager','admin','super_admin'));

CREATE POLICY "suppliers_all" ON public.suppliers FOR ALL
USING (public.get_my_role() IN ('inventory_manager','admin','super_admin'));

CREATE POLICY "products_customer_read" ON public.products FOR SELECT
USING (is_active = TRUE OR public.is_staff());

CREATE POLICY "products_staff_write" ON public.products FOR ALL
USING (public.is_staff());

CREATE POLICY "pricing_select" ON public.customer_pricing FOR SELECT
USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "invoices_select" ON public.invoices FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "wallet_own" ON public.wallet_transactions FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "locations_insert" ON public.delivery_locations FOR INSERT
WITH CHECK (driver_id = auth.uid() AND public.get_my_role() = 'driver');

CREATE POLICY "locations_select" ON public.delivery_locations FOR SELECT
USING (
  public.is_admin()
  OR driver_id = auth.uid()
  OR order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);

CREATE POLICY "admin_read_summaries" ON public.daily_summary FOR SELECT
USING (public.is_admin());

CREATE POLICY "service_write_daily" ON public.daily_summary FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "super_admin_audit" ON public.audit_logs FOR SELECT
USING (public.get_my_role() = 'super_admin');

CREATE POLICY "service_insert_audit" ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "customer_own_summary" ON public.customer_monthly_summary FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "driver_own_summary" ON public.driver_daily_summary FOR SELECT
USING (driver_id = auth.uid() OR public.is_admin());
