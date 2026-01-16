import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ArrowLeft, Search, Plus, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PurchaseOrder {
  id: string;
  supplierId: string;
  operationId: string;
  totalValue: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
  requestDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
}

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', icon: Clock, color: Colors.textTertiary },
  sent: { label: 'Enviado', icon: Package, color: Colors.info },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: Colors.primary },
  received: { label: 'Recebido', icon: Truck, color: Colors.success },
  cancelled: { label: 'Cancelado', icon: XCircle, color: Colors.error },
};

export default function ComprasScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrder['status'] | 'all'>('all');

  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('request_date', { ascending: false });
      
      if (error) {
        console.error('Error loading purchase orders:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((po: any): PurchaseOrder => ({
        id: po.id,
        supplierId: po.supplier_id || '',
        operationId: po.operation_id || '',
        totalValue: po.total_value,
        status: po.status as any,
        requestedBy: po.requested_by,
        approvedBy: po.approved_by,
        requestDate: new Date(po.request_date),
        expectedDeliveryDate: po.expected_delivery_date ? new Date(po.expected_delivery_date) : undefined,
        actualDeliveryDate: po.actual_delivery_date ? new Date(po.actual_delivery_date) : undefined,
        notes: po.notes,
      }));
    },
  });

  const filteredOrders = purchaseOrders.filter(po => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    if (search && !po.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    sent: purchaseOrders.filter(po => po.status === 'sent').length,
    confirmed: purchaseOrders.filter(po => po.status === 'confirmed').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
    cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length,
  };

  const totalValue = filteredOrders.reduce((sum, po) => sum + po.totalValue, 0);

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: "Compras",
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
            <TouchableOpacity style={styles.addButton} onPress={() => {}} activeOpacity={0.7}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
                onPress={() => setStatusFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
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
                  <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>

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
                          {format(order.expectedDeliveryDate, "dd/MM/yyyy")}
                        </Text>
                      </View>
                    )}

                    {order.actualDeliveryDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Data de Recebimento</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>
                          {format(order.actualDeliveryDate, "dd/MM/yyyy")}
                        </Text>
                      </View>
                    )}

                    {order.notes && (
                      <View style={styles.notesRow}>
                        <Text style={styles.notesLabel}>Observações:</Text>
                        <Text style={styles.notesText} numberOfLines={2}>{order.notes}</Text>
                      </View>
                    )}
                  </View>
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
});
