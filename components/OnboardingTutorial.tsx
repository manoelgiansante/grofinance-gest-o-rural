import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import {
  Tractor,
  DollarSign,
  BarChart3,
  Users,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Package,
  FileText,
  Calculator,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: <Tractor size={48} color="#fff" />,
    title: 'Bem-vindo ao Agrofinance!',
    description:
      'Sua plataforma completa de gestão financeira rural. Gerencie fazendas, operações, despesas, receitas e muito mais em um só lugar.',
    color: '#2E7D32',
  },
  {
    icon: <Package size={48} color="#fff" />,
    title: 'Gestão de Fazendas',
    description:
      'Cadastre suas fazendas, talhões e safras. Organize suas operações agrícolas e acompanhe a produtividade de cada área.',
    color: '#1565C0',
  },
  {
    icon: <DollarSign size={48} color="#fff" />,
    title: 'Controle Financeiro',
    description:
      'Registre todas as despesas e receitas. Acompanhe contas a pagar e receber, fluxo de caixa e conciliação bancária.',
    color: '#D32F2F',
  },
  {
    icon: <Users size={48} color="#fff" />,
    title: 'Fornecedores e Clientes',
    description:
      'Mantenha um cadastro completo de fornecedores e clientes. Gerencie contratos, barter e arrendamentos.',
    color: '#7B1FA2',
  },
  {
    icon: <FileText size={48} color="#fff" />,
    title: 'Notas Fiscais',
    description:
      'Emita NFe e MDFe diretamente pelo aplicativo. Mantenha sua documentação fiscal organizada e em dia.',
    color: '#00796B',
  },
  {
    icon: <BarChart3 size={48} color="#fff" />,
    title: 'Relatórios e DRE',
    description:
      'Visualize relatórios detalhados, DRE por operação, custo por hectare e análises de rentabilidade.',
    color: '#E64A19',
  },
  {
    icon: <FileSpreadsheet size={48} color="#fff" />,
    title: 'Importação Inteligente',
    description:
      'Importe dados de planilhas Excel com nossa IA. O sistema identifica automaticamente as colunas e mapeia os dados.',
    color: '#FF9800',
  },
  {
    icon: <Calculator size={48} color="#fff" />,
    title: 'Custo Operacional Grátis!',
    description:
      'Assinantes do plano Intermediário ou superior ganham acesso gratuito ao app Agrofinance Custo Operacional Rural!',
    color: '#9C27B0',
  },
];

interface OnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export default function OnboardingTutorial({ visible, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [visible]);

  const animateTransition = (direction: 'next' | 'prev') => {
    const toValue = direction === 'next' ? -width : width;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep((prev) => (direction === 'next' ? prev + 1 : prev - 1));
      slideAnim.setValue(direction === 'next' ? width : -width);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      animateTransition('next');
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateTransition('prev');
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@agrofinance_tutorial_seen', 'true');
    } catch (error) {
      console.error('Error saving tutorial state:', error);
    }
    onComplete();
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('@agrofinance_tutorial_seen', 'true');
    } catch (error) {
      console.error('Error saving tutorial state:', error);
    }
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={handleSkip}>
      <View style={[styles.container, { backgroundColor: step.color }]}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <X size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>{step.icon}</View>
            {currentStep === 6 && (
              <View style={styles.aiSparkle}>
                <Sparkles size={24} color="#FFD700" />
              </View>
            )}
          </View>

          {/* Text */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View key={index} style={[styles.dot, index === currentStep && styles.dotActive]} />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.navButton} onPress={handlePrev}>
              <ArrowLeft size={20} color="#fff" />
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} />
          )}

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonTextPrimary}>{isLastStep ? 'Começar' : 'Próximo'}</Text>
            {isLastStep ? (
              <CheckCircle size={20} color={step.color} />
            ) : (
              <ArrowRight size={20} color={step.color} />
            )}
          </TouchableOpacity>
        </View>

        {/* Step Counter */}
        <Text style={styles.stepCounter}>
          {currentStep + 1} de {TUTORIAL_STEPS.length}
        </Text>
      </View>
    </Modal>
  );
}

// Hook para verificar se deve mostrar o tutorial
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem('@agrofinance_tutorial_seen');
      setShowTutorial(seen !== 'true');
    } catch (error) {
      console.error('Error checking tutorial status:', error);
      setShowTutorial(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem('@agrofinance_tutorial_seen');
      setShowTutorial(true);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  return {
    showTutorial,
    isLoading,
    completeTutorial,
    resetTutorial,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSparkle: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#fff',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  stepCounter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
});
