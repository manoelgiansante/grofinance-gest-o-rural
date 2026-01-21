import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// =====================================================
// CONFIGURAÇÃO DOS MÚLTIPLOS SUPABASE
// Sistema SSO - Sincronização entre bancos
// =====================================================

// Supabase Principal (Operacional + Finance)
const SUPABASE_PRINCIPAL = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jxcnfyeemdltdfqtgbcl.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Supabase Rumo Máquinas (Separado)
const SUPABASE_MAQUINAS = {
  url: 'https://byfgflxlmcdciupjpoaz.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZmdmbHhsbWNkY2l1cGpwb2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDEyMjgsImV4cCI6MjA3NzI3NzIyOH0.6XZTCN2LtJYLs9ovXbjk8ljosQjEQVL3IDWq15l4mQg',
};

// Cliente Supabase do Rumo Máquinas (somente para sincronização)
export const supabaseMaquinas = createClient(SUPABASE_MAQUINAS.url, SUPABASE_MAQUINAS.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'supabase-maquinas-auth',
  },
});

// =====================================================
// TIPOS PARA SINCRONIZAÇÃO
// =====================================================
export interface SyncProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  farm_name?: string;
  created_at: string;
  synced_at?: string;
  source_db: 'principal' | 'maquinas';
}

export interface SyncSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  apps_included: string[];
  synced_at?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedProfiles?: number;
  syncedSubscriptions?: number;
  errors?: string[];
}

// =====================================================
// CLASSE DE SINCRONIZAÇÃO SSO
// =====================================================
class SupabaseSyncService {
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

  // Obter cliente do banco principal
  get principal(): SupabaseClient {
    return supabase;
  }

  // Obter cliente do banco máquinas
  get maquinas(): SupabaseClient {
    return supabaseMaquinas;
  }

  // =====================================================
  // SINCRONIZAR USUÁRIO APÓS LOGIN
  // =====================================================
  async syncUserAfterLogin(userId: string, email: string): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedProfiles = 0;
    let syncedSubscriptions = 0;

