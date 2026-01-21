import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wheat,
  MapPin,
  Calendar,
  ChevronDown,
  BarChart3,
  PieChart,
  Target,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

const { width: screenWidth } = Dimensions.get('window');

type FarmMetrics = {
  id: string;
  name: string;
  area: number;
  totalRevenue: number;
  totalExpense: number;
  revenuePerHectare: number;
  expensePerHectare: number;
  profitPerHectare: number;
  profitMargin: number;
};

type PeriodOption = {
  id: string;
  label: string;
  months: number;
};

const periods: PeriodOption[] = [
  { id: 'current_month', label: 'Mês Atual', months: 1 },
  { id: 'last_3_months', label: 'Últimos 3 meses', months: 3 },
  { id: 'last_6_months', label: 'Últimos 6 meses', months: 6 },
  { id: 'current_year', label: 'Ano Atual', months: 12 },
  { id: 'all_time', label: 'Todo Período', months: 0 },
];

export default function CostPerHectareScreen() {
  const isWeb = Platform.OS === 'web';
  const [farmMetrics, setFarmMetrics] = useState<FarmMetrics[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(periods[2]);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalArea, setTotalArea] = useState(0);
  const [overallMetrics, setOverallMetrics] = useState({
    totalRevenue: 0,
    totalExpense: 0,
    avgRevenuePerHa: 0,
    avgExpensePerHa: 0,
    avgProfitPerHa: 0,
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get farms, expenses and revenues
      const [farms, expenses, revenues] = await Promise.all([
        api.getFarms(),
        api.getExpenses(),
        api.getRevenues(),
      ]);

      // Calculate date filter
      const now = new Date();
      const startDate =
        selectedPeriod.months > 0
          ? new Date(now.getFullYear(), now.getMonth() - selectedPeriod.months, 1)
          : null;

      // Filter by period
      const filteredExpenses = startDate
        ? expenses.filter((e: any) => new Date(e.date) >= startDate)
        : expenses;
      const filteredRevenues = startDate
        ? revenues.filter((r: any) => new Date(r.date) >= startDate)
        : revenues;

      // Calculate total area
      const total = (farms || []).reduce((sum: number, f: any) => sum + (f.size || f.area || 0), 0);
      setTotalArea(total);

      // Calculate metrics per farm
      const metrics: FarmMetrics[] = (farms || []).map((farm: any) => {
        const farmExpenses = filteredExpenses.filter((e: any) => e.farm_id === farm.id);
        const farmRevenues = filteredRevenues.filter((r: any) => r.farm_id === farm.id);

        const totalExpense = farmExpenses.reduce(
          (sum: number, e: any) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0),
          0
        );
        const totalRevenue = farmRevenues.reduce((sum: number, r: any) => sum + (r.value || 0), 0);

        const area = farm.size || farm.area || 1;
        const revenuePerHectare = totalRevenue / area;
        const expensePerHectare = totalExpense / area;
        const profitPerHectare = revenuePerHectare - expensePerHectare;
        const profitMargin =
          totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue) * 100 : 0;

        return {
          id: farm.id,
          name: farm.name,
          area,
          totalRevenue,
          totalExpense,
          revenuePerHectare,
          expensePerHectare,
          profitPerHectare,
          profitMargin,
        };
      });

      // Sort by profit per hectare
      metrics.sort((a, b) => b.profitPerHectare - a.profitPerHectare);
      setFarmMetrics(metrics);

      // Calculate overall metrics
      const totalRevenue = filteredRevenues.reduce(
        (sum: number, r: any) => sum + (r.value || 0),
        0
      );
      const totalExpense = filteredExpenses.reduce(
        (sum: number, e: any) => sum + (e.actual_value || e.invoice_value || e.agreed_value || 0),
        0
      );

      setOverallMetrics({
        totalRevenue,
        totalExpense,
        avgRevenuePerHa: total > 0 ? totalRevenue / total : 0,
        avgExpensePerHa: total > 0 ? totalExpense / total : 0,
        avgProfitPerHa: total > 0 ? (totalRevenue - totalExpense) / total : 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyPerHa = (value: number) => {
    return `${formatCurrency(value)}/ha`;
  };

  const getPerformanceColor = (profitPerHa: number) => {
    if (profitPerHa > 1000) return Colors.success;
    if (profitPerHa > 0) return Colors.warning;
    return Colors.error;
  };

  const getPerformanceLabel = (profitPerHa: number) => {
    if (profitPerHa > 2000) return 'Excelente';
    if (profitPerHa > 1000) return 'Bom';
    if (profitPerHa > 0) return 'Regular';
    return 'Prejuízo';
  };

  // Find best and worst performing farms
  const bestFarm = farmMetrics.length > 0 ? farmMetrics[0] : null;
  const worstFarm = farmMetrics.length > 0 ? farmMetrics[farmMetrics.length - 1] : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>R$/Hectare</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Period Selector */}
          <TouchableOpacity
            style={styles.periodSelector}
            onPress={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <Calendar size={18} color={Colors.primary} />
            <Text style={styles.periodText}>{selectedPeriod.label}</Text>
            <ChevronDown size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showPeriodPicker && (
            <View style={styles.periodPicker}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodOption,
                    selectedPeriod.id === period.id && styles.periodOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedPeriod(period);
                    setShowPeriodPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.periodOptionText,
                      selectedPeriod.id === period.id && styles.periodOptionTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Total Area Banner */}
          <View style={styles.areaBanner}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.areaBannerText}>
              Área Total:{' '}
              <Text style={styles.areaBannerValue}>
                {totalArea.toLocaleString('pt-BR')} hectares
              </Text>
            </Text>
          </View>

          {/* Overall Metrics */}
          <View style={styles.overallCard}>
            <Text style={styles.overallTitle}>Visão Geral</Text>
            <View style={styles.overallGrid}>
              <View style={styles.overallItem}>
                <View style={[styles.overallIcon, { backgroundColor: Colors.success + '20' }]}>
                  <TrendingUp size={20} color={Colors.success} />
                </View>
                <Text style={styles.overallLabel}>Receita/ha</Text>
                <Text style={[styles.overallValue, { color: Colors.success }]}>
                  {formatCurrencyPerHa(overallMetrics.avgRevenuePerHa)}
                </Text>
              </View>
              <View style={styles.overallItem}>
                <View style={[styles.overallIcon, { backgroundColor: Colors.error + '20' }]}>
                  <TrendingDown size={20} color={Colors.error} />
                </View>
                <Text style={styles.overallLabel}>Custo/ha</Text>
                <Text style={[styles.overallValue, { color: Colors.error }]}>
                  {formatCurrencyPerHa(overallMetrics.avgExpensePerHa)}
                </Text>
              </View>
              <View style={styles.overallItem}>
                <View style={[styles.overallIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <DollarSign size={20} color={Colors.primary} />
                </View>
                <Text style={styles.overallLabel}>Lucro/ha</Text>
                <Text
                  style={[
                    styles.overallValue,
                    { color: overallMetrics.avgProfitPerHa >= 0 ? Colors.primary : Colors.error },
                  ]}
                >
                  {formatCurrencyPerHa(overallMetrics.avgProfitPerHa)}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Highlights */}
          {bestFarm && worstFarm && farmMetrics.length > 1 && (
            <View style={styles.highlightsRow}>
              <View style={[styles.highlightCard, { backgroundColor: Colors.success + '15' }]}>
                <Text style={styles.highlightLabel}>🏆 Melhor Desempenho</Text>
                <Text style={styles.highlightFarm}>{bestFarm.name}</Text>
                <Text style={[styles.highlightValue, { color: Colors.success }]}>
                  {formatCurrencyPerHa(bestFarm.profitPerHectare)}
                </Text>
              </View>
              <View style={[styles.highlightCard, { backgroundColor: Colors.warning + '15' }]}>
                <Text style={styles.highlightLabel}>⚠️ Precisa Atenção</Text>
                <Text style={styles.highlightFarm}>{worstFarm.name}</Text>
                <Text
                  style={[
                    styles.highlightValue,
                    { color: worstFarm.profitPerHectare >= 0 ? Colors.warning : Colors.error },
                  ]}
                >
                  {formatCurrencyPerHa(worstFarm.profitPerHectare)}
                </Text>
              </View>
            </View>
          )}

          {/* Farms Ranking */}
          <Text style={styles.sectionTitle}>Ranking por Fazenda</Text>

          {farmMetrics.length === 0 ? (
            <View style={styles.emptyState}>
              <Wheat size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Nenhuma fazenda cadastrada</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/farms')}
              >
                <Text style={styles.emptyStateButtonText}>Cadastrar Fazendas</Text>
              </TouchableOpacity>
            </View>
          ) : (
            farmMetrics.map((farm, index) => {
              const performanceColor = getPerformanceColor(farm.profitPerHectare);
              const performanceLabel = getPerformanceLabel(farm.profitPerHectare);

              return (
                <View key={farm.id} style={styles.farmCard}>
                  <View style={styles.farmHeader}>
                    <View style={styles.farmRank}>
                      <Text style={styles.farmRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.farmInfo}>
                      <Text style={styles.farmName}>{farm.name}</Text>
                      <Text style={styles.farmArea}>{farm.area.toLocaleString('pt-BR')} ha</Text>
                    </View>
                    <View
                      style={[
                        styles.performanceBadge,
                        { backgroundColor: performanceColor + '20' },
                      ]}
                    >
                      <Text style={[styles.performanceBadgeText, { color: performanceColor }]}>
                        {performanceLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.farmMetrics}>
                    <View style={styles.farmMetricItem}>
                      <Text style={styles.farmMetricLabel}>Receita/ha</Text>
                      <Text style={[styles.farmMetricValue, { color: Colors.success }]}>
                        {formatCurrencyPerHa(farm.revenuePerHectare)}
                      </Text>
                    </View>
                    <View style={styles.farmMetricItem}>
                      <Text style={styles.farmMetricLabel}>Custo/ha</Text>
                      <Text style={[styles.farmMetricValue, { color: Colors.error }]}>
                        {formatCurrencyPerHa(farm.expensePerHectare)}
                      </Text>
                    </View>
                    <View style={styles.farmMetricItem}>
                      <Text style={styles.farmMetricLabel}>Lucro/ha</Text>
                      <Text
                        style={[
                          styles.farmMetricValue,
                          { color: performanceColor, fontWeight: '700' },
                        ]}
                      >
                        {formatCurrencyPerHa(farm.profitPerHectare)}
                      </Text>
                    </View>
                  </View>

                  {/* Profit Margin Bar */}
                  <View style={styles.marginContainer}>
                    <View style={styles.marginHeader}>
                      <Text style={styles.marginLabel}>Margem de Lucro</Text>
                      <Text style={[styles.marginValue, { color: performanceColor }]}>
                        {farm.profitMargin.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.marginBar}>
                      <View
                        style={[
                          styles.marginFill,
                          {
                            width: `${Math.max(0, Math.min(100, farm.profitMargin))}%`,
                            backgroundColor: performanceColor,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Totals */}
                  <View style={styles.farmTotals}>
                    <Text style={styles.farmTotalText}>
                      Total: {formatCurrency(farm.totalRevenue)} receita |{' '}
                      {formatCurrency(farm.totalExpense)} custo
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Analysis Tips */}
          <View style={styles.tipsCard}>
            <Target size={20} color={Colors.primary} />
            <Text style={styles.tipsTitle}>Dicas de Análise</Text>
            <Text style={styles.tipsText}>
              • Compare o custo/ha entre fazendas para identificar ineficiências{'\n'}• Fazendas com
              margem abaixo de 20% precisam revisão de custos{'\n'}• O lucro/ha ideal para soja é
              acima de R$ 2.000/ha{'\n'}• Analise tendências ao longo dos meses para decisões
              estratégicas
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  periodPicker: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  periodOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodOptionActive: {
    backgroundColor: Colors.primary + '15',
  },
  periodOptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  periodOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  areaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  areaBannerText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  areaBannerValue: {
    fontWeight: '700',
    color: Colors.primary,
  },
  overallCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  overallGrid: {
    flexDirection: 'row',
  },
  overallItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overallLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
  },
  highlightLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  highlightFarm: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  farmCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  farmRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  farmRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  farmArea: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  performanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  farmMetrics: {
    flexDirection: 'row',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  farmMetricItem: {
    flex: 1,
  },
  farmMetricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  farmMetricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  marginContainer: {
    marginBottom: 12,
  },
  marginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  marginLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  marginValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  marginBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  marginFill: {
    height: '100%',
    borderRadius: 3,
  },
  farmTotals: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  farmTotalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  tipsCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
