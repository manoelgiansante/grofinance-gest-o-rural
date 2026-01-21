import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: 'basic' | 'intermediate' | 'premium';
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  recommended?: boolean;
  bonus?: string;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.9,
    priceLabel: 'R$ 29,90/mês',
    description: 'Para pequenos produtores',
    features: [
      'Controle de despesas ilimitado',
      'Controle de receitas',
      'Relatórios básicos',
      'Backup na nuvem',
      '1 fazenda',
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediário',
    price: 59.9,
    priceLabel: 'R$ 59,90/mês',
    description: 'Para produtores em crescimento',
    features: [
      'Tudo do Básico +',
      'Importação Excel com IA',
      'Relatórios avançados (DRE, Fluxo)',
      'Contas a receber/pagar',
      'Até 5 fazendas',
      'Contratos e clientes',
    ],
    recommended: true,
    bonus: '🎁 Rumo Operacional GRÁTIS!',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.9,
    priceLabel: 'R$ 99,90/mês',
    description: 'Gestão completa do agronegócio',
    features: [
      'Tudo do Intermediário +',
      'Módulo Fiscal (NF-e, MDF-e)',
      'Livro Caixa digital',
      'Conciliação bancária',
      'Fazendas ilimitadas',
      'Suporte prioritário',
      'API para integrações',
    ],
    bonus: '🎁 Rumo Operacional GRÁTIS!',
  },
];

export default function SubscriptionScreen() {
  const { user, upgradeSubscription, subscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan['id']>('intermediate');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!user?.email) {
      Alert.alert('Login necessário', 'Faça login para assinar um plano.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fazer Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setIsProcessing(true);

    try {
      // Aqui seria integrado com Stripe/RevenueCat
      // Por enquanto, simula a ativação
      const planMap: Record<string, 'free' | 'starter' | 'professional' | 'enterprise'> = {
        basic: 'starter',
        intermediate: 'professional',
        premium: 'enterprise',
      };
      const success = await upgradeSubscription(planMap[selectedPlan] || 'professional');

      if (success) {
        Alert.alert(
          '🎉 Assinatura Ativada!',
          selectedPlan === 'basic'
            ? 'Bem-vindo ao plano Básico!'
            : `Bem-vindo ao plano ${selectedPlan === 'intermediate' ? 'Intermediário' : 'Premium'}! Você ganhou acesso ao Rumo Operacional grátis!`,
          [{ text: 'Continuar', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível ativar a assinatura. Tente novamente.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua assinatura.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = subscription?.plan;

  // Map internal plan to display plan
  const planToDisplayMap: Record<string, string> = {
    free: 'basic',
    starter: 'basic',
    professional: 'intermediate',
    enterprise: 'premium',
  };
  const currentDisplayPlan = currentPlan ? planToDisplayMap[currentPlan] : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolha seu Plano</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <LinearGradient colors={['#2E7D32', '#4CAF50']} style={styles.hero}>
          <Ionicons name="rocket" size={48} color="#fff" />
          <Text style={styles.heroTitle}>Desbloqueie todo o potencial</Text>
          <Text style={styles.heroSubtitle}>Escolha o plano ideal para sua fazenda</Text>
        </LinearGradient>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.recommended && styles.planCardRecommended,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>MAIS POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text
                    style={[styles.planName, selectedPlan === plan.id && styles.planNameSelected]}
                  >
                    {plan.name}
                  </Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <View
                  style={[styles.radioOuter, selectedPlan === plan.id && styles.radioOuterSelected]}
                >
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
              </View>

              <Text
                style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceSelected]}
              >
                {plan.priceLabel}
              </Text>

              {plan.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{plan.bonus}</Text>
                </View>
              )}

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={selectedPlan === plan.id ? '#2E7D32' : '#10b981'}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {currentDisplayPlan === plan.id && (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanText}>PLANO ATUAL</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.ctaButton, isProcessing && styles.ctaButtonDisabled]}
            onPress={handleSubscribe}
            disabled={isProcessing || currentDisplayPlan === selectedPlan}
          >
            <Text style={styles.ctaButtonText}>
              {currentDisplayPlan === selectedPlan
                ? 'Plano Atual'
                : isProcessing
                  ? 'Processando...'
                  : `Assinar ${PLANS.find((p) => p.id === selectedPlan)?.name}`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.ctaDisclaimer}>
            Cancele a qualquer momento. Sem multa ou fidelidade.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Por que assinar?</Text>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="gift" size={24} color="#f59e0b" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Bônus Exclusivo</Text>
              <Text style={styles.benefitDescription}>
                Nos planos Intermediário e Premium, você ganha o Rumo Operacional totalmente grátis
                para gestão de custos!
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="cloud" size={24} color="#3b82f6" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Seus dados seguros</Text>
              <Text style={styles.benefitDescription}>
                Backup automático na nuvem. Acesse de qualquer dispositivo.
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIcon}>
              <Ionicons name="sparkles" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>IA para Importação</Text>
              <Text style={styles.benefitDescription}>
                Importe planilhas Excel e nossa IA mapeia os dados automaticamente.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  plansContainer: {
    padding: 16,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  planCardSelected: {
    borderColor: '#2E7D32',
  },
  planCardRecommended: {
    borderColor: '#f59e0b',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  planNameSelected: {
    color: '#2E7D32',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2E7D32',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  planPriceSelected: {
    color: '#2E7D32',
  },
  bonusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  featuresList: {
    marginTop: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  currentPlanBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  ctaContainer: {
    padding: 16,
  },
  ctaButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ctaDisclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  benefitsSection: {
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
});
