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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Cloud,
  Droplets,
  Thermometer,
  Camera,
  Edit2,
  Trash2,
  X,
  Filter,
  Search,
  Leaf,
  Bug,
  Pill,
  Tractor,
  SunMedium,
  CloudRain,
  Wind,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { api } from '@/lib/api';

type FieldEntry = {
  id: string;
  date: string;
  farm_id?: string;
  farm_name?: string;
  sector?: string;
  activity_type: string;
  description: string;
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
    wind_speed?: number;
  };
  observations?: string;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
};

const activityTypes = [
  { id: 'planting', label: 'Plantio', icon: Leaf, color: '#4CAF50' },
  { id: 'fertilizing', label: 'Adubação', icon: Pill, color: '#FF9800' },
  { id: 'spraying', label: 'Pulverização', icon: Bug, color: '#F44336' },
  { id: 'harvesting', label: 'Colheita', icon: Tractor, color: '#2196F3' },
  { id: 'irrigation', label: 'Irrigação', icon: Droplets, color: '#00BCD4' },
  { id: 'inspection', label: 'Vistoria', icon: Search, color: '#9C27B0' },
  { id: 'other', label: 'Outros', icon: Calendar, color: '#607D8B' },
];

const weatherConditions = [
  { id: 'sunny', label: 'Ensolarado', icon: SunMedium },
  { id: 'cloudy', label: 'Nublado', icon: Cloud },
  { id: 'rainy', label: 'Chuvoso', icon: CloudRain },
  { id: 'windy', label: 'Ventoso', icon: Wind },
];

