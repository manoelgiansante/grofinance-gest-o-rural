import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Plus, Search, Package, AlertTriangle, X, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';

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

const mockStock: StockItem[] = [];

const categories = [
  'Alimentação',
  'Fertilizantes',
  'Combustível',
  'Sementes',
  'Defensivos',
  'Medicamentos',
  'Produção Animal',
  'Produção Vegetal',
  'Outros',
];

const units = ['kg', 'L', 'ton', 'cab', 'sc', 'un', 'm³'];

export default function StockScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'input' | 'production'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStock);
  const [formData, setFormData] = useState({
    name: '',
    type: 'input' as 'input' | 'production',
    category: '',
    currentStock: '',
    minStock: '',
    unit: '',
    avgCost: '',
  });

  const filteredStock = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalValue = stockItems.reduce((sum, item) => sum + item.currentStock * item.avgCost, 0);
  const lowStockCount = stockItems.filter(
    (item) => item.currentStock < item.minStock && item.minStock > 0
  ).length;

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'input',
      category: '',
      currentStock: '',
      minStock: '',
      unit: '',
      avgCost: '',
    });
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Informe o nome do item');
      return;
    }
    if (!formData.category) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }
    if (!formData.unit) {
      Alert.alert('Erro', 'Selecione uma unidade');
      return;
    }

    const newItem: StockItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      type: formData.type,
      category: formData.category,
      currentStock: parseFloat(formData.currentStock) || 0,
      minStock: parseFloat(formData.minStock) || 0,
      unit: formData.unit,
      avgCost: parseFloat(formData.avgCost) || 0,
    };

    setStockItems([newItem, ...stockItems]);
    setModalVisible(false);
    resetForm();
    Alert.alert('Sucesso', 'Item adicionado ao estoque!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Estoque',
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
          <Text
            style={[styles.statValue, { color: lowStockCount > 0 ? Colors.error : Colors.success }]}
          >
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
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedType('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.filterChipText, selectedType === 'all' && styles.filterChipTextActive]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'input' && styles.filterChipActive]}
          onPress={() => setSelectedType('input')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.filterChipText, selectedType === 'input' && styles.filterChipTextActive]}
          >
            Insumos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedType === 'production' && styles.filterChipActive]}
          onPress={() => setSelectedType('production')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedType === 'production' && styles.filterChipTextActive,
            ]}
          >
            Produção
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredStock.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Tente outra busca' : 'Toque no + para adicionar itens ao estoque'}
            </Text>
          </View>
        ) : (
          filteredStock.map((item) => {
            const isLowStock = item.minStock > 0 && item.currentStock < item.minStock;
            const stockPercentage =
              item.minStock > 0 ? (item.currentStock / item.minStock) * 100 : 100;

            return (
              <TouchableOpacity key={item.id} style={styles.stockCard} activeOpacity={0.7}>
                <View style={styles.stockHeader}>
                  <View style={styles.stockTitleRow}>
                    <View
                      style={[
                        styles.stockIcon,
                        {
                          backgroundColor: isLowStock ? Colors.error + '18' : Colors.primary + '18',
                        },
                      ]}
                    >
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
                    <Text style={styles.stockDetailValue}>R$ {item.avgCost.toFixed(2)}</Text>
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
                            backgroundColor: isLowStock ? Colors.error : Colors.success,
                          },
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
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal para adicionar item */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalContentWeb]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Item de Estoque</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Tipo */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tipo *</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'input' && styles.typeOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'input' })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'input' && styles.typeOptionTextActive,
                      ]}
                    >
                      Insumo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.type === 'production' && styles.typeOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'production' })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === 'production' && styles.typeOptionTextActive,
                      ]}
                    >
                      Produção
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nome */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nome *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Fertilizante NPK 20-05-20"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Categoria */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoria *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !formData.category && { color: Colors.textTertiary },
                    ]}
                  >
                    {formData.category || 'Selecione uma categoria'}
                  </Text>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={styles.pickerOptions}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.pickerOption,
                          formData.category === cat && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.category === cat && styles.pickerOptionTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Unidade */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Unidade *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text
                    style={[styles.selectText, !formData.unit && { color: Colors.textTertiary }]}
                  >
                    {formData.unit || 'Selecione uma unidade'}
                  </Text>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showUnitPicker && (
                  <View style={styles.pickerOptions}>
                    {units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.pickerOption,
                          formData.unit === u && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, unit: u });
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.unit === u && styles.pickerOptionTextActive,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formRow}>
                {/* Estoque Atual */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Estoque Atual</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.currentStock}
                    onChangeText={(text) => setFormData({ ...formData, currentStock: text })}
                    keyboardType="numeric"
                  />
                </View>

                {/* Estoque Mínimo */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Estoque Mínimo</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.minStock}
                    onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Custo Médio */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Custo Médio (R$)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.avgCost}
                  onChangeText={(text) => setFormData({ ...formData, avgCost: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalContentWeb: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 24,
    marginBottom: 20,
    maxHeight: '85%',
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerOptions: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary + '18',
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeOptionTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
