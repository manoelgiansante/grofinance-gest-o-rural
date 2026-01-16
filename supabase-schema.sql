-- SCHEMA SUPABASE PARA AGROFINANCE
-- Execute este SQL no SQL Editor do seu Supabase Dashboard

-- =====================================================
-- 1. ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. FARMS (Fazendas)
-- =====================================================
CREATE TABLE IF NOT EXISTS farms (
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

-- =====================================================
-- 3. OPERATIONS (Operações)
-- =====================================================
CREATE TABLE IF NOT EXISTS operations (
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

-- =====================================================
-- 4. SUPPLIERS (Fornecedores)
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
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

-- =====================================================
-- 5. CLIENTS (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
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

-- =====================================================
-- 6. CATEGORIES (Categorias)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  subcategories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. COST CENTERS (Centros de Custo)
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES cost_centers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. EXPENSES (Despesas)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
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

-- =====================================================
-- 9. REVENUES (Receitas)
-- =====================================================
CREATE TABLE IF NOT EXISTS revenues (
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

-- =====================================================
-- 10. CONTRACTS (Contratos)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
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

-- =====================================================
-- 11. STOCK ITEMS (Itens de Estoque)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_items (
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

-- =====================================================
-- 12. STOCK MOVEMENTS (Movimentações de Estoque)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
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

-- =====================================================
-- 13. PURCHASE ORDERS (Ordens de Compra)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
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

-- =====================================================
-- 14. PURCHASE ORDER ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES stock_items(id),
  quantity DECIMAL(15, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  received_quantity DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. ASSETS (Patrimônio)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
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

-- =====================================================
-- 16. BANK ACCOUNTS (Contas Bancárias)
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
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

-- =====================================================
-- 17. TEAM MEMBERS (Membros da Equipe)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
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

-- =====================================================
-- 18. FISCAL ISSUERS (Emitentes Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_issuers (
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

-- =====================================================
-- 19. FISCAL RECIPIENTS (Destinatários Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_recipients (
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

-- =====================================================
-- 20. FISCAL OPERATION TEMPLATES (Templates de Operações Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_operation_templates (
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

-- =====================================================
-- 21. FISCAL PRODUCTS (Produtos Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_products (
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

-- =====================================================
-- 22. NFe (Notas Fiscais Eletrônicas)
-- =====================================================
CREATE TABLE IF NOT EXISTS nfes (
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

-- =====================================================
-- 23. MDFe (Manifesto Eletrônico)
-- =====================================================
CREATE TABLE IF NOT EXISTS mdfes (
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

-- =====================================================
-- 24. ATTACHMENTS (Anexos)
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
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

-- =====================================================
-- 25. DIVERGENCES (Divergências)
-- =====================================================
CREATE TABLE IF NOT EXISTS divergences (
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

-- =====================================================
-- 26. MONTH CLOSINGS (Fechamentos Mensais)
-- =====================================================
CREATE TABLE IF NOT EXISTS month_closings (
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

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (PUBLIC ACCESS - SEM AUTH)
-- Para desenvolvimento, permitindo acesso público
-- Em produção, você deve adicionar autenticação
-- =====================================================

CREATE POLICY "Allow public read access" ON farms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON farms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON farms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON farms FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON operations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON operations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON operations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON operations FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON suppliers FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON clients FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON cost_centers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON cost_centers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON cost_centers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON cost_centers FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON expenses FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON revenues FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON revenues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON revenues FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON revenues FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON contracts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON contracts FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON stock_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON stock_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON stock_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON stock_items FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON stock_movements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON stock_movements FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON purchase_orders FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON purchase_order_items FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON assets FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON bank_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON bank_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON bank_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON bank_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON team_members FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON fiscal_issuers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON fiscal_issuers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON fiscal_issuers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON fiscal_issuers FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON fiscal_recipients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON fiscal_recipients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON fiscal_recipients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON fiscal_recipients FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON fiscal_operation_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON fiscal_operation_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON fiscal_operation_templates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON fiscal_operation_templates FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON fiscal_products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON fiscal_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON fiscal_products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON fiscal_products FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON nfes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON nfes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON nfes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON nfes FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON mdfes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON mdfes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON mdfes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON mdfes FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON attachments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON attachments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON attachments FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON divergences FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON divergences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON divergences FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON divergences FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON month_closings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON month_closings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON month_closings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON month_closings FOR DELETE USING (true);

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
