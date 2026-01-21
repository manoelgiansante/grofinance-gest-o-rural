import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, TrendingDown, Plus, Target, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, Stack } from 'expo-router';

const mockSeasons: {
  id: string;
  name: string;
  crop: string;
  status: 'active' | 'planning' | 'completed';
  area: number;
  budgetedCost: number;
  actualCost: number;
  budgetedRevenue: number;
  actualRevenue: number;
  variance: number;
  expectedYield: number;
  actualYield: number;
}[] = [];

export default function SeasonsScreen() {
  const isWeb = Platform.OS === 'web';

  const getStatusColor = (status: string) => {
    if (status === 'active') return Colors.success;
    if (status === 'planning') return Colors.warning;
    if (status === 'completed') return Colors.info;
    return Colors.textSecondary;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Em andamento';
    if (status === 'planning') return 'Planejamento';
    if (status === 'completed') return 'Concluída';
    return 'Cancelada';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Safras & Orçamento', headerShown: true }} />
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Todas as Safras</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-season' as any)}
            >
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addButtonText}>Nova Safra</Text>
            </TouchableOpacity>
          </View>

          {mockSeasons.map((season) => {
            const budgetVariance =
              season.actualCost > 0
                ? ((season.actualCost - season.budgetedCost) / season.budgetedCost) * 100
                : 0;
            const isOverBudget = budgetVariance > 5;

            return (
              <TouchableOpacity
                key={season.id}
                style={styles.seasonCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/season-details?id=${season.id}` as any)}
              >
                <View style={styles.seasonHeader}>
                  <View style={styles.seasonTitle}>
                    <Calendar size={20} color={Colors.primary} />
                    <Text style={styles.seasonName}>{season.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(season.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(season.status) }]}>
                      {getStatusLabel(season.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.areaText}>
                  {season.area} ha • {season.crop}
                </Text>

                <View style={styles.divider} />

                <View style={styles.budgetSection}>
                  <Text style={styles.sectionTitle}>Orçamento vs Realizado</Text>

                  <View style={styles.budgetRow}>
                    <View style={styles.budgetItem}>
                      <Text style={styles.budgetLabel}>Custos</Text>
                      <View style={styles.budgetValues}>
                        <Text style={styles.budgetActual}>
                          R${' '}
                          {season.actualCost > 0 ? season.actualCost.toLocaleString('pt-BR') : '-'}
                        </Text>
                        <Text style={styles.budgetPlanned}>
                          / R$ {season.budgetedCost.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                      {season.actualCost > 0 && (
                        <View style={styles.varianceContainer}>
                          {isOverBudget ? (
                            <TrendingUp size={12} color={Colors.error} />
                          ) : (
                            <TrendingDown size={12} color={Colors.success} />
                          )}
                          <Text
                            style={[
                              styles.varianceText,
                              {
                                color: isOverBudget ? Colors.error : Colors.success,
                              },
                            ]}
                          >
                            {budgetVariance > 0 ? '+' : ''}
                            {budgetVariance.toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.budgetItem}>
                      <Text style={styles.budgetLabel}>Receitas</Text>
                      <View style={styles.budgetValues}>
                        <Text style={[styles.budgetActual, { color: Colors.success }]}>
                          R${' '}
                          {season.actualRevenue > 0
                            ? season.actualRevenue.toLocaleString('pt-BR')
                            : '-'}
                        </Text>
                        <Text style={styles.budgetPlanned}>
                          / R$ {season.budgetedRevenue.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Target size={16} color={Colors.textSecondary} />
                    <Text style={styles.metricLabel}>Produtividade Esperada</Text>
                    <Text style={styles.metricValue}>{season.expectedYield} sc/ha</Text>
                  </View>
                  {season.actualYield > 0 && (
                    <View style={styles.metricItem}>
                      <DollarSign size={16} color={Colors.success} />
                      <Text style={styles.metricLabel}>Produtividade Real</Text>
                      <Text style={[styles.metricValue, { color: Colors.success }]}>
                        {season.actualYield} sc/ha
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  seasonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  areaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  budgetSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  budgetRow: {
    gap: 16,
  },
  budgetItem: {
    gap: 6,
  },
  budgetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  budgetValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  budgetActual: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  budgetPlanned: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  varianceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
});
