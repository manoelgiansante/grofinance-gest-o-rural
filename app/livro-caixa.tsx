import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Plus,
  Download,
  Upload,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Share2,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Send,
  Eye,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type EntryType = 'receita' | 'despesa';
type EntryStatus = 'draft' | 'validated' | 'sent_accountant' | 'processed';

interface LivroCaixaEntry {
  id: string;
  date: Date;
  document: string;
  description: string;
  type: EntryType;
  category: string;
  value: number;
  operation: string;
  status: EntryStatus;
  invoiceNumber?: string;
  nfeKey?: string;
  observation?: string;
  validatedAt?: Date;
  sentAt?: Date;
}

const mockEntries: LivroCaixaEntry[] = [];

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: Colors.textTertiary, icon: FileText },
  validated: { label: 'Validado', color: Colors.success, icon: CheckCircle2 },
  sent_accountant: { label: 'Enviado Contador', color: Colors.info, icon: Send },
  processed: { label: 'Processado', color: Colors.primary, icon: CheckCircle2 },
};

const CATEGORIES = [
  'Venda Produção',
  'Insumos',
  'Mão de Obra',
  'Utilidades',
  'Manutenção',
  'Combustível',
  'Serviços',
  'Outros',
];

const OPERATIONS = ['Confinamento', 'Cana', 'Soja', 'Milho', 'Sede', 'Compostagem', 'Geral'];

