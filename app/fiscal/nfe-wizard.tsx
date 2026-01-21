import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';

type WizardStep =
  | 'emitente'
  | 'destinatario'
  | 'operacao'
  | 'itens'
  | 'transporte'
  | 'valores'
  | 'funrural'
  | 'revisao';

const steps: { id: WizardStep; title: string; number: number }[] = [
  { id: 'emitente', title: 'Emitente', number: 1 },
  { id: 'destinatario', title: 'Destinatário', number: 2 },
  { id: 'operacao', title: 'Operação', number: 3 },
  { id: 'itens', title: 'Itens', number: 4 },
  { id: 'transporte', title: 'Transporte', number: 5 },
  { id: 'valores', title: 'Valores', number: 6 },
  { id: 'funrural', title: 'Funrural', number: 7 },
  { id: 'revisao', title: 'Revisão', number: 8 },
];

export default function NFeWizardScreen() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('emitente');

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
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Emitir NF-e',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

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
                    <Text
                      style={[
                        styles.progressStepNumber,
                        isActive && styles.progressStepNumberActive,
                      ]}
                    >
                      {step.number}
                    </Text>
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
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{steps[currentStepIndex].title}</Text>

          {currentStep === 'emitente' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Selecione ou adicione o emitente da nota fiscal
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

          {currentStep === 'destinatario' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Informe os dados do destinatário da nota fiscal
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CPF/CNPJ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00.000.000/0000-00"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome / Razão Social</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inscrição Estadual (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000.000"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          )}

          {currentStep === 'operacao' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Selecione ou configure a operação fiscal</Text>
              <TouchableOpacity style={styles.selectCard} activeOpacity={0.7}>
                <Text style={styles.selectCardLabel}>Selecionar Operação Fiscal</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Natureza da Operação</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Venda de produção do estabelecimento"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CFOP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0000"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {currentStep === 'itens' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Adicione os produtos/serviços da nota fiscal
              </Text>
              <TouchableOpacity style={styles.addItemButton} activeOpacity={0.7}>
                <Text style={styles.addItemButtonText}>+ Adicionar Item</Text>
              </TouchableOpacity>
              <View style={styles.emptyItemsState}>
                <Text style={styles.emptyItemsText}>Nenhum item adicionado ainda</Text>
              </View>
            </View>
          )}

          {currentStep === 'transporte' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Configure as informações de transporte</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Frete</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
                    <View style={styles.radio} />
                    <Text style={styles.radioLabel}>Por conta do Emitente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
                    <View style={styles.radio} />
                    <Text style={styles.radioLabel}>Por conta do Destinatário</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
                    <View style={styles.radio} />
                    <Text style={styles.radioLabel}>Sem Frete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {currentStep === 'valores' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Revise os valores calculados automaticamente
              </Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Valor dos Produtos</Text>
                  <Text style={styles.summaryValue}>R$ 0,00</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Valor do Frete</Text>
                  <Text style={styles.summaryValue}>R$ 0,00</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Desconto</Text>
                  <Text style={styles.summaryValue}>R$ 0,00</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelTotal}>Valor Total da NF-e</Text>
                  <Text style={styles.summaryValueTotal}>R$ 0,00</Text>
                </View>
              </View>
            </View>
          )}

          {currentStep === 'funrural' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>Configure o recolhimento do Funrural</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Recolher Funrural</Text>
                <TouchableOpacity style={styles.switch} activeOpacity={0.7}>
                  <View style={styles.switchThumb} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 'revisao' && (
            <View style={styles.form}>
              <Text style={styles.formDescription}>
                Revise todas as informações antes de transmitir
              </Text>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Resumo da NF-e</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Emitente</Text>
                  <Text style={styles.reviewValue}>Não selecionado</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Destinatário</Text>
                  <Text style={styles.reviewValue}>Não preenchido</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Operação</Text>
                  <Text style={styles.reviewValue}>Não configurada</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Itens</Text>
                  <Text style={styles.reviewValue}>0 itens</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Valor Total</Text>
                  <Text style={styles.reviewValue}>R$ 0,00</Text>
                </View>
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
            {isLastStep ? 'Transmitir NF-e' : 'Próximo'}
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
  },
  progressStepCompleted: {
    backgroundColor: Colors.success,
  },
  progressStepNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textTertiary,
  },
  progressStepNumberActive: {
    color: Colors.white,
  },
  progressStepLabel: {
    fontSize: 11,
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
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  selectCardLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  addButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    marginHorizontal: 16,
  },
  addItemButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addItemButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  emptyItemsState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyItemsText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryLabelTotal: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  switch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    padding: 4,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 14,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerButtonPrimary: {
    backgroundColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  footerButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  footerButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
