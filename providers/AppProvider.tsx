import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { User, Expense, Operation, Revenue, Client, Contract, PurchaseOrder, TeamMember, Farm, Asset, StockItem, BankAccount, Category, MonthClosing } from '@/types';
import { currentUser as mockUser } from '@/mocks/data';

interface AppContextValue {
  user: User;
  expenses: Expense[];
  operations: Operation[];
  revenues: Revenue[];
  clients: Client[];
  contracts: Contract[];
  purchaseOrders: PurchaseOrder[];
  teamMembers: TeamMember[];
  farms: Farm[];
  assets: Asset[];
  stockItems: StockItem[];
  bankAccounts: BankAccount[];
  categories: Category[];
  monthClosings: MonthClosing[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addRevenue: (revenue: Omit<Revenue, 'id' | 'createdAt'>) => Promise<void>;
  updateRevenue: (id: string, updates: Partial<Revenue>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Promise<void>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  addFarm: (farm: Omit<Farm, 'id'>) => Promise<void>;
  updateFarm: (id: string, updates: Partial<Farm>) => Promise<void>;
  deleteFarm: (id: string) => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  isLoading: boolean;
  refetch: () => void;
}

export const [AppProvider, useApp] = createContextHook<AppContextValue>(() => {
  const [user] = useState<User>(mockUser);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error loading expenses:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((exp: any): Expense => ({
        id: exp.id,
        description: exp.description,
        date: new Date(exp.date),
        dueDate: new Date(exp.due_date),
        competence: new Date(exp.competence),
        createdAt: new Date(exp.created_at),
        approvedAt: exp.approved_at ? new Date(exp.approved_at) : undefined,
        paidAt: exp.paid_at ? new Date(exp.paid_at) : undefined,
        supplierId: exp.supplier_id || '',
        operationId: exp.operation_id || '',
        costCenterId: exp.cost_center_id,
        category: exp.category,
        subcategory: exp.subcategory,
        negotiatedValue: exp.negotiated_value,
        invoiceValue: exp.invoice_value,
        actualValue: exp.actual_value,
        paymentMethod: exp.payment_method as any,
        installments: exp.installments,
        currentInstallment: exp.current_installment,
        serviceConfirmed: exp.service_confirmed,
        serviceConfirmedBy: exp.service_confirmed_by,
        serviceConfirmedAt: exp.service_confirmed_at ? new Date(exp.service_confirmed_at) : undefined,
        createdBy: exp.created_by,
        approvedBy: exp.approved_by,
        paidBy: exp.paid_by,
        notes: exp.notes,
        tags: exp.tags || [],
        attachments: [],
        status: exp.status as any,
      }));
    },
  });

