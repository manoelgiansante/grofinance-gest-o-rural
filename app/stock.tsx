import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Plus, Search, Package, AlertTriangle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";

interface StockBatch {
  id: string;
  lotNumber: string;
  quantity: number;
  unitCost: number;
  manufacturingDate?: Date;
  expiryDate?: Date;
  supplier?: string;
  status: 'active' | 'expired' | 'near_expiry';
}

interface StockItem {
  id: string;
  name: string;
  type: 'input' | 'production';
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  avgCost: number;
  batches?: StockBatch[];
}

const mockStock: StockItem[] = [
  { 
    id: '1', 
    name: 'Ração Premium Gado', 
    type: 'input', 
    category: 'Alimentação', 
    currentStock: 15000, 
    minStock: 10000, 
    unit: 'kg', 
    avgCost: 1.85,
    batches: [
      { id: 'L001', lotNumber: 'L001-2025', quantity: 8000, unitCost: 1.82, manufacturingDate: new Date('2025-01-10'), expiryDate: new Date('2025-07-10'), supplier: 'Nutrifort', status: 'active' },
      { id: 'L002', lotNumber: 'L002-2024', quantity: 5000, unitCost: 1.88, manufacturingDate: new Date('2024-12-15'), expiryDate: new Date('2025-03-15'), supplier: 'Nutrifort', status: 'near_expiry' },
      { id: 'L003', lotNumber: 'L003-2025', quantity: 2000, unitCost: 1.85, manufacturingDate: new Date('2025-01-05'), expiryDate: new Date('2025-06-05'), supplier: 'Nutrifort', status: 'active' },
    ]
  },
  { 
    id: '2', 
    name: 'Fertilizante NPK 20-05-20', 
    type: 'input', 
    category: 'Fertilizantes', 
    currentStock: 2500, 
    minStock: 3000, 
    unit: 'kg', 
    avgCost: 3.20,
    batches: [
      { id: 'F001', lotNumber: 'F001-2024', quantity: 1500, unitCost: 3.15, manufacturingDate: new Date('2024-11-20'), expiryDate: new Date('2026-11-20'), supplier: 'AgroFert', status: 'active' },
      { id: 'F002', lotNumber: 'F002-2025', quantity: 1000, unitCost: 3.25, manufacturingDate: new Date('2025-01-08'), expiryDate: new Date('2027-01-08'), supplier: 'AgroFert', status: 'active' },
    ]
  },
  { id: '3', name: 'Diesel S10', type: 'input', category: 'Combustível', currentStock: 8500, minStock: 5000, unit: 'L', avgCost: 4.85 },
  { id: '4', name: 'Boi Gordo', type: 'production', category: 'Produção Animal', currentStock: 450, minStock: 0, unit: 'cab', avgCost: 7800 },
  { id: '5', name: 'Cana-de-açúcar', type: 'production', category: 'Produção Vegetal', currentStock: 125000, minStock: 0, unit: 'ton', avgCost: 85 },
];

export default function StockScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'input' | 'production'>('all');

  const filteredStock = mockStock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalValue = mockStock.reduce((sum, item) => sum + (item.currentStock * item.avgCost), 0);
  const lowStockCount = mockStock.filter(item => item.currentStock < item.minStock).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: "Estoque",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={styles.statLabel}>Valor Total</Text>
          <Text style={styles.statValue}>R$ {(totalValue / 1000).toFixed(0)}k</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={styles.statHeader}>
            <AlertTriangle size={18} color={lowStockCount > 0 ? Colors.error : Colors.success} />
            <Text style={styles.statLabel}>Baixo Estoque</Text>
          </View>
          <Text style={[styles.statValue, { color: lowStockCount > 0 ? Colors.error : Colors.success }]}>
            {lowStockCount} itens
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar itens..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedType('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, selectedType === 'all' && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, selectedType === 'input' && styles.filterChipActive]}
          onPress={() => setSelectedType('input')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, selectedType === 'input' && styles.filterChipTextActive]}>
            Insumos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, selectedType === 'production' && styles.filterChipActive]}
          onPress={() => setSelectedType('production')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, selectedType === 'production' && styles.filterChipTextActive]}>
            Produção
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredStock.map((item) => {
          const isLowStock = item.currentStock < item.minStock;
          const stockPercentage = item.minStock > 0 ? (item.currentStock / item.minStock) * 100 : 100;

          return (
            <TouchableOpacity key={item.id} style={styles.stockCard} activeOpacity={0.7}>
              <View style={styles.stockHeader}>
                <View style={styles.stockTitleRow}>
                  <View style={[styles.stockIcon, { backgroundColor: isLowStock ? Colors.error + '18' : Colors.primary + '18' }]}>
                    <Package size={20} color={isLowStock ? Colors.error : Colors.primary} />
                  </View>
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockName}>{item.name}</Text>
                    <Text style={styles.stockCategory}>{item.category}</Text>
                  </View>
                </View>
                {isLowStock && (
                  <View style={styles.alertBadge}>
                    <AlertTriangle size={16} color={Colors.error} />
                  </View>
                )}
              </View>

              <View style={styles.stockDetails}>
                <View style={styles.stockDetailItem}>
                  <Text style={styles.stockDetailLabel}>Estoque Atual</Text>
                  <Text style={[styles.stockDetailValue, isLowStock && { color: Colors.error }]}>
                    {item.currentStock.toLocaleString('pt-BR')} {item.unit}
                  </Text>
                </View>
                <View style={styles.stockDivider} />
                <View style={styles.stockDetailItem}>
                  <Text style={styles.stockDetailLabel}>Valor Médio</Text>
                  <Text style={styles.stockDetailValue}>
                    R$ {item.avgCost.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.stockDivider} />
                <View style={styles.stockDetailItem}>
                  <Text style={styles.stockDetailLabel}>Valor Total</Text>
                  <Text style={styles.stockDetailValue}>
                    R$ {(item.currentStock * item.avgCost).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>

              {item.minStock > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(stockPercentage, 100)}%`,
                          backgroundColor: isLowStock ? Colors.error : Colors.success
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, isLowStock && { color: Colors.error }]}>
                    Mínimo: {item.minStock.toLocaleString('pt-BR')} {item.unit}
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
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
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
    marginBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stockCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
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
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stockIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  stockCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  alertBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stockDetailItem: {
    flex: 1,
  },
  stockDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  stockDetailLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 6,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  stockDetailValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  progressSection: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