export default function FieldNotebookScreen() {
  const isWeb = Platform.OS === 'web';
  const [entries, setEntries] = useState<FieldEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FieldEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [farms, setFarms] = useState<any[]>([]);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formFarmId, setFormFarmId] = useState('');
  const [formSector, setFormSector] = useState('');
  const [formActivityType, setFormActivityType] = useState('inspection');
  const [formDescription, setFormDescription] = useState('');
  const [formWeatherCondition, setFormWeatherCondition] = useState('sunny');
  const [formTemperature, setFormTemperature] = useState('');
  const [formHumidity, setFormHumidity] = useState('');
  const [formObservations, setFormObservations] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entriesData, farmsData] = await Promise.all([
        api.getFieldNotebookEntries(),
        api.getFarms(),
      ]);
      setEntries(entriesData || []);
      setFarms(farmsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.farm_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || entry.activity_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getActivityConfig = (type: string) => {
    return activityTypes.find((a) => a.id === type) || activityTypes[activityTypes.length - 1];
  };

  const getWeatherIcon = (condition: string) => {
    return weatherConditions.find((w) => w.id === condition)?.icon || Cloud;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormFarmId('');
    setFormSector('');
    setFormActivityType('inspection');
    setFormDescription('');
    setFormWeatherCondition('sunny');
    setFormTemperature('');
    setFormHumidity('');
    setFormObservations('');
    setIsModalVisible(true);
  };

  const openEditModal = (entry: FieldEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormFarmId(entry.farm_id || '');
    setFormSector(entry.sector || '');
    setFormActivityType(entry.activity_type);
    setFormDescription(entry.description);
    setFormWeatherCondition(entry.weather?.condition || 'sunny');
    setFormTemperature(entry.weather?.temperature?.toString() || '');
    setFormHumidity(entry.weather?.humidity?.toString() || '');
    setFormObservations(entry.observations || '');
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formDescription) {
      Alert.alert('Erro', 'Preencha a descrição da atividade');
      return;
    }

    const selectedFarm = farms.find((f) => f.id === formFarmId);

    const entryData = {
      date: formDate,
      farm_id: formFarmId || null,
      farm_name: selectedFarm?.name || null,
      sector: formSector || null,
      activity_type: formActivityType,
      description: formDescription,
      weather: {
        condition: formWeatherCondition,
        temperature: parseFloat(formTemperature) || null,
        humidity: parseFloat(formHumidity) || null,
      },
      observations: formObservations || null,
    };

    try {
      if (editingEntry) {
        await api.updateFieldNotebookEntry(editingEntry.id, entryData);
      } else {
        await api.createFieldNotebookEntry(entryData);
      }
      setIsModalVisible(false);
      loadData();
      Alert.alert('Sucesso', editingEntry ? 'Registro atualizado!' : 'Registro criado!');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro');
    }
  };

  const handleDelete = (entry: FieldEntry) => {
    Alert.alert('Confirmar Exclusão', 'Deseja realmente excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteFieldNotebookEntry(entry.id);
            loadData();
          } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Erro', 'Não foi possível excluir o registro');
          }
        },
      },
    ]);
  };

  // Group entries by date
  const groupedEntries = filteredEntries.reduce(
    (groups, entry) => {
      const date = entry.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
      return groups;
    },
    {} as Record<string, FieldEntry[]>
  );

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Caderno de Campo</Text>
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary + '15' }]}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.success + '15' }]}>
              <Leaf size={20} color={Colors.success} />
              <Text style={styles.statValue}>
                {entries.filter((e) => e.activity_type === 'planting').length}
              </Text>
              <Text style={styles.statLabel}>Plantios</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
              <Bug size={20} color={Colors.warning} />
              <Text style={styles.statValue}>
                {entries.filter((e) => e.activity_type === 'spraying').length}
              </Text>
              <Text style={styles.statLabel}>Pulverizações</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar registros..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Activity Type Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedType && styles.filterChipActive]}
              onPress={() => setSelectedType(null)}
            >
              <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {activityTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.filterChip, isActive && { backgroundColor: type.color }]}
                  onPress={() => setSelectedType(isActive ? null : type.id)}
                >
                  <Icon size={16} color={isActive ? '#fff' : type.color} />
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Entries by Date */}
          {sortedDates.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Nenhum registro encontrado</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={openAddModal}>
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Novo Registro</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sortedDates.map((date) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {groupedEntries[date].map((entry) => {
                  const activity = getActivityConfig(entry.activity_type);
                  const ActivityIcon = activity.icon;
                  const WeatherIcon = getWeatherIcon(entry.weather?.condition || 'sunny');

                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.entryCard}
                      onPress={() => openEditModal(entry)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.activityBadge, { backgroundColor: activity.color }]}>
                        <ActivityIcon size={18} color="#fff" />
                      </View>
                      <View style={styles.entryContent}>
                        <View style={styles.entryHeader}>
                          <Text style={styles.entryActivity}>{activity.label}</Text>
                          {entry.weather && (
                            <View style={styles.weatherBadge}>
                              <WeatherIcon size={14} color={Colors.textSecondary} />
                              {entry.weather.temperature && (
                                <Text style={styles.weatherText}>
                                  {entry.weather.temperature}°C
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                        <Text style={styles.entryDescription} numberOfLines={2}>
                          {entry.description}
                        </Text>
                        {entry.farm_name && (
                          <View style={styles.entryLocation}>
                            <MapPin size={12} color={Colors.textSecondary} />
                            <Text style={styles.entryLocationText}>
                              {entry.farm_name}
                              {entry.sector ? ` - ${entry.sector}` : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(entry)}
                      >
                        <Trash2 size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEntry ? 'Editar Registro' : 'Novo Registro'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Date */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Data</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={Colors.textSecondary}
                    value={formDate}
                    onChangeText={setFormDate}
                  />
                </View>

                {/* Activity Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tipo de Atividade</Text>
                  <View style={styles.activityGrid}>
                    {activityTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formActivityType === type.id;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          style={[
                            styles.activityOption,
                            isSelected && { backgroundColor: type.color, borderColor: type.color },
                          ]}
                          onPress={() => setFormActivityType(type.id)}
                        >
                          <Icon size={20} color={isSelected ? '#fff' : type.color} />
                          <Text
                            style={[styles.activityOptionText, isSelected && { color: '#fff' }]}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descrição *</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Descreva a atividade realizada..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formDescription}
                    onChangeText={setFormDescription}
                  />
                </View>

                {/* Farm */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Fazenda</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.farmChip, !formFarmId && styles.farmChipActive]}
                      onPress={() => setFormFarmId('')}
                    >
                      <Text style={[styles.farmChipText, !formFarmId && styles.farmChipTextActive]}>
                        Nenhuma
                      </Text>
                    </TouchableOpacity>
                    {farms.map((farm) => (
                      <TouchableOpacity
                        key={farm.id}
                        style={[styles.farmChip, formFarmId === farm.id && styles.farmChipActive]}
                        onPress={() => setFormFarmId(farm.id)}
                      >
                        <Text
                          style={[
                            styles.farmChipText,
                            formFarmId === farm.id && styles.farmChipTextActive,
                          ]}
                        >
                          {farm.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Sector */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Talhão/Setor</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Talhão 1, Setor Norte..."
                    placeholderTextColor={Colors.textSecondary}
                    value={formSector}
                    onChangeText={setFormSector}
                  />
                </View>

                {/* Weather */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Condição Climática</Text>
                  <View style={styles.weatherGrid}>
                    {weatherConditions.map((weather) => {
                      const Icon = weather.icon;
                      const isSelected = formWeatherCondition === weather.id;
                      return (
                        <TouchableOpacity
                          key={weather.id}
                          style={[styles.weatherOption, isSelected && styles.weatherOptionSelected]}
                          onPress={() => setFormWeatherCondition(weather.id)}
                        >
                          <Icon
                            size={24}
                            color={isSelected ? Colors.primary : Colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.weatherOptionText,
                              isSelected && styles.weatherOptionTextSelected,
                            ]}
                          >
                            {weather.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Temperature and Humidity */}
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Temperatura (°C)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="25"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formTemperature}
                      onChangeText={setFormTemperature}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Umidade (%)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="60"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={formHumidity}
                      onChangeText={setFormHumidity}
                    />
                  </View>
                </View>

                {/* Observations */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Observações</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Observações adicionais..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formObservations}
                    onChangeText={setFormObservations}
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
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filtersScroll: {
    marginBottom: 20,
  },
  filterChip: {
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
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  entryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  entryLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryLocationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
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
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  activityOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  farmChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  farmChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  farmChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  farmChipTextActive: {
    color: '#fff',
  },
  weatherGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  weatherOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weatherOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  weatherOptionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weatherOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
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