    try {
      console.log('[Sync] Iniciando sincronização SSO para:', email);

      // 1. Buscar/criar perfil no banco principal
      const profilePrincipal = await this.getOrCreateProfile(
        this.principal,
        userId,
        email,
        'principal'
      );

      // 2. Sincronizar com Rumo Máquinas
      await this.syncProfileToMaquinas(profilePrincipal);
      syncedProfiles++;

      // 3. Buscar assinatura ativa (passando email)
      const subscription = await this.getActiveSubscription(userId, email);

      // 4. Sincronizar assinatura com Máquinas
      if (subscription) {
        await this.syncSubscriptionToMaquinas(subscription);
        syncedSubscriptions++;
      }

      // 5. Salvar timestamp de sincronização
      await AsyncStorage.setItem('lastSsoSync', new Date().toISOString());
      await AsyncStorage.setItem('ssoUserId', userId);
      this.lastSyncTime = new Date();

      console.log('[Sync] Sincronização SSO concluída com sucesso');

      return {
        success: true,
        message: 'Sincronização SSO concluída',
        syncedProfiles,
        syncedSubscriptions,
      };
    } catch (error: any) {
      console.error('[Sync] Erro na sincronização:', error);
      errors.push(error.message || 'Erro desconhecido');
      return {
        success: false,
        message: 'Erro na sincronização SSO',
        errors,
      };
    }
  }

  // =====================================================
  // BUSCAR OU CRIAR PERFIL
  // =====================================================
  private async getOrCreateProfile(
    client: SupabaseClient,
    userId: string,
    email: string,
    source: 'principal' | 'maquinas'
  ): Promise<SyncProfile> {
    try {
      // Buscar perfil existente
      const { data: existing, error: fetchError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existing) {
        return { ...existing, source_db: source };
      }

      // Criar novo perfil
      const newProfile: Partial<SyncProfile> = {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        source_db: source,
      };

      const { data: created, error: createError } = await client
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.log('[Sync] Erro ao criar perfil (pode já existir):', createError.message);
        // Se falhar, tentar buscar novamente
        const { data: retry } = await client.from('profiles').select('*').eq('id', userId).single();
        if (retry) return { ...retry, source_db: source };
        throw createError;
      }

      return { ...created, source_db: source };
    } catch (error) {
      console.error('[Sync] Erro em getOrCreateProfile:', error);
      // Retornar perfil mínimo se falhar
      return {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        source_db: source,
      };
    }
  }

  // =====================================================
  // SINCRONIZAR PERFIL COM MÁQUINAS
  // =====================================================
  private async syncProfileToMaquinas(profile: SyncProfile): Promise<void> {
    try {
      // Verificar se existe no Máquinas
      const { data: existing } = await this.maquinas
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .single();

      const syncData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Atualizar
        await this.maquinas.from('profiles').update(syncData).eq('id', profile.id);
      } else {
        // Inserir
        await this.maquinas.from('profiles').insert({
          ...syncData,
          created_at: profile.created_at || new Date().toISOString(),
        });
      }

      console.log('[Sync] Perfil sincronizado com Máquinas');
    } catch (error) {
      console.log('[Sync] Erro ao sincronizar perfil com Máquinas:', error);
      // Não propagar erro - sincronização é best-effort
    }
  }

  // =====================================================
  // BUSCAR ASSINATURA ATIVA
  // =====================================================
  private async getActiveSubscription(
    userId: string,
    email?: string
  ): Promise<SyncSubscription | null> {
    try {
      // Buscar por email na tabela user_subscriptions
      if (!email) {
        const { data: userData } = await this.principal.auth.getUser();
        email = userData?.user?.email;
      }

      if (!email) return null;

      const { data, error } = await this.principal
        .from('user_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) return null;

      // Converter para formato interno
      const plan = data.custo_operacional_plan || data.gestao_rural_plan || 'free';
      const isExpired = data.expires_at && new Date(data.expires_at) < new Date();

      return {
        id: data.id,
        user_id: userId,
        plan: plan,
        status: isExpired ? 'expired' : plan === 'free' ? 'trial' : 'active',
        starts_at: data.created_at,
        expires_at: data.expires_at,
        apps_included: ['operacional', 'finance', 'maquinas'],
      };
    } catch (error) {
      console.log('[Sync] Erro ao buscar assinatura:', error);
      return null;
    }
  }

  // =====================================================
  // SINCRONIZAR ASSINATURA COM MÁQUINAS
  // =====================================================
  private async syncSubscriptionToMaquinas(subscription: SyncSubscription): Promise<void> {
    try {
      // Verificar se existe assinatura no Máquinas para o usuário
      const { data: existingList } = await this.maquinas
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', subscription.user_id)
        .limit(1);

      // Mapear plano para o formato do Máquinas
      const planMapping: Record<string, string> = {
        free: 'free',
        trial: 'free',
        premium: 'professional',
        enterprise: 'enterprise',
      };

      const maquinasPlan = planMapping[subscription.plan] || 'free';

      // Buscar o plan_id no Máquinas
      const { data: planData } = await this.maquinas
        .from('subscription_plans')
        .select('id')
        .eq('plan_type', maquinasPlan)
        .single();

      if (!planData) {
        console.log('[Sync] Plano não encontrado no Máquinas:', maquinasPlan);
        return;
      }

      const syncData = {
        user_id: subscription.user_id,
        plan_id: planData.id,
        status: subscription.status === 'trial' ? 'trialing' : subscription.status,
        current_period_start: subscription.starts_at,
        current_period_end: subscription.expires_at,
        updated_at: new Date().toISOString(),
      };

      if (existingList && existingList.length > 0) {
        // Atualizar
        await this.maquinas
          .from('user_subscriptions')
          .update(syncData)
          .eq('user_id', subscription.user_id);
      } else {
        // Inserir nova
        await this.maquinas.from('user_subscriptions').insert({
          ...syncData,
          created_at: new Date().toISOString(),
        });
      }

      console.log('[Sync] Assinatura sincronizada com Máquinas');
    } catch (error) {
      console.log('[Sync] Erro ao sincronizar assinatura com Máquinas:', error);
      // Não propagar erro - sincronização é best-effort
    }
  }

  // =====================================================
  // LOGIN SINCRONIZADO (SSO)
  // =====================================================
  async signInWithSSO(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user: any | null;
    session: any | null;
    error?: string;
  }> {
    try {
      // 1. Login no banco principal
      const { data: principalAuth, error: principalError } =
        await this.principal.auth.signInWithPassword({
          email,
          password,
        });

      if (principalError) {
        return { success: false, user: null, session: null, error: principalError.message };
      }

      if (!principalAuth.user) {
        return { success: false, user: null, session: null, error: 'Usuário não encontrado' };
      }

      // 2. Tentar login no Máquinas (mesmo email/senha)
      try {
        await this.maquinas.auth.signInWithPassword({ email, password });
        console.log('[SSO] Login sincronizado com Máquinas');
      } catch (maqError) {
        // Se não existir no Máquinas, criar conta
        try {
          await this.maquinas.auth.signUp({ email, password });
          console.log('[SSO] Conta criada no Máquinas');
        } catch {
          console.log('[SSO] Não foi possível sincronizar com Máquinas');
        }
      }

      // 3. Sincronizar dados
      await this.syncUserAfterLogin(principalAuth.user.id, email);

      return {
        success: true,
        user: principalAuth.user,
        session: principalAuth.session,
      };
    } catch (error: any) {
      return { success: false, user: null, session: null, error: error.message };
    }
  }

  // =====================================================
  // REGISTRO SINCRONIZADO (SSO)
  // =====================================================
  async signUpWithSSO(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{
    success: boolean;
    user: any | null;
    session: any | null;
    error?: string;
  }> {
    try {
      // 1. Registro no banco principal
      const { data: principalAuth, error: principalError } = await this.principal.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (principalError) {
        return { success: false, user: null, session: null, error: principalError.message };
      }

      if (!principalAuth.user) {
        return { success: false, user: null, session: null, error: 'Erro ao criar usuário' };
      }

      // 2. Criar no Máquinas também
      try {
        await this.maquinas.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        console.log('[SSO] Conta criada no Máquinas');
      } catch {
        console.log('[SSO] Não foi possível criar conta no Máquinas (pode ser normal)');
      }

      // 3. Criar perfil e trial
      await this.syncUserAfterLogin(principalAuth.user.id, email);

      return {
        success: true,
        user: principalAuth.user,
        session: principalAuth.session,
      };
    } catch (error: any) {
      return { success: false, user: null, session: null, error: error.message };
    }
  }

  // =====================================================
  // LOGOUT SINCRONIZADO
  // =====================================================
  async signOutAll(): Promise<void> {
    try {
      await Promise.all([this.principal.auth.signOut(), this.maquinas.auth.signOut()]);
      await AsyncStorage.removeItem('lastSsoSync');
      await AsyncStorage.removeItem('ssoUserId');
      console.log('[SSO] Logout de todos os sistemas');
    } catch (error) {
      console.error('[SSO] Erro no logout:', error);
    }
  }

  // =====================================================
  // VERIFICAR ACESSO A APP ESPECÍFICO
  // =====================================================
  async checkAppAccess(
    userId: string,
    appName: 'operacional' | 'finance' | 'maquinas'
  ): Promise<{
    hasAccess: boolean;
    reason?: string;
  }> {
    try {
      // Buscar email do usuário
      const { data: userData } = await this.principal.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        return { hasAccess: false, reason: 'Usuário não autenticado' };
      }

      const { data: subscription } = await this.principal
        .from('user_subscriptions')
        .select('*')
        .eq('email', email)
        .single();

      if (!subscription) {
        return { hasAccess: false, reason: 'Sem assinatura ativa' };
      }

      // Verificar se expirou
      if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
        return { hasAccess: false, reason: 'Assinatura expirada' };
      }

      // Verificar plano por app
      const plan = subscription.custo_operacional_plan || subscription.gestao_rural_plan || 'free';

      // Trial ou plano pago tem acesso a tudo
      if (
        plan !== 'free' ||
        !subscription.expires_at ||
        new Date(subscription.expires_at) > new Date()
      ) {
        return { hasAccess: true };
      }

      return { hasAccess: false, reason: 'Plano não inclui este app' };
    } catch (error) {
      console.error('[SSO] Erro ao verificar acesso:', error);
      return { hasAccess: false, reason: 'Erro ao verificar acesso' };
    }
  }

  // =====================================================
  // ATUALIZAR ASSINATURA E SINCRONIZAR
  // =====================================================
  async updateSubscriptionAndSync(
    userId: string,
    email: string,
    updates: { plan?: string; expires_at?: string }
  ): Promise<boolean> {
    try {
      // 1. Atualizar no principal (user_subscriptions)
      const { error } = await this.principal
        .from('user_subscriptions')
        .update({
          custo_operacional_plan: updates.plan,
          gestao_rural_plan: updates.plan,
          expires_at: updates.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) throw error;

      // 2. Buscar assinatura atualizada
      const subscription = await this.getActiveSubscription(userId, email);

      // 3. Sincronizar com Máquinas
      if (subscription) {
        await this.syncSubscriptionToMaquinas(subscription);
      }

      return true;
    } catch (error) {
      console.error('[SSO] Erro ao atualizar assinatura:', error);
      return false;
    }
  }

  // =====================================================
  // FORÇAR SINCRONIZAÇÃO COMPLETA
  // =====================================================
  async forceSyncAll(userId: string, email: string): Promise<SyncResult> {
    this.syncInProgress = true;
    try {
      const result = await this.syncUserAfterLogin(userId, email);
      this.syncInProgress = false;
      return result;
    } catch (error: any) {
      this.syncInProgress = false;
      return {
        success: false,
        message: error.message || 'Erro na sincronização',
        errors: [error.message],
      };
    }
  }

  // =====================================================
  // STATUS DA SINCRONIZAÇÃO
  // =====================================================
  getSyncStatus(): {
    inProgress: boolean;
    lastSync: Date | null;
    needsSync: boolean;
  } {
    const needsSync =
      !this.lastSyncTime || Date.now() - this.lastSyncTime.getTime() > this.SYNC_INTERVAL;

    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSyncTime,
      needsSync,
    };
  }
}

// Exportar instância única do serviço
export const ssoService = new SupabaseSyncService();
export default ssoService;
