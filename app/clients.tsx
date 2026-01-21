import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Users, Building2, User, X, ChevronRight } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";
import { useState } from "react";

export default function ClientsScreen() {
  const { clients } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'legal'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    type: 'physical' as 'physical' | 'legal',
    email: '',
    phone: '',
    city: '',
    state: 'SP',
  });

  const filteredClients = clients.filter(client => {
    if (filterType !== 'all' && client.type !== filterType) return false;
    if (!searchQuery) return true;
    return (
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cpfCnpj.includes(searchQuery)
    );
  });

  const totalActive = clients.filter(c => c.active).length;
  const totalPhysical = clients.filter(c => c.type === 'physical').length;
  const totalLegal = clients.filter(c => c.type === 'legal').length;

  const isWeb = Platform.OS === 'web';

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Informe o nome do cliente');
      return;
    }
    if (!formData.cpfCnpj.trim()) {
      Alert.alert('Erro', 'Informe o CPF/CNPJ');
      return;
    }
    
    Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
    setShowModal(false);
    setFormData({ name: '', cpfCnpj: '', type: 'physical', email: '', phone: '', city: '', state: 'SP' });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Clientes</Text>
            <Text style={styles.subtitle}>Cadastro de Clientes</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, isWeb && styles.statsRowWeb]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Ativos</Text>
            <Text style={styles.statValue}>{totalActive}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pessoa Física</Text>
            <Text style={[styles.statValue, { color: Colors.info }]}>{totalPhysical}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pessoa Jurídica</Text>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{totalLegal}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {['all', 'physical', 'legal'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.filterChipActive]}
              onPress={() => setFilterType(type as any)}
            >
              <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                {type === 'all' ? 'Todos' : type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar clientes..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
              <Text style={styles.emptySubtitle}>Adicione um novo cliente para começar</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowModal(true)}
              >
                <Plus size={18} color={Colors.white} />
                <Text style={styles.emptyButtonText}>Novo Cliente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredClients.map((client) => {
              const Icon = client.type === 'physical' ? User : Building2;
              
              return (
                <TouchableOpacity 
                  key={client.id}
                  style={styles.clientCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.clientHeader}>
                    <View style={styles.clientIconContainer}>
                      <View style={[styles.clientIcon, { backgroundColor: client.type === 'physical' ? Colors.info + '20' : Colors.accent + '20' }]}>
                        <Icon size={20} color={client.type === 'physical' ? Colors.info : Colors.accent} />
                      </View>
                      <View style={styles.clientNameContainer}>
                        <Text style={styles.clientName}>{client.name}</Text>
                        <Text style={styles.clientCpfCnpj}>{client.cpfCnpj}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: client.active ? Colors.success : Colors.error }]} />
                  </View>

                  {(client.email || client.phone) && (
                    <View style={styles.clientInfo}>
                      {client.email && <Text style={styles.clientInfoText}>{client.email}</Text>}
                      {client.phone && <Text style={styles.clientInfoText}>{client.phone}</Text>}
                    </View>
                  )}

                  {client.city && client.state && (
                    <View style={styles.clientLocation}>
                      <Text style={styles.clientLocationText}>{client.city}, {client.state}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Novo Cliente */}
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
                  <Text style={styles.modalTitle}>Novo Cliente</Text>
                  <Text style={styles.modalSubtitle}>Cadastre um novo cliente</Text>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <X size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Tipo de Pessoa */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tipo de Pessoa *</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[styles.typeOption, formData.type === 'physical' && styles.typeOptionActive]}
                      onPress={() => setFormData({...formData, type: 'physical'})}
                    >
                      <User size={18} color={formData.type === 'physical' ? Colors.white : Colors.textSecondary} />
                      <Text style={[styles.typeOptionText, formData.type === 'physical' && styles.typeOptionTextActive]}>
                        Pessoa Física
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.typeOption, formData.type === 'legal' && styles.typeOptionActive]}
                      onPress={() => setFormData({...formData, type: 'legal'})}
                    >
                      <Building2 size={18} color={formData.type === 'legal' ? Colors.white : Colors.textSecondary} />
                      <Text style={[styles.typeOptionText, formData.type === 'legal' && styles.typeOptionTextActive]}>
                        Pessoa Jurídica
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>{formData.type === 'physical' ? 'Nome Completo' : 'Razão Social'} *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={formData.type === 'physical' ? 'Nome do cliente' : 'Razão social da empresa'}
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>{formData.type === 'physical' ? 'CPF' : 'CNPJ'} *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={formData.type === 'physical' ? '000.000.000-00' : '00.000.000/0000-00'}
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.cpfCnpj}
                    onChangeText={(text) => setFormData({...formData, cpfCnpj: text})}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>E-mail</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="email@exemplo.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Telefone</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 2 }]}>
                    <Text style={styles.formLabel}>Cidade</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Nome da cidade"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.city}
                      onChangeText={(text) => setFormData({...formData, city: text})}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>UF</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="SP"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.state}
                      onChangeText={(text) => setFormData({...formData, state: text})}
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                  <Text style={styles.primaryButtonText}>Cadastrar Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowModal(false)}>
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
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  addButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: Colors.shadowMedium, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 20 },
  statsRowWeb: { flexWrap: 'wrap' },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.white },
  searchContainer: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, gap: 12, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, letterSpacing: 0.2 },
  list: { flex: 1, paddingHorizontal: 24 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  emptyButtonText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  clientCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: Colors.border, elevation: 2, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4 },
  clientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clientIconContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  clientIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  clientNameContainer: { flex: 1 },
  clientName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2, letterSpacing: -0.2 },
  clientCpfCnpj: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  clientInfo: { gap: 4, marginBottom: 8 },
  clientInfoText: { fontSize: 13, color: Colors.textSecondary },
  clientLocation: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  clientLocationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  closeButton: { padding: 8 },
  modalBody: { padding: 20 },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  formInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  formRow: { flexDirection: 'row', gap: 12 },
  typeSelector: { flexDirection: 'row', gap: 12 },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  typeOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  typeOptionTextActive: { color: Colors.white },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  secondaryButton: { backgroundColor: Colors.background, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
});
