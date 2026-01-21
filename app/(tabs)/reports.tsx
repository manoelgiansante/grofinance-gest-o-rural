import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { monthlyResults } from '@/mocks/data';
import Colors from '@/constants/colors';

export default function ReportsScreen() {
  const { operations } = useApp();

  const totalRevenue = monthlyResults.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = monthlyResults.reduce((sum, r) => sum + r.expenses, 0);
  const totalResult = totalRevenue - totalExpenses;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>Janeiro 2025</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Consolidado do Mês</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              + R$ {totalRevenue.toLocaleString('pt-BR')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>
              - R$ {totalExpenses.toLocaleString('pt-BR')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.summaryLabelBold]}>Resultado</Text>
            <View style={styles.resultRow}>
              {totalResult > 0 ? (
                <TrendingUp size={20} color={Colors.success} />
              ) : (
                <TrendingDown size={20} color={Colors.error} />
              )}
              <Text
                style={[
                  styles.summaryValue,
                  styles.summaryValueBold,
                  { color: totalResult > 0 ? Colors.success : Colors.error },
                ]}
              >
                R$ {totalResult.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Operação</Text>
          {monthlyResults.map((result) => {
            const operation = operations.find((o) => o.id === result.operationId);
            if (!operation) return null;

            const isPositive = result.result > 0;

            return (
              <View key={result.operationId} style={styles.operationCard}>
                <View style={styles.operationHeader}>
                  <View style={styles.operationTitleRow}>
                    <View style={[styles.operationDot, { backgroundColor: operation.color }]} />
                    <Text style={styles.operationName}>{operation.name}</Text>
                  </View>
                  <View style={styles.resultBadge}>
                    {isPositive ? (
                      <TrendingUp size={16} color={Colors.success} />
                    ) : (
                      <TrendingDown size={16} color={Colors.error} />
                    )}
                    <Text
                      style={[
                        styles.resultValue,
                        { color: isPositive ? Colors.success : Colors.error },
                      ]}
                    >
                      R$ {Math.abs(result.result).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.operationValues}>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Receitas</Text>
                    <Text style={styles.valueAmount}>
                      R$ {result.revenue.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  <View style={styles.valueDivider} />
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Despesas</Text>
                    <Text style={styles.valueAmount}>
                      R$ {result.expenses.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.categoriesSection}>
                  <Text style={styles.categoriesTitle}>Principais Categorias</Text>
                  {result.expensesByCategory.slice(0, 3).map((cat) => (
                    <View key={cat.category} style={styles.categoryRow}>
                      <Text style={styles.categoryName}>{cat.category}</Text>
                      <Text style={styles.categoryAmount}>
                        R$ {cat.amount.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginBottom: 28,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryLabelBold: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  summaryValueBold: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  operationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  operationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  operationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  operationName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  operationValues: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  valueItem: {
    flex: 1,
  },
  valueDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  valueLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  categoriesSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
