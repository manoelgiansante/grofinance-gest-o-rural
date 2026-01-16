import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ArrowLeft, Plus, ArrowRightLeft, Package, Wheat, Clock, CheckCircle, XCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";
import { format } from "date-fns";

interface BarterContract {
  id: string;
  type: 'input_for_product' | 'product_for_input';
  supplierId: string;
  supplierName: string;
  operationId: string;
  operationName: string;
  inputProduct: string;
  inputQuantity: number;
  inputUnit: string;
  inputUnitValue: number;
  outputProduct: string;
  outputQuantity: number;
  outputUnit: string;
  outputUnitValue: number;
  exchangeRate: number;
  startDate: Date;
  settlementDate: Date;
  status: 'active' | 'partially_settled' | 'settled' | 'cancelled';
  settledInputQuantity: number;
  settledOutputQuantity: number;
  notes?: string;
  createdAt: Date;
}

const mockContracts: BarterContract[] = [
  {
    id: '1',
    type: 'input_for_product',
    supplierId: 'sup1',
    supplierName: 'AgroInsumos Ltda',
    operationId: 'op1',
    operationName: 'Lavoura de Soja',
    inputProduct: 'Fertilizante NPK 20-05-20',
    inputQuantity: 10000,
    inputUnit: 'kg',
    inputUnitValue: 3.20,
    outputProduct: 'Soja em grão',
    outputQuantity: 533,
    outputUnit: 'sc 60kg',
    outputUnitValue: 60.0,
    exchangeRate: 0.0533,
    startDate: new Date('2025-01-15'),
    settlementDate: new Date('2025-05-30'),
    status: 'active',
    settledInputQuantity: 0,
    settledOutputQuantity: 0,
    notes: 'Pagamento na entrega da safra',
    createdAt: new Date('2025-01-10'),
  },
  {
    id: '2',
    type: 'product_for_input',
    supplierId: 'sup2',
    supplierName: 'Nutrifort Sementes',
    operationId: 'op2',
    operationName: 'Confinamento',
    inputProduct: 'Ração Premium Gado',
    inputQuantity: 50000,
    inputUnit: 'kg',
    inputUnitValue: 1.85,
    outputProduct: 'Boi Gordo',
    outputQuantity: 12,
    outputUnit: 'cab',
    outputUnitValue: 7800,
    exchangeRate: 0.00024,
    startDate: new Date('2025-01-01'),
    settlementDate: new Date('2025-04-15'),
    status: 'partially_settled',
    settledInputQuantity: 25000,
    settledOutputQuantity: 6,
    notes: 'Entrega parcelada conforme desenvolvimento do gado',
    createdAt: new Date('2024-12-20'),
  },
];

const STATUS_CONFIG = {
  active: { label: 'Ativo', icon: Clock, color: Colors.primary },
  partially_settled: { label: 'Parcialmente Liquidado', icon: ArrowRightLeft, color: Colors.warning },
  settled: { label: 'Liquidado', icon: CheckCircle, color: Colors.success },
  cancelled: { label: 'Cancelado', icon: XCircle, color: Colors.error },
};

export default function BarterScreen() {
  const [statusFilter, setStatusFilter] = useState<BarterContract['status'] | 'all'>('all');

  const filteredContracts = mockContracts.filter(c => 
    statusFilter === 'all' || c.status === statusFilter
  );

  const totalActive = mockContracts.filter(c => c.status === 'active').length;
  const totalValue = mockContracts.reduce((sum, c) => 
    sum + (c.inputQuantity * c.inputUnitValue), 0
  );

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: "Barter/Troca",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Contratos de Barter</Text>
              <Text style={styles.subtitle}>Troca de insumos por produção</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => {}} activeOpacity={0.7}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Contratos Ativos</Text>
              <Text style={styles.statValue}>{totalActive}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Valor Total</Text>
              <Text style={styles.statValue}>R$ {totalValue.toLocaleString('pt-BR')}</Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
                onPress={() => setStatusFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status as BarterContract['status'])}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {filteredContracts.length === 0 && (
              <View style={styles.emptyState}>
                <ArrowRightLeft size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>Nenhum contrato de barter</Text>
              </View>
            )}

            {filteredContracts.map((contract) => {
              const config = STATUS_CONFIG[contract.status];
              const Icon = config.icon;
              const inputTotal = contract.inputQuantity * contract.inputUnitValue;
              const outputTotal = contract.outputQuantity * contract.outputUnitValue;
              const settledPercentage = contract.status === 'active' ? 0 : 
                (contract.settledOutputQuantity / contract.outputQuantity) * 100;

              return (
                <TouchableOpacity
                  key={contract.id}
                  style={styles.contractCard}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <View style={styles.contractHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: config.color + '15' }]}>
                      <Icon size={20} color={config.color} />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractSupplier}>{contract.supplierName}</Text>
                      <Text style={styles.contractOperation}>{contract.operationName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>

                  <View style={styles.exchangeSection}>
                    <View style={styles.exchangeItem}>
                      <View style={[styles.exchangeIcon, { backgroundColor: Colors.primary + '15' }]}>
                        <Package size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.exchangeDetails}>
                        <Text style={styles.exchangeLabel}>Fornecido</Text>
                        <Text style={styles.exchangeProduct}>{contract.inputProduct}</Text>
                        <Text style={styles.exchangeQuantity}>
                          {contract.inputQuantity.toLocaleString('pt-BR')} {contract.inputUnit}
                        </Text>
                        <Text style={styles.exchangeValue}>
                          R$ {inputTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.exchangeArrow}>
                      <ArrowRightLeft size={24} color={Colors.textSecondary} />
                    </View>

                    <View style={styles.exchangeItem}>
                      <View style={[styles.exchangeIcon, { backgroundColor: Colors.success + '15' }]}>
                        <Wheat size={18} color={Colors.success} />
                      </View>
                      <View style={styles.exchangeDetails}>
                        <Text style={styles.exchangeLabel}>A Entregar</Text>
                        <Text style={styles.exchangeProduct}>{contract.outputProduct}</Text>
                        <Text style={styles.exchangeQuantity}>
                          {contract.outputQuantity.toLocaleString('pt-BR')} {contract.outputUnit}
                        </Text>
                        <Text style={styles.exchangeValue}>
                          R$ {outputTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.contractDates}>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Início</Text>
                      <Text style={styles.dateValue}>
                        {format(contract.startDate, "dd/MM/yyyy")}
                      </Text>
                    </View>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Liquidação</Text>
                      <Text style={styles.dateValue}>
                        {format(contract.settlementDate, "dd/MM/yyyy")}
                      </Text>
                    </View>
                  </View>

                  {contract.status === 'partially_settled' && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${settledPercentage}%`,
                              backgroundColor: Colors.success
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {settledPercentage.toFixed(0)}% liquidado ({contract.settledOutputQuantity}/{contract.outputQuantity} {contract.outputUnit})
                      </Text>
                    </View>
                  )}

                  {contract.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Observações:</Text>
                      <Text style={styles.notesText}>{contract.notes}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 24,
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
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
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
  contractCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractInfo: {
    flex: 1,
  },
  contractSupplier: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  contractOperation: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  exchangeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  exchangeItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  exchangeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  exchangeDetails: {
    flex: 1,
  },
  exchangeLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  exchangeProduct: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exchangeQuantity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  exchangeValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  exchangeArrow: {
    width: 32,
    alignItems: 'center',
  },
  contractDates: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  notesSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
