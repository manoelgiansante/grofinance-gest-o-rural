import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Upload,
  Download,
  FileText,
  CreditCard,
  Plus,
  FileSpreadsheet,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashFlowItem {
  date: Date;
  description: string;
  type: 'in' | 'out';
  value: number;
  status: 'projected' | 'realized';
  category: string;
  operation: string;
}

const mockCashFlow: CashFlowItem[] = [];

export default function CashFlowScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newMovement, setNewMovement] = useState({
    description: '',
    type: 'in' as 'in' | 'out',
    value: '',
    category: '',
  });
  const currentBalance = 0;
  const projectedInflows = mockCashFlow
    .filter((i) => i.type === 'in' && i.status === 'projected')
    .reduce((sum, i) => sum + i.value, 0);
  const projectedOutflows = mockCashFlow
    .filter((i) => i.type === 'out' && i.status === 'projected')
    .reduce((sum, i) => sum + i.value, 0);
  const projectedBalance = currentBalance + projectedInflows - projectedOutflows;

  const handleImportData = (type: string) => {
    setShowImportModal(false);
    // Simular importação
    alert(`Importação de ${type} iniciada!`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Fluxo de Caixa',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowImportModal(true)}
            activeOpacity={0.7}
          >
            <Upload size={18} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Importar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/bank-reconciliation')}
            activeOpacity={0.7}
          >
            <CreditCard size={18} color={Colors.info} />
            <Text style={styles.actionButtonText}>Conciliar OFX</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => setShowNewModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={[styles.actionButtonText, { color: Colors.white }]}>Novo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceValue}>R$ {currentBalance.toLocaleString('pt-BR')}</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.projectionRow}>
            <View style={styles.projectionItem}>
              <View style={styles.projectionHeader}>
                <TrendingUp size={16} color={Colors.success} />
                <Text style={styles.projectionLabel}>Entradas Previstas</Text>
              </View>
              <Text style={[styles.projectionValue, { color: Colors.success }]}>
                + R$ {projectedInflows.toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.projectionDivider} />
            <View style={styles.projectionItem}>
              <View style={styles.projectionHeader}>
                <TrendingDown size={16} color={Colors.error} />
                <Text style={styles.projectionLabel}>Saídas Previstas</Text>
              </View>
              <Text style={[styles.projectionValue, { color: Colors.error }]}>
                - R$ {projectedOutflows.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.projectedBalanceRow}>
            <Text style={styles.projectedBalanceLabel}>Saldo Projetado</Text>
            <Text
              style={[
                styles.projectedBalanceValue,
                { color: projectedBalance > currentBalance ? Colors.success : Colors.error },
              ]}
            >
              R$ {projectedBalance.toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedPeriod === 'week' && styles.filterChipActive]}
            onPress={() => setSelectedPeriod('week')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPeriod === 'week' && styles.filterChipTextActive,
              ]}
            >
              Próximos 7 dias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedPeriod === 'month' && styles.filterChipActive]}
            onPress={() => setSelectedPeriod('month')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPeriod === 'month' && styles.filterChipTextActive,
              ]}
            >
              Este mês
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movimentações</Text>
          {mockCashFlow.map((item, index) => {
            const isInflow = item.type === 'in';
            const isRealized = item.status === 'realized';

            return (
              <TouchableOpacity key={index} style={styles.flowCard} activeOpacity={0.7}>
                <View style={styles.flowHeader}>
                  <View style={styles.flowDateBadge}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.flowDate}>
                      {format(item.date, 'dd MMM', { locale: ptBR })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isRealized ? Colors.success + '18' : Colors.warning + '18',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isRealized ? Colors.success : Colors.warning },
                      ]}
                    >
                      {isRealized ? 'Realizado' : 'Projetado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.flowContent}>
                  <View style={styles.flowInfo}>
                    <Text style={styles.flowDescription}>{item.description}</Text>
                    <View style={styles.flowMeta}>
                      <Text style={styles.flowCategory}>{item.category}</Text>
                      <Text style={styles.flowOperation}> • {item.operation}</Text>
                    </View>
                  </View>
                  <View style={styles.flowValueContainer}>
                    <View
                      style={[
                        styles.flowIcon,
                        { backgroundColor: isInflow ? Colors.success + '18' : Colors.error + '18' },
                      ]}
                    >
                      {isInflow ? (
                        <TrendingUp size={18} color={Colors.success} />
                      ) : (
                        <TrendingDown size={18} color={Colors.error} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.flowValue,
                        { color: isInflow ? Colors.success : Colors.error },
                      ]}
                    >
                      {isInflow ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Importar Dados</Text>
            <Text style={styles.modalDescription}>
              Importe contas a pagar e receber de planilhas ou outros sistemas
            </Text>

            <TouchableOpacity
              style={styles.importOption}
              onPress={() => handleImportData('Planilha Excel')}
              activeOpacity={0.7}
            >
              <View style={[styles.importOptionIcon, { backgroundColor: Colors.success + '15' }]}>
                <FileSpreadsheet size={24} color={Colors.success} />
              </View>
              <View style={styles.importOptionInfo}>
                <Text style={styles.importOptionTitle}>Planilha Excel (XLS/XLSX)</Text>
                <Text style={styles.importOptionDescription}>
                  Importe contas a pagar e receber de planilhas
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importOption}
              onPress={() => handleImportData('CSV')}
              activeOpacity={0.7}
            >
              <View style={[styles.importOptionIcon, { backgroundColor: Colors.info + '15' }]}>
                <FileText size={24} color={Colors.info} />
              </View>
              <View style={styles.importOptionInfo}>
                <Text style={styles.importOptionTitle}>Arquivo CSV</Text>
                <Text style={styles.importOptionDescription}>
                  Formato simples compatível com diversos sistemas
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importOption}
              onPress={() => router.push('/bank-reconciliation')}
              activeOpacity={0.7}
            >
              <View style={[styles.importOptionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <CreditCard size={24} color={Colors.primary} />
              </View>
              <View style={styles.importOptionInfo}>
                <Text style={styles.importOptionTitle}>Extrato Bancário (OFX)</Text>
                <Text style={styles.importOptionDescription}>
                  Importe e concilie extratos bancários automaticamente
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importOption}
              onPress={() => handleImportData('Sistema Contábil')}
              activeOpacity={0.7}
            >
              <View style={[styles.importOptionIcon, { backgroundColor: Colors.warning + '15' }]}>
                <Download size={24} color={Colors.warning} />
              </View>
              <View style={styles.importOptionInfo}>
                <Text style={styles.importOptionTitle}>Outro Sistema</Text>
                <Text style={styles.importOptionDescription}>
                  Importe de sistemas contábeis e ERPs
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowImportModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Nova Movimentação */}
      <Modal
        visible={showNewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Movimentação</Text>
            <Text style={styles.modalDescription}>
              Adicione uma entrada ou saída no fluxo de caixa
            </Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, newMovement.type === 'in' && styles.typeOptionIn]}
                onPress={() => setNewMovement({ ...newMovement, type: 'in' })}
              >
                <TrendingUp
                  size={20}
                  color={newMovement.type === 'in' ? Colors.white : Colors.success}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    newMovement.type === 'in' && { color: Colors.white },
                  ]}
                >
                  Entrada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, newMovement.type === 'out' && styles.typeOptionOut]}
                onPress={() => setNewMovement({ ...newMovement, type: 'out' })}
              >
                <TrendingDown
                  size={20}
                  color={newMovement.type === 'out' ? Colors.white : Colors.error}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    newMovement.type === 'out' && { color: Colors.white },
                  ]}
                >
                  Saída
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <View style={styles.formInput}>
                <FileText size={18} color={Colors.textTertiary} />
                <Text style={styles.formInputText}>
                  {newMovement.description || 'Ex: Venda de gado'}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Valor (R$)</Text>
              <View style={styles.formInput}>
                <Text style={styles.formInputText}>{newMovement.value || '0,00'}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoria</Text>
              <View style={styles.categoryOptions}>
                {['Vendas', 'Insumos', 'Utilidades', 'Mão de Obra', 'Outros'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      newMovement.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setNewMovement({ ...newMovement, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        newMovement.category === cat && { color: Colors.white },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                alert('Movimentação adicionada com sucesso!');
                setShowNewModal(false);
                setNewMovement({ description: '', type: 'in', value: '', category: '' });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Salvar Movimentação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNewModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 20,
    letterSpacing: -1,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: Colors.white,
    opacity: 0.25,
    marginVertical: 16,
  },
  projectionRow: {
    flexDirection: 'row',
  },
  projectionItem: {
    flex: 1,
  },
  projectionDivider: {
    width: 1,
    backgroundColor: Colors.white,
    opacity: 0.25,
    marginHorizontal: 16,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  projectionLabel: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.85,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  projectedBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectedBalanceLabel: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  projectedBalanceValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
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
  flowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  flowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  flowDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
  },
  flowDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  flowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flowInfo: {
    flex: 1,
    marginRight: 12,
  },
  flowDescription: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  flowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  flowOperation: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  flowValueContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  flowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
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
  importOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  importOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importOptionInfo: {
    flex: 1,
  },
  importOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  importOptionDescription: {
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  typeOptionIn: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeOptionOut: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formInputText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
