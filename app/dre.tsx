import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Share2,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Period = 'month' | 'quarter' | 'year' | 'custom';

export default function DREScreen() {
  const { expenses, revenues, operations } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedDate] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);

  const { startDate, endDate } = useMemo(() => {
    if (selectedPeriod === 'month') {
      return {
        startDate: startOfMonth(selectedDate),
        endDate: endOfMonth(selectedDate),
      };
    } else if (selectedPeriod === 'year') {
      return {
        startDate: startOfYear(selectedDate),
        endDate: endOfYear(selectedDate),
      };
    }
    return {
      startDate: startOfMonth(selectedDate),
      endDate: endOfMonth(selectedDate),
    };
  }, [selectedPeriod, selectedDate]);

  const dreData = useMemo(() => {
    const filteredExpenses = expenses.filter(
      (e) => e.date >= startDate && e.date <= endDate && e.status !== 'draft'
    );
    const filteredRevenues = revenues.filter(
      (r) => r.date >= startDate && r.date <= endDate && r.status !== 'cancelled'
    );

    const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.value, 0);
    const totalExpense = filteredExpenses.reduce(
      (sum, e) => sum + (e.actualValue || e.invoiceValue || e.negotiatedValue),
      0
    );
    const netProfit = totalRevenue - totalExpense;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const revenueByCategory: Record<string, number> = {};
    filteredRevenues.forEach((r) => {
      const cat = r.category || 'Outros';
      revenueByCategory[cat] = (revenueByCategory[cat] || 0) + r.value;
    });

    const expenseByCategory: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Outros';
      const value = e.actualValue || e.invoiceValue || e.negotiatedValue;
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + value;
    });

    const revenueByOperation: Record<string, number> = {};
    filteredRevenues.forEach((r) => {
      const op = operations.find((o) => o.id === r.operationId);
      const opName = op ? op.name : 'Sem Operação';
      revenueByOperation[opName] = (revenueByOperation[opName] || 0) + r.value;
    });

    const expenseByOperation: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const op = operations.find((o) => o.id === e.operationId);
      const opName = op ? op.name : 'Sem Operação';
      const value = e.actualValue || e.invoiceValue || e.negotiatedValue;
      expenseByOperation[opName] = (expenseByOperation[opName] || 0) + value;
    });

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      margin,
      revenueByCategory,
      expenseByCategory,
      revenueByOperation,
      expenseByOperation,
    };
  }, [expenses, revenues, operations, startDate, endDate]);

  const isWeb = Platform.OS === 'web';

  const handleExport = (format: string) => {
    setShowExportModal(false);
    alert(`DRE exportado em formato ${format}!`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: 'DRE',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Demonstrativo de Resultado</Text>
              <Text style={styles.subtitle}>
                {format(startDate, "dd 'de' MMM", { locale: ptBR })} -{' '}
                {format(endDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => setShowExportModal(true)}
              activeOpacity={0.7}
            >
              <Download size={18} color={Colors.primary} />
              <Text style={styles.exportText}>Exportar</Text>
            </TouchableOpacity>
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
                style={[styles.periodText, selectedPeriod === 'quarter' && styles.periodTextActive]}
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

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: Colors.success + '15' }]}>
                  <TrendingUp size={24} color={Colors.success} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Receita Bruta</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    R$ {dreData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: Colors.error + '15' }]}>
                  <TrendingDown size={24} color={Colors.error} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Despesas Totais</Text>
                  <Text style={[styles.summaryValue, { color: Colors.error }]}>
                    R$ {dreData.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.profitRow}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + '15' }]}>
                <DollarSign size={24} color={Colors.primary} />
              </View>
              <View style={styles.profitInfo}>
                <Text style={styles.profitLabel}>Lucro Líquido</Text>
                <Text
                  style={[
                    styles.profitValue,
                    { color: dreData.netProfit >= 0 ? Colors.success : Colors.error },
                  ]}
                >
                  R$ {dreData.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.marginBadge}>
                <Text style={styles.marginText}>{dreData.margin.toFixed(1)}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receitas por Categoria</Text>
            {Object.entries(dreData.revenueByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, value]) => {
                const percentage = (value / dreData.totalRevenue) * 100;
                return (
                  <View key={category} style={styles.lineItem}>
                    <View style={styles.lineLeft}>
                      <View style={[styles.lineDot, { backgroundColor: Colors.success }]} />
                      <Text style={styles.lineLabel}>{category}</Text>
                    </View>
                    <View style={styles.lineRight}>
                      <Text style={styles.linePercentage}>{percentage.toFixed(1)}%</Text>
                      <Text style={[styles.lineValue, { color: Colors.success }]}>
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            {Object.keys(dreData.revenueByCategory).length === 0 && (
              <Text style={styles.emptyText}>Nenhuma receita no período</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
            {Object.entries(dreData.expenseByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, value]) => {
                const percentage = (value / dreData.totalExpense) * 100;
                return (
                  <View key={category} style={styles.lineItem}>
                    <View style={styles.lineLeft}>
                      <View style={[styles.lineDot, { backgroundColor: Colors.error }]} />
                      <Text style={styles.lineLabel}>{category}</Text>
                    </View>
                    <View style={styles.lineRight}>
                      <Text style={styles.linePercentage}>{percentage.toFixed(1)}%</Text>
                      <Text style={[styles.lineValue, { color: Colors.error }]}>
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            {Object.keys(dreData.expenseByCategory).length === 0 && (
              <Text style={styles.emptyText}>Nenhuma despesa no período</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultado por Operação</Text>
            {operations.map((op) => {
              const revenue = dreData.revenueByOperation[op.name] || 0;
              const expense = dreData.expenseByOperation[op.name] || 0;
              const result = revenue - expense;

              if (revenue === 0 && expense === 0) return null;

              return (
                <View key={op.id} style={styles.operationCard}>
                  <View style={styles.operationHeader}>
                    <View style={[styles.operationIcon, { backgroundColor: op.color + '20' }]}>
                      <Text style={[styles.operationIconText, { color: op.color }]}>
                        {op.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.operationName}>{op.name}</Text>
                  </View>

                  <View style={styles.operationDetails}>
                    <View style={styles.operationLine}>
                      <Text style={styles.operationLineLabel}>Receitas</Text>
                      <Text style={[styles.operationLineValue, { color: Colors.success }]}>
                        R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.operationLine}>
                      <Text style={styles.operationLineLabel}>Despesas</Text>
                      <Text style={[styles.operationLineValue, { color: Colors.error }]}>
                        R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={[styles.operationLine, styles.operationLineTotal]}>
                      <Text style={styles.operationLineLabelBold}>Resultado</Text>
                      <Text
                        style={[
                          styles.operationLineValueBold,
                          { color: result >= 0 ? Colors.success : Colors.error },
                        ]}
                      >
                        R$ {result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Modal de Exportação */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exportar DRE</Text>
            <Text style={styles.modalDescription}>Escolha o formato de exportação</Text>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExport('Excel')}
              activeOpacity={0.7}
            >
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.success + '15' }]}>
                <FileText size={24} color={Colors.success} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Excel (XLSX)</Text>
                <Text style={styles.exportOptionDesc}>Planilha editável com dados completos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExport('PDF')}
              activeOpacity={0.7}
            >
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.error + '15' }]}>
                <FileText size={24} color={Colors.error} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>PDF</Text>
                <Text style={styles.exportOptionDesc}>Relatório formatado para impressão</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExport('Contador')}
              activeOpacity={0.7}
            >
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Share2 size={24} color={Colors.primary} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Enviar para Contador</Text>
                <Text style={styles.exportOptionDesc}>Integração com sistema contábil</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExportModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerButton: {
    padding: 8,
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
  title: {
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
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
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profitInfo: {
    flex: 1,
  },
  profitLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  profitValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  marginBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  marginText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lineLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  lineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  linePercentage: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
    minWidth: 50,
    textAlign: 'right',
  },
  lineValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    minWidth: 120,
    textAlign: 'right',
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  operationCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  operationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationIconText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  operationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  operationDetails: {
    gap: 8,
  },
  operationLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operationLineLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  operationLineValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  operationLineTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  operationLineLabelBold: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  operationLineValueBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  exportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportOptionInfo: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
