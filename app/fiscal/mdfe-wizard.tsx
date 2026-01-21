import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Truck,
  MapPin,
  FileText,
  User,
  Package,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type WizardStep =
  | 'emitente'
  | 'percurso'
  | 'veiculo'
  | 'motorista'
  | 'documentos'
  | 'carregamento'
  | 'revisao';

const steps: { id: WizardStep; title: string; number: number; icon: any }[] = [
  { id: 'emitente', title: 'Emitente', number: 1, icon: User },
  { id: 'percurso', title: 'Percurso', number: 2, icon: MapPin },
  { id: 'veiculo', title: 'Veículo', number: 3, icon: Truck },
  { id: 'motorista', title: 'Motorista', number: 4, icon: User },
  { id: 'documentos', title: 'Documentos', number: 5, icon: FileText },
  { id: 'carregamento', title: 'Carregamento', number: 6, icon: Package },
  { id: 'revisao', title: 'Revisão', number: 7, icon: Check },
];

interface FormData {
  emitente: string;
  ufInicio: string;
  cidadeInicio: string;
  ufFim: string;
  cidadeFim: string;
  placa: string;
  renavam: string;
  tara: string;
  capacidadeKg: string;
  capacidadeM3: string;
  motoristaNome: string;
  motoristaCpf: string;
  dataEmissao: string;
  dataViagem: string;
}

