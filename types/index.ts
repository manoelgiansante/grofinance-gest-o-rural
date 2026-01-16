export type UserRole = 'admin' | 'field' | 'approver' | 'financial' | 'accountant' | 'auditor';

export type ExpenseStatus = 
  | 'draft' 
  | 'pending_validation' 
  | 'pending_approval' 
  | 'approved' 
  | 'disputed' 
  | 'scheduled' 
  | 'paid' 
  | 'reconciled';

export type PaymentMethod = 'pix' | 'transfer' | 'boleto' | 'check' | 'card' | 'cash';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  operations: string[];
}

export interface Operation {
  id: string;
  name: string;
  type: 'confinamento' | 'cana' | 'compostagem' | 'sede' | 'other';
  color: string;
  icon: string;
  budget: number;
  spent: number;
}

export interface CostCenter {
  id: string;
  name: string;
  operationId: string;
  parent?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cpfCnpj: string;
  category: string;
}

export interface Attachment {
  id: string;
  type: 'invoice' | 'boleto' | 'receipt' | 'photo' | 'contract' | 'other';
  uri: string;
  name: string;
  size?: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Divergence {
  id: string;
  reason: string;
  expectedValue: number;
  chargedValue: number;
  evidence?: string;
  responsible?: string;
  deadline?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface Expense {
  id: string;
  description: string;
  supplierId: string;
  operationId: string;
  costCenterId?: string;
  category: string;
  subcategory?: string;
  negotiatedValue: number;
  invoiceValue?: number;
  actualValue?: number;
  date: Date;
  dueDate: Date;
  competence: Date;
  paymentMethod: PaymentMethod;
  installments?: number;
  currentInstallment?: number;
  status: ExpenseStatus;
  attachments: Attachment[];
  divergence?: Divergence;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidBy?: string;
  paidAt?: Date;
  notes?: string;
  tags?: string[];
  serviceConfirmed?: boolean;
  serviceConfirmedBy?: string;
  serviceConfirmedAt?: Date;
}

export interface MonthlyResult {
  operationId: string;
  month: string;
  revenue: number;
  expenses: number;
  result: number;
  expensesByCategory: { category: string; amount: number }[];
}

export interface DashboardStats {
  totalBudget: number;
  totalSpent: number;
  pendingApprovals: number;
  pendingPayments: number;
  disputed: number;
  monthExpenses: number;
  monthRevenue: number;
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  type: 'physical' | 'legal';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  stateRegistration?: string;
  active: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'revenue';
  subcategories?: string[];
  color?: string;
  icon?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bank?: string;
  accountNumber?: string;
  type: 'checking' | 'savings' | 'cash';
  initialBalance: number;
  currentBalance: number;
  active: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  type: 'input' | 'production';
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  avgCost: number;
  lastPurchasePrice?: number;
  lastPurchaseDate?: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  operationId?: string;
  supplierId?: string;
  invoiceNumber?: string;
  date: Date;
  notes?: string;
  createdBy: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  operationId: string;
  items: PurchaseOrderItem[];
  totalValue: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  requestDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface Contract {
  id: string;
  type: 'purchase' | 'sale';
  partnerId: string;
  operationId: string;
  product: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  createdAt: Date;
}

export interface Revenue {
  id: string;
  description: string;
  clientId: string;
  operationId: string;
  category: string;
  value: number;
  invoiceNumber?: string;
  date: Date;
  dueDate: Date;
  receivedDate?: Date;
  status: 'pending' | 'received' | 'overdue' | 'cancelled';
  paymentMethod: PaymentMethod;
  attachments: Attachment[];
  contractId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CashFlow {
  date: Date;
  description: string;
  type: 'in' | 'out';
  category: string;
  value: number;
  bankAccountId: string;
  operationId?: string;
  status: 'projected' | 'realized';
  relatedId?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'vehicle' | 'equipment' | 'building' | 'land' | 'other';
  operationId?: string;
  purchaseDate: Date;
  purchaseValue: number;
  currentValue: number;
  depreciationRate?: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: 'active' | 'maintenance' | 'inactive' | 'sold';
  notes?: string;
}

export interface Farm {
  id: string;
  name: string;
  cpfCnpj: string;
  stateRegistration?: string;
  area: number;
  city: string;
  state: string;
  active: boolean;
  operations: string[];
}

export interface MonthClosing {
  id: string;
  month: string;
  year: number;
  status: 'open' | 'closed' | 'auditing';
  closedBy?: string;
  closedAt?: Date;
  checklist: ClosingChecklistItem[];
  notes?: string;
}

export interface ClosingChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export type NFeStatus = 'draft' | 'authorized' | 'cancelled' | 'denied' | 'processing';
export type NFeType = 'saida' | 'entrada' | 'devolucao' | 'remessa';
export type FreightType = 'emitente' | 'destinatario' | 'terceiro' | 'sem_frete';

export interface FiscalIssuer {
  id: string;
  name: string;
  cpfCnpj: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  crt: '1' | '2' | '3';
  address: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  ibgeCode: string;
  phone?: string;
  email?: string;
  certificateA1?: string;
  certificatePassword?: string;
  certificateExpiresAt?: Date;
  active: boolean;
}

export interface FiscalRecipient {
  id: string;
  name: string;
  cpfCnpj: string;
  stateRegistration?: string;
  address: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  ibgeCode: string;
  phone?: string;
  email?: string;
  authorizedThirdParties?: string[];
}

export interface FiscalOperationTemplate {
  id: string;
  name: string;
  nature: string;
  cfop: string;
  type: NFeType;
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao';
  cstIcmsPadrao?: string;
  csosnPadrao?: string;
  automaticText?: string;
  futureExit?: boolean;
  createdAt: Date;
}

export interface FiscalProduct {
  id: string;
  name: string;
  ncm: string;
  cest?: string;
  unit: string;
  ean?: string;
  cfop: string;
  cstIcms?: string;
  csosn?: string;
  cstPis?: string;
  cstCofins?: string;
  icmsAliquot?: number;
  active: boolean;
}

export interface NFeItem {
  id: string;
  productId: string;
  productName: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  cstIcms?: string;
  csosn?: string;
  icmsBase?: number;
  icmsAliquot?: number;
  icmsValue?: number;
  cstPis?: string;
  pisBase?: number;
  pisAliquot?: number;
  pisValue?: number;
  cstCofins?: string;
  cofinsBase?: number;
  cofinsAliquot?: number;
  cofinsValue?: number;
}

export interface NFeTransport {
  freightType: FreightType;
  carrierId?: string;
  carrierName?: string;
  carrierCpfCnpj?: string;
  carrierStateRegistration?: string;
  carrierAddress?: string;
  carrierCity?: string;
  carrierState?: string;
  vehiclePlate?: string;
  vehicleState?: string;
  volumes?: number;
  grossWeight?: number;
  netWeight?: number;
  transitGuide?: boolean;
}

export interface NFeFunrural {
  enabled: boolean;
  base?: number;
  aliquot?: number;
  value?: number;
  automaticText?: string;
}

export interface NFePayment {
  method: 'dinheiro' | 'cheque' | 'cartao_credito' | 'cartao_debito' | 'credito_loja' | 'vale_alimentacao' | 'vale_refeicao' | 'vale_presente' | 'vale_combustivel' | 'boleto' | 'sem_pagamento' | 'outros';
  type: 'a_vista' | 'a_prazo';
  installments?: number;
  installmentValues?: number[];
  installmentDueDates?: Date[];
}

export interface NFe {
  id: string;
  number?: number;
  series?: number;
  issuerId: string;
  recipientId: string;
  operationTemplateId?: string;
  nature: string;
  cfop: string;
  type: NFeType;
  issueDate: Date;
  exitDate?: Date;
  items: NFeItem[];
  transport: NFeTransport;
  payment: NFePayment;
  funrural: NFeFunrural;
  productsValue: number;
  freightValue: number;
  insuranceValue: number;
  otherExpenses: number;
  discount: number;
  totalValue: number;
  icmsBase: number;
  icmsValue: number;
  additionalInfo?: string;
  status: NFeStatus;
  accessKey?: string;
  protocol?: string;
  xmlUrl?: string;
  danfeUrl?: string;
  createdBy: string;
  createdAt: Date;
  authorizedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface MDFe {
  id: string;
  number?: number;
  series?: number;
  issuerId: string;
  nfeIds: string[];
  status: 'draft' | 'authorized' | 'cancelled' | 'closed';
  vehiclePlate: string;
  vehicleState: string;
  driverCpf: string;
  driverName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  issueDate: Date;
  accessKey?: string;
  protocol?: string;
  createdBy: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  permissions: TeamPermission[];
  farmIds: string[];
  operationIds: string[];
  active: boolean;
  createdAt: Date;
}

export interface TeamPermission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'pay')[];
  valueLimit?: number;
}

export interface Field {
  id: string;
  name: string;
  farmId: string;
  area: number;
  unit: 'ha' | 'alqueire' | 'acre';
  latitude?: number;
  longitude?: number;
  soilType?: string;
  currentCrop?: string;
  active: boolean;
  notes?: string;
}

export interface Season {
  id: string;
  name: string;
  fieldId: string;
  crop: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  area: number;
  expectedYield: number;
  actualYield?: number;
  yieldUnit: string;
  budgetedCost: number;
  actualCost: number;
  budgetedRevenue: number;
  actualRevenue: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface SeasonCost {
  id: string;
  seasonId: string;
  category: string;
  description: string;
  budgeted: number;
  actual: number;
  date?: Date;
}

export interface FieldProfitability {
  fieldId: string;
  seasonId: string;
  totalRevenue: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPerHa: number;
  grossMarginPerUnit: number;
  roi: number;
}

export interface BarterContract {
  id: string;
  type: 'input_for_product' | 'product_for_input';
  supplierId?: string;
  clientId?: string;
  operationId: string;
  inputProduct: string;
  inputQuantity: number;
  inputUnit: string;
  inputUnitValue: number;
  outputProduct: string;
  outputQuantity: number;
  outputUnit: string;
  outputUnitValue: number;
  exchangeRate: number;
  startDate: Date;
  settlementDate: Date;
  status: 'active' | 'partially_settled' | 'settled' | 'cancelled';
  settledInputQuantity: number;
  settledOutputQuantity: number;
  notes?: string;
  createdAt: Date;
}

export interface LeaseContract {
  id: string;
  lessorName: string;
  lessorCpfCnpj: string;
  fieldId: string;
  area: number;
  startDate: Date;
  endDate: Date;
  paymentType: 'fixed_cash' | 'fixed_product' | 'percentage' | 'partnership';
  fixedCashValue?: number;
  fixedProductQuantity?: number;
  fixedProductUnit?: string;
  percentageValue?: number;
  partnershipShare?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual' | 'harvest';
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface LeasePayment {
  id: string;
  leaseId: string;
  dueDate: Date;
  paidDate?: Date;
  value: number;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface Forecast {
  id: string;
  name: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  startDate: Date;
  endDate: Date;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedCashFlow: ForecastCashFlowItem[];
  assumptions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastCashFlowItem {
  date: Date;
  description: string;
  type: 'in' | 'out';
  category: string;
  value: number;
  accumulated: number;
}

export interface FinancialStatement {
  id: string;
  type: 'dre' | 'balance_sheet' | 'cash_flow';
  startDate: Date;
  endDate: Date;
  operationId?: string;
  data: any;
  createdAt: Date;
}

export interface DRELine {
  code: string;
  description: string;
  value: number;
  type: 'revenue' | 'expense' | 'result';
  level: number;
  parent?: string;
}

export interface AssetDepreciation {
  id: string;
  assetId: string;
  method: 'linear' | 'declining_balance' | 'units_of_production';
  usefulLife: number;
  residualValue: number;
  depreciationRate: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  lastCalculationDate: Date;
}
