-- =====================================================
-- MIGRAÇÃO LIMPA - DROPA TODAS AS TABELAS E RECRIA
-- Execute este SQL completo no SQL Editor do Supabase
-- =====================================================

-- DROP ALL TABLES (em ordem reversa por causa das foreign keys)
DROP TABLE IF EXISTS asset_depreciations CASCADE;
DROP TABLE IF EXISTS financial_statements CASCADE;
DROP TABLE IF EXISTS forecasts CASCADE;
DROP TABLE IF EXISTS lease_payments CASCADE;
DROP TABLE IF EXISTS lease_contracts CASCADE;
DROP TABLE IF EXISTS barter_contracts CASCADE;
DROP TABLE IF EXISTS season_costs CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS month_closings CASCADE;
DROP TABLE IF EXISTS divergences CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS mdfes CASCADE;
DROP TABLE IF EXISTS nfes CASCADE;
DROP TABLE IF EXISTS fiscal_products CASCADE;
DROP TABLE IF EXISTS fiscal_operation_templates CASCADE;
DROP TABLE IF EXISTS fiscal_recipients CASCADE;
DROP TABLE IF EXISTS fiscal_issuers CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS stock_items CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS revenues CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS cost_centers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS farms CASCADE;

-- DROP FUNCTION
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- =====================================================
-- AGORA RECRIA TUDO DO ZERO
-- =====================================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FARMS (Fazendas)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  area DECIMAL(10, 2),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OPERATIONS (Operações)
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUPPLIERS (Fornecedores)
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  category TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLIENTS (Clientes)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  state_registration TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CATEGORIES (Categorias)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  subcategories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COST CENTERS (Centros de Custo)
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES cost_centers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EXPENSES (Despesas)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  operation_id UUID REFERENCES operations(id),
  cost_center_id UUID REFERENCES cost_centers(id),
  category TEXT NOT NULL,
  subcategory TEXT,
  negotiated_value DECIMAL(15, 2) NOT NULL,
  invoice_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  competence TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL,
  installments INTEGER,
  current_installment INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  tags TEXT[],
  service_confirmed BOOLEAN DEFAULT false,
  service_confirmed_by TEXT,
  service_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_by TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. REVENUES (Receitas)
