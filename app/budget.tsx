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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  X,
  Calendar,
  PieChart,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

type BudgetCategory = {
  id: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  month: number;
  year: number;
  type: 'revenue' | 'expense';
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

const defaultCategories = {
  revenue: ['Vendas Agrícolas', 'Vendas Pecuária', 'Serviços', 'Arrendamento', 'Outros'],
  expense: ['Insumos', 'Mão de Obra', 'Combustível', 'Manutenção', 'Energia', 'Impostos', 'Outros'],
};

export default function BudgetScreen() {
  const isWeb = Platform.OS === 'web';
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedType, setSelectedType] = useState<'revenue' | 'expense'>('expense');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formPlannedAmount, setFormPlannedAmount] = useState('');
  const [formActualAmount, setFormActualAmount] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthBudgets = budgets.filter(
    (b) => b.year === selectedYear && b.month === selectedMonth && b.type === selectedType
  );

  const totalPlanned = monthBudgets.reduce((sum, b) => sum + b.planned_amount, 0);
  const totalActual = monthBudgets.reduce((sum, b) => sum + b.actual_amount, 0);
  const variance = totalPlanned - totalActual;
  const variancePercent = totalPlanned > 0 ? (variance / totalPlanned) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setFormCategory('');
    setFormPlannedAmount('');
    setFormActualAmount('0');
    setIsModalVisible(true);
  };

  const openEditModal = (budget: BudgetCategory) => {
    setEditingBudget(budget);
    setFormCategory(budget.category);
    setFormPlannedAmount(budget.planned_amount.toString());
    setFormActualAmount(budget.actual_amount.toString());
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formCategory || !formPlannedAmount) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const budgetData = {
      category: formCategory,
      planned_amount: parseFloat(formPlannedAmount),
      actual_amount: parseFloat(formActualAmount) || 0,
      month: selectedMonth,
      year: selectedYear,
      type: selectedType,
    };

    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget.id, budgetData);
      } else {
        await api.createBudget(budgetData);
      }
      setIsModalVisible(false);
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Erro', 'Não foi possível salvar o orçamento');
    }
  };

  const handleDelete = (budget: BudgetCategory) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o orçamento de "${budget.category}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteBudget(budget.id);
              loadBudgets();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Erro', 'Não foi possível excluir o orçamento');
            }
          },
        },
      ]
    );
  };

  const getProgressColor = (planned: number, actual: number, type: string) => {
    const percent = (actual / planned) * 100;
    if (type === 'expense') {
      if (percent > 100) return Colors.error;
      if (percent > 80) return Colors.warning;
      return Colors.success;
    } else {
      if (percent >= 100) return Colors.success;
      if (percent >= 70) return Colors.warning;
      return Colors.error;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Orçamento</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
                <Text style={styles.navButton}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
                <Text style={styles.navButton}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Month Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthTabs}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.monthTab, selectedMonth === index && styles.monthTabActive]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text
                  style={[
                    styles.monthTabText,
                    selectedMonth === index && styles.monthTabTextActive,
                  ]}
                >
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === 'expense' && styles.typeButtonActiveExpense,
              ]}
              onPress={() => setSelectedType('expense')}
            >
              <TrendingDown size={18} color={selectedType === 'expense' ? '#fff' : Colors.error} />
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                Despesas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === 'revenue' && styles.typeButtonActiveRevenue,
              ]}
              onPress={() => setSelectedType('revenue')}
            >
              <TrendingUp size={18} color={selectedType === 'revenue' ? '#fff' : Colors.success} />
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === 'revenue' && styles.typeButtonTextActive,
                ]}
              >
                Receitas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Orçado</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalPlanned)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Realizado</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalActual)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Variação</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: variance >= 0 ? Colors.success : Colors.error },
                  ]}
                >
                  {variancePercent >= 0 ? '+' : ''}
                  {variancePercent.toFixed(1)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (totalActual / totalPlanned) * 100 || 0)}%`,
                      backgroundColor: getProgressColor(totalPlanned, totalActual, selectedType),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(0) : 0}% utilizado
              </Text>
            </View>
          </View>

          {/* Budget Items */}
          <Text style={styles.sectionTitle}>
            {selectedType === 'expense' ? 'Despesas por Categoria' : 'Receitas por Categoria'}
          </Text>

          {monthBudgets.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Nenhum orçamento definido</Text>
              <Text style={styles.emptyStateSubtext}>
                Defina metas de {selectedType === 'expense' ? 'despesas' : 'receitas'} para este mês
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={openAddModal}>
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Criar Orçamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            monthBudgets.map((budget) => {
              const percent = (budget.actual_amount / budget.planned_amount) * 100;
              const progressColor = getProgressColor(
                budget.planned_amount,
                budget.actual_amount,
                selectedType
              );
              const isOverBudget = selectedType === 'expense' && percent > 100;

              return (
                <View key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <View style={styles.budgetTitleRow}>
                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                        {isOverBudget && (
                          <AlertCircle size={16} color={Colors.error} style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      <Text style={styles.budgetValues}>
                        {formatCurrency(budget.actual_amount)} /{' '}
                        {formatCurrency(budget.planned_amount)}
                      </Text>
                    </View>
                    <View style={styles.budgetActions}>
                      <TouchableOpacity
                        onPress={() => openEditModal(budget)}
                        style={styles.actionButton}
                      >
                        <Edit2 size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(budget)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.budgetProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, percent)}%`, backgroundColor: progressColor },
                        ]}
                      />
                    </View>
                    <Text style={[styles.budgetPercent, { color: progressColor }]}>
                      {percent.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Quick Add Suggestions */}
          {monthBudgets.length > 0 && monthBudgets.length < 5 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Sugestões de categorias:</Text>
              <View style={styles.suggestionsList}>
                {defaultCategories[selectedType]
                  .filter((cat) => !monthBudgets.find((b) => b.category === cat))
                  .slice(0, 3)
                  .map((cat, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => {
                        setFormCategory(cat);
                        setFormPlannedAmount('');
                        setFormActualAmount('0');
                        setEditingBudget(null);
                        setIsModalVisible(true);
                      }}
                    >
                      <Plus size={14} color={Colors.primary} />
                      <Text style={styles.suggestionText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    {months[selectedMonth]} {selectedYear} •{' '}
                    {selectedType === 'expense' ? 'Despesa' : 'Receita'}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Categoria *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Insumos, Combustível..."
                    placeholderTextColor={Colors.textSecondary}
                    value={formCategory}
                    onChangeText={setFormCategory}
                  />
                  <View style={styles.categorySuggestions}>
                    {defaultCategories[selectedType].slice(0, 4).map((cat, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.catSuggestion,
                          formCategory === cat && styles.catSuggestionActive,
                        ]}
                        onPress={() => setFormCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.catSuggestionText,
                            formCategory === cat && styles.catSuggestionTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Valor Orçado *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={formPlannedAmount}
                    onChangeText={setFormPlannedAmount}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Valor Realizado</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={formActualAmount}
                    onChangeText={setFormActualAmount}
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
  periodSelector: {
    alignItems: 'center',
    marginBottom: 16,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    fontSize: 18,
    color: Colors.primary,
    paddingHorizontal: 16,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  monthTabs: {
    marginBottom: 16,
  },
  monthTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  monthTabTextActive: {
    color: '#fff',
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  typeButtonActiveExpense: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeButtonActiveRevenue: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
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
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  budgetValues: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  budgetActions: {
    flexDirection: 'row',
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
  budgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetPercent: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
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
  suggestionsSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  suggestionsTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
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
    maxHeight: '85%',
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
  modalInfo: {
    padding: 12,
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
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
  categorySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  catSuggestion: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catSuggestionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catSuggestionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  catSuggestionTextActive: {
    color: '#fff',
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
