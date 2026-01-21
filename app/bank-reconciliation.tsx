import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { 
  ArrowLeft, Upload, Download, FileText, CheckCircle2, AlertCircle, 
  RefreshCw, Link2, Link2Off, Calendar, TrendingUp, TrendingDown,
  Search, Filter, X, Check, HelpCircle, CreditCard, Plus
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TransactionStatus = 'matched' | 'unmatched' | 'divergent' | 'ignored';

interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  value: number;
  type: 'credit' | 'debit';
  balance: number;
  status: TransactionStatus;
  matchedEntryId?: string;
}

interface SystemEntry {
  id: string;
  date: Date;
  description: string;
  value: number;
  type: 'receita' | 'despesa';
  category: string;
  supplier?: string;
  client?: string;
  isMatched: boolean;
}

const mockBankTransactions: BankTransaction[] = [
  { id: 'bt-1', date: new Date('2025-01-15'), description: 'TED RECEBIDA - FRIGORÍFICO MARFRIG S/A', value: 180000, type: 'credit', balance: 467500, status: 'matched', matchedEntryId: 'se-1' },
  { id: 'bt-2', date: new Date('2025-01-14'), description: 'PIX ENVIADO - AGROPECUÁRIA BOA VISTA', value: 25000, type: 'debit', balance: 287500, status: 'matched', matchedEntryId: 'se-2' },
  { id: 'bt-3', date: new Date('2025-01-13'), description: 'TARIFA DE MANUTENÇÃO DE CONTA', value: 45, type: 'debit', balance: 312500, status: 'unmatched' },
  { id: 'bt-4', date: new Date('2025-01-12'), description: 'TED RECEBIDA - USINA SAO MARTINHO', value: 95000, type: 'credit', balance: 312545, status: 'divergent', matchedEntryId: 'se-3' },
  { id: 'bt-5', date: new Date('2025-01-11'), description: 'BOLETO - FERT. NPK AGROMAX', value: 44850, type: 'debit', balance: 217545, status: 'divergent', matchedEntryId: 'se-4' },
  { id: 'bt-6', date: new Date('2025-01-10'), description: 'DEB AUTOMÁTICO - CPFL ENERGIA', value: 3200, type: 'debit', balance: 262395, status: 'matched', matchedEntryId: 'se-5' },
  { id: 'bt-7', date: new Date('2025-01-09'), description: 'PIX RECEBIDO - AGRO FERTILIZANTES LTDA', value: 12000, type: 'credit', balance: 265595, status: 'unmatched' },
];

const mockSystemEntries: SystemEntry[] = [
  { id: 'se-1', date: new Date('2025-01-15'), description: 'Venda de Gado Gordo - Lote 15', value: 180000, type: 'receita', category: 'Venda Produção', client: 'Frigorífico Marfrig', isMatched: true },
  { id: 'se-2', date: new Date('2025-01-14'), description: 'Compra de Ração Animal', value: 25000, type: 'despesa', category: 'Insumos', supplier: 'Agropecuária Boa Vista', isMatched: true },
  { id: 'se-3', date: new Date('2025-01-12'), description: 'Venda de Cana-de-açúcar', value: 95500, type: 'receita', category: 'Venda Produção', client: 'Usina São Martinho', isMatched: true },
  { id: 'se-4', date: new Date('2025-01-11'), description: 'Compra de Fertilizante NPK', value: 45000, type: 'despesa', category: 'Insumos', supplier: 'Agromax Fertilizantes', isMatched: true },
  { id: 'se-5', date: new Date('2025-01-10'), description: 'Conta de Energia Elétrica', value: 3200, type: 'despesa', category: 'Utilidades', supplier: 'CPFL Energia', isMatched: true },
  { id: 'se-6', date: new Date('2025-01-08'), description: 'Venda de Composto Orgânico', value: 12000, type: 'receita', category: 'Venda Produção', client: 'Agro Fertilizantes Ltda', isMatched: false },
];