CREATE TABLE revenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  operation_id UUID REFERENCES operations(id),
  category TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  invoice_number TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  received_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  contract_id UUID,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CONTRACTS (Contratos)
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  partner_id UUID,
  operation_id UUID REFERENCES operations(id),
  product TEXT NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_terms TEXT,
  delivery_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. STOCK ITEMS (Itens de Estoque)
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock DECIMAL(15, 2) DEFAULT 0,
  min_stock DECIMAL(15, 2) DEFAULT 0,
  avg_cost DECIMAL(15, 2) DEFAULT 0,
  last_purchase_price DECIMAL(15, 2),
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. STOCK MOVEMENTS (Movimentações de Estoque)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  operation_id UUID REFERENCES operations(id),
  supplier_id UUID REFERENCES suppliers(id),
  invoice_number TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. PURCHASE ORDERS (Ordens de Compra)
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id),
  operation_id UUID REFERENCES operations(id),
  total_value DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PURCHASE ORDER ITEMS
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES stock_items(id),
  quantity DECIMAL(15, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  received_quantity DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ASSETS (Patrimônio)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  operation_id UUID REFERENCES operations(id),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  purchase_value DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) NOT NULL,
  depreciation_rate DECIMAL(5, 2),
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. BANK ACCOUNTS (Contas Bancárias)
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bank TEXT,
  account_number TEXT,
  type TEXT NOT NULL,
  initial_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. TEAM MEMBERS (Membros da Equipe)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  permissions JSONB,
  farm_ids UUID[],
  operation_ids UUID[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. FISCAL ISSUERS (Emitentes Fiscais)
CREATE TABLE fiscal_issuers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  municipal_registration TEXT,
  crt TEXT NOT NULL,
  address TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  ibge_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  certificate_expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. FISCAL RECIPIENTS (Destinatários Fiscais)
CREATE TABLE fiscal_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  address TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  ibge_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  authorized_third_parties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. FISCAL OPERATION TEMPLATES (Templates de Operações Fiscais)
CREATE TABLE fiscal_operation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nature TEXT NOT NULL,
  cfop TEXT NOT NULL,
  type TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  cst_icms_padrao TEXT,
  csosn_padrao TEXT,
  automatic_text TEXT,
  future_exit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. FISCAL PRODUCTS (Produtos Fiscais)
CREATE TABLE fiscal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ncm TEXT NOT NULL,
  cest TEXT,
  unit TEXT NOT NULL,
  ean TEXT,
  cfop TEXT NOT NULL,
  cst_icms TEXT,
  csosn TEXT,
  cst_pis TEXT,
  cst_cofins TEXT,
  icms_aliquot DECIMAL(5, 2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. NFe (Notas Fiscais Eletrônicas)
CREATE TABLE nfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER,
  series INTEGER,
  issuer_id UUID REFERENCES fiscal_issuers(id),
  recipient_id UUID REFERENCES fiscal_recipients(id),
  operation_template_id UUID REFERENCES fiscal_operation_templates(id),
  nature TEXT NOT NULL,
  cfop TEXT NOT NULL,
  type TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  items JSONB NOT NULL,
  transport JSONB NOT NULL,
  payment JSONB NOT NULL,
  funrural JSONB,
  products_value DECIMAL(15, 2) NOT NULL,
  freight_value DECIMAL(15, 2) DEFAULT 0,
  insurance_value DECIMAL(15, 2) DEFAULT 0,
  other_expenses DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) NOT NULL,
  icms_base DECIMAL(15, 2) DEFAULT 0,
  icms_value DECIMAL(15, 2) DEFAULT 0,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  access_key TEXT,
  protocol TEXT,
  xml_url TEXT,
  danfe_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  authorized_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. MDFe (Manifesto Eletrônico)
CREATE TABLE mdfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER,
  series INTEGER,
  issuer_id UUID REFERENCES fiscal_issuers(id),
  nfe_ids UUID[],
  status TEXT NOT NULL DEFAULT 'draft',
  vehicle_plate TEXT NOT NULL,
  vehicle_state TEXT NOT NULL,
  driver_cpf TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  access_key TEXT,
  protocol TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. ATTACHMENTS (Anexos)
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  related_id UUID NOT NULL,
  related_type TEXT NOT NULL,
  type TEXT NOT NULL,
  uri TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. DIVERGENCES (Divergências)
CREATE TABLE divergences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  expected_value DECIMAL(15, 2) NOT NULL,
  charged_value DECIMAL(15, 2) NOT NULL,
  evidence TEXT,
  responsible TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 26. MONTH CLOSINGS (Fechamentos Mensais)
CREATE TABLE month_closings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  closed_by TEXT,
  closed_at TIMESTAMP WITH TIME ZONE,
  checklist JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year)
);

-- 27. FIELDS (Talhões/Campos)
CREATE TABLE fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  area DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ha',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  soil_type TEXT,
  current_crop TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. SEASONS (Safras/Temporadas)
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_harvest_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_harvest_date TIMESTAMP WITH TIME ZONE,
  area DECIMAL(15, 2) NOT NULL,
  expected_yield DECIMAL(15, 2) NOT NULL,
  actual_yield DECIMAL(15, 2),
  yield_unit TEXT NOT NULL,
  budgeted_cost DECIMAL(15, 2) DEFAULT 0,
  actual_cost DECIMAL(15, 2) DEFAULT 0,
  budgeted_revenue DECIMAL(15, 2) DEFAULT 0,
  actual_revenue DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. SEASON COSTS (Custos por Safra)
CREATE TABLE season_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budgeted DECIMAL(15, 2) DEFAULT 0,
  actual DECIMAL(15, 2) DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. BARTER CONTRACTS (Contratos de Troca)
CREATE TABLE barter_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  client_id UUID REFERENCES clients(id),
  operation_id UUID REFERENCES operations(id),
  input_product TEXT NOT NULL,
  input_quantity DECIMAL(15, 2) NOT NULL,
  input_unit TEXT NOT NULL,
  input_unit_value DECIMAL(15, 2) NOT NULL,
  output_product TEXT NOT NULL,
  output_quantity DECIMAL(15, 2) NOT NULL,
  output_unit TEXT NOT NULL,
  output_unit_value DECIMAL(15, 2) NOT NULL,
  exchange_rate DECIMAL(15, 6) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  settlement_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  settled_input_quantity DECIMAL(15, 2) DEFAULT 0,
  settled_output_quantity DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 31. LEASE CONTRACTS (Contratos de Arrendamento)
