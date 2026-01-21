import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Upload,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useAuth } from '@/contexts/AuthContext';
import { suppliers } from '@/mocks/data';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { Expense } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExcelImporter from '@/components/ExcelImporter';

export default function ExpensesScreen() {
  const { expenses, operations, refetch } = useApp();
  const { isPremium } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  const getStatusInfo = (status: Expense['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Rascunho', color: Colors.textSecondary, icon: FileText };
      case 'pending_validation':
        return { label: 'Aguardando Validação', color: Colors.warning, icon: Clock };
      case 'pending_approval':
        return { label: 'Aguardando Aprovação', color: Colors.info, icon: Clock };
      case 'approved':
        return { label: 'Aprovado', color: Colors.success, icon: CheckCircle2 };
      case 'disputed':
        return { label: 'Divergente', color: Colors.error, icon: AlertCircle };
      case 'scheduled':
        return { label: 'Agendado', color: Colors.info, icon: Clock };
      case 'paid':
        return { label: 'Pago', color: Colors.success, icon: CheckCircle2 };
      case 'reconciled':
        return { label: 'Conciliado', color: Colors.primary, icon: CheckCircle2 };
      default:
        return { label: status, color: Colors.textSecondary, icon: FileText };
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (!searchQuery) return true;
    const supplier = suppliers.find((s) => s.id === expense.supplierId);
    const operation = operations.find((o) => o.id === expense.operationId);
    return (
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Excel Importer Modal */}
      <Modal
        visible={showImporter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImporter(false)}
      >
        <ExcelImporter
          targetTable="expenses"
          onImportComplete={() => {
            setShowImporter(false);
            refetch();
          }}
          onClose={() => setShowImporter(false)}
        />
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Despesas</Text>
        <View style={styles.headerButtons}>
          {isPremium && (
            <TouchableOpacity
              style={styles.importButton}
              onPress={() => setShowImporter(true)}
              activeOpacity={0.7}
            >
              <Upload size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-expense')}
            activeOpacity={0.7}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar despesas..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Filter size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {filteredExpenses.map((expense) => {
          const supplier = suppliers.find((s) => s.id === expense.supplierId);
          const operation = operations.find((o) => o.id === expense.operationId);
          const statusInfo = getStatusInfo(expense.status);
          const StatusIcon = statusInfo.icon;

          return (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/expense-details?id=${expense.id}`)}
            >
              <View style={styles.expenseHeader}>
                <View style={styles.expenseMainInfo}>
                  <Text style={styles.expenseDescription} numberOfLines={1}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseSupplier} numberOfLines={1}>
                    {supplier?.name}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>
                  R$ {(expense.invoiceValue || expense.negotiatedValue).toLocaleString('pt-BR')}
                </Text>
              </View>

              <View style={styles.expenseFooter}>
                <View style={styles.expenseMetaLeft}>
                  {operation && (
                    <View
                      style={[styles.operationBadge, { backgroundColor: operation.color + '20' }]}
                    >
                      <Text style={[styles.operationBadgeText, { color: operation.color }]}>
                        {operation.name}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.expenseDate}>
                    {format(expense.dueDate, 'dd MMM', { locale: ptBR })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                  <StatusIcon size={14} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              {expense.divergence && (
                <View style={styles.divergenceAlert}>
                  <AlertCircle size={14} color={Colors.error} />
                  <Text style={styles.divergenceText}>
                    Divergência: R${' '}
                    {(
                      expense.divergence.chargedValue - expense.divergence.expectedValue
                    ).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  importButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  expenseSupplier: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  expenseAmount: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
  expenseDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  divergenceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  divergenceText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500' as const,
  },
});
