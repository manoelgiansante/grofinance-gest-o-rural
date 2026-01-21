import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, FileText, CheckCircle2, XCircle, Calendar } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ContractsScreen() {
  const { contracts, operations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'sale'>('all');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: Colors.success, icon: CheckCircle2 };
      case 'completed':
        return { label: 'Concluído', color: Colors.info, icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelado', color: Colors.error, icon: XCircle };
      default:
        return { label: status, color: Colors.textSecondary, icon: FileText };
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filterType !== 'all' && contract.type !== filterType) return false;
    if (!searchQuery) return true;
    const operation = operations.find((o) => o.id === contract.operationId);
    return (
      contract.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalActive = contracts.filter((c) => c.status === 'active').length;
  const totalValue = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.totalValue, 0);

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Contratos</Text>
            <Text style={styles.subtitle}>Gestão de Contratos</Text>
          </View>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, isWeb && styles.statsRowWeb]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Contratos Ativos</Text>
            <Text style={styles.statValue}>{totalActive}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Valor Total</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              R$ {totalValue.toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'purchase' && styles.filterChipActive]}
            onPress={() => setFilterType('purchase')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === 'purchase' && styles.filterChipTextActive,
              ]}
            >
              Compra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'sale' && styles.filterChipActive]}
            onPress={() => setFilterType('sale')}
          >
            <Text
              style={[styles.filterChipText, filterType === 'sale' && styles.filterChipTextActive]}
            >
              Venda
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar contratos..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {filteredContracts.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nenhum contrato encontrado</Text>
              <Text style={styles.emptySubtitle}>Adicione um novo contrato para começar</Text>
            </View>
          ) : (
            filteredContracts.map((contract) => {
              const operation = operations.find((o) => o.id === contract.operationId);
              const statusInfo = getStatusInfo(contract.status);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity key={contract.id} style={styles.contractCard} activeOpacity={0.7}>
                  <View style={styles.contractHeader}>
                    <View style={styles.contractBadge}>
                      <Text style={styles.contractBadgeText}>
                        {contract.type === 'purchase' ? 'COMPRA' : 'VENDA'}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}
                    >
                      <StatusIcon size={14} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.contractProduct}>{contract.product}</Text>

                  <View style={styles.contractInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Quantidade:</Text>
                      <Text style={styles.infoValue}>
                        {contract.quantity.toLocaleString('pt-BR')} {contract.unit}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Valor Unitário:</Text>
                      <Text style={styles.infoValue}>
                        R$ {contract.unitPrice.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Valor Total:</Text>
                      <Text
                        style={[styles.infoValue, { fontWeight: '700', color: Colors.primary }]}
                      >
                        R$ {contract.totalValue.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.contractFooter}>
                    {operation && (
                      <View
                        style={[styles.operationBadge, { backgroundColor: operation.color + '20' }]}
                      >
                        <Text style={[styles.operationBadgeText, { color: operation.color }]}>
                          {operation.name}
                        </Text>
                      </View>
                    )}
                    <View style={styles.dateRow}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.dateText}>
                        {format(contract.startDate, 'dd/MM/yy', { locale: ptBR })} -{' '}
                        {format(contract.endDate, 'dd/MM/yy', { locale: ptBR })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statsRowWeb: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
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
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
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
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contractCard: {
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
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contractBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  contractProduct: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  contractInfo: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
