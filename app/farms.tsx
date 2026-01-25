import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, MapPin, Ruler, MoreVertical, X, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { Farm } from '@/types';

const STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

export default function FarmsScreen() {
  const { farms = [] } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    city: '',
    state: 'SP',
    area: '',
  });

  const mockFarms: Farm[] = [];

  const displayFarms = farms.length > 0 ? farms : mockFarms;

  const filteredFarms = displayFarms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalArea = displayFarms.reduce((sum, f) => sum + (f.area || 0), 0);
  const isWeb = Platform.OS === 'web';

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Informe o nome da fazenda');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erro', 'Informe a cidade');
      return;
    }
    if (!formData.area.trim()) {
      Alert.alert('Erro', 'Informe a área');
      return;
    }

    Alert.alert('Sucesso', 'Fazenda cadastrada com sucesso!');
    setShowModal(false);
    setFormData({ name: '', cpfCnpj: '', city: '', state: 'SP', area: '' });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Fazendas</Text>
            <Text style={styles.subtitle}>
              {displayFarms.length} propriedades • {totalArea.toLocaleString('pt-BR')} ha
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: Colors.primary, borderLeftWidth: 4 }]}>
            <Text style={styles.statLabel}>Propriedades</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{displayFarms.length}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.success, borderLeftWidth: 4 }]}>
            <Text style={styles.statLabel}>Área Total</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {totalArea.toLocaleString('pt-BR')} ha
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar fazendas..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {filteredFarms.map((farm) => (
            <TouchableOpacity key={farm.id} style={styles.farmCard} activeOpacity={0.7}>
              <View style={styles.farmIcon}>
                <MapPin size={24} color={Colors.primary} />
              </View>
              <View style={styles.farmInfo}>
                <Text style={styles.farmName}>{farm.name}</Text>
                <Text style={styles.farmLocation}>{`${farm.city} - ${farm.state}`}</Text>
                <View style={styles.farmMeta}>
                  <Ruler size={14} color={Colors.textSecondary} />
                  <Text style={styles.farmSize}>{farm.area.toLocaleString('pt-BR')} hectares</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  Alert.alert(farm.name, 'Escolha uma ação', [
                    {
                      text: 'Ver Detalhes',
                      onPress: () => router.push(`/farm-details?id=${farm.id}` as any),
                    },
                    {
                      text: 'Editar',
                      onPress: () => Alert.alert('Em breve', 'Edição de fazenda será implementada'),
                    },
                    { text: 'Ver Talhões', onPress: () => router.push('/fields') },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: () =>
                        Alert.alert('Confirmar', `Deseja excluir "${farm.name}"?`, [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Excluir',
                            style: 'destructive',
                            onPress: () => Alert.alert('Sucesso', 'Fazenda excluída'),
                          },
                        ]),
                    },
                    { text: 'Cancelar', style: 'cancel' },
                  ]);
                }}
              >
                <MoreVertical size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {filteredFarms.length === 0 && (
            <View style={styles.emptyState}>
              <MapPin size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhuma fazenda encontrada</Text>
              <Text style={styles.emptySubtitle}>Adicione sua primeira propriedade</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowModal(true)}>
                <Plus size={18} color={Colors.white} />
                <Text style={styles.emptyButtonText}>Nova Fazenda</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Nova Fazenda */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Nova Fazenda</Text>
                  <Text style={styles.modalSubtitle}>Cadastre uma nova propriedade rural</Text>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nome da Fazenda *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Fazenda São João"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>CNPJ/CPF</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.cpfCnpj}
                    onChangeText={(text) => setFormData({ ...formData, cpfCnpj: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 2 }]}>
                    <Text style={styles.formLabel}>Cidade *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Nome da cidade"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.city}
                      onChangeText={(text) => setFormData({ ...formData, city: text })}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>UF *</Text>
                    <TouchableOpacity
                      style={styles.formSelect}
                      onPress={() => setShowStateModal(true)}
                    >
                      <Text style={styles.formSelectText}>{formData.state}</Text>
                      <ChevronRight size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Área Total (hectares) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.area}
                    onChangeText={(text) => setFormData({ ...formData, area: text })}
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                  <Text style={styles.primaryButtonText}>Cadastrar Fazenda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setFormData({ name: '', cpfCnpj: '', city: '', state: 'SP', area: '' });
                    setShowModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Seleção de Estado */}
        <Modal
          visible={showStateModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowStateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione o Estado</Text>
                <TouchableOpacity
                  onPress={() => setShowStateModal(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                {STATES.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateOption,
                      formData.state === state && styles.stateOptionActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, state });
                      setShowStateModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.stateOptionText,
                        formData.state === state && styles.stateOptionTextActive,
                      ]}
                    >
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  title: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  statValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchBar: {
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
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  list: { flex: 1, paddingHorizontal: 24 },
  farmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  farmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  farmInfo: { flex: 1 },
  farmName: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  farmLocation: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  farmMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  farmSize: { fontSize: 13, color: Colors.textSecondary },
  moreButton: { padding: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  closeButton: { padding: 8 },
  modalBody: { padding: 20 },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
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
  formRow: { flexDirection: 'row', gap: 12 },
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
  formSelectText: { fontSize: 15, color: Colors.textPrimary },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  stateOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stateOptionActive: { backgroundColor: Colors.primary + '15' },
  stateOptionText: { fontSize: 16, color: Colors.textPrimary },
  stateOptionTextActive: { color: Colors.primary, fontWeight: '600' },
});
