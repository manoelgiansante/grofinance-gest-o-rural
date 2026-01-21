import { supabase } from './supabase';

// =====================================================
// CROSS-APP SERVICE
// Serviço para comunicação entre Agrofinance e Agrofinance Operacional
// =====================================================

export interface CrossAppSubscription {
  email: string;
  agrofinancePlan: 'free' | 'basic' | 'intermediate' | 'premium';
  agrofinanceOperacionalPlan: 'free' | 'basic' | 'intermediate' | 'premium';
  hasBonus: boolean; // Se assinou Finance intermediário+, Operacional é grátis
  expiresAt?: string;
}

export const CrossAppService = {
  /**
   * Verifica status da assinatura unificada
   * Funciona para ambos os apps
   */
  async getSubscriptionStatus(email: string): Promise<CrossAppSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar assinatura:', error);
        return null;
      }

      if (!data) return null;

      return {
        email: data.email,
        agrofinancePlan: data.gestao_rural_plan || 'free',
        agrofinanceOperacionalPlan: data.custo_operacional_plan || 'free',
        hasBonus: data.custo_op_bonus || false,
        expiresAt: data.expires_at,
      };
    } catch (err) {
      console.error('Erro no CrossAppService:', err);
      return null;
    }
  },

  /**
   * Ativa assinatura do Agrofinance (com bônus para Operacional)
   */
  async activateFinanceSubscription(
    email: string, 
    plan: 'basic' | 'intermediate' | 'premium'
  ): Promise<boolean> {
    try {
      // Se plano intermediário ou premium, dá bônus no Operacional
      const giveBonus = plan === 'intermediate' || plan === 'premium';
      
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 ano

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          email,
          gestao_rural_plan: plan,
          custo_op_bonus: giveBonus,
          custo_operacional_plan: giveBonus ? 'premium' : 'free',
          expires_at: expiresAt.toISOString(),
          subscribed_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao ativar assinatura:', err);
      return false;
    }
  },

  /**
   * Verifica se usuário tem acesso premium no Agrofinance
   */
  async hasFinancePremium(email: string): Promise<boolean> {
    const subscription = await this.getSubscriptionStatus(email);
    if (!subscription) return false;
    
    return subscription.agrofinancePlan === 'premium' ||
           subscription.agrofinancePlan === 'intermediate';
  },

  /**
   * Verifica se usuário tem bônus ativo para Agrofinance Operacional
   */
  async hasOperacionalBonus(email: string): Promise<boolean> {
    const subscription = await this.getSubscriptionStatus(email);
    return subscription?.hasBonus || false;
  },

  /**
   * Sincroniza dados compartilhados entre os apps
   */
  async syncSharedData() {
    const [farms, suppliers, clients, bankAccounts, categories] = await Promise.all([
      supabase.from('farms').select('*').eq('active', true),
      supabase.from('suppliers').select('*').eq('active', true),
      supabase.from('clients').select('*').eq('active', true),
      supabase.from('bank_accounts').select('*').eq('active', true),
      supabase.from('categories').select('*'),
    ]);

    return {
      farms: farms.data || [],
      suppliers: suppliers.data || [],
      clients: clients.data || [],
      bankAccounts: bankAccounts.data || [],
      categories: categories.data || [],
    };
  },

  /**
   * Obtém resumo financeiro consolidado
   */
  async getConsolidatedSummary(farmId?: string) {
    let expenseQuery = supabase
      .from('expenses')
      .select('actual_value, agreed_value, invoice_value, status, category');
    
    let revenueQuery = supabase
      .from('revenues')
      .select('value, status, category');

    // Filtrar por fazenda se especificado
    if (farmId) {
      expenseQuery = expenseQuery.eq('farm_id', farmId);
      revenueQuery = revenueQuery.eq('farm_id', farmId);
    }

    const [expenses, revenues] = await Promise.all([
      expenseQuery,
      revenueQuery,
    ]);

    const expenseData = expenses.data || [];
    const revenueData = revenues.data || [];

    const totalExpenses = expenseData.reduce(
      (sum, e) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0), 
      0
    );
    
    const pendingExpenses = expenseData
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0), 0);
    
    const totalRevenues = revenueData.reduce(
      (sum, r) => sum + (r.value || 0), 
      0
    );

    const receivedRevenues = revenueData
      .filter(r => r.status === 'received')
      .reduce((sum, r) => sum + (r.value || 0), 0);

    // Agrupar por categoria
    const expensesByCategory = expenseData.reduce((acc, e) => {
      const cat = e.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (e.actual_value || e.invoice_value || e.agreed_value || 0);
      return acc;
    }, {} as Record<string, number>);

    const revenuesByCategory = revenueData.reduce((acc, r) => {
      const cat = r.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (r.value || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      pendingExpenses,
      paidExpenses: totalExpenses - pendingExpenses,
      totalRevenues,
      receivedRevenues,
      pendingRevenues: totalRevenues - receivedRevenues,
      balance: totalRevenues - totalExpenses,
      cashBalance: receivedRevenues - (totalExpenses - pendingExpenses),
      expensesCount: expenseData.length,
      revenuesCount: revenueData.length,
      expensesByCategory,
      revenuesByCategory,
    };
  },

  /**
   * Abre Agrofinance Operacional via deep link
   */
  getOperacionalDeepLink(path?: string): string {
    const base = 'agrofinance-operacional://';
    return path ? `${base}${path}` : base;
  },

  /**
   * Verifica se Agrofinance Operacional está instalado
   */
  async checkOperacionalInstalled(): Promise<boolean> {
    // Essa verificação precisa ser feita no lado nativo
    // Por enquanto retorna true
    return true;
  },
};

export default CrossAppService;
