import { supabase, supabaseRaw } from './supabase';

// =====================================================
// API SERVICE - Agrofinance
// Serviço centralizado para todas as operações do banco
// =====================================================

// ==================== FARMS ====================
export const FarmsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw.from('farms').select('*').order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabaseRaw.from('farms').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async create(farm: {
    name: string;
    cpf_cnpj: string;
    city: string;
    state: string;
    area?: number;
    state_registration?: string;
    active?: boolean;
  }) {
    const { data, error } = await supabaseRaw.from('farms').insert(farm).select().single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      cpf_cnpj: string;
      city: string;
      state: string;
      area: number;
      state_registration: string;
      active: boolean;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('farms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('farms').update({ active: false }).eq('id', id);

    if (error) throw error;
  },
};

// ==================== EXPENSES ====================
export const ExpensesAPI = {
  async getAll(filters?: {
    status?: string;
    category?: string;
    farmId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = supabase
      .from('expenses')
      .select(
        `
        *,
        supplier:suppliers(id, name),
        operation:operations(id, name)
      `
      )
      .order('date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.farmId) query = query.eq('farm_id', filters.farmId);
    if (filters?.startDate) query = query.gte('date', filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte('date', filters.endDate.toISOString());

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabaseRaw
      .from('expenses')
      .select(
        `
        *,
        supplier:suppliers(*),
        operation:operations(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(expense: {
    description: string;
    date: string;
    due_date?: string;
    category?: string;
    subcategory?: string;
    supplier_id?: string;
    operation_id?: string;
    farm_id?: string;
    agreed_value?: number;
    invoice_value?: number;
    actual_value?: number;
    payment_method?: string;
    status?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('expenses')
      .insert({
        ...expense,
        status: expense.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      description: string;
      date: string;
      due_date: string;
      category: string;
      subcategory: string;
      supplier_id: string;
      operation_id: string;
      agreed_value: number;
      invoice_value: number;
      actual_value: number;
      payment_method: string;
      status: string;
      notes: string;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('expenses').delete().eq('id', id);

    if (error) throw error;
  },

  async approve(id: string, approvedBy: string) {
    return this.update(id, {
      status: 'approved',
      // approved_by: approvedBy,
      // approved_at: new Date().toISOString(),
    } as any);
  },

  async markAsPaid(id: string, paidBy: string, actualValue?: number) {
    return this.update(id, {
      status: 'paid',
      actual_value: actualValue,
      // paid_by: paidBy,
      // paid_at: new Date().toISOString(),
    } as any);
  },
};

// ==================== REVENUES ====================
export const RevenuesAPI = {
  async getAll(filters?: {
    status?: string;
    category?: string;
    clientId?: string;
    farmId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = supabase
      .from('revenues')
      .select(
        `
        *,
        client:clients(id, name)
      `
      )
      .order('date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.clientId) query = query.eq('client_id', filters.clientId);
    if (filters?.farmId) query = query.eq('farm_id', filters.farmId);
    if (filters?.startDate) query = query.gte('date', filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte('date', filters.endDate.toISOString());

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabaseRaw
      .from('revenues')
      .select(
        `
        *,
        client:clients(id, name)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(revenue: {
    description: string;
    date: string;
    category?: string;
    client_id?: string;
    farm_id?: string;
    value: number;
    status?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('revenues')
      .insert({
        ...revenue,
        status: revenue.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      description: string;
      date: string;
      category: string;
      client_id: string;
      value: number;
      status: string;
      notes: string;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('revenues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('revenues').delete().eq('id', id);

    if (error) throw error;
  },

  async markAsReceived(id: string) {
    return this.update(id, { status: 'received' });
  },
};

// ==================== CLIENTS ====================
export const ClientsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('clients')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(client: {
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('clients')
      .insert({ ...client, active: true })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      document: string;
      email: string;
      phone: string;
      address: string;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('clients').update({ active: false }).eq('id', id);

    if (error) throw error;
  },
};

// ==================== SUPPLIERS ====================
export const SuppliersAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('suppliers')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(supplier: {
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    category?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('suppliers')
      .insert({ ...supplier, active: true })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      document: string;
      email: string;
      phone: string;
      category: string;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('suppliers').update({ active: false }).eq('id', id);

    if (error) throw error;
  },
};

// ==================== CONTRACTS ====================
export const ContractsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('contracts')
      .select(
        `
        *,
        client:clients(id, name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(contract: {
    client_id: string;
    product: string;
    quantity: number;
    unit_price: number;
    total_value: number;
    start_date: string;
    end_date?: string;
    status?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('contracts')
      .insert({
        ...contract,
        status: contract.status || 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      product: string;
      quantity: number;
      unit_price: number;
      total_value: number;
      end_date: string;
      status: string;
      notes: string;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('contracts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== BANK ACCOUNTS ====================
export const BankAccountsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('bank_accounts')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(account: {
    name: string;
    bank_name?: string;
    account_number?: string;
    agency?: string;
    initial_balance?: number;
    current_balance?: number;
  }) {
    const { data, error } = await supabaseRaw
      .from('bank_accounts')
      .insert({
        ...account,
        current_balance: account.initial_balance || 0,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBalance(id: string, newBalance: number) {
    const { data, error } = await supabaseRaw
      .from('bank_accounts')
      .update({
        current_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== OPERATIONS ====================
export const OperationsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw.from('operations').select('*').order('name');

    if (error) throw error;
    return data || [];
  },

  async create(operation: {
    name: string;
    type?: string;
    color?: string;
    icon?: string;
    budget?: number;
  }) {
    const { data, error } = await supabaseRaw
      .from('operations')
      .insert(operation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<{
      name: string;
      type: string;
      color: string;
      icon: string;
      budget: number;
      spent: number;
    }>
  ) {
    const { data, error } = await supabaseRaw
      .from('operations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== REPORTS ====================
export const ReportsAPI = {
  async getExpensesByCategory(startDate?: Date, endDate?: Date) {
    let query = supabaseRaw
      .from('expenses')
      .select('category, actual_value, invoice_value, agreed_value');

    if (startDate) query = query.gte('date', startDate.toISOString());
    if (endDate) query = query.lte('date', endDate.toISOString());

    const { data, error } = await query;
    if (error) throw error;

    const grouped = ((data || []) as any[]).reduce(
      (acc: Record<string, number>, e: any) => {
        const cat = e.category || 'Outros';
        const value = e.actual_value || e.invoice_value || e.agreed_value || 0;
        acc[cat] = (acc[cat] || 0) + value;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(grouped).map(([category, total]) => ({
      category,
      total,
    }));
  },

  async getRevenuesByCategory(startDate?: Date, endDate?: Date) {
    let query = supabaseRaw.from('revenues').select('category, value');

    if (startDate) query = query.gte('date', startDate.toISOString());
    if (endDate) query = query.lte('date', endDate.toISOString());

    const { data, error } = await query;
    if (error) throw error;

    const grouped = ((data || []) as any[]).reduce(
      (acc: Record<string, number>, r: any) => {
        const cat = r.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + (r.value || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(grouped).map(([category, total]) => ({
      category,
      total,
    }));
  },

  async getCashFlow(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [expenses, revenues] = await Promise.all([
      supabaseRaw
        .from('expenses')
        .select('date, actual_value, invoice_value, agreed_value')
        .gte('date', startDate.toISOString()),
      supabaseRaw.from('revenues').select('date, value').gte('date', startDate.toISOString()),
    ]);

    const monthlyData: Record<string, { expenses: number; revenues: number }> = {};

    ((expenses.data || []) as any[]).forEach((e: any) => {
      const month = new Date(e.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { expenses: 0, revenues: 0 };
      monthlyData[month].expenses += e.actual_value || e.invoice_value || e.agreed_value || 0;
    });

    ((revenues.data || []) as any[]).forEach((r: any) => {
      const month = new Date(r.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { expenses: 0, revenues: 0 };
      monthlyData[month].revenues += r.value || 0;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        expenses: data.expenses,
        revenues: data.revenues,
        balance: data.revenues - data.expenses,
      }));
  },

  async getDashboardSummary() {
    const [expenses, revenues, pendingExpenses, pendingRevenues] = await Promise.all([
      supabaseRaw.from('expenses').select('actual_value, invoice_value, agreed_value'),
      supabaseRaw.from('revenues').select('value'),
      supabaseRaw
        .from('expenses')
        .select('actual_value, invoice_value, agreed_value')
        .eq('status', 'pending'),
      supabaseRaw.from('revenues').select('value').eq('status', 'pending'),
    ]);

    const totalExpenses = ((expenses.data || []) as any[]).reduce(
      (sum: number, e: any) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0),
      0
    );
    const totalRevenues = ((revenues.data || []) as any[]).reduce(
      (sum: number, r: any) => sum + (r.value || 0),
      0
    );
    const totalPendingExpenses = ((pendingExpenses.data || []) as any[]).reduce(
      (sum: number, e: any) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0),
      0
    );
    const totalPendingRevenues = ((pendingRevenues.data || []) as any[]).reduce(
      (sum: number, r: any) => sum + (r.value || 0),
      0
    );

    return {
      totalExpenses,
      totalRevenues,
      totalPendingExpenses,
      totalPendingRevenues,
      balance: totalRevenues - totalExpenses,
      expensesCount: expenses.data?.length || 0,
      revenuesCount: revenues.data?.length || 0,
    };
  },
};

// ==================== ASSETS ====================
export const AssetsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw.from('assets').select('*').order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabaseRaw.from('assets').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async create(asset: {
    name: string;
    category: string;
    purchase_date: string;
    purchase_value: number;
    current_value: number;
    depreciation_rate: number;
    farm_id?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw.from('assets').insert(asset).select().single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseRaw
      .from('assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('assets').delete().eq('id', id);

    if (error) throw error;
  },
};

// ==================== FORECASTS ====================
export const ForecastsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('forecasts')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(forecast: {
    type: string;
    category: string;
    description: string;
    amount: number;
    month: number;
    year: number;
    probability: number;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw.from('forecasts').insert(forecast).select().single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseRaw
      .from('forecasts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('forecasts').delete().eq('id', id);

    if (error) throw error;
  },
};

// ==================== BUDGETS ====================
export const BudgetsAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('budgets')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(budget: {
    category: string;
    planned_amount: number;
    actual_amount: number;
    month: number;
    year: number;
    type: string;
  }) {
    const { data, error } = await supabaseRaw.from('budgets').insert(budget).select().single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseRaw
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('budgets').delete().eq('id', id);

    if (error) throw error;
  },
};

// ==================== CLOSING PERIODS ====================
export const ClosingPeriodsAPI = {
  async getByYear(year: number) {
    const { data, error } = await supabaseRaw
      .from('closing_periods')
      .select('*')
      .eq('year', year)
      .order('month');

    if (error) throw error;
    return data || [];
  },

  async close(id: string) {
    const { data, error } = await supabaseRaw
      .from('closing_periods')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reopen(id: string) {
    const { data, error } = await supabaseRaw
      .from('closing_periods')
      .update({
        status: 'open',
        closed_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== FIELD NOTEBOOK ====================
export const FieldNotebookAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw
      .from('field_notebook')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(entry: {
    date: string;
    farm_id?: string;
    farm_name?: string;
    sector?: string;
    activity_type: string;
    description: string;
    weather?: any;
    observations?: string;
    photos?: string[];
    location?: any;
  }) {
    const { data, error } = await supabaseRaw
      .from('field_notebook')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseRaw
      .from('field_notebook')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('field_notebook').delete().eq('id', id);

    if (error) throw error;
  },
};

// ==================== MACHINES ====================
export const MachinesAPI = {
  async getAll() {
    const { data, error } = await supabaseRaw.from('machines').select('*').order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabaseRaw.from('machines').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async create(machine: {
    name: string;
    type?: string;
    brand?: string;
    model?: string;
    year?: number;
    hour_meter?: number;
    status?: string;
    fuel_consumption?: number;
    operational_cost?: number;
    farm_id?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw.from('machines').insert(machine).select().single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseRaw
      .from('machines')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseRaw.from('machines').delete().eq('id', id);

    if (error) throw error;
  },

  async getStatistics() {
    const { data: machines } = await supabaseRaw.from('machines').select('*');

    const { data: operations } = await supabaseRaw.from('machine_operations').select('*');

    const { data: maintenance } = await supabaseRaw.from('machine_maintenance').select('*');

    const totalMachines = machines?.length || 0;
    const activeMachines = machines?.filter((m) => m.status === 'active').length || 0;
    const totalHours = operations?.reduce((acc, op) => acc + (op.hours_worked || 0), 0) || 0;
    const totalMaintenanceCost = maintenance?.reduce((acc, m) => acc + (m.cost || 0), 0) || 0;
    const totalFuelUsed = operations?.reduce((acc, op) => acc + (op.fuel_used || 0), 0) || 0;
    const totalAreaCovered = operations?.reduce((acc, op) => acc + (op.area_covered || 0), 0) || 0;

    return {
      totalMachines,
      activeMachines,
      inMaintenanceMachines: machines?.filter((m) => m.status === 'maintenance').length || 0,
      totalHours,
      totalMaintenanceCost,
      totalFuelUsed,
      totalAreaCovered,
    };
  },
};

// ==================== MACHINE OPERATIONS ====================
export const MachineOperationsAPI = {
  async getAll(machineId?: string) {
    let query = supabase
      .from('machine_operations')
      .select('*')
      .order('start_time', { ascending: false });

    if (machineId) query = query.eq('machine_id', machineId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(operation: {
    machine_id: string;
    machine_name?: string;
    operation_type: string;
    start_time: string;
    end_time?: string;
    hours_worked?: number;
    fuel_used?: number;
    area_covered?: number;
    operator_name?: string;
    farm_id?: string;
    sector?: string;
    notes?: string;
  }) {
    const { data, error } = await supabaseRaw
      .from('machine_operations')
      .insert(operation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentByMachine(machineId: string, limit = 10) {
    const { data, error } = await supabaseRaw
      .from('machine_operations')
      .select('*')
      .eq('machine_id', machineId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// ==================== MACHINE MAINTENANCE ====================
export const MachineMaintenanceAPI = {
  async getAll(machineId?: string) {
    let query = supabase
      .from('machine_maintenance')
      .select('*')
      .order('date', { ascending: false });

    if (machineId) query = query.eq('machine_id', machineId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(maintenance: {
    machine_id: string;
    machine_name?: string;
    maintenance_type: string;
    description: string;
    date: string;
    cost?: number;
    parts_replaced?: string[];
    technician?: string;
    next_maintenance_date?: string;
    next_maintenance_hours?: number;
  }) {
    const { data, error } = await supabaseRaw
      .from('machine_maintenance')
      .insert(maintenance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUpcoming(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabaseRaw
      .from('machine_maintenance')
      .select('*')
      .gte('next_maintenance_date', new Date().toISOString())
      .lte('next_maintenance_date', futureDate.toISOString())
      .order('next_maintenance_date');

    if (error) throw error;
    return data || [];
  },
};

// ==================== SIMPLE API WRAPPER ====================
// For simpler imports in screens
export const api = {
  // Farms
  getFarms: () => FarmsAPI.getAll(),
  getFarm: (id: string) => FarmsAPI.getById(id),
  createFarm: (data: any) => FarmsAPI.create(data),
  updateFarm: (id: string, data: any) => FarmsAPI.update(id, data),
  deleteFarm: (id: string) => FarmsAPI.delete(id),

  // Expenses
  getExpenses: (filters?: any) => ExpensesAPI.getAll(filters),
  getExpense: (id: string) => ExpensesAPI.getById(id),
  createExpense: (data: any) => ExpensesAPI.create(data),
  updateExpense: (id: string, data: any) => ExpensesAPI.update(id, data),
  deleteExpense: (id: string) => ExpensesAPI.delete(id),

  // Revenues
  getRevenues: (filters?: any) => RevenuesAPI.getAll(filters),
  getRevenue: (id: string) => RevenuesAPI.getById(id),
  createRevenue: (data: any) => RevenuesAPI.create(data),
  updateRevenue: (id: string, data: any) => RevenuesAPI.update(id, data),
  deleteRevenue: (id: string) => RevenuesAPI.delete(id),

  // Assets
  getAssets: () => AssetsAPI.getAll(),
  getAsset: (id: string) => AssetsAPI.getById(id),
  createAsset: (data: any) => AssetsAPI.create(data),
  updateAsset: (id: string, data: any) => AssetsAPI.update(id, data),
  deleteAsset: (id: string) => AssetsAPI.delete(id),

  // Forecasts
  getForecasts: () => ForecastsAPI.getAll(),
  createForecast: (data: any) => ForecastsAPI.create(data),
  updateForecast: (id: string, data: any) => ForecastsAPI.update(id, data),
  deleteForecast: (id: string) => ForecastsAPI.delete(id),

  // Budgets
  getBudgets: () => BudgetsAPI.getAll(),
  createBudget: (data: any) => BudgetsAPI.create(data),
  updateBudget: (id: string, data: any) => BudgetsAPI.update(id, data),
  deleteBudget: (id: string) => BudgetsAPI.delete(id),

  // Closing Periods
  getClosingPeriods: (year: number) => ClosingPeriodsAPI.getByYear(year),
  closePeriod: (id: string) => ClosingPeriodsAPI.close(id),
  reopenPeriod: (id: string) => ClosingPeriodsAPI.reopen(id),

  // Field Notebook (Caderno de Campo)
  getFieldNotebookEntries: () => FieldNotebookAPI.getAll(),
  createFieldNotebookEntry: (data: any) => FieldNotebookAPI.create(data),
  updateFieldNotebookEntry: (id: string, data: any) => FieldNotebookAPI.update(id, data),
  deleteFieldNotebookEntry: (id: string) => FieldNotebookAPI.delete(id),

  // Machines (Máquinas)
  getMachines: () => MachinesAPI.getAll(),
  getMachine: (id: string) => MachinesAPI.getById(id),
  createMachine: (data: any) => MachinesAPI.create(data),
  updateMachine: (id: string, data: any) => MachinesAPI.update(id, data),
  deleteMachine: (id: string) => MachinesAPI.delete(id),
  getMachineStatistics: () => MachinesAPI.getStatistics(),

  // Machine Operations
  getMachineOperations: (machineId?: string) => MachineOperationsAPI.getAll(machineId),
  createMachineOperation: (data: any) => MachineOperationsAPI.create(data),

  // Machine Maintenance
  getMachineMaintenance: (machineId?: string) => MachineMaintenanceAPI.getAll(machineId),
  createMachineMaintenance: (data: any) => MachineMaintenanceAPI.create(data),
  getUpcomingMaintenance: (days?: number) => MachineMaintenanceAPI.getUpcoming(days),

  // Reports
  getDashboardSummary: () => ReportsAPI.getDashboardSummary(),
  getCashFlow: (months?: number) => ReportsAPI.getCashFlow(months),
  getExpensesByCategory: () => ReportsAPI.getExpensesByCategory(),
  getRevenuesByCategory: () => ReportsAPI.getRevenuesByCategory(),
};

// ==================== EXPORT ALL ====================
export default {
  farms: FarmsAPI,
  expenses: ExpensesAPI,
  revenues: RevenuesAPI,
  clients: ClientsAPI,
  suppliers: SuppliersAPI,
  contracts: ContractsAPI,
  bankAccounts: BankAccountsAPI,
  operations: OperationsAPI,
  reports: ReportsAPI,
  assets: AssetsAPI,
  forecasts: ForecastsAPI,
  budgets: BudgetsAPI,
  closingPeriods: ClosingPeriodsAPI,
  fieldNotebook: FieldNotebookAPI,
  machines: MachinesAPI,
  machineOperations: MachineOperationsAPI,
  machineMaintenance: MachineMaintenanceAPI,
};