const STATUS_CONFIG = {
  matched: { label: 'Conciliado', color: Colors.success, icon: CheckCircle2 },
  unmatched: { label: 'Sem Vínculo', color: Colors.warning, icon: HelpCircle },
  divergent: { label: 'Divergente', color: Colors.error, icon: AlertCircle },
  ignored: { label: 'Ignorado', color: Colors.textTertiary, icon: X },
};

export default function BankReconciliationScreen() {
  const [activeTab, setActiveTab] = useState<'import' | 'reconcile' | 'review'>('import');
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [systemEntries, setSystemEntries] = useState<SystemEntry[]>(mockSystemEntries);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const isWeb = Platform.OS === 'web';

  const matchedCount = bankTransactions.filter(t => t.status === 'matched').length;
  const unmatchedCount = bankTransactions.filter(t => t.status === 'unmatched').length;
  const divergentCount = bankTransactions.filter(t => t.status === 'divergent').length;

  const totalCredits = bankTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.value, 0);
  const totalDebits = bankTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.value, 0);

  const filteredTransactions = bankTransactions.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unmatchedSystemEntries = systemEntries.filter(e => !e.isMatched);

  const handleImportOFX = () => {
    // Simular importação de arquivo OFX
    setImportedFile('extrato_banco_brasil_jan2025.ofx');
    setTimeout(() => {
      setActiveTab('reconcile');
    }, 500);
  };

  const handleAutoReconcile = () => {
    // Simular conciliação automática
    alert('Conciliação automática realizada!\n\n4 transações conciliadas automaticamente\n2 transações com divergência detectada\n1 transação sem vínculo');
  };

  const handleMatchTransaction = (transaction: BankTransaction, entryId: string) => {
    setBankTransactions(prev => 
      prev.map(t => t.id === transaction.id 
        ? { ...t, status: 'matched' as TransactionStatus, matchedEntryId: entryId }
        : t
      )
    );
    setSystemEntries(prev =>
      prev.map(e => e.id === entryId ? { ...e, isMatched: true } : e)
    );
    setShowMatchModal(false);
    setSelectedTransaction(null);
  };

  const handleIgnoreTransaction = (transactionId: string) => {
    setBankTransactions(prev =>
      prev.map(t => t.id === transactionId 
        ? { ...t, status: 'ignored' as TransactionStatus }
        : t
      )
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: !isWeb,
          title: "Conciliação Bancária",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Conciliação Bancária</Text>
              <Text style={styles.subtitle}>Importação OFX e conciliação automática</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'import' && styles.tabActive]}
              onPress={() => setActiveTab('import')}
              activeOpacity={0.7}
            >
              <Upload size={18} color={activeTab === 'import' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'import' && styles.tabTextActive]}>
                Importar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reconcile' && styles.tabActive]}
              onPress={() => setActiveTab('reconcile')}
              activeOpacity={0.7}
            >
              <Link2 size={18} color={activeTab === 'reconcile' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'reconcile' && styles.tabTextActive]}>
                Conciliar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'review' && styles.tabActive]}
              onPress={() => setActiveTab('review')}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={18} color={activeTab === 'review' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'review' && styles.tabTextActive]}>
                Revisar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Import Tab */}
            {activeTab === 'import' && (
              <View style={styles.tabContent}>
                <View style={styles.importCard}>
                  <View style={styles.importIcon}>
                    <Upload size={40} color={Colors.primary} />
                  </View>
                  <Text style={styles.importTitle}>Importar Extrato OFX</Text>
                  <Text style={styles.importDescription}>
                    Importe seu extrato bancário no formato OFX para fazer a conciliação automática
                    com os lançamentos do sistema.
                  </Text>
                  <TouchableOpacity 
                    style={styles.importButton}
                    onPress={handleImportOFX}
                    activeOpacity={0.7}
                  >
                    <FileText size={20} color={Colors.white} />
                    <Text style={styles.importButtonText}>Selecionar Arquivo OFX</Text>
                  </TouchableOpacity>
                </View>

                {importedFile && (
                  <View style={styles.importedFileCard}>
                    <View style={styles.importedFileIcon}>
                      <CheckCircle2 size={24} color={Colors.success} />
                    </View>
                    <View style={styles.importedFileInfo}>
                      <Text style={styles.importedFileName}>{importedFile}</Text>
                      <Text style={styles.importedFileStatus}>Arquivo importado com sucesso</Text>
                    </View>
                  </View>
                )}

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Como obter o arquivo OFX?</Text>
                  <View style={styles.helpStep}>
                    <View style={styles.helpStepNumber}>
                      <Text style={styles.helpStepNumberText}>1</Text>
                    </View>
                    <Text style={styles.helpStepText}>
                      Acesse o Internet Banking do seu banco
                    </Text>
                  </View>
                  <View style={styles.helpStep}>
                    <View style={styles.helpStepNumber}>
                      <Text style={styles.helpStepNumberText}>2</Text>
                    </View>
                    <Text style={styles.helpStepText}>
                      Vá em "Extrato" ou "Movimentações"
                    </Text>
                  </View>
                  <View style={styles.helpStep}>
                    <View style={styles.helpStepNumber}>
                      <Text style={styles.helpStepNumberText}>3</Text>
                    </View>
                    <Text style={styles.helpStepText}>
                      Exporte o extrato no formato OFX ou Money
                    </Text>
                  </View>
                </View>

                <View style={styles.openFinanceCard}>
                  <View style={styles.openFinanceHeader}>
                    <CreditCard size={24} color={Colors.info} />
                    <Text style={styles.openFinanceTitle}>Open Finance</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Em breve</Text>
                    </View>
                  </View>
                  <Text style={styles.openFinanceDescription}>
                    Conecte sua conta bancária via Open Finance para sincronização automática
                    de transações em tempo real.
                  </Text>
                </View>
              </View>
            )}

            {/* Reconcile Tab */}
            {activeTab === 'reconcile' && (
              <View style={styles.tabContent}>
                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
                    <Text style={styles.statValue}>{matchedCount}</Text>
                    <Text style={styles.statLabel}>Conciliados</Text>
                  </View>
                  <View style={[styles.statCard, { borderLeftColor: Colors.warning }]}>
                    <Text style={styles.statValue}>{unmatchedCount}</Text>
                    <Text style={styles.statLabel}>Sem Vínculo</Text>
                  </View>
                  <View style={[styles.statCard, { borderLeftColor: Colors.error }]}>
                    <Text style={styles.statValue}>{divergentCount}</Text>
                    <Text style={styles.statLabel}>Divergentes</Text>
                  </View>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <TrendingUp size={16} color={Colors.success} />
                      <Text style={styles.summaryLabel}>Créditos</Text>
                      <Text style={[styles.summaryValue, { color: Colors.success }]}>
                        R$ {totalCredits.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <TrendingDown size={16} color={Colors.error} />
                      <Text style={styles.summaryLabel}>Débitos</Text>
                      <Text style={[styles.summaryValue, { color: Colors.error }]}>
                        R$ {totalDebits.toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Auto Reconcile Button */}
                <TouchableOpacity 
                  style={styles.autoReconcileButton}
                  onPress={handleAutoReconcile}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={20} color={Colors.white} />
                  <Text style={styles.autoReconcileText}>Conciliar Automaticamente</Text>
                </TouchableOpacity>

                {/* Filters */}
                <View style={styles.filterRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('all')}
                    >
                      <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
                        Todos ({bankTransactions.length})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'unmatched' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('unmatched')}
                    >
                      <Text style={[styles.filterText, filterStatus === 'unmatched' && styles.filterTextActive]}>
                        Sem Vínculo ({unmatchedCount})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'divergent' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('divergent')}
                    >
                      <Text style={[styles.filterText, filterStatus === 'divergent' && styles.filterTextActive]}>
                        Divergentes ({divergentCount})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'matched' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('matched')}
                    >
                      <Text style={[styles.filterText, filterStatus === 'matched' && styles.filterTextActive]}>
                        Conciliados ({matchedCount})
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Transactions List */}
                <Text style={styles.sectionTitle}>Transações Bancárias</Text>
                
                {filteredTransactions.map((transaction) => {
                  const statusConfig = STATUS_CONFIG[transaction.status];
                  const StatusIcon = statusConfig.icon;
                  const isCredit = transaction.type === 'credit';

                  return (
                    <TouchableOpacity
                      key={transaction.id}
                      style={styles.transactionCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (transaction.status === 'unmatched' || transaction.status === 'divergent') {
                          setSelectedTransaction(transaction);
                          setShowMatchModal(true);
                        }
                      }}
                    >
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionDateBadge}>
                          <Calendar size={12} color={Colors.textSecondary} />
                          <Text style={styles.transactionDate}>
                            {format(transaction.date, 'dd/MM/yyyy')}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                          <StatusIcon size={12} color={statusConfig.color} />
                          <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.transactionContent}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription} numberOfLines={2}>
                            {transaction.description}
                          </Text>
                        </View>
                        <View style={styles.transactionValueContainer}>
                          <View style={[
                            styles.typeIcon,
                            { backgroundColor: isCredit ? Colors.success + '18' : Colors.error + '18' }
                          ]}>
                            {isCredit ? (
                              <TrendingUp size={16} color={Colors.success} />
                            ) : (
                              <TrendingDown size={16} color={Colors.error} />
                            )}
                          </View>
                          <Text style={[
                            styles.transactionValue,
                            { color: isCredit ? Colors.success : Colors.error }
                          ]}>
                            {isCredit ? '+' : '-'} R$ {transaction.value.toLocaleString('pt-BR')}
                          </Text>
                        </View>
                      </View>

                      {transaction.status === 'divergent' && (
                        <View style={styles.divergenceAlert}>
                          <AlertCircle size={14} color={Colors.error} />
                          <Text style={styles.divergenceText}>
                            Valor divergente do lançamento no sistema
                          </Text>
                        </View>
                      )}

                      {transaction.status === 'unmatched' && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity 
                            style={styles.matchButton}
                            onPress={() => {
                              setSelectedTransaction(transaction);
                              setShowMatchModal(true);
                            }}
                          >
                            <Link2 size={14} color={Colors.primary} />
                            <Text style={styles.matchButtonText}>Vincular</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.ignoreButton}
                            onPress={() => handleIgnoreTransaction(transaction.id)}
                          >
                            <X size={14} color={Colors.textSecondary} />
                            <Text style={styles.ignoreButtonText}>Ignorar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Review Tab */}
            {activeTab === 'review' && (
              <View style={styles.tabContent}>
                <View style={styles.reviewCard}>
                  <View style={styles.reviewIcon}>
                    <CheckCircle2 size={48} color={Colors.success} />
                  </View>
                  <Text style={styles.reviewTitle}>Resumo da Conciliação</Text>
                  
                  <View style={styles.reviewStats}>
                    <View style={styles.reviewStatItem}>
                      <Text style={styles.reviewStatValue}>{bankTransactions.length}</Text>
                      <Text style={styles.reviewStatLabel}>Total de Transações</Text>
                    </View>
                    <View style={styles.reviewStatDivider} />
                    <View style={styles.reviewStatItem}>
                      <Text style={[styles.reviewStatValue, { color: Colors.success }]}>{matchedCount}</Text>
                      <Text style={styles.reviewStatLabel}>Conciliadas</Text>
                    </View>
                    <View style={styles.reviewStatDivider} />
                    <View style={styles.reviewStatItem}>
                      <Text style={[styles.reviewStatValue, { color: Colors.error }]}>{unmatchedCount + divergentCount}</Text>
                      <Text style={styles.reviewStatLabel}>Pendentes</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Lançamentos sem Vínculo no Sistema</Text>
                {unmatchedSystemEntries.map((entry) => {
                  const isReceita = entry.type === 'receita';
                  return (
                    <View key={entry.id} style={styles.unmatchedEntryCard}>
                      <View style={styles.unmatchedEntryHeader}>
                        <Calendar size={12} color={Colors.textSecondary} />
                        <Text style={styles.unmatchedEntryDate}>
                          {format(entry.date, 'dd/MM/yyyy')}
                        </Text>
                        <View style={[
                          styles.typeBadge,
                          { backgroundColor: isReceita ? Colors.success + '15' : Colors.error + '15' }
                        ]}>
                          <Text style={[
                            styles.typeBadgeText,
                            { color: isReceita ? Colors.success : Colors.error }
                          ]}>
                            {isReceita ? 'Receita' : 'Despesa'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.unmatchedEntryDescription}>{entry.description}</Text>
                      <View style={styles.unmatchedEntryFooter}>
                        <Text style={styles.unmatchedEntryCategory}>{entry.category}</Text>
                        <Text style={[
                          styles.unmatchedEntryValue,
                          { color: isReceita ? Colors.success : Colors.error }
                        ]}>
                          R$ {entry.value.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity style={styles.finishButton} activeOpacity={0.7}>
                  <Check size={20} color={Colors.white} />
                  <Text style={styles.finishButtonText}>Finalizar Conciliação</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vincular Transação</Text>
              <TouchableOpacity onPress={() => setShowMatchModal(false)}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <View style={styles.selectedTransactionCard}>
                <Text style={styles.selectedTransactionLabel}>Transação Bancária</Text>
                <Text style={styles.selectedTransactionDescription}>
                  {selectedTransaction.description}
                </Text>
                <Text style={[
                  styles.selectedTransactionValue,
                  { color: selectedTransaction.type === 'credit' ? Colors.success : Colors.error }
                ]}>
                  {selectedTransaction.type === 'credit' ? '+' : '-'} R$ {selectedTransaction.value.toLocaleString('pt-BR')}
                </Text>
              </View>
            )}

            <Text style={styles.matchLabel}>Selecione o lançamento correspondente:</Text>

            <ScrollView style={styles.matchList} showsVerticalScrollIndicator={false}>
              {systemEntries
                .filter(e => !e.isMatched)
                .map((entry) => {
                  const isReceita = entry.type === 'receita';
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.matchOption}
                      onPress={() => selectedTransaction && handleMatchTransaction(selectedTransaction, entry.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.matchOptionInfo}>
                        <Text style={styles.matchOptionDate}>
                          {format(entry.date, 'dd/MM/yyyy')}
                        </Text>
                        <Text style={styles.matchOptionDescription}>{entry.description}</Text>
                        <Text style={styles.matchOptionCategory}>
                          {entry.supplier || entry.client}
                        </Text>
                      </View>
                      <Text style={[
                        styles.matchOptionValue,
                        { color: isReceita ? Colors.success : Colors.error }
                      ]}>
                        R$ {entry.value.toLocaleString('pt-BR')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.createNewButton} activeOpacity={0.7}>
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.createNewText}>Criar Novo Lançamento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerButton: {
    padding: 8,
  },
  header: {
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
  tabContainer: {
    flexDirection: 'row',
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
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabContent: {
    flex: 1,
  },
  importCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  importIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  importTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  importDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  importedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.success + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  importedFileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importedFileInfo: {
    flex: 1,
  },
  importedFileName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  importedFileStatus: {
    fontSize: 12,
    color: Colors.success,
  },
  helpSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  helpStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpStepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  helpStepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  openFinanceCard: {
    backgroundColor: Colors.info + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  openFinanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  openFinanceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.info,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.info,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  openFinanceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  autoReconcileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  autoReconcileText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  transactionValueContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  divergenceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  divergenceText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  matchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    paddingVertical: 8,
    borderRadius: 8,
  },
  matchButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  ignoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ignoreButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewIcon: {
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  reviewStats: {
    flexDirection: 'row',
    width: '100%',
  },
  reviewStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  reviewStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  reviewStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reviewStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  unmatchedEntryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unmatchedEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  unmatchedEntryDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  unmatchedEntryDescription: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  unmatchedEntryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unmatchedEntryCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unmatchedEntryValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
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
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  selectedTransactionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  selectedTransactionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  selectedTransactionDescription: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  selectedTransactionValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  matchLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  matchList: {
    maxHeight: 250,
  },
  matchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  matchOptionInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchOptionDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  matchOptionDescription: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  matchOptionCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  matchOptionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  createNewText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