CREATE TABLE lease_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lessor_name TEXT NOT NULL,
  lessor_cpf_cnpj TEXT NOT NULL,
  field_id UUID REFERENCES fields(id),
  area DECIMAL(15, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_type TEXT NOT NULL,
  fixed_cash_value DECIMAL(15, 2),
  fixed_product_quantity DECIMAL(15, 2),
  fixed_product_unit TEXT,
  percentage_value DECIMAL(5, 2),
  partnership_share DECIMAL(5, 2),
  payment_frequency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32. LEASE PAYMENTS (Pagamentos de Arrendamento)
CREATE TABLE lease_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID REFERENCES lease_contracts(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  value DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33. FORECASTS (Projeções Financeiras)
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  projected_revenue DECIMAL(15, 2) DEFAULT 0,
  projected_expenses DECIMAL(15, 2) DEFAULT 0,
  projected_cash_flow JSONB,
  assumptions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 34. FINANCIAL STATEMENTS (Demonstrativos Financeiros)
CREATE TABLE financial_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  operation_id UUID REFERENCES operations(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 35. ASSET DEPRECIATIONS (Depreciação de Ativos)
CREATE TABLE asset_depreciations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  useful_life INTEGER NOT NULL,
  residual_value DECIMAL(15, 2) DEFAULT 0,
  depreciation_rate DECIMAL(5, 2) NOT NULL,
  monthly_depreciation DECIMAL(15, 2) NOT NULL,
  accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
  current_book_value DECIMAL(15, 2) NOT NULL,
  last_calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_operation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE divergences ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE barter_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (PUBLIC ACCESS)
-- =====================================================

CREATE POLICY "Allow public access" ON farms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON cost_centers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON revenues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON stock_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON fiscal_issuers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON fiscal_recipients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON fiscal_operation_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON fiscal_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON nfes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON mdfes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON divergences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON month_closings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON fields FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON seasons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON season_costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON barter_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON lease_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON lease_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON forecasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON financial_statements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON asset_depreciations FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_operations_farm_id ON operations(farm_id);
CREATE INDEX idx_expenses_operation_id ON expenses(operation_id);
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_revenues_client_id ON revenues(client_id);
CREATE INDEX idx_revenues_operation_id ON revenues(operation_id);
CREATE INDEX idx_revenues_status ON revenues(status);
CREATE INDEX idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX idx_nfes_issuer_id ON nfes(issuer_id);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_attachments_related ON attachments(related_id, related_type);
CREATE INDEX idx_fields_farm_id ON fields(farm_id);
CREATE INDEX idx_seasons_field_id ON seasons(field_id);
CREATE INDEX idx_seasons_status ON seasons(status);
CREATE INDEX idx_season_costs_season_id ON season_costs(season_id);
CREATE INDEX idx_barter_contracts_status ON barter_contracts(status);
CREATE INDEX idx_lease_contracts_field_id ON lease_contracts(field_id);
CREATE INDEX idx_lease_contracts_status ON lease_contracts(status);
CREATE INDEX idx_lease_payments_lease_id ON lease_payments(lease_id);
CREATE INDEX idx_asset_depreciations_asset_id ON asset_depreciations(asset_id);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_issuers_updated_at BEFORE UPDATE ON fiscal_issuers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_recipients_updated_at BEFORE UPDATE ON fiscal_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_products_updated_at BEFORE UPDATE ON fiscal_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfes_updated_at BEFORE UPDATE ON nfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mdfes_updated_at BEFORE UPDATE ON mdfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_month_closings_updated_at BEFORE UPDATE ON month_closings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barter_contracts_updated_at BEFORE UPDATE ON barter_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lease_contracts_updated_at BEFORE UPDATE ON lease_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_depreciations_updated_at BEFORE UPDATE ON asset_depreciations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
