import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Plus, Search, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { format } from 'date-fns';

interface Receivable {
  id: string;
  description: string;
  clientName: string;
  operation: string;
  value: number;
  dueDate: Date;
  status: 'pending' | 'received' | 'overdue';
  invoiceNumber?: string;
}

const mockReceivables: Receivable[] = [];

export default function ReceivablesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceivables = mockReceivables.filter(
    (item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPending = mockReceivables
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.value, 0);
  const overdueCount = mockReceivables.filter((r) => r.status === 'overdue').length;

  const getStatusInfo = (status: Receivable['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'A Receber', color: Colors.info, icon: Clock };
      case 'received':
        return { label: 'Recebido', color: Colors.success, icon: CheckCircle2 };
      case 'overdue':
        return { label: 'Atrasado', color: Colors.error, icon: AlertCircle };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Contas a Receber',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={[styles.statIcon, { backgroundColor: Colors.info + '18' }]}>
            <TrendingUp size={18} color={Colors.info} />
          </View>
          <Text style={styles.statLabel}>A Receber</Text>
          <Text style={styles.statValue}>R$ {(totalPending / 1000).toFixed(0)}k</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={[styles.statIcon, { backgroundColor: Colors.error + '18' }]}>
            <AlertCircle size={18} color={Colors.error} />
          </View>
          <Text style={styles.statLabel}>Atrasados</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>{overdueCount}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar contas..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredReceivables.map((item) => {
          const statusInfo = getStatusInfo(item.status);
          const StatusIcon = statusInfo.icon;

          return (
            <TouchableOpacity key={item.id} style={styles.receivableCard} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                </View>
                <Text style={styles.value}>R$ {item.value.toLocaleString('pt-BR')}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                  <View style={[styles.operationBadge, { backgroundColor: Colors.primary + '18' }]}>
                    <Text style={[styles.operationText, { color: Colors.primary }]}>
                      {item.operation}
                    </Text>
                  </View>
                  <Text style={styles.dueDate}>Venc: {format(item.dueDate, 'dd/MM/yyyy')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '18' }]}>
                  <StatusIcon size={14} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              {item.invoiceNumber && (
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>NF: {item.invoiceNumber}</Text>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
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
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  receivableCard: {
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
    marginBottom: 14,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  clientName: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.success,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  operationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  operationText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  dueDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
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
  },
  invoiceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  invoiceText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
