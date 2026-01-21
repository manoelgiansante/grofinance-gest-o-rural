import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Tractor,
  Wrench,
  Fuel,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Settings,
  ChevronRight,
  Activity,
  DollarSign,
  BarChart3,
  Gauge,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { IntegrationService, MachineData } from '@/lib/integrationService';

export default function MachinesIntegrationScreen() {
  const isWeb = Platform.OS === 'web';
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [machineCosts, setMachineCosts] = useState({
    totalCost: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    operatorCost: 0,
    costPerHectare: 0,
    totalHectares: 0,
  });
  const [utilization, setUtilization] = useState({
    totalMachines: 0,
    activeMachines: 0,
    inMaintenance: 0,
    averageHoursPerDay: 0,
    topMachines: [] as { name: string; hours: number; efficiency: number }[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [machinesData, costsData, utilizationData, syncTime] = await Promise.all([
        IntegrationService.getMachines(),
        IntegrationService.getMachineCostPerHectare(),
        IntegrationService.getMachineUtilization(),
        IntegrationService.getLastSyncTime(),
      ]);

      setMachines(machinesData);
      setMachineCosts(costsData);
      setUtilization(utilizationData);
      setLastSync(syncTime);
    } catch (error) {
      console.error('Error loading machine data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await IntegrationService.syncAll();
    if (!result.success) {
      Alert.alert('Atenção', result.errors.join('\n'));
    }
    await loadData();
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'maintenance':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'maintenance':
        return 'Manutenção';
      default:
        return 'Inativo';
    }
  };

  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'tractor':
        return Tractor;
      case 'harvester':
        return Tractor;
      default:
        return Tractor;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Integração Máquinas</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <RefreshCw size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          {/* Sync Status */}
          <View style={styles.syncBanner}>
            <View style={styles.syncInfo}>
              <Activity size={18} color={Colors.primary} />
              <Text style={styles.syncText}>
                {lastSync
                  ? `Última sincronização: ${lastSync.toLocaleString('pt-BR')}`
                  : 'Nunca sincronizado'}
              </Text>
            </View>
            <TouchableOpacity style={styles.syncButton} onPress={handleRefresh}>
              <Text style={styles.syncButtonText}>Sincronizar</Text>
            </TouchableOpacity>
          </View>

          {/* Overview Stats */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Visão Geral da Frota</Text>
            <View style={styles.overviewGrid}>
              <View style={[styles.overviewItem, { backgroundColor: Colors.primary + '15' }]}>
                <Tractor size={24} color={Colors.primary} />
                <Text style={styles.overviewValue}>{utilization.totalMachines}</Text>
                <Text style={styles.overviewLabel}>Total</Text>
              </View>
              <View style={[styles.overviewItem, { backgroundColor: Colors.success + '15' }]}>
                <Activity size={24} color={Colors.success} />
                <Text style={styles.overviewValue}>{utilization.activeMachines}</Text>
                <Text style={styles.overviewLabel}>Ativos</Text>
              </View>
              <View style={[styles.overviewItem, { backgroundColor: Colors.warning + '15' }]}>
                <Wrench size={24} color={Colors.warning} />
                <Text style={styles.overviewValue}>{utilization.inMaintenance}</Text>
                <Text style={styles.overviewLabel}>Manutenção</Text>
              </View>
              <View style={[styles.overviewItem, { backgroundColor: Colors.info + '15' }]}>
                <Clock size={24} color={Colors.info || Colors.primary} />
                <Text style={styles.overviewValue}>
                  {utilization.averageHoursPerDay.toFixed(1)}h
                </Text>
                <Text style={styles.overviewLabel}>Média/Dia</Text>
              </View>
            </View>
          </View>

          {/* Cost Analysis */}
          <Text style={styles.sectionTitle}>Análise de Custos</Text>
          <View style={styles.costCard}>
            <View style={styles.costHeader}>
              <DollarSign size={20} color={Colors.primary} />
              <Text style={styles.costHeaderText}>Custo Total de Máquinas</Text>
            </View>
            <Text style={styles.costTotal}>{formatCurrency(machineCosts.totalCost)}</Text>

            <View style={styles.costBreakdown}>
              <View style={styles.costItem}>
                <View style={[styles.costIcon, { backgroundColor: Colors.warning + '20' }]}>
                  <Fuel size={16} color={Colors.warning} />
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>Combustível</Text>
                  <Text style={styles.costValue}>{formatCurrency(machineCosts.fuelCost)}</Text>
                </View>
              </View>
              <View style={styles.costItem}>
                <View style={[styles.costIcon, { backgroundColor: Colors.error + '20' }]}>
                  <Wrench size={16} color={Colors.error} />
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>Manutenção</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(machineCosts.maintenanceCost)}
                  </Text>
                </View>
              </View>
              <View style={styles.costItem}>
                <View style={[styles.costIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Activity size={16} color={Colors.primary} />
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>Operador</Text>
                  <Text style={styles.costValue}>{formatCurrency(machineCosts.operatorCost)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.costPerHa}>
              <BarChart3 size={18} color={Colors.success} />
              <Text style={styles.costPerHaText}>
                Custo/Hectare:{' '}
                <Text style={styles.costPerHaValue}>
                  {formatCurrency(machineCosts.costPerHectare)}/ha
                </Text>
              </Text>
            </View>
          </View>

          {/* Top Machines */}
          {utilization.topMachines.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Top Máquinas (Últimos 30 dias)</Text>
              <View style={styles.topMachinesCard}>
                {utilization.topMachines.map((machine, index) => (
                  <View key={index} style={styles.topMachineItem}>
                    <View style={styles.topMachineRank}>
                      <Text style={styles.topMachineRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.topMachineInfo}>
                      <Text style={styles.topMachineName}>{machine.name}</Text>
                      <Text style={styles.topMachineHours}>
                        {machine.hours.toFixed(1)} horas trabalhadas
                      </Text>
                    </View>
                    <View style={styles.topMachineEfficiency}>
                      <Gauge
                        size={18}
                        color={machine.efficiency > 70 ? Colors.success : Colors.warning}
                      />
                      <Text
                        style={[
                          styles.topMachineEfficiencyText,
                          { color: machine.efficiency > 70 ? Colors.success : Colors.warning },
                        ]}
                      >
                        {machine.efficiency.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Machines List */}
          <Text style={styles.sectionTitle}>Máquinas Cadastradas</Text>

          {machines.length === 0 ? (
            <View style={styles.emptyState}>
              <Tractor size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>Nenhuma máquina encontrada</Text>
              <Text style={styles.emptyStateText}>
                Cadastre máquinas no app Rumo Máquinas para ver os dados aqui.
              </Text>
              <TouchableOpacity style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Abrir Rumo Máquinas</Text>
              </TouchableOpacity>
            </View>
          ) : (
            machines.map((machine) => {
              const statusColor = getStatusColor(machine.status);
              const statusLabel = getStatusLabel(machine.status);
              const Icon = getMachineIcon(machine.type);

              return (
                <View key={machine.id} style={styles.machineCard}>
                  <View style={styles.machineHeader}>
                    <View
                      style={[styles.machineIconContainer, { backgroundColor: statusColor + '20' }]}
                    >
                      <Icon size={24} color={statusColor} />
                    </View>
                    <View style={styles.machineInfo}>
                      <Text style={styles.machineName}>{machine.name}</Text>
                      <Text style={styles.machineMeta}>
                        {machine.brand} {machine.model} • {machine.year}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.machineStats}>
                    <View style={styles.machineStat}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <Text style={styles.machineStatText}>{machine.hourMeter}h</Text>
                    </View>
                    {machine.fuelConsumption && (
                      <View style={styles.machineStat}>
                        <Fuel size={14} color={Colors.textSecondary} />
                        <Text style={styles.machineStatText}>{machine.fuelConsumption} L/h</Text>
                      </View>
                    )}
                    {machine.operationalCost && (
                      <View style={styles.machineStat}>
                        <DollarSign size={14} color={Colors.textSecondary} />
                        <Text style={styles.machineStatText}>
                          {formatCurrency(machine.operationalCost)}/h
                        </Text>
                      </View>
                    )}
                  </View>

                  {machine.status === 'maintenance' && machine.nextMaintenance && (
                    <View style={styles.maintenanceAlert}>
                      <AlertTriangle size={14} color={Colors.warning} />
                      <Text style={styles.maintenanceAlertText}>
                        Previsão de retorno:{' '}
                        {new Date(machine.nextMaintenance).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Integration Info */}
          <View style={styles.infoCard}>
            <Settings size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Sobre a Integração</Text>
              <Text style={styles.infoText}>
                Os dados de máquinas são sincronizados automaticamente com o app Rumo Máquinas.
                Custos de combustível, manutenção e operação são integrados aos seus relatórios
                financeiros.
              </Text>
            </View>
          </View>
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
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  syncButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewItem: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  costCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  costHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  costTotal: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    gap: 12,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  costIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  costPerHa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  costPerHaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  costPerHaValue: {
    fontWeight: '700',
    color: Colors.success,
  },
  topMachinesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  topMachineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topMachineRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topMachineRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  topMachineInfo: {
    flex: 1,
  },
  topMachineName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  topMachineHours: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  topMachineEfficiency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topMachineEfficiencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  machineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  machineMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  machineStats: {
    flexDirection: 'row',
    gap: 16,
  },
  machineStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  machineStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  maintenanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  maintenanceAlertText: {
    fontSize: 12,
    color: Colors.warning,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
