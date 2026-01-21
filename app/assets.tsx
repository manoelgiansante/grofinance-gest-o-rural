import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Tractor,
  Package,
  Building2,
  Search,
  Filter,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

type Asset = {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_value: number;
  current_value: number;
  depreciation_rate: number;
  farm_id?: string;
  notes?: string;
};

const categories = [
  { id: 'machinery', label: 'Maquinário', icon: Tractor },
  { id: 'equipment', label: 'Equipamentos', icon: Package },
  { id: 'infrastructure', label: 'Infraestrutura', icon: Building2 },
];

export default function AssetsScreen() {
  const isWeb = Platform.OS === 'web';
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('machinery');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchaseValue, setFormPurchaseValue] = useState('');
  const [formDepreciationRate, setFormDepreciationRate] = useState('10');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAssets();
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
  const totalPurchaseValue = assets.reduce((sum, asset) => sum + (asset.purchase_value || 0), 0);
  const totalDepreciation = totalPurchaseValue - totalValue;

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.icon || Package;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.label || category;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const openAddModal = () => {
    setEditingAsset(null);
    setFormName('');
    setFormCategory('machinery');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormPurchaseValue('');
    setFormDepreciationRate('10');
    setFormNotes('');
    setIsModalVisible(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormCategory(asset.category);
    setFormPurchaseDate(asset.purchase_date);
    setFormPurchaseValue(asset.purchase_value.toString());
    setFormDepreciationRate(asset.depreciation_rate.toString());
    setFormNotes(asset.notes || '');
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName || !formPurchaseValue) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const purchaseValue = parseFloat(formPurchaseValue);
    const depreciationRate = parseFloat(formDepreciationRate) / 100;

    // Calculate depreciation based on years since purchase
    const purchaseDate = new Date(formPurchaseDate);
    const now = new Date();
    const yearsOwned = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const currentValue = Math.max(0, purchaseValue * Math.pow(1 - depreciationRate, yearsOwned));

    const assetData = {
      name: formName,
      category: formCategory,
      purchase_date: formPurchaseDate,
      purchase_value: purchaseValue,
      current_value: currentValue,
      depreciation_rate: parseFloat(formDepreciationRate),
      notes: formNotes,
    };

    try {
      if (editingAsset) {
        await api.updateAsset(editingAsset.id, assetData);
      } else {
        await api.createAsset(assetData);
      }
      setIsModalVisible(false);
      loadAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      Alert.alert('Erro', 'Não foi possível salvar o ativo');
    }
  };

  const handleDelete = (asset: Asset) => {
    Alert.alert('Confirmar Exclusão', `Deseja realmente excluir "${asset.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteAsset(asset.id);
            loadAssets();
          } catch (error) {
            console.error('Error deleting asset:', error);
            Alert.alert('Erro', 'Não foi possível excluir o ativo');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Ativos</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary + '15' }]}>
              <Text style={[styles.statLabel, { color: Colors.primary }]}>Valor Total</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {formatCurrency(totalValue)}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
              <Text style={[styles.statLabel, { color: Colors.warning }]}>Depreciação</Text>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {formatCurrency(totalDepreciation)}
              </Text>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar ativos..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(isActive ? null : category.id)}
                >
                  <Icon size={16} color={isActive ? '#fff' : Colors.textSecondary} />
                  <Text
                    style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Assets List */}
          <View style={styles.assetsList}>
            {filteredAssets.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>Nenhum ativo encontrado</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={openAddModal}>
                  <Plus size={20} color="#fff" />
                  <Text style={styles.emptyStateButtonText}>Adicionar Ativo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredAssets.map((asset) => {
                const Icon = getCategoryIcon(asset.category);
                const depreciation = asset.purchase_value - asset.current_value;
                const depreciationPercent = ((depreciation / asset.purchase_value) * 100).toFixed(
                  1
                );

                return (
                  <View key={asset.id} style={styles.assetCard}>
                    <View style={styles.assetHeader}>
                      <View style={styles.assetIconContainer}>
                        <Icon size={24} color={Colors.primary} />
                      </View>
                      <View style={styles.assetInfo}>
                        <Text style={styles.assetName}>{asset.name}</Text>
                        <Text style={styles.assetCategory}>{getCategoryLabel(asset.category)}</Text>
                      </View>
                      <View style={styles.assetActions}>
                        <TouchableOpacity
                          onPress={() => openEditModal(asset)}
                          style={styles.actionButton}
                        >
                          <Edit2 size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(asset)}
                          style={styles.actionButton}
                        >
                          <Trash2 size={18} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.assetDetails}>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.assetDetailLabel}>Valor Compra</Text>
                        <Text style={styles.assetDetailValue}>
                          {formatCurrency(asset.purchase_value)}
                        </Text>
                      </View>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.assetDetailLabel}>Valor Atual</Text>
                        <Text style={[styles.assetDetailValue, { color: Colors.primary }]}>
                          {formatCurrency(asset.current_value)}
                        </Text>
                      </View>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.assetDetailLabel}>Depreciação</Text>
                        <Text style={[styles.assetDetailValue, { color: Colors.warning }]}>
                          {depreciationPercent}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nome *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Trator John Deere"
                    placeholderTextColor={Colors.textSecondary}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Categoria</Text>
                  <View style={styles.categoryOptions}>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formCategory === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryOption,
                            isSelected && styles.categoryOptionSelected,
                          ]}
                          onPress={() => setFormCategory(cat.id)}
                        >
                          <Icon size={20} color={isSelected ? '#fff' : Colors.textSecondary} />
                          <Text
                            style={[
                              styles.categoryOptionText,
                              isSelected && styles.categoryOptionTextSelected,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Data Compra</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="AAAA-MM-DD"
                      placeholderTextColor={Colors.textSecondary}
                      value={formPurchaseDate}
                      onChangeText={setFormPurchaseDate}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Valor Compra *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0.00"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formPurchaseValue}
                      onChangeText={setFormPurchaseValue}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Taxa Depreciação Anual (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="10"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={formDepreciationRate}
                    onChangeText={setFormDepreciationRate}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Observações</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Informações adicionais..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formNotes}
                    onChangeText={setFormNotes}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalButtonSaveText}>Salvar</Text>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  assetsList: {
    gap: 12,
  },
  assetCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  assetCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetDetails: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  assetDetailItem: {
    flex: 1,
  },
  assetDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  assetDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
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
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.background,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
