import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Package,
  Plus,
  X,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const { expenses } = useApp();
  const { isPremium } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    Animated.spring(fabAnimation, {
      toValue: fabOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [fabOpen]);

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('@rumo_finance_onboarding_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Error checking onboarding:', err);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@rumo_finance_onboarding_seen', 'true');
      setShowOnboarding(false);
    } catch (err) {
      console.error('Error saving onboarding state:', err);
    }
  };

  const stats = {
    cashBalance: 0,
    accountsPayable: 0,
    accountsReceivable: 0,
    pendingApprovals: expenses.filter((e) => e.status === 'pending_approval').length,
    overduePayments: expenses.filter(
      (e) => e.status === 'approved' && new Date(e.dueDate) < new Date()
    ).length,
    monthRevenue: 0,
    monthExpenses: 0,
    monthResult: 0,
  };

  const recentActivity: { type: 'in' | 'out'; desc: string; value: number; date: string }[] = [];

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      {/* Onboarding Modal */}
      <OnboardingTutorial visible={showOnboarding} onComplete={handleOnboardingComplete} />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Subscription Banner */}
          {!isPremium && (
            <SubscriptionBanner compact onSubscribe={() => router.push('/subscription')} />
          )}

          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Dashboard Financeiro</Text>
              <Text style={styles.subtitle}>Visão consolidada do negócio</Text>
            </View>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodChip, selectedPeriod === 'month' && styles.periodChipActive]}
                onPress={() => setSelectedPeriod('month')}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}
                >
                  Mês
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodChip, selectedPeriod === 'quarter' && styles.periodChipActive]}
                onPress={() => setSelectedPeriod('quarter')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === 'quarter' && styles.periodTextActive,
                  ]}
                >
                  Trimestre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodChip, selectedPeriod === 'year' && styles.periodChipActive]}
                onPress={() => setSelectedPeriod('year')}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextActive]}
                >
                  Ano
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.metricsGrid, isWeb && styles.metricsGridWeb]}>
            <TouchableOpacity
              style={[styles.metricCard, styles.metricCardPrimary, isWeb && styles.metricCardWeb]}
              activeOpacity={0.7}
              onPress={() => router.push('/cash-flow')}
            >
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <DollarSign size={24} color={Colors.primary} />
                </View>
                <ArrowUpRight size={18} color={Colors.white} opacity={0.6} />
              </View>
              <Text style={styles.metricValue}>R$ {stats.cashBalance.toLocaleString('pt-BR')}</Text>
              <Text style={styles.metricLabel}>Saldo em Caixa</Text>
              <View style={styles.metricTrend}>
                <TrendingUp size={14} color={Colors.white} opacity={0.8} />
                <Text style={styles.metricTrendText}>+12.5% vs mês anterior</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricCard, isWeb && styles.metricCardWeb]}
              activeOpacity={0.7}
              onPress={() => router.push('/expenses')}
            >
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: Colors.error + '15' }]}>
                  <TrendingDown size={22} color={Colors.error} />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: Colors.textPrimary }]}>
                R$ {stats.accountsPayable.toLocaleString('pt-BR')}
              </Text>
              <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>
                Contas a Pagar
              </Text>
              {stats.overduePayments > 0 && (
                <View style={styles.metricAlert}>
                  <AlertTriangle size={12} color={Colors.error} />
                  <Text style={styles.metricAlertText}>{stats.overduePayments} vencidas</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricCard, isWeb && styles.metricCardWeb]}
              activeOpacity={0.7}
              onPress={() => router.push('/receivables')}
            >
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: Colors.success + '15' }]}>
                  <TrendingUp size={22} color={Colors.success} />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: Colors.textPrimary }]}>
                R$ {stats.accountsReceivable.toLocaleString('pt-BR')}
              </Text>
              <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>
                Contas a Receber
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricCard, isWeb && styles.metricCardWeb]}
              activeOpacity={0.7}
              onPress={() => router.push('/validations')}
            >
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: Colors.warning + '15' }]}>
                  <Clock size={22} color={Colors.warning} />
                </View>
              </View>
              <Text style={[styles.metricValue, { color: Colors.textPrimary }]}>
                {stats.pendingApprovals}
              </Text>
              <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>
                Pendentes de Aprovação
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.row, isWeb && styles.rowWeb]}>
            <View style={[styles.resultCard, isWeb && styles.resultCardWeb]}>
              <Text style={styles.resultTitle}>Resultado do Período</Text>
              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <View style={styles.resultIconContainer}>
                  <ArrowDownRight size={16} color={Colors.success} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Receitas</Text>
                  <Text style={[styles.resultValue, { color: Colors.success }]}>
                    R$ {stats.monthRevenue.toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>

              <View style={styles.resultRow}>
                <View style={styles.resultIconContainer}>
                  <ArrowUpRight size={16} color={Colors.error} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Despesas</Text>
                  <Text style={[styles.resultValue, { color: Colors.error }]}>
                    R$ {stats.monthExpenses.toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <View
                  style={[styles.resultIconContainer, { backgroundColor: Colors.primary + '15' }]}
                >
                  <DollarSign size={16} color={Colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultLabel, styles.resultLabelBold]}>Lucro Líquido</Text>
                  <Text
                    style={[styles.resultValue, styles.resultValueBold, { color: Colors.primary }]}
                  >
                    R$ {stats.monthResult.toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.activityCard, isWeb && styles.activityCardWeb]}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>Atividade Recente</Text>
                <TouchableOpacity onPress={() => router.push('/cash-flow')}>
                  <Text style={styles.activityLink}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              {recentActivity.length === 0 ? (
                <View style={styles.emptyActivity}>
                  <Clock size={32} color={Colors.textTertiary} />
                  <Text style={styles.emptyActivityText}>Nenhuma movimentação ainda</Text>
                  <Text style={styles.emptyActivityHint}>
                    Registre sua primeira receita ou despesa
                  </Text>
                </View>
              ) : (
                recentActivity.map((item, idx) => {
                  const isInflow = item.type === 'in';
                  return (
                    <View key={idx} style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          {
                            backgroundColor: isInflow ? Colors.success + '15' : Colors.error + '15',
                          },
                        ]}
                      >
                        {isInflow ? (
                          <ArrowDownRight size={16} color={Colors.success} />
                        ) : (
                          <ArrowUpRight size={16} color={Colors.error} />
                        )}
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityDesc}>{item.desc}</Text>
                        <Text style={styles.activityDate}>{item.date}</Text>
                      </View>
                      <Text
                        style={[
                          styles.activityValue,
                          { color: isInflow ? Colors.success : Colors.error },
                        ]}
                      >
                        {isInflow ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View style={[styles.quickActions, isWeb && styles.quickActionsWeb]}>
            <Text style={styles.quickActionsTitle}>Acesso Rápido</Text>
            <View style={[styles.quickActionsGrid, isWeb && styles.quickActionsGridWeb]}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/add-expense')}
                activeOpacity={0.7}
              >
                <FileText size={24} color={Colors.primary} />
                <Text style={styles.quickActionLabel}>Nova Despesa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/fiscal')}
                activeOpacity={0.7}
              >
                <CreditCard size={24} color={Colors.accent} />
                <Text style={styles.quickActionLabel}>Emitir NF-e</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/stock')}
                activeOpacity={0.7}
              >
                <Package size={24} color={Colors.info} />
                <Text style={styles.quickActionLabel}>Estoque</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/reports')}
                activeOpacity={0.7}
              >
                <Calendar size={24} color={Colors.success} />
                <Text style={styles.quickActionLabel}>Relatórios</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FAB - Floating Action Button */}
      {fabOpen && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabOpen(false)}
        />
      )}

      <View style={styles.fabContainer}>
        {/* Opções do FAB */}
        <Animated.View
          style={[
            styles.fabOption,
            {
              opacity: fabAnimation,
              transform: [
                {
                  translateY: fabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -180],
                  }),
                },
                { scale: fabAnimation },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fabOptionButton, { backgroundColor: Colors.success }]}
            onPress={() => {
              setFabOpen(false);
              router.push('/add-revenue');
            }}
          >
            <TrendingUp size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.fabOptionLabel}>Nova Receita</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabOption,
            {
              opacity: fabAnimation,
              transform: [
                {
                  translateY: fabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                  }),
                },
                { scale: fabAnimation },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fabOptionButton, { backgroundColor: Colors.error }]}
            onPress={() => {
              setFabOpen(false);
              router.push('/add-expense');
            }}
          >
            <TrendingDown size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.fabOptionLabel}>Nova Despesa</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabOption,
            {
              opacity: fabAnimation,
              transform: [
                {
                  translateY: fabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                  }),
                },
                { scale: fabAnimation },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fabOptionButton, { backgroundColor: Colors.info }]}
            onPress={() => {
              setFabOpen(false);
              router.push('/fiscal/nfe-wizard');
            }}
          >
            <FileText size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.fabOptionLabel}>Emitir NF-e</Text>
        </Animated.View>

        {/* Botão principal do FAB */}
        <TouchableOpacity
          style={[styles.fab, fabOpen && styles.fabActive]}
          onPress={() => setFabOpen(!fabOpen)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: fabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Plus size={28} color={Colors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.white,
  },
  metricsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  metricsGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  metricCardWeb: {
    width: 'calc(25% - 12px)' as any,
  },
  metricCardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.85,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  metricTrendText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    fontWeight: '500' as const,
  },
  metricAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.error + '15',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  metricAlertText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600' as const,
  },
  row: {
    gap: 16,
    marginBottom: 24,
  },
  rowWeb: {
    flexDirection: 'row',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  resultCardWeb: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  resultDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  resultLabelBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  resultValueBold: {
    fontSize: 24,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  activityCardWeb: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  activityLink: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  activityValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptyActivityHint: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsWeb: {
    maxWidth: 1000,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionsGridWeb: {
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabActive: {
    backgroundColor: Colors.textPrimary,
  },
  fabOption: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  fabOptionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabOptionLabel: {
    position: 'absolute',
    right: 60,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
