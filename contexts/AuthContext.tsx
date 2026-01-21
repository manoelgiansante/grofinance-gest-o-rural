import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { supabase, supabaseRaw } from '@/lib/supabase';
import { ssoService } from '@/lib/supabase-sync';
import { Session, User } from '@supabase/supabase-js';

// =====================================================
// TIPOS - SISTEMA INTEGRADO RUMO (SSO)
// =====================================================
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

// Estrutura da tabela user_subscriptions existente
export interface UserSubscription {
  id: string;
  email: string;
  gestao_rural_plan: string | null;
  custo_operacional_plan: string | null;
  custo_op_bonus: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Interface adaptada para uso no app
export interface Subscription {
  id: string;
  user_id: string;
  email: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  apps_included: string[];
  features: string[];
  // Campos específicos do banco
  gestao_rural_plan?: string | null;
  custo_operacional_plan?: string | null;
  custo_op_bonus?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  farm_name?: string;
  created_at: string;
}

// =====================================================
// AUTH CONTEXT - LOGIN ÚNICO INTEGRADO
// =====================================================
export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  // =====================================================
  // CARREGAR PERFIL AUTOMÁTICO
  // =====================================================
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (data) {
        setProfile(data);
        return data;
      }
      return null;
    } catch (error) {
      console.log('[Auth] Error loading profile:', error);
      return null;
    }
  }, []);

  // =====================================================
  // CARREGAR ASSINATURA INTEGRADA AUTOMÁTICA
  // =====================================================
  const loadSubscription = useCallback(async (userId: string): Promise<Subscription | null> => {
    setIsLoadingSubscription(true);
    try {
      // Buscar por email do usuário
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;

      if (!userEmail) {
        setIsLoadingSubscription(false);
        return null;
      }

      // Usar tabela user_subscriptions existente
      const { data, error } = await supabaseRaw
        .from('user_subscriptions')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (data) {
        // Converter para formato interno
        const subData = data as any;
        const plan = subData.custo_operacional_plan || subData.gestao_rural_plan || 'free';
        const isExpired = subData.expires_at && new Date(subData.expires_at) < new Date();

        const subscription: Subscription = {
          id: subData.id,
          user_id: userId,
          email: subData.email,
          plan: (plan as SubscriptionPlan) || 'free',
          status: isExpired ? 'expired' : plan === 'free' ? 'trial' : 'active',
          starts_at: subData.created_at,
          expires_at: subData.expires_at,
          created_at: subData.created_at,
          apps_included: ['operacional', 'finance', 'maquinas'],
          features:
            plan !== 'free'
              ? ['unlimited_entries', 'advanced_reports', 'pdf_export']
              : ['basic_reports'],
          gestao_rural_plan: subData.gestao_rural_plan,
          custo_operacional_plan: subData.custo_operacional_plan,
          custo_op_bonus: subData.custo_op_bonus,
        };

        setSubscription(subscription);
        setIsLoadingSubscription(false);
        return subscription;
      }

      // Criar entrada de trial se não existir
      const trialData = {
        email: userEmail,
        gestao_rural_plan: 'free',
        custo_operacional_plan: 'free',
        custo_op_bonus: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data: created } = await supabaseRaw
        .from('user_subscriptions')
        .insert(trialData)
        .select()
        .single();

      if (created) {
        const createdData = created as any;
        const subscription: Subscription = {
          id: createdData.id,
          user_id: userId,
          email: createdData.email,
          plan: 'free',
          status: 'trial',
          starts_at: createdData.created_at,
          expires_at: createdData.expires_at,
          created_at: createdData.created_at,
          apps_included: ['operacional', 'finance', 'maquinas'],
          features: ['basic_reports', 'limited_entries'],
          gestao_rural_plan: createdData.gestao_rural_plan,
          custo_operacional_plan: createdData.custo_operacional_plan,
          custo_op_bonus: createdData.custo_op_bonus,
        };
        setSubscription(subscription);
        setIsLoadingSubscription(false);
        return subscription;
      }

      setIsLoadingSubscription(false);
      return null;
    } catch (error) {
      console.log('[Auth] Error loading subscription:', error);
      setIsLoadingSubscription(false);
      return null;
    }
  }, []);

  // =====================================================
  // INICIALIZAÇÃO - AUTO-INTEGRAÇÃO
  // =====================================================
  useEffect(() => {
    console.log('[Auth] Initializing integrated auth...');

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // AUTO-INTEGRAÇÃO: Login = acesso automático a tudo
        if (session?.user) {
          await loadUserProfile(session.user.id);
          await loadSubscription(session.user.id);
        }
      } catch (error) {
        console.log('[Auth] Exception:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    let authSub: { unsubscribe: () => void } | null = null;

    try {
      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Auto-carregar tudo quando logar
        if (session?.user) {
          await loadUserProfile(session.user.id);
          await loadSubscription(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        setIsLoading(false);
      });
      authSub = authListener.data.subscription;
    } catch (error) {
      console.log('[Auth] Listener error:', error);
    }

    return () => {
      authSub?.unsubscribe();
    };
  }, [loadUserProfile, loadSubscription]);

  // =====================================================
  // VERIFICAÇÕES DE ACESSO
  // =====================================================
  const hasAccessToApp = useCallback(
    (appName: string): boolean => {
      if (!subscription) return false;
      const isPaid =
        subscription.plan === 'professional' ||
        subscription.plan === 'enterprise' ||
        subscription.plan === 'starter';
      if (isPaid) {
        return subscription.status === 'active' || subscription.status === 'trial';
      }
      // Trial tem acesso a todos os apps
      if (subscription.status === 'trial') return true;
      return subscription.apps_included?.includes(appName) ?? false;
    },
    [subscription]
  );

  const hasFeature = useCallback(
    (featureName: string): boolean => {
      if (!subscription) return false;
      const isPaid = subscription.plan === 'professional' || subscription.plan === 'enterprise';
      if (isPaid) return subscription.status === 'active';
      return subscription.features?.includes(featureName) ?? false;
    },
    [subscription]
  );

  const needsPayment = useCallback((): boolean => {
    if (!subscription) return true;
    if (subscription.status === 'trial') {
      return subscription.expires_at ? new Date(subscription.expires_at) < new Date() : false;
    }
    return subscription.status === 'expired' || subscription.status === 'cancelled';
  }, [subscription]);

  const trialDaysRemaining = useCallback((): number => {
    if (!subscription || subscription.status !== 'trial' || !subscription.expires_at) return 0;
    const diff = new Date(subscription.expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // =====================================================
  // UPGRADE APÓS PAGAMENTO
  // =====================================================
  const upgradeSubscription = useCallback(
    async (plan: SubscriptionPlan): Promise<boolean> => {
      if (!user || !subscription?.email) return false;
      try {
        const newExpiration = new Date();
        newExpiration.setMonth(newExpiration.getMonth() + 1);

        // Atualizar na tabela user_subscriptions
        const updates = {
          custo_operacional_plan: plan,
          gestao_rural_plan: plan,
          expires_at: newExpiration.toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabaseRaw
          .from('user_subscriptions')
          .update(updates)
          .eq('email', subscription.email);

        await loadSubscription(user.id);

        // Sincronizar com outros bancos via SSO
        if (user.email) {
          ssoService.forceSyncAll(user.id, user.email);
        }

        return true;
      } catch (error) {
        console.log('[Auth] Upgrade error:', error);
        return false;
      }
    },
    [user, subscription, loadSubscription]
  );

  // =====================================================
  // AUTH ACTIONS - INTEGRADO COM SSO
  // =====================================================
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    // Usar SSO Service para registro sincronizado
    const result = await ssoService.signUpWithSSO(email, password, fullName);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar conta');
    }
    return { user: result.user, session: result.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Usar SSO Service para login sincronizado
    const result = await ssoService.signInWithSSO(email, password);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao fazer login');
    }
    return { user: result.user, session: result.session };
  }, []);

  const signOut = useCallback(async () => {
    // Logout de todos os sistemas SSO
    await ssoService.signOutAll();
    setProfile(null);
    setSubscription(null);
  }, []);

  // Login simplificado por email (magic link)
  const loginWithEmail = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao enviar link de login' };
      }
    },
    []
  );

  // Skip login - modo demo/offline
  const skipLogin = useCallback(async (): Promise<void> => {
    // Criar um perfil local demo
    const demoProfile: UserProfile = {
      id: 'demo-user',
      email: 'demo@agrofinance.app',
      full_name: 'Usuário Demo',
      created_at: new Date().toISOString(),
    };
    setProfile(demoProfile);

    // Criar assinatura trial demo
    const demoSubscription: Subscription = {
      id: 'demo-subscription',
      user_id: 'demo-user',
      email: 'demo@agrofinance.app',
      plan: 'free',
      status: 'trial',
      starts_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      apps_included: ['operacional', 'finance', 'maquinas'],
      features: ['basic_reports', 'limited_entries'],
    };
    setSubscription(demoSubscription);
    setIsLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return false;
      try {
        await supabaseRaw.from('profiles').update(updates).eq('id', user.id);
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        // Sincronizar perfil com outros bancos
        if (user.email) {
          ssoService.forceSyncAll(user.id, user.email);
        }
        return true;
      } catch {
        return false;
      }
    },
    [user]
  );

  // =====================================================
  // FUNÇÕES SSO ADICIONAIS
  // =====================================================
  const checkAppAccess = useCallback(
    async (appName: 'operacional' | 'finance' | 'maquinas') => {
      if (!user) return { hasAccess: false, reason: 'Não autenticado' };
      return ssoService.checkAppAccess(user.id, appName);
    },
    [user]
  );

  const forceSyncSSO = useCallback(async () => {
    if (!user || !user.email) return { success: false, message: 'Não autenticado' };
    return ssoService.forceSyncAll(user.id, user.email);
  }, [user]);

  const getSyncStatus = useCallback(() => {
    return ssoService.getSyncStatus();
  }, []);

  // =====================================================
  // RETORNO - TUDO INTEGRADO COM SSO
  // =====================================================
  return {
    // Auth
    session,
    user,
    isLoading,
    isAuthenticated: !!session,
    // Perfil
    profile,
    updateProfile,
    // Assinatura integrada
    subscription,
    isLoadingSubscription,
    isPremium: subscription?.plan === 'professional' || subscription?.plan === 'enterprise',
    isTrial: subscription?.status === 'trial',
    isActive: subscription?.status === 'active' || subscription?.status === 'trial',
    // Verificações
    hasAccessToApp,
    hasFeature,
    needsPayment,
    trialDaysRemaining,
    // Ações
    signUp,
    signIn,
    signOut,
    resetPassword,
    upgradeSubscription,
    loadSubscription,
    loginWithEmail,
    skipLogin,
    // SSO - Sincronização entre apps
    checkAppAccess,
    forceSyncSSO,
    getSyncStatus,
  };
});
