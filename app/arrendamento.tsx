import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';

interface LeaseContract {
  id: string;
  lessorName: string;
  lessorCpfCnpj: string;
  fieldId: string;
  fieldName: string;
  area: number;
  startDate: Date;
  endDate: Date;
  paymentType: 'fixed_cash' | 'fixed_product' | 'percentage' | 'partnership';
  fixedCashValue?: number;
  fixedProductQuantity?: number;
  fixedProductUnit?: string;
  percentageValue?: number;
  partnershipShare?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual' | 'harvest';
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

const mockLeases: LeaseContract[] = [
  {
    id: '1',
    lessorName: 'José Silva',
    lessorCpfCnpj: '123.456.789-00',
    fieldId: 'field1',
    fieldName: 'Talhão Norte - 50ha',
    area: 50,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-08-31'),
    paymentType: 'fixed_product',
    fixedProductQuantity: 15,
    fixedProductUnit: 'sc/ha',
    paymentFrequency: 'harvest',
    status: 'active',
    notes: 'Pagamento em soja após a colheita',
    createdAt: new Date('2024-08-15'),
  },
  {
    id: '2',
    lessorName: 'Maria Oliveira',
    lessorCpfCnpj: '987.654.321-00',
    fieldId: 'field2',
    fieldName: 'Fazenda Sul - 100ha',
    area: 100,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    paymentType: 'fixed_cash',
    fixedCashValue: 2500,
    paymentFrequency: 'annual',
    status: 'active',
    notes: 'Pagamento único em janeiro',
    createdAt: new Date('2024-12-10'),
  },
  {
    id: '3',
    lessorName: 'Cooperativa Agrícola',
    lessorCpfCnpj: '12.345.678/0001-90',
    fieldId: 'field3',
    fieldName: 'Área Oeste - 75ha',
    area: 75,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-06-30'),
    paymentType: 'percentage',
    percentageValue: 25,
    paymentFrequency: 'harvest',
    status: 'active',
    notes: '25% da produção líquida',
    createdAt: new Date('2024-06-15'),
  },
];

const PAYMENT_TYPE_CONFIG = {
  fixed_cash: { label: 'Valor Fixo (R$)', icon: DollarSign },
  fixed_product: { label: 'Produto Fixo', icon: MapPin },
  percentage: { label: 'Percentual', icon: DollarSign },
  partnership: { label: 'Parceria', icon: User },
};

const STATUS_CONFIG = {
  active: { label: 'Ativo', icon: Clock, color: Colors.primary },
  completed: { label: 'Concluído', icon: CheckCircle, color: Colors.success },
  cancelled: { label: 'Cancelado', icon: XCircle, color: Colors.error },
};

export default function ArrendamentoScreen() {
  const [statusFilter, setStatusFilter] = useState<LeaseContract['status'] | 'all'>('all');

  const filteredLeases = mockLeases.filter(
    (l) => statusFilter === 'all' || l.status === statusFilter
  );

  const totalArea = mockLeases
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.area, 0);
  const activeLeases = mockLeases.filter((l) => l.status === 'active').length;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: 'Arrendamentos',
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
              <Text style={styles.title}>Contratos de Arrendamento</Text>
              <Text style={styles.subtitle}>Gestão de áreas arrendadas</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => {}} activeOpacity={0.7}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Contratos Ativos</Text>
              <Text style={styles.statValue}>{activeLeases}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Área Total</Text>
              <Text style={styles.statValue}>{totalArea} ha</Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
                onPress={() => setStatusFilter('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status as LeaseContract['status'])}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.filterText, statusFilter === status && styles.filterTextActive]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredLeases.length === 0 && (
              <View style={styles.emptyState}>
                <MapPin size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>Nenhum contrato de arrendamento</Text>
              </View>
            )}

            {filteredLeases.map((lease) => {
              const config = STATUS_CONFIG[lease.status];
              const Icon = config.icon;
              const paymentConfig = PAYMENT_TYPE_CONFIG[lease.paymentType];
              const daysRemaining = differenceInDays(lease.endDate, new Date());
              const isNearEnd = daysRemaining > 0 && daysRemaining <= 60;

              return (
                <TouchableOpacity
                  key={lease.id}
                  style={styles.leaseCard}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <View style={styles.leaseHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: config.color + '15' }]}>
                      <Icon size={20} color={config.color} />
                    </View>
                    <View style={styles.leaseInfo}>
                      <Text style={styles.leaseLessor}>{lease.lessorName}</Text>
                      <Text style={styles.leaseDoc}>{lease.lessorCpfCnpj}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                      <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldSection}>
                    <View style={[styles.fieldIcon, { backgroundColor: Colors.success + '15' }]}>
                      <MapPin size={18} color={Colors.success} />
                    </View>
                    <View style={styles.fieldDetails}>
                      <Text style={styles.fieldName}>{lease.fieldName}</Text>
                      <Text style={styles.fieldArea}>{lease.area} hectares</Text>
                    </View>
                  </View>

                  <View style={styles.paymentSection}>
                    <View style={styles.paymentHeader}>
                      <paymentConfig.icon size={16} color={Colors.primary} />
                      <Text style={styles.paymentType}>{paymentConfig.label}</Text>
                    </View>
                    <View style={styles.paymentDetails}>
                      {lease.paymentType === 'fixed_cash' && lease.fixedCashValue && (
                        <Text style={styles.paymentValue}>
                          R$ {lease.fixedCashValue.toLocaleString('pt-BR')}/ha/ano
                        </Text>
                      )}
                      {lease.paymentType === 'fixed_product' && lease.fixedProductQuantity && (
                        <Text style={styles.paymentValue}>
                          {lease.fixedProductQuantity} {lease.fixedProductUnit}
                        </Text>
                      )}
                      {lease.paymentType === 'percentage' && lease.percentageValue && (
                        <Text style={styles.paymentValue}>
                          {lease.percentageValue}% da produção
                        </Text>
                      )}
                      {lease.paymentType === 'partnership' && lease.partnershipShare && (
                        <Text style={styles.paymentValue}>
                          {lease.partnershipShare}% de participação
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.dateSection}>
                    <View style={styles.dateItem}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.dateLabel}>Início</Text>
                      <Text style={styles.dateValue}>{format(lease.startDate, 'dd/MM/yyyy')}</Text>
                    </View>
                    <View style={styles.dateItem}>
                      <Calendar size={14} color={Colors.textSecondary} />
                      <Text style={styles.dateLabel}>Término</Text>
                      <Text style={styles.dateValue}>{format(lease.endDate, 'dd/MM/yyyy')}</Text>
                    </View>
                  </View>

                  {lease.status === 'active' && isNearEnd && (
                    <View style={styles.alertBanner}>
                      <Clock size={16} color={Colors.warning} />
                      <Text style={styles.alertText}>Vence em {daysRemaining} dias</Text>
                    </View>
                  )}

                  {lease.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Observações:</Text>
                      <Text style={styles.notesText}>{lease.notes}</Text>
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
  leaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  leaseInfo: {
    flex: 1,
  },
  leaseLessor: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  leaseDoc: {
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
  fieldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldDetails: {
    flex: 1,
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fieldArea: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  paymentSection: {
    padding: 14,
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  paymentType: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  dateSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    flex: 1,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.warning + '15',
    borderRadius: 10,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.warning,
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