export default function LivroCaixaScreen() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entries, setEntries] = useState<LivroCaixaEntry[]>(mockEntries);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showOperationPicker, setShowOperationPicker] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receita' as EntryType,
    document: '',
    description: '',
    category: '',
    operation: '',
    value: '',
    observation: '',
  });

  const isWeb = Platform.OS === 'web';

  const filteredEntries = entries.filter((entry) => {
    if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (
      search &&
      !entry.description.toLowerCase().includes(search.toLowerCase()) &&
      !entry.document.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalReceitas = filteredEntries
    .filter((e) => e.type === 'receita')
    .reduce((sum, e) => sum + e.value, 0);

  const totalDespesas = filteredEntries
    .filter((e) => e.type === 'despesa')
    .reduce((sum, e) => sum + e.value, 0);

  const saldoPeriodo = totalReceitas - totalDespesas;

  const pendingCount = filteredEntries.filter((e) => e.status === 'draft').length;
  const validatedCount = filteredEntries.filter((e) => e.status === 'validated').length;

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const sendToAccountant = () => {
    // Simular envio para contador
    alert(`${selectedEntries.length} lançamentos enviados para o contador!`);
    setSelectedEntries([]);
  };

  const resetForm = () => {
    setFormData({
      type: 'receita',
      document: '',
      description: '',
      category: '',
      operation: '',
      value: '',
      observation: '',
    });
    setShowCategoryPicker(false);
    setShowOperationPicker(false);
  };

  const handleSaveEntry = () => {
    if (!formData.description.trim()) {
      alert('Informe a descrição do lançamento');
      return;
    }
    if (!formData.category) {
      alert('Selecione uma categoria');
      return;
    }
    if (!formData.value) {
      alert('Informe o valor');
      return;
    }

    const newEntry: LivroCaixaEntry = {
      id: Date.now().toString(),
      date: new Date(),
      document: formData.document || 'Manual',
      description: formData.description.trim(),
      type: formData.type,
      category: formData.category,
      value: parseFloat(formData.value.replace(',', '.')) || 0,
      operation: formData.operation || 'Geral',
      status: 'draft',
      observation: formData.observation,
    };

    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    resetForm();
    alert('Lançamento adicionado com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: 'Livro Caixa',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Livro Caixa</Text>
              <Text style={styles.subtitle}>Produtor Rural - Fiscal</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => setShowExportModal(true)}
                activeOpacity={0.7}
              >
                <Download size={18} color={Colors.primary} />
                <Text style={styles.exportButtonText}>Exportar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}
              >
                <Plus size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Resumo Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <BookOpen size={24} color={Colors.white} />
              </View>
              <View style={styles.summaryPeriod}>
                <Text style={styles.summaryPeriodLabel}>Período</Text>
                <Text style={styles.summaryPeriodValue}>
                  {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
              </View>
              <TouchableOpacity style={styles.periodSelector} activeOpacity={0.7}>
                <Calendar size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryItemHeader}>
                  <TrendingUp size={16} color={Colors.success} />
                  <Text style={styles.summaryItemLabel}>Receitas</Text>
                </View>
                <Text style={[styles.summaryItemValue, { color: Colors.success }]}>
                  + R$ {totalReceitas.toLocaleString('pt-BR')}
                </Text>
              </View>
              <View style={styles.summaryItemDivider} />
              <View style={styles.summaryItem}>
                <View style={styles.summaryItemHeader}>
                  <TrendingDown size={16} color={Colors.error} />
                  <Text style={styles.summaryItemLabel}>Despesas</Text>
                </View>
                <Text style={[styles.summaryItemValue, { color: Colors.error }]}>
                  - R$ {totalDespesas.toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.saldoRow}>
              <Text style={styles.saldoLabel}>Saldo do Período</Text>
              <Text
                style={[
                  styles.saldoValue,
                  { color: saldoPeriodo >= 0 ? Colors.success : Colors.error },
                ]}
              >
                R$ {saldoPeriodo.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>

          {/* Status Cards */}
          <View style={styles.statusRow}>
            <View style={[styles.statusCard, { borderLeftColor: Colors.warning }]}>
              <Clock size={20} color={Colors.warning} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Pendentes</Text>
                <Text style={styles.statusValue}>{pendingCount}</Text>
              </View>
            </View>
            <View style={[styles.statusCard, { borderLeftColor: Colors.success }]}>
              <CheckCircle2 size={20} color={Colors.success} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Validados</Text>
                <Text style={styles.statusValue}>{validatedCount}</Text>
              </View>
            </View>
          </View>

          {/* Actions Row */}
          {selectedEntries.length > 0 && (
            <View style={styles.bulkActionsRow}>
              <Text style={styles.bulkActionsText}>{selectedEntries.length} selecionado(s)</Text>
              <View style={styles.bulkActions}>
                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={sendToAccountant}
                  activeOpacity={0.7}
                >
                  <Send size={16} color={Colors.white} />
                  <Text style={styles.bulkActionText}>Enviar para Contador</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Filters */}
          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[styles.filterChip, typeFilter === 'all' && styles.filterChipActive]}
                onPress={() => setTypeFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, typeFilter === 'all' && styles.filterTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, typeFilter === 'receita' && styles.filterChipActive]}
                onPress={() => setTypeFilter('receita')}
                activeOpacity={0.7}
              >
                <TrendingUp
                  size={14}
                  color={typeFilter === 'receita' ? Colors.white : Colors.success}
                />
                <Text
                  style={[styles.filterText, typeFilter === 'receita' && styles.filterTextActive]}
                >
                  Receitas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, typeFilter === 'despesa' && styles.filterChipActive]}
                onPress={() => setTypeFilter('despesa')}
                activeOpacity={0.7}
              >
                <TrendingDown
                  size={14}
                  color={typeFilter === 'despesa' ? Colors.white : Colors.error}
                />
                <Text
                  style={[styles.filterText, typeFilter === 'despesa' && styles.filterTextActive]}
                >
                  Despesas
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por descrição ou documento..."
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Entries List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionTitle}>Lançamentos</Text>

            {filteredEntries.length === 0 && (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
              </View>
            )}

            {filteredEntries.map((entry) => {
              const statusConfig = STATUS_CONFIG[entry.status];
              const StatusIcon = statusConfig.icon;
              const isReceita = entry.type === 'receita';
              const isSelected = selectedEntries.includes(entry.id);

              return (
                <TouchableOpacity
                  key={entry.id}
                  style={[styles.entryCard, isSelected && styles.entryCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => toggleEntrySelection(entry.id)}
                  onLongPress={() => toggleEntrySelection(entry.id)}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDateBadge}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.entryDate}>{format(entry.date, 'dd/MM/yyyy')}</Text>
                    </View>
                    <View
                      style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}
                    >
                      <StatusIcon size={12} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.entryContent}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryDocument}>{entry.document}</Text>
                      <Text style={styles.entryDescription} numberOfLines={2}>
                        {entry.description}
                      </Text>
                      <View style={styles.entryMeta}>
                        <View
                          style={[styles.categoryBadge, { backgroundColor: Colors.primary + '15' }]}
                        >
                          <Text style={[styles.categoryText, { color: Colors.primary }]}>
                            {entry.category}
                          </Text>
                        </View>
                        <Text style={styles.entryOperation}>{entry.operation}</Text>
                      </View>
                    </View>
                    <View style={styles.entryValueContainer}>
                      <View
                        style={[
                          styles.typeIcon,
                          {
                            backgroundColor: isReceita
                              ? Colors.success + '18'
                              : Colors.error + '18',
                          },
                        ]}
                      >
                        {isReceita ? (
                          <TrendingUp size={18} color={Colors.success} />
                        ) : (
                          <TrendingDown size={18} color={Colors.error} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.entryValue,
                          { color: isReceita ? Colors.success : Colors.error },
                        ]}
                      >
                        {isReceita ? '+' : '-'} R$ {entry.value.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  </View>

                  {entry.nfeKey && (
                    <View style={styles.nfeKeyContainer}>
                      <Text style={styles.nfeKeyLabel}>Chave NF-e:</Text>
                      <Text style={styles.nfeKeyValue} numberOfLines={1}>
                        {entry.nfeKey}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exportar Livro Caixa</Text>
            <Text style={styles.modalDescription}>
              Escolha o formato de exportação para enviar ao seu contador
            </Text>

            <TouchableOpacity style={styles.exportOption} activeOpacity={0.7}>
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.success + '15' }]}>
                <FileText size={24} color={Colors.success} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Excel (XLSX)</Text>
                <Text style={styles.exportOptionDescription}>
                  Planilha formatada para contabilidade
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} activeOpacity={0.7}>
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.error + '15' }]}>
                <FileText size={24} color={Colors.error} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>PDF</Text>
                <Text style={styles.exportOptionDescription}>
                  Relatório completo para impressão
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} activeOpacity={0.7}>
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.info + '15' }]}>
                <FileText size={24} color={Colors.info} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>SPED (TXT)</Text>
                <Text style={styles.exportOptionDescription}>
                  Formato oficial para Receita Federal
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} activeOpacity={0.7}>
              <View style={[styles.exportOptionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Share2 size={24} color={Colors.primary} />
              </View>
              <View style={styles.exportOptionInfo}>
                <Text style={styles.exportOptionTitle}>Enviar para Contador</Text>
                <Text style={styles.exportOptionDescription}>
                  Integração direta com sistema contábil
                </Text>
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

      {/* Modal Adicionar Lançamento */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.addModalContent, isWeb && styles.addModalContentWeb]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Novo Lançamento</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.addModalCloseBtn}
              >
                <Text style={styles.addModalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addModalBody} showsVerticalScrollIndicator={false}>
              {/* Tipo */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tipo *</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'receita' && styles.typeOptionReceita,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'receita' })}
                  >
                    <TrendingUp
                      size={18}
                      color={formData.type === 'receita' ? Colors.white : Colors.success}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'receita' && styles.typeOptionTextActive,
                      ]}
                    >
                      Receita
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'despesa' && styles.typeOptionDespesa,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'despesa' })}
                  >
                    <TrendingDown
                      size={18}
                      color={formData.type === 'despesa' ? Colors.white : Colors.error}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'despesa' && styles.typeOptionTextActive,
                      ]}
                    >
                      Despesa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Documento */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Documento</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: NF-e 1234, Recibo 001"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.document}
                  onChangeText={(text) => setFormData({ ...formData, document: text })}
                />
              </View>

              {/* Descrição */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descrição *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Descreva o lançamento"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              {/* Categoria */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoria *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !formData.category && { color: Colors.textTertiary },
                    ]}
                  >
                    {formData.category || 'Selecione uma categoria'}
                  </Text>
                  <Filter size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={styles.pickerOptions}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.pickerOption,
                          formData.category === cat && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.category === cat && styles.pickerOptionTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Operação */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Operação/Centro de Custo</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowOperationPicker(!showOperationPicker)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !formData.operation && { color: Colors.textTertiary },
                    ]}
                  >
                    {formData.operation || 'Selecione uma operação'}
                  </Text>
                  <Filter size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showOperationPicker && (
                  <View style={styles.pickerOptions}>
                    {OPERATIONS.map((op) => (
                      <TouchableOpacity
                        key={op}
                        style={[
                          styles.pickerOption,
                          formData.operation === op && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, operation: op });
                          setShowOperationPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.operation === op && styles.pickerOptionTextActive,
                          ]}
                        >
                          {op}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Valor */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Valor (R$) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.value}
                  onChangeText={(text) => setFormData({ ...formData, value: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Observação */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Observação</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Observações adicionais..."
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.observation}
                  onChangeText={(text) => setFormData({ ...formData, observation: text })}
                  multiline
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.addModalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEntry}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryPeriod: {
    flex: 1,
  },
  summaryPeriodLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  summaryPeriodValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'capitalize' as const,
  },
  periodSelector: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  saldoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  saldoValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  bulkActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  entryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryInfo: {
    flex: 1,
    marginRight: 12,
  },
  entryDocument: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  entryOperation: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  entryValueContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  nfeKeyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nfeKeyLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
    marginRight: 6,
  },
  nfeKeyValue: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace' as const,
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
    padding: 24,
    paddingBottom: 40,
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
  exportOptionDescription: {
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
  // Add Modal Styles
  addModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  addModalContentWeb: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 24,
    marginBottom: 20,
    maxHeight: '85%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  addModalCloseBtn: {
    padding: 4,
  },
  addModalCloseBtnText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  addModalBody: {
    padding: 20,
  },
  addModalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerOptions: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary + '18',
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionReceita: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeOptionDespesa: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeOptionTextActive: {
    color: Colors.white,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
