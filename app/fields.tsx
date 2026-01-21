import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, TrendingUp, Sprout, Plus, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router, Stack } from 'expo-router';

const mockFields: {
  id: string;
  name: string;
  area: number;
  crop: string;
  grossMargin: number;
  marginPerHa: number;
  status: 'active' | 'planning' | 'inactive';
  roi: number;
}[] = [];

const totalArea = mockFields.reduce((acc, f) => acc + f.area, 0);
const totalMargin = mockFields.reduce((acc, f) => acc + f.grossMargin, 0);
const avgMarginPerHa = totalArea > 0 ? totalMargin / totalArea : 0;

export default function FieldsScreen() {
  const isWeb = Platform.OS === 'web';

  const getStatusColor = (status: string) => {
    if (status === 'active') return Colors.success;
    if (status === 'planning') return Colors.warning;
    return Colors.textSecondary;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Em produção';
    if (status === 'planning') return 'Planejamento';
    return 'Inativo';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Talhões & Rentabilidade', headerShown: true }} />
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo de Rentabilidade</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Área Total</Text>
                <Text style={styles.summaryValue}>{totalArea} ha</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Margem Bruta Total</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  R$ {totalMargin.toLocaleString('pt-BR')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Margem/ha Média</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                  R$ {avgMarginPerHa.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Todos os Talhões</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-field' as any)}
            >
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addButtonText}>Novo Talhão</Text>
            </TouchableOpacity>
          </View>

          {mockFields.map((field) => (
            <TouchableOpacity
              key={field.id}
              style={styles.fieldCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/field-details?id=${field.id}` as any)}
            >
              <View style={styles.fieldHeader}>
                <View style={styles.fieldTitle}>
                  <MapPin size={20} color={Colors.primary} />
                  <Text style={styles.fieldName}>{field.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(field.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(field.status) }]}>
                      {getStatusLabel(field.status)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </View>

              <View style={styles.fieldInfo}>
                <View style={styles.infoItem}>
                  <Sprout size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoLabel}>{field.crop}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValue}>{field.area} ha</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Margem Bruta</Text>
                  <Text style={[styles.metricValue, { color: Colors.success }]}>
                    R$ {field.grossMargin.toLocaleString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Margem/ha</Text>
                  <Text style={[styles.metricValue, { color: Colors.primary }]}>
                    R$ {field.marginPerHa.toLocaleString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>ROI</Text>
                  <View style={styles.roiContainer}>
                    <TrendingUp size={14} color={Colors.success} />
                    <Text style={[styles.metricValue, { color: Colors.success, fontSize: 16 }]}>
                      {field.roi}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 20,
  },
  summaryGrid: {
    gap: 16,
  },
  summaryItem: {
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.85,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  fieldCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fieldName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  fieldInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
