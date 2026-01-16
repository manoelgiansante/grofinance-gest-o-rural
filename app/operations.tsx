import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ArrowLeft, Search, Plus, Sprout, Edit2, Trash2, DollarSign } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Operation {
  id: string;
  name: string;
  type: 'confinamento' | 'cana' | 'compostagem' | 'sede' | 'other';
  color: string;
  icon: string;
  budget: number;
  spent: number;
}

const OPERATION_TYPES = [
  { value: 'confinamento', label: 'Confinamento' },
  { value: 'cana', label: 'Cana-de-açúcar' },
  { value: 'compostagem', label: 'Compostagem' },
  { value: 'sede', label: 'Sede/Administrativo' },
  { value: 'other', label: 'Outro' },
] as const;

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

export default function OperationsScreen() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const queryClient = useQueryClient();

  const { data: operations = [], isLoading } = useQuery<Operation[]>({
    queryKey: ['operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading operations:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map((op: any): Operation => ({
        id: op.id,
        name: op.name,
        type: op.type as any,
        color: op.color || '#000',
        icon: op.icon || 'circle',
        budget: op.budget || 0,
        spent: op.spent || 0,
      }));
    },
  });

  const deleteOperationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('operations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const handleDelete = (operation: Operation) => {
    if (Platform.OS === 'web') {
      if (confirm(`Deseja excluir ${operation.name}?`)) {
        deleteOperationMutation.mutate(operation.id);
      }
    } else {
      Alert.alert(
        'Excluir Operação',
        `Deseja excluir ${operation.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => deleteOperationMutation.mutate(operation.id)
          },
        ]
      );
    }
  };

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingOperation(null);
    setShowForm(true);
  };

  const filteredOperations = operations.filter(op => 
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    op.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudget = operations.reduce((sum, op) => sum + op.budget, 0);
  const totalSpent = operations.reduce((sum, op) => sum + op.spent, 0);

  const isWeb = Platform.OS === 'web';

  if (showForm) {
    return <OperationForm operation={editingOperation} onClose={() => setShowForm(false)} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: "Operações",
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
              <Text style={styles.title}>Operações</Text>
              <Text style={styles.subtitle}>{operations.length} cadastradas</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleNew} activeOpacity={0.7}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Nova</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Orçamento Total</Text>
              <Text style={styles.statValue}>R$ {totalBudget.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Realizado</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                R$ {totalSpent.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar operação"
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {isLoading && <Text style={styles.emptyText}>Carregando...</Text>}
            
            {!isLoading && filteredOperations.length === 0 && (
              <View style={styles.emptyState}>
                <Sprout size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {search ? 'Nenhuma operação encontrada' : 'Nenhuma operação cadastrada'}
                </Text>
              </View>
            )}

            {filteredOperations.map((operation) => {
              const budgetUsage = operation.budget > 0 ? (operation.spent / operation.budget) * 100 : 0;
              const isOverBudget = budgetUsage > 100;

              return (
                <View key={operation.id} style={styles.operationCard}>
                  <View style={styles.operationHeader}>
                    <View style={[styles.operationIcon, { backgroundColor: operation.color + '20' }]}>
                      <Text style={[styles.operationIconText, { color: operation.color }]}>
                        {operation.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.operationInfo}>
                      <Text style={styles.operationName}>{operation.name}</Text>
                      <Text style={styles.operationType}>
                        {OPERATION_TYPES.find(t => t.value === operation.type)?.label || operation.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.operationDetails}>
                    <View style={styles.budgetRow}>
                      <View style={styles.budgetItem}>
                        <Text style={styles.budgetLabel}>Orçamento</Text>
                        <Text style={styles.budgetValue}>
                          R$ {operation.budget.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                      <View style={styles.budgetItem}>
                        <Text style={styles.budgetLabel}>Realizado</Text>
                        <Text style={[styles.budgetValue, { color: isOverBudget ? Colors.error : Colors.primary }]}>
                          R$ {operation.spent.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                    </View>

                    {operation.budget > 0 && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${Math.min(budgetUsage, 100)}%`,
                                backgroundColor: isOverBudget ? Colors.error : Colors.primary
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.progressText, isOverBudget && { color: Colors.error }]}>
                          {budgetUsage.toFixed(1)}% do orçamento
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.operationActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(operation)}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={16} color={Colors.primary} />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonDanger]}
                      onPress={() => handleDelete(operation)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={Colors.error} />
                      <Text style={[styles.actionButtonText, { color: Colors.error }]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

function OperationForm({ operation, onClose }: { operation: Operation | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: operation?.name || '',
    type: operation?.type || 'other' as Operation['type'],
    color: operation?.color || PRESET_COLORS[0],
    budget: operation?.budget?.toString() || '0',
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data: Record<string, any> = {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        budget: parseFloat(formData.budget) || 0,
        icon: 'circle',
      };

      if (operation) {
        const result = await (supabase.from('operations') as any).update(data).eq('id', operation.id);
        if (result.error) throw result.error;
      } else {
        data.spent = 0;
        const result = await (supabase.from('operations') as any).insert(data);
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!formData.name) {
      if (Platform.OS === 'web') {
        alert('Preencha o nome da operação');
      } else {
        Alert.alert('Erro', 'Preencha o nome da operação');
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
          title: operation ? "Editar Operação" : "Nova Operação",
          headerLeft: () => (
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollContent}>
          <View style={styles.formHeader}>
            <Text style={styles.title}>{operation ? 'Editar Operação' : 'Nova Operação'}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Nome *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Ex: Confinamento Norte, Lavoura de Soja"
              placeholderTextColor={Colors.textTertiary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Tipo *</Text>
            <View style={styles.typeGrid}>
              {OPERATION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeCard, formData.type === type.value && styles.typeCardActive]}
                  onPress={() => setFormData({ ...formData, type: type.value as Operation['type'] })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeCardText, formData.type === type.value && styles.typeCardTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Cor</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.color === color && styles.colorOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, color })}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Orçamento Anual</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.formInputWithIcon}
                placeholder="0,00"
                placeholderTextColor={Colors.textTertiary}
                value={formData.budget}
                onChangeText={(text) => setFormData({ ...formData, budget: text.replace(/[^0-9,.]/g, '') })}
                keyboardType="numeric"
              />
            </View>
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
  operationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  operationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationIconText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  operationInfo: {
    flex: 1,
  },
  operationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  operationType: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  operationDetails: {
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  budgetItem: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
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
  operationActions: {
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeCardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeCardTextActive: {
    color: Colors.white,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: Colors.textPrimary,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formInputWithIcon: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
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
