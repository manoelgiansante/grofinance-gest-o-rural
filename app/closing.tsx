import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

type ClosingPeriod = {
  id: string;
  month: number;
  year: number;
  status: 'open' | 'pending' | 'closed';
  total_revenue: number;
  total_expense: number;
  balance: number;
  closed_at?: string;
  closed_by?: string;
  notes?: string;
};

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function ClosingScreen() {
  const isWeb = Platform.OS === 'web';
  const [periods, setPeriods] = useState<ClosingPeriod[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<ClosingPeriod | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPeriods();
  }, [selectedYear]);

  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      const data = await api.getClosingPeriods(selectedYear);

      // If no data, generate empty periods for the year
      if (!data || data.length === 0) {
        const emptyPeriods = months.map((_, index) => ({
          id: `${selectedYear}-${index}`,
          month: index,
          year: selectedYear,
          status: 'open' as const,
          total_revenue: 0,
          total_expense: 0,
          balance: 0,
        }));
        setPeriods(emptyPeriods);
      } else {
        setPeriods(data);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'closed':
        return { color: Colors.success, icon: Lock, label: 'Fechado' };
      case 'pending':
        return { color: Colors.warning, icon: AlertTriangle, label: 'Pendente' };
      default:
        return { color: Colors.textSecondary, icon: Unlock, label: 'Aberto' };
    }
  };

  const handleClosePeriod = (period: ClosingPeriod) => {
    Alert.alert(
      'Fechar Período',
      `Deseja fechar o período de ${months[period.month]} ${period.year}?\n\nApós o fechamento, nenhuma alteração poderá ser feita neste período.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar Período',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.closePeriod(period.id);
              loadPeriods();
              Alert.alert('Sucesso', 'Período fechado com sucesso!');
            } catch (error) {
              console.error('Error closing period:', error);
              Alert.alert('Erro', 'Não foi possível fechar o período');
            }
          },
        },
      ]
    );
  };

  const handleReopenPeriod = (period: ClosingPeriod) => {
    Alert.alert(
      'Reabrir Período',
      `Deseja reabrir o período de ${months[period.month]} ${period.year}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reabrir',
          onPress: async () => {
            try {
              await api.reopenPeriod(period.id);
              loadPeriods();
              Alert.alert('Sucesso', 'Período reaberto!');
            } catch (error) {
              console.error('Error reopening period:', error);
              Alert.alert('Erro', 'Não foi possível reabrir o período');
            }
          },
        },
      ]
    );
  };

  const handleExportReport = (period: ClosingPeriod) => {
    Alert.alert('Exportar Relatório', 'Escolha o formato de exportação:', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'PDF', onPress: () => exportReport(period, 'pdf') },
      { text: 'Excel', onPress: () => exportReport(period, 'excel') },
    ]);
  };

  const exportReport = async (period: ClosingPeriod, format: string) => {
    try {
      Alert.alert('Exportando...', `Gerando relatório em ${format.toUpperCase()}...`);
      // TODO: Implement actual export
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar o relatório');
    }
  };

  const openPeriodDetail = (period: ClosingPeriod) => {
    setSelectedPeriod(period);
    setIsDetailModalVisible(true);
  };

  const yearTotals = periods.reduce(
    (acc, p) => ({
      revenue: acc.revenue + p.total_revenue,
      expense: acc.expense + p.total_expense,
      balance: acc.balance + p.balance,
    }),
    { revenue: 0, expense: 0, balance: 0 }
  );

  const closedCount = periods.filter((p) => p.status === 'closed').length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Fechamento</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
              <Text style={styles.navButton}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
              <Text style={styles.navButton}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Year Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo Anual</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <TrendingUp size={20} color={Colors.success} />
                <Text style={styles.summaryLabel}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  {formatCurrency(yearTotals.revenue)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <TrendingDown size={20} color={Colors.error} />
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>
                  {formatCurrency(yearTotals.expense)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <DollarSign
                  size={20}
                  color={yearTotals.balance >= 0 ? Colors.primary : Colors.warning}
                />
                <Text style={styles.summaryLabel}>Saldo</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: yearTotals.balance >= 0 ? Colors.primary : Colors.warning },
                  ]}
                >
                  {formatCurrency(yearTotals.balance)}
                </Text>
              </View>
            </View>
            <View style={styles.closedProgress}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Períodos fechados</Text>
                <Text style={styles.progressValue}>{closedCount}/12</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(closedCount / 12) * 100}%` }]} />
              </View>
            </View>
          </View>

          {/* Periods List */}
          <Text style={styles.sectionTitle}>Períodos Mensais</Text>

          {periods.map((period) => {
            const statusConfig = getStatusConfig(period.status);
            const StatusIcon = statusConfig.icon;

            return (
              <TouchableOpacity
                key={period.id}
                style={styles.periodCard}
                onPress={() => openPeriodDetail(period)}
                activeOpacity={0.7}
              >
                <View style={styles.periodHeader}>
                  <View style={styles.periodInfo}>
                    <Text style={styles.periodMonth}>{months[period.month]}</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
                    >
                      <StatusIcon size={14} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.periodBalance,
                      { color: period.balance >= 0 ? Colors.success : Colors.error },
                    ]}
                  >
                    {formatCurrency(period.balance)}
                  </Text>
                </View>
                <View style={styles.periodDetails}>
                  <View style={styles.periodDetailItem}>
                    <Text style={styles.periodDetailLabel}>Receitas</Text>
                    <Text style={[styles.periodDetailValue, { color: Colors.success }]}>
                      +{formatCurrency(period.total_revenue)}
                    </Text>
                  </View>
                  <View style={styles.periodDetailItem}>
                    <Text style={styles.periodDetailLabel}>Despesas</Text>
                    <Text style={[styles.periodDetailValue, { color: Colors.error }]}>
                      -{formatCurrency(period.total_expense)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Period Detail Modal */}
        <Modal visible={isDetailModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedPeriod && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {months[selectedPeriod.month]} {selectedPeriod.year}
                    </Text>
                    <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.detailSummary}>
                      <View style={styles.detailItem}>
                        <TrendingUp size={24} color={Colors.success} />
                        <Text style={styles.detailLabel}>Receitas</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>
                          {formatCurrency(selectedPeriod.total_revenue)}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <TrendingDown size={24} color={Colors.error} />
                        <Text style={styles.detailLabel}>Despesas</Text>
                        <Text style={[styles.detailValue, { color: Colors.error }]}>
                          {formatCurrency(selectedPeriod.total_expense)}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <DollarSign
                          size={24}
                          color={selectedPeriod.balance >= 0 ? Colors.primary : Colors.warning}
                        />
                        <Text style={styles.detailLabel}>Saldo</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            {
                              color: selectedPeriod.balance >= 0 ? Colors.primary : Colors.warning,
                            },
                          ]}
                        >
                          {formatCurrency(selectedPeriod.balance)}
                        </Text>
                      </View>
                    </View>

                    {selectedPeriod.status === 'closed' && selectedPeriod.closed_at && (
                      <View style={styles.closedInfo}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={styles.closedInfoText}>
                          Fechado em{' '}
                          {new Date(selectedPeriod.closed_at).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors.primary + '15' }]}
                      onPress={() => handleExportReport(selectedPeriod)}
                    >
                      <Download size={20} color={Colors.primary} />
                      <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                        Exportar
                      </Text>
                    </TouchableOpacity>

                    {selectedPeriod.status !== 'closed' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.success }]}
                        onPress={() => {
                          setIsDetailModalVisible(false);
                          handleClosePeriod(selectedPeriod);
                        }}
                      >
                        <Lock size={20} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                          Fechar Período
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.warning }]}
                        onPress={() => {
                          setIsDetailModalVisible(false);
                          handleReopenPeriod(selectedPeriod);
                        }}
                      >
                        <Unlock size={20} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Reabrir</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  navButton: {
    fontSize: 18,
    color: Colors.primary,
    paddingHorizontal: 20,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  closedProgress: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  periodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  periodMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  periodBalance: {
    fontSize: 17,
    fontWeight: '700',
  },
  periodDetails: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  periodDetailItem: {
    flex: 1,
  },
  periodDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  periodDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  modalBody: {
    padding: 20,
  },
  detailSummary: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  closedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.success + '15',
    borderRadius: 8,
    gap: 8,
  },
  closedInfoText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