  const { data: operations = [] } = useQuery<Operation[]>({
    queryKey: ['operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading operations:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((op: any): Operation => ({
        id: op.id,
        name: op.name,
        type: op.type as any,
        color: op.color || '#000',
        icon: op.icon || 'circle',
        budget: op.budget || 0,
        spent: op.spent || 0,
      }));
    },
  });

  const { data: revenues = [] } = useQuery<Revenue[]>({
    queryKey: ['revenues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenues')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error loading revenues:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((rev: any): Revenue => ({
        id: rev.id,
        description: rev.description,
        date: new Date(rev.date),
        dueDate: new Date(rev.due_date),
        receivedDate: rev.received_date ? new Date(rev.received_date) : undefined,
        createdAt: new Date(rev.created_at),
        clientId: rev.client_id || '',
        operationId: rev.operation_id || '',
        category: rev.category,
        value: rev.value,
        invoiceNumber: rev.invoice_number,
        paymentMethod: rev.payment_method as any,
        contractId: rev.contract_id,
        createdBy: rev.created_by,
        notes: rev.notes,
        status: rev.status as any,
        attachments: [],
      }));
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading clients:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((c: any): Client => ({
        id: c.id,
        name: c.name,
        cpfCnpj: c.cpf_cnpj,
        type: c.type as any,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        zipCode: c.zip_code,
        stateRegistration: c.state_registration,
        active: c.active,
        createdAt: new Date(c.created_at),
      }));
    },
  });

  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error loading contracts:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((c: any): Contract => ({
        id: c.id,
        type: c.type as any,
        partnerId: c.partner_id || '',
        operationId: c.operation_id || '',
        product: c.product,
        quantity: c.quantity,
        unit: c.unit,
        unitPrice: c.unit_price,
        totalValue: c.total_value,
        startDate: new Date(c.start_date),
        endDate: new Date(c.end_date),
        status: c.status as any,
        paymentTerms: c.payment_terms,
        deliveryTerms: c.delivery_terms,
        notes: c.notes,
        createdAt: new Date(c.created_at),
      }));
    },
  });

  const { data: purchaseOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('request_date', { ascending: false });
      
      if (error) {
        console.error('Error loading purchase orders:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((po: any): PurchaseOrder => ({
        id: po.id,
        supplierId: po.supplier_id || '',
        operationId: po.operation_id || '',
        items: [],
        totalValue: po.total_value,
        status: po.status as any,
        requestedBy: po.requested_by,
        approvedBy: po.approved_by,
        requestDate: new Date(po.request_date),
        expectedDeliveryDate: po.expected_delivery_date ? new Date(po.expected_delivery_date) : undefined,
        actualDeliveryDate: po.actual_delivery_date ? new Date(po.actual_delivery_date) : undefined,
        notes: po.notes,
      }));
    },
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading team members:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((m: any): TeamMember => ({
        id: m.id,
        name: m.name,
        email: m.email,
        cpf: m.cpf,
        phone: m.phone,
        role: m.role as any,
        permissions: (m.permissions || []) as any,
        farmIds: m.farm_ids || [],
        operationIds: m.operation_ids || [],
        active: m.active,
        createdAt: new Date(m.created_at),
      }));
    },
  });

  const { data: farms = [] } = useQuery<Farm[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading farms:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((f: any): Farm => ({
        id: f.id,
        name: f.name,
        cpfCnpj: f.cpf_cnpj,
        stateRegistration: f.state_registration,
        area: f.area || 0,
        city: f.city,
        state: f.state,
        active: f.active,
        operations: [],
      }));
    },
  });

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading assets:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((a: any): Asset => ({
        id: a.id,
        name: a.name,
        type: a.type as any,
        operationId: a.operation_id,
        purchaseDate: new Date(a.purchase_date),
        purchaseValue: a.purchase_value,
        currentValue: a.current_value,
        depreciationRate: a.depreciation_rate,
        brand: a.brand,
        model: a.model,
        serialNumber: a.serial_number,
        status: a.status as any,
        notes: a.notes,
      }));
    },
  });

  const stockItems: StockItem[] = [];
  const bankAccounts: BankAccount[] = [];
  const categories: Category[] = [];
  const monthClosings: MonthClosing[] = [];

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: expense.description,
          supplier_id: expense.supplierId,
          operation_id: expense.operationId,
          cost_center_id: expense.costCenterId,
          category: expense.category,
          subcategory: expense.subcategory,
          negotiated_value: expense.negotiatedValue,
          invoice_value: expense.invoiceValue,
          actual_value: expense.actualValue,
          date: expense.date.toISOString(),
          due_date: expense.dueDate.toISOString(),
          competence: expense.competence.toISOString(),
          payment_method: expense.paymentMethod,
          installments: expense.installments,
          current_installment: expense.currentInstallment,
          status: expense.status,
          notes: expense.notes,
          tags: expense.tags,
          service_confirmed: expense.serviceConfirmed,
          service_confirmed_by: expense.serviceConfirmedBy,
          service_confirmed_at: expense.serviceConfirmedAt?.toISOString(),
          created_by: expense.createdBy,
          approved_by: expense.approvedBy,
          approved_at: expense.approvedAt?.toISOString(),
          paid_by: expense.paidBy,
          paid_at: expense.paidAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      const updateData: any = {};
      
      if (updates.description) updateData.description = updates.description;
      if (updates.supplierId) updateData.supplier_id = updates.supplierId;
      if (updates.operationId) updateData.operation_id = updates.operationId;
      if (updates.category) updateData.category = updates.category;
      if (updates.negotiatedValue !== undefined) updateData.negotiated_value = updates.negotiatedValue;
      if (updates.status) updateData.status = updates.status;
      if (updates.approvedBy) updateData.approved_by = updates.approvedBy;
      if (updates.approvedAt) updateData.approved_at = updates.approvedAt.toISOString();
      if (updates.paidBy) updateData.paid_by = updates.paidBy;
      if (updates.paidAt) updateData.paid_at = updates.paidAt.toISOString();

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const addRevenueMutation = useMutation({
    mutationFn: async (revenue: Omit<Revenue, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('revenues')
        .insert({
          description: revenue.description,
          client_id: revenue.clientId,
          operation_id: revenue.operationId,
          category: revenue.category,
          value: revenue.value,
          invoice_number: revenue.invoiceNumber,
          date: revenue.date.toISOString(),
          due_date: revenue.dueDate.toISOString(),
          received_date: revenue.receivedDate?.toISOString(),
          status: revenue.status,
          payment_method: revenue.paymentMethod,
          contract_id: revenue.contractId,
          notes: revenue.notes,
          created_by: revenue.createdBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
    },
  });

  const updateRevenueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Revenue> }) => {
      const updateData: any = {};
      
      if (updates.description) updateData.description = updates.description;
      if (updates.clientId) updateData.client_id = updates.clientId;
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.status) updateData.status = updates.status;
      if (updates.receivedDate) updateData.received_date = updates.receivedDate.toISOString();

      const { data, error } = await supabase
        .from('revenues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
    },
  });

  const deleteRevenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
    },
  });

  const addClientMutation = useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          cpf_cnpj: client.cpfCnpj,
          type: client.type,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          state: client.state,
          zip_code: client.zipCode,
          state_registration: client.stateRegistration,
          active: client.active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.active !== undefined) updateData.active = updates.active;

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const isLoading = expensesLoading;

  const refetch = () => {
    queryClient.invalidateQueries();
  };

  return {
    user,
    expenses,
    operations,
    revenues,
    clients,
    contracts,
    purchaseOrders,
    teamMembers,
    farms,
    assets,
    stockItems,
    bankAccounts,
    categories,
    monthClosings,
    addExpense: async (expense) => {
      await addExpenseMutation.mutateAsync(expense);
    },
    updateExpense: async (id, updates) => {
      await updateExpenseMutation.mutateAsync({ id, updates });
    },
    deleteExpense: async (id) => {
      await deleteExpenseMutation.mutateAsync(id);
    },
    addRevenue: async (revenue) => {
      await addRevenueMutation.mutateAsync(revenue);
    },
    updateRevenue: async (id, updates) => {
      await updateRevenueMutation.mutateAsync({ id, updates });
    },
    deleteRevenue: async (id) => {
      await deleteRevenueMutation.mutateAsync(id);
    },
    addClient: async (client) => {
      await addClientMutation.mutateAsync(client);
    },
    updateClient: async (id, updates) => {
      await updateClientMutation.mutateAsync({ id, updates });
    },
    deleteClient: async (id) => {
      await deleteClientMutation.mutateAsync(id);
    },
    addContract: async () => {},
    updateContract: async () => {},
    deleteContract: async () => {},
    addPurchaseOrder: async () => {},
    updatePurchaseOrder: async () => {},
    deletePurchaseOrder: async () => {},
    addTeamMember: async () => {},
    updateTeamMember: async () => {},
    deleteTeamMember: async () => {},
    addFarm: async () => {},
    updateFarm: async () => {},
    deleteFarm: async () => {},
    addAsset: async () => {},
    updateAsset: async () => {},
    deleteAsset: async () => {},
    isLoading,
    refetch,
  };
});
