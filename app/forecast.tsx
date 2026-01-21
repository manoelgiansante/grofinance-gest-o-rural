import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  BarChart3,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

type ForecastItem = {
  id: string;
  type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  month: number;
  year: number;
  probability: number;
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

export default function ForecastScreen() {
  const isWeb = Platform.OS === 'web';
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingForecast, setEditingForecast] = useState<ForecastItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formType, setFormType] = useState<'revenue' | 'expense'>('revenue');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMonth, setFormMonth] = useState(new Date().getMonth());
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formProbability, setFormProbability] = useState('80');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getForecasts();
      setForecasts(data || []);
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const yearForecasts = forecasts.filter((f) => f.year === selectedYear);

  const monthlyData = months.map((month, index) => {
    const monthForecasts = yearForecasts.filter((f) => f.month === index);
    const revenues = monthForecasts
      .filter((f) => f.type === 'revenue')
      .reduce((sum, f) => sum + f.amount, 0);
    const expenses = monthForecasts
      .filter((f) => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);
    return { month, index, revenues, expenses, balance: revenues - expenses };
  });

  const totalRevenues = yearForecasts
    .filter((f) => f.type === 'revenue')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = yearForecasts
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalBalance = totalRevenues - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const openAddModal = () => {
    setEditingForecast(null);
    setFormType('revenue');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormMonth(selectedMonth ?? new Date().getMonth());
    setFormYear(selectedYear);
    setFormProbability('80');
    setFormNotes('');
    setIsModalVisible(true);
  };

  const openEditModal = (forecast: ForecastItem) => {
    setEditingForecast(forecast);
    setFormType(forecast.type);
    setFormCategory(forecast.category);
    setFormDescription(forecast.description);
    setFormAmount(forecast.amount.toString());
    setFormMonth(forecast.month);
    setFormYear(forecast.year);
    setFormProbability(forecast.probability.toString());
    setFormNotes(forecast.notes || '');
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formDescription || !formAmount) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const forecastData = {
      type: formType,
      category: formCategory,
      description: formDescription,
      amount: parseFloat(formAmount),
      month: formMonth,
      year: formYear,
      probability: parseFloat(formProbability),
      notes: formNotes,
    };

    try {
      if (editingForecast) {
        await api.updateForecast(editingForecast.id, forecastData);
      } else {
        await api.createForecast(forecastData);
      }
      setIsModalVisible(false);
      loadForecasts();
    } catch (error) {
      console.error('Error saving forecast:', error);
      Alert.alert('Erro', 'Não foi possível salvar a previsão');
    }
  };

  const handleDelete = (forecast: ForecastItem) => {
    Alert.alert('Confirmar Exclusão', `Deseja realmente excluir "${forecast.description}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteForecast(forecast.id);
            loadForecasts();
          } catch (error) {
            console.error('Error deleting forecast:', error);
            Alert.alert('Erro', 'Não foi possível excluir a previsão');
          }
        },
      },
    ]);
  };

  const filteredForecasts =
    selectedMonth !== null ? yearForecasts.filter((f) => f.month === selectedMonth) : yearForecasts;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Previsão Financeira</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear - 1)}
            >
              <Text style={styles.yearButtonText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Text style={styles.yearButtonText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Annual Summary */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: Colors.success + '15' }]}>
              <TrendingUp size={20} color={Colors.success} />
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Receitas</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {formatCurrency(totalRevenues)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.error + '15' }]}>
              <TrendingDown size={20} color={Colors.error} />
              <Text style={[styles.summaryLabel, { color: Colors.error }]}>Despesas</Text>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor:
                    totalBalance >= 0 ? Colors.primary + '15' : Colors.warning + '15',
                },
              ]}
            >
              <BarChart3 size={20} color={totalBalance >= 0 ? Colors.primary : Colors.warning} />
              <Text
                style={[
                  styles.summaryLabel,
                  { color: totalBalance >= 0 ? Colors.primary : Colors.warning },
                ]}
              >
                Saldo
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: totalBalance >= 0 ? Colors.primary : Colors.warning },
                ]}
              >
                {formatCurrency(totalBalance)}
              </Text>
            </View>
          </View>

          {/* Month Cards */}
          <Text style={styles.sectionTitle}>Visão Mensal</Text>
          <View style={styles.monthGrid}>
            {monthlyData.map((data) => (
              <TouchableOpacity
                key={data.index}
                style={[styles.monthCard, selectedMonth === data.index && styles.monthCardActive]}
                onPress={() => setSelectedMonth(selectedMonth === data.index ? null : data.index)}
              >
                <Text
                  style={[styles.monthName, selectedMonth === data.index && styles.monthNameActive]}
                >
                  {data.month.slice(0, 3)}
                </Text>
                <View style={styles.monthValues}>
                  <Text style={[styles.monthRevenue, { fontSize: 11 }]}>
                    +{formatCurrency(data.revenues)}
                  </Text>
                  <Text style={[styles.monthExpense, { fontSize: 11 }]}>
                    -{formatCurrency(data.expenses)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.monthBalance,
                    { color: data.balance >= 0 ? Colors.success : Colors.error },
                  ]}
                >
                  {formatCurrency(data.balance)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Forecast List */}
          <View style={styles.forecastsHeader}>
            <Text style={styles.sectionTitle}>
              {selectedMonth !== null
                ? `Previsões - ${months[selectedMonth]}`
                : 'Todas as Previsões'}
            </Text>
            {selectedMonth !== null && (
              <TouchableOpacity onPress={() => setSelectedMonth(null)}>
                <Text style={styles.clearFilter}>Limpar filtro</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredForecasts.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Nenhuma previsão encontrada</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={openAddModal}>
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Adicionar Previsão</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredForecasts.map((forecast) => (
              <View
                key={forecast.id}
                style={[
                  styles.forecastCard,
                  { borderLeftColor: forecast.type === 'revenue' ? Colors.success : Colors.error },
                ]}
              >
                <View style={styles.forecastMain}>
                  <View style={styles.forecastInfo}>
                    <Text style={styles.forecastDescription}>{forecast.description}</Text>
                    <Text style={styles.forecastMeta}>
                      {months[forecast.month]} {forecast.year} • {forecast.probability}%
                      probabilidade
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.forecastAmount,
                      { color: forecast.type === 'revenue' ? Colors.success : Colors.error },
                    ]}
                  >
                    {forecast.type === 'revenue' ? '+' : '-'}
                    {formatCurrency(forecast.amount)}
                  </Text>
                </View>
                <View style={styles.forecastActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(forecast)}
                    style={styles.actionButton}
                  >
                    <Edit2 size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(forecast)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingForecast ? 'Editar Previsão' : 'Nova Previsão'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tipo</Text>
                  <View style={styles.typeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        formType === 'revenue' && styles.typeOptionRevenue,
                      ]}
                      onPress={() => setFormType('revenue')}
                    >
                      <TrendingUp
                        size={20}
                        color={formType === 'revenue' ? '#fff' : Colors.success}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          formType === 'revenue' && styles.typeOptionTextActive,
                        ]}
                      >
                        Receita
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        formType === 'expense' && styles.typeOptionExpense,
                      ]}
                      onPress={() => setFormType('expense')}
                    >
                      <TrendingDown
                        size={20}
                        color={formType === 'expense' ? '#fff' : Colors.error}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          formType === 'expense' && styles.typeOptionTextActive,
                        ]}
                      >
                        Despesa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descrição *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Venda de soja"
                    placeholderTextColor={Colors.textSecondary}
                    value={formDescription}
                    onChangeText={setFormDescription}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Categoria</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Grãos, Insumos..."
                    placeholderTextColor={Colors.textSecondary}
                    value={formCategory}
                    onChangeText={setFormCategory}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Valor *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0.00"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formAmount}
                      onChangeText={setFormAmount}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Probabilidade (%)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="80"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formProbability}
                      onChangeText={setFormProbability}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Mês</Text>
                    <View style={styles.selectContainer}>
                      <Text style={styles.selectText}>{months[formMonth]}</Text>
                    </View>
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Ano</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="2024"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formYear.toString()}
                      onChangeText={(text) => setFormYear(parseInt(text) || selectedYear)}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Observações</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Informações adicionais..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formNotes}
                    onChangeText={setFormNotes}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalButtonSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  yearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonText: {
    fontSize: 18,
    color: Colors.primary,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  monthCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  monthName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  monthNameActive: {
    color: Colors.primary,
  },
  monthValues: {
    marginBottom: 4,
  },
  monthRevenue: {
    color: Colors.success,
    fontWeight: '500',
  },
  monthExpense: {
    color: Colors.error,
    fontWeight: '500',
  },
  monthBalance: {
    fontSize: 12,
    fontWeight: '700',
  },
  forecastsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFilter: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  forecastCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  forecastMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  forecastInfo: {
    flex: 1,
  },
  forecastDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  forecastMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  forecastAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  forecastActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
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
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  typeOptionRevenue: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeOptionExpense: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  selectContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.background,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
