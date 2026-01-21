import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Plus,
  Search,
  FileText,
  Truck,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState } from 'react';
import { NFe, MDFe } from '@/types';

const mockNFes: NFe[] = [];

const mockMDFes: MDFe[] = [];

export default function FiscalScreen() {
  const [activeTab, setActiveTab] = useState<'nfe' | 'mdfe' | 'sefaz'>('nfe');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusInfo = (status: NFe['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Rascunho', color: Colors.textSecondary, icon: FileText };
      case 'processing':
        return { label: 'Processando', color: Colors.warning, icon: Clock };
      case 'authorized':
        return { label: 'Autorizada', color: Colors.success, icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelada', color: Colors.error, icon: XCircle };
      case 'denied':
        return { label: 'Denegada', color: Colors.error, icon: XCircle };
      default:
        return { label: status, color: Colors.textSecondary, icon: FileText };
    }
  };

  const filteredNFes = mockNFes.filter((nfe) => {
    if (!searchQuery) return true;
    return (
      nfe.number?.toString().includes(searchQuery) ||
      nfe.accessKey?.includes(searchQuery) ||
      nfe.nature.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Fiscal',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por número, chave ou natureza..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nfe' && styles.tabActive]}
          onPress={() => setActiveTab('nfe')}
          activeOpacity={0.7}
        >
          <FileText size={18} color={activeTab === 'nfe' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'nfe' && styles.tabTextActive]}>NF-e</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mdfe' && styles.tabActive]}
          onPress={() => setActiveTab('mdfe')}
          activeOpacity={0.7}
        >
          <Truck size={18} color={activeTab === 'mdfe' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'mdfe' && styles.tabTextActive]}>MDF-e</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sefaz' && styles.tabActive]}
          onPress={() => setActiveTab('sefaz')}
          activeOpacity={0.7}
        >
          <Download
            size={18}
            color={activeTab === 'sefaz' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'sefaz' && styles.tabTextActive]}>
            Importação SEFAZ
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'nfe' && (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/fiscal/nfe-wizard')}
                activeOpacity={0.7}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Emitir NF-e</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
                <Text style={styles.secondaryButtonText}>Importar XML</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas Fiscais</Text>
              {filteredNFes.map((nfe) => {
                const statusInfo = getStatusInfo(nfe.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <TouchableOpacity
                    key={nfe.id}
                    style={styles.nfeCard}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/fiscal/nfe-details?id=${nfe.id}`)}
                  >
                    <View style={styles.nfeHeader}>
                      <View style={styles.nfeNumberBadge}>
                        <Text style={styles.nfeNumber}>NF-e {nfe.number}</Text>
                        <Text style={styles.nfeSeries}>Série {nfe.series}</Text>
                      </View>
                      <View
                        style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}
                      >
                        <StatusIcon size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.nfeNature} numberOfLines={1}>
                      {nfe.nature}
                    </Text>

                    <View style={styles.nfeDetails}>
                      <View style={styles.nfeDetailItem}>
                        <Text style={styles.nfeDetailLabel}>CFOP</Text>
                        <Text style={styles.nfeDetailValue}>{nfe.cfop}</Text>
                      </View>
                      <View style={styles.nfeDivider} />
                      <View style={styles.nfeDetailItem}>
                        <Text style={styles.nfeDetailLabel}>Valor Total</Text>
                        <Text style={styles.nfeDetailValue}>
                          R$ {nfe.totalValue.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                      <View style={styles.nfeDivider} />
                      <View style={styles.nfeDetailItem}>
                        <Text style={styles.nfeDetailLabel}>Data</Text>
                        <Text style={styles.nfeDetailValue}>
                          {nfe.issueDate.toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    </View>

                    {nfe.accessKey && (
                      <View style={styles.accessKeyContainer}>
                        <Text style={styles.accessKeyLabel}>Chave de Acesso</Text>
                        <Text style={styles.accessKeyValue}>{nfe.accessKey}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {activeTab === 'mdfe' && (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/fiscal/mdfe-wizard' as any)}
                activeOpacity={0.7}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Emitir MDF-e</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manifestos de Documento Fiscal</Text>
              {mockMDFes.map((mdfe) => (
                <TouchableOpacity key={mdfe.id} style={styles.nfeCard} activeOpacity={0.7}>
                  <View style={styles.nfeHeader}>
                    <View style={styles.nfeNumberBadge}>
                      <Text style={styles.nfeNumber}>MDF-e {mdfe.number}</Text>
                      <Text style={styles.nfeSeries}>Série {mdfe.series}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: Colors.success + '15' }]}>
                      <CheckCircle2 size={14} color={Colors.success} />
                      <Text style={[styles.statusText, { color: Colors.success }]}>Autorizado</Text>
                    </View>
                  </View>

                  <View style={styles.mdfeRoute}>
                    <Text style={styles.mdfeRouteText}>
                      {mdfe.originCity}/{mdfe.originState} → {mdfe.destinationCity}/
                      {mdfe.destinationState}
                    </Text>
                  </View>

                  <View style={styles.nfeDetails}>
                    <View style={styles.nfeDetailItem}>
                      <Text style={styles.nfeDetailLabel}>Veículo</Text>
                      <Text style={styles.nfeDetailValue}>{mdfe.vehiclePlate}</Text>
                    </View>
                    <View style={styles.nfeDivider} />
                    <View style={styles.nfeDetailItem}>
                      <Text style={styles.nfeDetailLabel}>Motorista</Text>
                      <Text style={styles.nfeDetailValue}>{mdfe.driverName}</Text>
                    </View>
                    <View style={styles.nfeDivider} />
                    <View style={styles.nfeDetailItem}>
                      <Text style={styles.nfeDetailLabel}>NF-es</Text>
                      <Text style={styles.nfeDetailValue}>{mdfe.nfeIds.length}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeTab === 'sefaz' && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Download size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Importação SEFAZ</Text>
              <Text style={styles.emptyDescription}>
                Conecte sua conta da SEFAZ para importar automaticamente as notas fiscais recebidas
              </Text>
              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.7}>
                <Text style={styles.primaryButtonText}>Configurar Integração</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  nfeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  nfeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nfeNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nfeNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  nfeSeries: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
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
    letterSpacing: 0.3,
  },
  nfeNature: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  nfeDetails: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  nfeDetailItem: {
    flex: 1,
  },
  nfeDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  nfeDetailLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 6,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  nfeDetailValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  accessKeyContainer: {
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  accessKeyLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 6,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  accessKeyValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'monospace' as const,
    letterSpacing: 1,
  },
  mdfeRoute: {
    marginBottom: 16,
  },
  mdfeRouteText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
});
