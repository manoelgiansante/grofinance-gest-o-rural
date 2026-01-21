import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, FileText, AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { suppliers } from '@/mocks/data';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { expenses, operations, updateExpense, user } = useApp();
  const expense = expenses.find((e) => e.id === id);

  const [divergenceReason, setDivergenceReason] = useState('');
  const [showDivergenceForm, setShowDivergenceForm] = useState(false);

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Despesa não encontrada</Text>
      </SafeAreaView>
    );
  }

  const supplier = suppliers.find((s) => s.id === expense.supplierId);
  const operation = operations.find((o) => o.id === expense.operationId);

  const handleApprove = () => {
    Alert.alert('Aprovar Despesa', 'Confirma a aprovação desta despesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprovar',
        onPress: () => {
          updateExpense(expense.id, {
            status: 'approved',
            approvedBy: user.id,
            approvedAt: new Date(),
          });
          Alert.alert('Sucesso', 'Despesa aprovada!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  const handleMarkAsPaid = () => {
    Alert.alert('Marcar como Pago', 'Confirma o pagamento desta despesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          updateExpense(expense.id, {
            status: 'paid',
            paidBy: user.id,
            paidAt: new Date(),
          });
          Alert.alert('Sucesso', 'Pagamento registrado!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  const handleMarkDivergence = () => {
    if (!divergenceReason) {
      Alert.alert('Erro', 'Informe o motivo da divergência');
      return;
    }

    updateExpense(expense.id, {
      status: 'disputed',
      divergence: {
        id: `div-${Date.now()}`,
        reason: divergenceReason,
        expectedValue: expense.negotiatedValue,
        chargedValue: expense.invoiceValue || expense.negotiatedValue,
        responsible: user.id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    Alert.alert('Sucesso', 'Divergência registrada!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalhes da Despesa</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          {expense.status === 'disputed' && (
            <View style={[styles.statusBadge, { backgroundColor: Colors.error + '15' }]}>
              <AlertTriangle size={20} color={Colors.error} />
              <Text style={[styles.statusText, { color: Colors.error }]}>Divergente</Text>
            </View>
          )}
          {expense.status === 'paid' && (
            <View style={[styles.statusBadge, { backgroundColor: Colors.success + '15' }]}>
              <CheckCircle2 size={20} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>Pago</Text>
            </View>
          )}
          {expense.status === 'pending_approval' && (
            <View style={[styles.statusBadge, { backgroundColor: Colors.info + '15' }]}>
              <Clock size={20} color={Colors.info} />
              <Text style={[styles.statusText, { color: Colors.info }]}>Aguardando Aprovação</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.infoValue}>{expense.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fornecedor</Text>
            <Text style={styles.infoValue}>{supplier?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Operação</Text>
            {operation && (
              <View style={[styles.operationBadge, { backgroundColor: operation.color + '20' }]}>
                <Text style={[styles.operationText, { color: operation.color }]}>
                  {operation.name}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoria</Text>
            <Text style={styles.infoValue}>{expense.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Valor Negociado</Text>
              <Text style={styles.valueAmount}>
                R$ {expense.negotiatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            {expense.invoiceValue && (
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>Valor Cobrado</Text>
                <Text
                  style={[
                    styles.valueAmount,
                    expense.invoiceValue !== expense.negotiatedValue && { color: Colors.error },
                  ]}
                >
                  R$ {expense.invoiceValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
          </View>
          {expense.invoiceValue && expense.invoiceValue !== expense.negotiatedValue && (
            <View style={styles.divergenceWarning}>
              <AlertTriangle size={16} color={Colors.warning} />
              <Text style={styles.divergenceWarningText}>
                Diferença de R${' '}
                {Math.abs(expense.invoiceValue - expense.negotiatedValue).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datas</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vencimento</Text>
            <Text style={styles.infoValue}>
              {format(expense.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Criado em</Text>
            <Text style={styles.infoValue}>
              {format(expense.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
        </View>

        {expense.divergence && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Divergência</Text>
            <View style={styles.divergenceCard}>
              <Text style={styles.divergenceReason}>{expense.divergence.reason}</Text>
              {expense.divergence.evidence && (
                <Text style={styles.divergenceEvidence}>{expense.divergence.evidence}</Text>
              )}
            </View>
          </View>
        )}

        {expense.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anexos</Text>
            {expense.attachments.map((att) => (
              <View key={att.id} style={styles.attachmentItem}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.attachmentName}>{att.name}</Text>
              </View>
            ))}
          </View>
        )}

        {!showDivergenceForm && expense.status === 'pending_approval' && (
          <TouchableOpacity
            style={styles.divergenceButton}
            onPress={() => setShowDivergenceForm(true)}
          >
            <AlertTriangle size={20} color={Colors.error} />
            <Text style={styles.divergenceButtonText}>Marcar Divergência</Text>
          </TouchableOpacity>
        )}

        {showDivergenceForm && (
          <View style={styles.divergenceForm}>
            <Text style={styles.divergenceFormTitle}>Registrar Divergência</Text>
            <TextInput
              style={styles.divergenceInput}
              placeholder="Descreva o motivo da divergência..."
              placeholderTextColor={Colors.textSecondary}
              value={divergenceReason}
              onChangeText={setDivergenceReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.divergenceFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDivergenceForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleMarkDivergence}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {expense.status === 'pending_approval' && !showDivergenceForm && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
            <CheckCircle2 size={20} color={Colors.white} />
            <Text style={styles.approveButtonText}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {expense.status === 'approved' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payButton} onPress={handleMarkAsPaid}>
            <DollarSign size={20} color={Colors.white} />
            <Text style={styles.payButtonText}>Marcar como Pago</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    padding: 24,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  operationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  operationText: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 12,
  },
  valueItem: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 8,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  valueAmount: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  divergenceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.warning + '18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  divergenceWarningText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  divergenceCard: {
    backgroundColor: Colors.error + '15',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  divergenceReason: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '700' as const,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  divergenceEvidence: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentName: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  divergenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  divergenceButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.error,
    letterSpacing: 0.3,
  },
  divergenceForm: {
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  divergenceFormTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  divergenceInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: 0.2,
  },
  divergenceFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: Colors.error,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  footer: {
    padding: 24,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.success,
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  approveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
