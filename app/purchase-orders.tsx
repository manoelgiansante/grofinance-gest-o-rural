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
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Sprout,
  X,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName?: string;
  operationId: string;
  operationName?: string;
  seasonId?: string;
  seasonName?: string;
  fieldId?: string;
  fieldName?: string;
  totalValue: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  requestDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  items?: { name: string; quantity: number; unit: string; unitPrice: number }[];
}

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', icon: Clock, color: Colors.textTertiary },
  sent: { label: 'Enviado', icon: Package, color: Colors.info },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: Colors.primary },
  received: { label: 'Recebido', icon: Truck, color: Colors.success },
  cancelled: { label: 'Cancelado', icon: XCircle, color: Colors.error },
};

// Mock data with season and field
const mockOrders: PurchaseOrder[] = [];

export default function PurchaseOrdersScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrder['status'] | 'all'>('all');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Use mock data for now
  const purchaseOrders = mockOrders;
  const isLoading = false;

  const filteredOrders = purchaseOrders.filter((po) => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    if (search && !po.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: purchaseOrders.length,
    draft: purchaseOrders.filter((po) => po.status === 'draft').length,
    sent: purchaseOrders.filter((po) => po.status === 'sent').length,
    confirmed: purchaseOrders.filter((po) => po.status === 'confirmed').length,
    received: purchaseOrders.filter((po) => po.status === 'received').length,
    cancelled: purchaseOrders.filter((po) => po.status === 'cancelled').length,
  };

  const totalValue = filteredOrders.reduce((sum, po) => sum + po.totalValue, 0);

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: 'Pedidos de Compra',
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
              <Text style={styles.title}>Pedidos de Compra</Text>
              <Text style={styles.subtitle}>{purchaseOrders.length} pedidos</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewOrderModal(true)}
              activeOpacity={0.7}
            >
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Novo Pedido</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Valor Total</Text>
              <Text style={styles.statValue}>R$ {totalValue.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Aguardando</Text>
              <Text style={[styles.statValue, { color: Colors.info }]}>
                {statusCounts.sent + statusCounts.confirmed}
              </Text>
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
                  Todos ({statusCounts.all})
                </Text>
              </TouchableOpacity>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status as PurchaseOrder['status'])}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.filterText, statusFilter === status && styles.filterTextActive]}
                  >
                    {config.label} ({statusCounts[status as keyof typeof statusCounts]})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por número do pedido"
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isLoading && <Text style={styles.emptyText}>Carregando...</Text>}

            {!isLoading && filteredOrders.length === 0 && (
              <View style={styles.emptyState}>
                <Package size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {search ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
                </Text>
              </View>
            )}

            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;

              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  activeOpacity={0.7}
                  onPress={() => {}}
                >
                  <View style={styles.orderHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: config.color + '15' }]}>
                      <Icon size={20} color={config.color} />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>Pedido #{order.id.substring(0, 8)}</Text>
                      <Text style={styles.orderDate}>
                        {format(order.requestDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                      <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>

                  {/* Supplier Info */}
                  {order.supplierName && (
                    <View style={styles.supplierRow}>
                      <Text style={styles.supplierLabel}>Fornecedor:</Text>
                      <Text style={styles.supplierName}>{order.supplierName}</Text>
                    </View>
                  )}

                  {/* Season and Field Tags */}
                  {(order.seasonName || order.fieldName) && (
                    <View style={styles.tagsRow}>
                      {order.seasonName && (
                        <View style={[styles.tagBadge, { backgroundColor: Colors.success + '15' }]}>
                          <Sprout size={12} color={Colors.success} />
                          <Text style={[styles.tagText, { color: Colors.success }]}>
                            {order.seasonName}
                          </Text>
                        </View>
                      )}
                      {order.fieldName && (
                        <View style={[styles.tagBadge, { backgroundColor: Colors.info + '15' }]}>
                          <MapPin size={12} color={Colors.info} />
                          <Text style={[styles.tagText, { color: Colors.info }]}>
                            {order.fieldName}
                          </Text>
                        </View>
                      )}
                      {order.operationName && (
                        <View style={[styles.tagBadge, { backgroundColor: Colors.primary + '15' }]}>
                          <Text style={[styles.tagText, { color: Colors.primary }]}>
                            {order.operationName}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.orderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Valor Total</Text>
                      <Text style={styles.detailValue}>
                        R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    {order.expectedDeliveryDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Previsão de Entrega</Text>
                        <Text style={styles.detailValue}>
                          {format(order.expectedDeliveryDate, 'dd/MM/yyyy')}
                        </Text>
                      </View>
                    )}

                    {order.actualDeliveryDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Data de Recebimento</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>
                          {format(order.actualDeliveryDate, 'dd/MM/yyyy')}
                        </Text>
                      </View>
                    )}

                    {order.notes && (
                      <View style={styles.notesRow}>
                        <Text style={styles.notesLabel}>Observações:</Text>
                        <Text style={styles.notesText} numberOfLines={2}>
                          {order.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {/* New Order Modal */}
        <Modal
          visible={showNewOrderModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNewOrderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Novo Pedido de Compra</Text>
                  <Text style={styles.modalSubtitle}>Preencha os dados do pedido</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowNewOrderModal(false)}
                >
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Fornecedor *</Text>
                  <TouchableOpacity style={styles.formSelect} activeOpacity={0.7}>
                    <Text style={styles.formSelectPlaceholder}>Selecione o fornecedor</Text>
                    <ChevronRight size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Safra *</Text>
                  <TouchableOpacity style={styles.formSelect} activeOpacity={0.7}>
                    <Text style={styles.formSelectPlaceholder}>Selecione a safra</Text>
                    <ChevronRight size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Talhão/Área</Text>
                  <TouchableOpacity style={styles.formSelect} activeOpacity={0.7}>
                    <Text style={styles.formSelectPlaceholder}>Selecione a área (opcional)</Text>
                    <ChevronRight size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Operação</Text>
                  <TouchableOpacity style={styles.formSelect} activeOpacity={0.7}>
                    <Text style={styles.formSelectPlaceholder}>
                      Vincular a uma operação (opcional)
                    </Text>
                    <ChevronRight size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Data Prevista de Entrega</Text>
                  <TouchableOpacity style={styles.formSelect} activeOpacity={0.7}>
                    <Text style={styles.formSelectPlaceholder}>Selecione a data</Text>
                    <Calendar size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Observações</Text>
                  <TextInput
                    style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Informações adicionais sobre o pedido"
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.7}
                  onPress={() => setShowNewOrderModal(false)}
                >
                  <Text style={styles.primaryButtonText}>Adicionar Itens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.7}
                  onPress={() => setShowNewOrderModal(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
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
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
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
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  orderDate: {
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
  orderDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  notesRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  supplierLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formSelect: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formSelectText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  formSelectPlaceholder: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
