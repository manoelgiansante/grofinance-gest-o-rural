import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Filter, DollarSign, Clock, CheckCircle2, AlertCircle, Calendar, Upload } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { router } from "expo-router";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ExcelImporter from "@/components/ExcelImporter";

export default function RevenuesScreen() {
  const { revenues, clients, operations, refetch } = useApp();
  const { isPremium } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: Colors.warning, icon: Clock };
      case 'received':
        return { label: 'Recebido', color: Colors.success, icon: CheckCircle2 };
      case 'overdue':
        return { label: 'Atrasado', color: Colors.error, icon: AlertCircle };
      case 'cancelled':
        return { label: 'Cancelado', color: Colors.textSecondary, icon: AlertCircle };
      default:
        return { label: status, color: Colors.textSecondary, icon: DollarSign };
    }
  };

  const filteredRevenues = revenues.filter(revenue => {
    if (!searchQuery) return true;
    const client = clients.find(c => c.id === revenue.clientId);
    const operation = operations.find(o => o.id === revenue.operationId);
    return (
      revenue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPending = revenues.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.value, 0);
  const totalReceived = revenues.filter(r => r.status === 'received').reduce((sum, r) => sum + r.value, 0);
  const totalOverdue = revenues.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.value, 0);

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      {/* Excel Importer Modal */}
      <Modal
        visible={showImporter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImporter(false)}
      >
        <ExcelImporter
          targetTable="revenues"
          onImportComplete={() => {
            setShowImporter(false);
            refetch();
          }}
          onClose={() => setShowImporter(false)}
        />
      </Modal>

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Receitas</Text>
            <Text style={styles.subtitle}>Contas a Receber</Text>
          </View>
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
              onPress={() => router.push('/add-revenue')}
              activeOpacity={0.7}
            >
              <Plus size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statsRow, isWeb && styles.statsRowWeb]}>
          <View style={[styles.statCard, { borderLeftColor: Colors.warning, borderLeftWidth: 4 }]}>
            <Text style={styles.statLabel}>A Receber</Text>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              R$ {totalPending.toLocaleString('pt-BR')}
            </Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.success, borderLeftWidth: 4 }]}>
            <Text style={styles.statLabel}>Recebido</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              R$ {totalReceived.toLocaleString('pt-BR')}
            </Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.error, borderLeftWidth: 4 }]}>
            <Text style={styles.statLabel}>Atrasado</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              R$ {totalOverdue.toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receitas..."
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
          {filteredRevenues.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
              <Text style={styles.emptySubtitle}>Adicione uma nova receita para começar</Text>
            </View>
          ) : (
            filteredRevenues.map((revenue) => {
              const client = clients.find(c => c.id === revenue.clientId);
              const operation = operations.find(o => o.id === revenue.operationId);
              const statusInfo = getStatusInfo(revenue.status);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity 
                  key={revenue.id}
                  style={styles.revenueCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.revenueHeader}>
                    <View style={styles.revenueMainInfo}>
                      <Text style={styles.revenueDescription} numberOfLines={1}>
                        {revenue.description}
                      </Text>
                      <Text style={styles.revenueClient} numberOfLines={1}>
                        {client?.name || 'Cliente não encontrado'}
                      </Text>
                    </View>
                    <Text style={styles.revenueAmount}>
                      R$ {revenue.value.toLocaleString('pt-BR')}
                    </Text>
                  </View>

                  <View style={styles.revenueFooter}>
                    <View style={styles.revenueMetaLeft}>
                      {operation && (
                        <View style={[styles.operationBadge, { backgroundColor: operation.color + '20' }]}>
                          <Text style={[styles.operationBadgeText, { color: operation.color }]}>
                            {operation.name}
                          </Text>
                        </View>
                      )}
                      <View style={styles.dateRow}>
                        <Calendar size={14} color={Colors.textSecondary} />
                        <Text style={styles.revenueDate}>
                          {format(revenue.dueDate, 'dd MMM', { locale: ptBR })}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                      <StatusIcon size={14} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    minWidth: 100,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
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
  revenueCard: {
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
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  revenueMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  revenueDescription: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  revenueClient: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  revenueAmount: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.success,
    letterSpacing: -0.3,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueMetaLeft: {
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revenueDate: {
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
});
