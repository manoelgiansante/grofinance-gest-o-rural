import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Supplier {
  id: string;
  name: string;
  cpfCnpj: string;
  type: 'physical' | 'legal';
  category: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  active: boolean;
  createdAt: Date;
}

export default function SuppliersScreen() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');

      if (error) {
        console.error('Error loading suppliers:', error);
        throw error;
      }

      if (!data) return [];

      return data.map(
        (s: any): Supplier => ({
          id: s.id,
          name: s.name,
          cpfCnpj: s.cpf_cnpj,
          type: s.type as any,
          category: s.category,
          email: s.email,
          phone: s.phone,
          address: s.address,
          city: s.city,
          state: s.state,
          active: s.active,
          createdAt: new Date(s.created_at),
        })
      );
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleDelete = (supplier: Supplier) => {
    if (Platform.OS === 'web') {
      if (confirm(`Deseja excluir ${supplier.name}?`)) {
        deleteSupplierMutation.mutate(supplier.id);
      }
    } else {
      Alert.alert('Excluir Fornecedor', `Deseja excluir ${supplier.name}?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteSupplierMutation.mutate(supplier.id),
        },
      ]);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cpfCnpj.includes(search) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = suppliers.filter((s) => s.active).length;
  const inactiveCount = suppliers.filter((s) => !s.active).length;

  const isWeb = Platform.OS === 'web';

  if (showForm) {
    return <SupplierForm supplier={editingSupplier} onClose={() => setShowForm(false)} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: 'Fornecedores',
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
              <Text style={styles.title}>Fornecedores</Text>
              <Text style={styles.subtitle}>{suppliers.length} cadastrados</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleNew} activeOpacity={0.7}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Ativos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{inactiveCount}</Text>
              <Text style={styles.statLabel}>Inativos</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome, CPF/CNPJ ou categoria"
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

            {!isLoading && filteredSuppliers.length === 0 && (
              <View style={styles.emptyState}>
                <Building2 size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {search ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
                </Text>
              </View>
            )}

            {filteredSuppliers.map((supplier) => (
              <View key={supplier.id} style={styles.supplierCard}>
                <View style={styles.supplierHeader}>
                  <View
                    style={[
                      styles.supplierIcon,
                      {
                        backgroundColor: supplier.active
                          ? Colors.primary + '15'
                          : Colors.textTertiary + '15',
                      },
                    ]}
                  >
                    {supplier.type === 'legal' ? (
                      <Building2
                        size={20}
                        color={supplier.active ? Colors.primary : Colors.textTertiary}
                      />
                    ) : (
                      <User
                        size={20}
                        color={supplier.active ? Colors.primary : Colors.textTertiary}
                      />
                    )}
                  </View>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    <Text style={styles.supplierDoc}>{supplier.cpfCnpj}</Text>
                  </View>
                  {!supplier.active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inativo</Text>
                    </View>
                  )}
                </View>

                <View style={styles.supplierDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{supplier.category}</Text>
                    </View>
                  </View>

                  {supplier.email && (
                    <View style={styles.detailRow}>
                      <Mail size={14} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{supplier.email}</Text>
                    </View>
                  )}

                  {supplier.phone && (
                    <View style={styles.detailRow}>
                      <Phone size={14} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{supplier.phone}</Text>
                    </View>
                  )}

                  {supplier.city && supplier.state && (
                    <View style={styles.detailRow}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {supplier.city} - {supplier.state}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.supplierActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(supplier)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={16} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleDelete(supplier)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={Colors.error} />
                    <Text style={[styles.actionButtonText, { color: Colors.error }]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SupplierForm({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    cpfCnpj: supplier?.cpfCnpj || '',
    type: supplier?.type || ('legal' as 'physical' | 'legal'),
    category: supplier?.category || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    active: supplier?.active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data: Record<string, any> = {
        name: formData.name,
        cpf_cnpj: formData.cpfCnpj,
        type: formData.type,
        category: formData.category,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        active: formData.active,
      };

      if (supplier) {
        const result = await (supabase.from('suppliers') as any).update(data).eq('id', supplier.id);
        if (result.error) throw result.error;
      } else {
        const result = await (supabase.from('suppliers') as any).insert(data);
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!formData.name || !formData.cpfCnpj || !formData.category) {
      if (Platform.OS === 'web') {
        alert('Preencha os campos obrigatórios');
      } else {
        Alert.alert('Erro', 'Preencha os campos obrigatórios');
      }
      return;
    }
    saveMutation.mutate();
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: supplier ? 'Editar Fornecedor' : 'Novo Fornecedor',
          headerLeft: () => (
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formScrollContent}
        >
          <View style={styles.formHeader}>
            <Text style={styles.title}>{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Nome *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nome do fornecedor"
              placeholderTextColor={Colors.textTertiary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={styles.formLabel}>Tipo *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formData.type === 'physical' && styles.typeOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'physical' })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'physical' && styles.typeOptionTextActive,
                    ]}
                  >
                    Pessoa Física
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, formData.type === 'legal' && styles.typeOptionActive]}
                  onPress={() => setFormData({ ...formData, type: 'legal' })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'legal' && styles.typeOptionTextActive,
                    ]}
                  >
                    Pessoa Jurídica
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={styles.formLabel}>CPF/CNPJ *</Text>
              <TextInput
                style={styles.formInput}
                placeholder={formData.type === 'physical' ? '000.000.000-00' : '00.000.000/0000-00'}
                placeholderTextColor={Colors.textTertiary}
                value={formData.cpfCnpj}
                onChangeText={(text) => setFormData({ ...formData, cpfCnpj: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Categoria *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Ex: Insumos, Equipamentos, Serviços"
              placeholderTextColor={Colors.textTertiary}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="email@exemplo.com"
              placeholderTextColor={Colors.textTertiary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput
              style={styles.formInput}
              placeholder="(00) 00000-0000"
              placeholderTextColor={Colors.textTertiary}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Endereço</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Rua, número, complemento"
              placeholderTextColor={Colors.textTertiary}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 2 }]}>
              <Text style={styles.formLabel}>Cidade</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Cidade"
                placeholderTextColor={Colors.textTertiary}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>

            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={styles.formLabel}>Estado</Text>
              <TextInput
                style={styles.formInput}
                placeholder="UF"
                placeholderTextColor={Colors.textTertiary}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text.toUpperCase() })}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, active: !formData.active })}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, formData.active && styles.checkboxActive]}>
                {formData.active && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.checkboxLabel}>Fornecedor ativo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonSecondary]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.formButtonTextSecondary}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.formButtonPrimary]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={saveMutation.isPending}
            >
              <Text style={styles.formButtonTextPrimary}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formScrollContent: {
    paddingHorizontal: 24,
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
  formHeader: {
    paddingTop: 24,
    paddingBottom: 20,
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
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
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
  supplierCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  supplierIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  supplierDoc: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  inactiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.textTertiary + '20',
    borderRadius: 8,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  supplierDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  supplierActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
  },
  actionButtonDanger: {
    backgroundColor: Colors.error + '10',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  formSection: {
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeOptionTextActive: {
    color: Colors.white,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  formButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  formButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
});
