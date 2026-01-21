import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Clock, CheckCircle2, FileText } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { suppliers } from '@/mocks/data';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { format } from 'date-fns';

export default function ValidationsScreen() {
  const { expenses, operations } = useApp();

  const pendingApproval = expenses.filter((e) => e.status === 'pending_approval');
  const pendingValidation = expenses.filter((e) => e.status === 'pending_validation');
  const disputed = expenses.filter((e) => e.status === 'disputed');
  const approved = expenses.filter((e) => e.status === 'approved');

  const renderExpenseItem = (expense: (typeof expenses)[0]) => {
    const supplier = suppliers.find((s) => s.id === expense.supplierId);
    const operation = operations.find((o) => o.id === expense.operationId);

    return (
      <TouchableOpacity
        key={expense.id}
        style={styles.expenseCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/expense-details?id=${expense.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardMainInfo}>
            <Text style={styles.cardDescription} numberOfLines={1}>
              {expense.description}
            </Text>
            <Text style={styles.cardSupplier} numberOfLines={1}>
              {supplier?.name}
            </Text>
          </View>
          <Text style={styles.cardAmount}>
            R$ {(expense.invoiceValue || expense.negotiatedValue).toLocaleString('pt-BR')}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          {operation && (
            <View style={[styles.operationBadge, { backgroundColor: operation.color + '20' }]}>
              <Text style={[styles.operationBadgeText, { color: operation.color }]}>
                {operation.name}
              </Text>
            </View>
          )}
          <Text style={styles.cardDate}>Venc: {format(expense.dueDate, 'dd/MM/yyyy')}</Text>
        </View>

        {expense.divergence && (
          <View style={styles.divergenceInfo}>
            <AlertTriangle size={14} color={Colors.error} />
            <Text style={styles.divergenceText}>
              Valor cobrado: R$ {expense.divergence.chargedValue.toLocaleString('pt-BR')} |
              Esperado: R$ {expense.divergence.expectedValue.toLocaleString('pt-BR')}
            </Text>
          </View>
        )}

        {!expense.serviceConfirmed && expense.category === 'Manutenção' && (
          <View style={styles.warningInfo}>
            <AlertTriangle size={14} color={Colors.warning} />
            <Text style={styles.warningText}>Serviço ainda não confirmado</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Validações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {disputed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertTriangle size={20} color={Colors.error} />
                <Text style={styles.sectionTitle}>Divergências</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{disputed.length}</Text>
              </View>
            </View>
            {disputed.map(renderExpenseItem)}
          </View>
        )}

        {pendingValidation.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <FileText size={20} color={Colors.warning} />
                <Text style={styles.sectionTitle}>Aguardando Validação</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingValidation.length}</Text>
              </View>
            </View>
            {pendingValidation.map(renderExpenseItem)}
          </View>
        )}

        {pendingApproval.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={20} color={Colors.info} />
                <Text style={styles.sectionTitle}>Aguardando Aprovação</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingApproval.length}</Text>
              </View>
            </View>
            {pendingApproval.map(renderExpenseItem)}
          </View>
        )}

        {approved.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <CheckCircle2 size={20} color={Colors.success} />
                <Text style={styles.sectionTitle}>Aprovados - Pronto para Pagar</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{approved.length}</Text>
              </View>
            </View>
            {approved.map(renderExpenseItem)}
          </View>
        )}

        {disputed.length === 0 &&
          pendingValidation.length === 0 &&
          pendingApproval.length === 0 &&
          approved.length === 0 && (
            <View style={styles.emptyState}>
              <CheckCircle2 size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptyText}>Não há pendências no momento</Text>
            </View>
          )}

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
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  expenseCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardDescription: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardSupplier: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  cardAmount: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  operationBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  cardDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  divergenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  divergenceText: {
    flex: 1,
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  warningInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