export default function MDFeWizardScreen() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('emitente');
  const [formData, setFormData] = useState<FormData>({
    emitente: '',
    ufInicio: '',
    cidadeInicio: '',
    ufFim: '',
    cidadeFim: '',
    placa: '',
    renavam: '',
    tara: '',
    capacidadeKg: '',
    capacidadeM3: '',
    motoristaNome: '',
    motoristaCpf: '',
    dataEmissao: '',
    dataViagem: '',
  });
  const [selectedNFes, setSelectedNFes] = useState<string[]>([]);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleFinish = () => {
    // Simular transmissão do MDF-e
    alert('MDF-e transmitido com sucesso!');
    router.back();
  };

  const mockNFes: { id: string; number: string; value: number; destination: string }[] = [];

  const toggleNFeSelection = (id: string) => {
    setSelectedNFes((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Emitir MDF-e',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.progressContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.progressSteps}
        >
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <View key={step.id} style={styles.progressStepWrapper}>
                <TouchableOpacity
                  style={[
                    styles.progressStep,
                    isActive && styles.progressStepActive,
                    isCompleted && styles.progressStepCompleted,
                  ]}
                  onPress={() => setCurrentStep(step.id)}
                  activeOpacity={0.7}
                >
                  {isCompleted ? (
                    <Check size={14} color={Colors.white} />
                  ) : (
                    <Icon size={14} color={isActive ? Colors.white : Colors.textTertiary} />
                  )}
                </TouchableOpacity>
                <Text
                  style={[styles.progressStepLabel, isActive && styles.progressStepLabelActive]}
                >
                  {step.title}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{steps[currentStepIndex].title}</Text>

          {currentStep === 'emitente' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Selecione ou adicione o emitente do manifesto
              </Text>
              <TouchableOpacity style={styles.selectCard} activeOpacity={0.7}>
                <Text style={styles.selectCardLabel}>Selecionar Emitente</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                <Text style={styles.addButtonText}>+ Adicionar Novo Emitente</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'percurso' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Defina o percurso do transporte</Text>

              <View style={styles.routeCard}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.routePointLabel}>Origem</Text>
                </View>
                <View style={styles.routeInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>UF</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="SP"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.ufInicio}
                      onChangeText={(text) => setFormData({ ...formData, ufInicio: text })}
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 3 }]}>
                    <Text style={styles.inputLabel}>Cidade</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Araraquara"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.cidadeInicio}
                      onChangeText={(text) => setFormData({ ...formData, cidadeInicio: text })}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.routeConnector}>
                <View style={styles.routeLine} />
              </View>

              <View style={styles.routeCard}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
                  <Text style={styles.routePointLabel}>Destino</Text>
                </View>
                <View style={styles.routeInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>UF</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="SP"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.ufFim}
                      onChangeText={(text) => setFormData({ ...formData, ufFim: text })}
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 3 }]}>
                    <Text style={styles.inputLabel}>Cidade</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="São Paulo"
                      placeholderTextColor={Colors.textTertiary}
                      value={formData.cidadeFim}
                      onChangeText={(text) => setFormData({ ...formData, cidadeFim: text })}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.addRouteButton} activeOpacity={0.7}>
                <Text style={styles.addRouteButtonText}>+ Adicionar Parada Intermediária</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'veiculo' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Informe os dados do veículo de transporte</Text>

              <View style={styles.vehicleTypeRow}>
                <TouchableOpacity
                  style={[styles.vehicleTypeCard, styles.vehicleTypeCardActive]}
                  activeOpacity={0.7}
                >
                  <Truck size={24} color={Colors.primary} />
                  <Text style={styles.vehicleTypeLabel}>Próprio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vehicleTypeCard} activeOpacity={0.7}>
                  <Truck size={24} color={Colors.textTertiary} />
                  <Text style={[styles.vehicleTypeLabel, { color: Colors.textTertiary }]}>
                    Terceiro
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Placa do Veículo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.placa}
                  onChangeText={(text) => setFormData({ ...formData, placa: text })}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RENAVAM</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000000000"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.renavam}
                  onChangeText={(text) => setFormData({ ...formData, renavam: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Tara (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.tara}
                    onChangeText={(text) => setFormData({ ...formData, tara: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Capacidade (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.capacidadeKg}
                    onChangeText={(text) => setFormData({ ...formData, capacidadeKg: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {currentStep === 'motorista' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Informe os dados do motorista responsável</Text>

              <TouchableOpacity style={styles.selectCard} activeOpacity={0.7}>
                <Text style={styles.selectCardLabel}>Selecionar Motorista Cadastrado</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do motorista"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.motoristaNome}
                  onChangeText={(text) => setFormData({ ...formData, motoristaNome: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CPF</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.motoristaCpf}
                  onChangeText={(text) => setFormData({ ...formData, motoristaCpf: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {currentStep === 'documentos' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Selecione as NF-e que serão vinculadas ao manifesto
              </Text>

              {mockNFes.map((nfe) => {
                const isSelected = selectedNFes.includes(nfe.id);
                return (
                  <TouchableOpacity
                    key={nfe.id}
                    style={[styles.nfeCard, isSelected && styles.nfeCardSelected]}
                    onPress={() => toggleNFeSelection(nfe.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.nfeCheckbox, isSelected && styles.nfeCheckboxSelected]}>
                      {isSelected && <Check size={14} color={Colors.white} />}
                    </View>
                    <View style={styles.nfeInfo}>
                      <Text style={styles.nfeNumber}>NF-e {nfe.number}</Text>
                      <Text style={styles.nfeDestination}>{nfe.destination}</Text>
                    </View>
                    <Text style={styles.nfeValue}>R$ {nfe.value.toLocaleString('pt-BR')}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  {selectedNFes.length} documento(s) selecionado(s)
                </Text>
              </View>
            </View>
          )}

          {currentStep === 'carregamento' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Informe os dados do carregamento</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Emissão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.dataEmissao}
                  onChangeText={(text) => setFormData({ ...formData, dataEmissao: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data Prevista da Viagem</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.dataViagem}
                  onChangeText={(text) => setFormData({ ...formData, dataViagem: text })}
                />
              </View>

              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total de Documentos</Text>
                  <Text style={styles.totalValue}>{selectedNFes.length}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Valor Total</Text>
                  <Text style={styles.totalValueMoney}>
                    R${' '}
                    {mockNFes
                      .filter((nfe) => selectedNFes.includes(nfe.id))
                      .reduce((sum, nfe) => sum + nfe.value, 0)
                      .toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {currentStep === 'revisao' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Revise todas as informações antes de transmitir
              </Text>

              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Resumo do MDF-e</Text>

                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Percurso</Text>
                  <Text style={styles.reviewValue}>
                    {formData.cidadeInicio || 'Não informado'}/{formData.ufInicio || '-'} →{' '}
                    {formData.cidadeFim || 'Não informado'}/{formData.ufFim || '-'}
                  </Text>
                </View>

                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Veículo</Text>
                  <Text style={styles.reviewValue}>{formData.placa || 'Não informado'}</Text>
                </View>

                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Motorista</Text>
                  <Text style={styles.reviewValue}>
                    {formData.motoristaNome || 'Não informado'}
                  </Text>
                </View>

                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Documentos Vinculados</Text>
                  <Text style={styles.reviewValue}>{selectedNFes.length} NF-e</Text>
                </View>

                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Valor Total</Text>
                  <Text
                    style={[
                      styles.reviewValue,
                      { color: Colors.primary, fontWeight: '700' as const },
                    ]}
                  >
                    R${' '}
                    {mockNFes
                      .filter((nfe) => selectedNFes.includes(nfe.id))
                      .reduce((sum, nfe) => sum + nfe.value, 0)
                      .toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>

              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>⚠️ Atenção</Text>
                <Text style={styles.warningText}>
                  Após a transmissão, o MDF-e só poderá ser cancelado em até 24 horas. Verifique
                  todos os dados antes de prosseguir.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.footerButtonSecondary,
            isFirstStep && styles.footerButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={isFirstStep}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={isFirstStep ? Colors.textTertiary : Colors.textPrimary} />
          <Text style={[styles.footerButtonText, isFirstStep && styles.footerButtonTextDisabled]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={isLastStep ? handleFinish : handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.footerButtonTextPrimary}>
            {isLastStep ? 'Transmitir MDF-e' : 'Próximo'}
          </Text>
          {!isLastStep && <ChevronRight size={20} color={Colors.white} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressSteps: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  progressStepWrapper: {
    alignItems: 'center',
    width: 60,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
  },
  progressStepCompleted: {
    backgroundColor: Colors.success,
  },
  progressStepLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  progressStepLabelActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  form: {
    marginTop: 8,
  },
  formDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  selectCardLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routePointLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  routeInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  routeConnector: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.border,
  },
  addRouteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  addRouteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  vehicleTypeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleTypeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  vehicleTypeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  nfeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  nfeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  nfeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfeCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  nfeInfo: {
    flex: 1,
  },
  nfeNumber: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nfeDestination: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  nfeValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  selectedCount: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  totalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  totalValueMoney: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  warningCard: {
    backgroundColor: Colors.warning + '10',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  footerButtonSecondary: {
    backgroundColor: Colors.surfaceLight,
  },
  footerButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  footerButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  footerButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
