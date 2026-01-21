import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { CrossAppService } from '@/lib/crossApp';

interface SubscriptionBannerProps {
  onSubscribe?: () => void;
  compact?: boolean;
}

export function SubscriptionBanner({ onSubscribe, compact = false }: SubscriptionBannerProps) {
  const { isPremium, hasOperacionalBonus, subscription } = useAuth();

  const openRumoOperacional = async () => {
    const deepLink = CrossAppService.getOperacionalDeepLink();
    
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        // Fallback para web ou app não instalado
        // Aqui poderia abrir a store
        console.log('Agrofinance Operacional não instalado');
      }
    } catch (err) {
      console.error('Erro ao abrir Agrofinance Operacional:', err);
    }
  };

  // Se já é premium e tem bônus ativo
  if (isPremium && hasOperacionalBonus) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={compact ? 24 : 32} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, compact && styles.titleCompact]}>
                Assinatura Premium Ativa
              </Text>
              <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
                Você tem acesso ao Agrofinance Operacional grátis!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={openRumoOperacional}
            >
              <Text style={styles.actionButtonText}>Abrir</Text>
              <Ionicons name="arrow-forward" size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Se não é premium, mostrar banner de upgrade
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="gift" size={compact ? 24 : 32} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, compact && styles.titleCompact]}>
              Assine Premium
            </Text>
            <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
              Ganhe Agrofinance Operacional grátis!
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onSubscribe}
          >
            <Text style={styles.actionButtonText}>Assinar</Text>
            <Ionicons name="arrow-forward" size={16} color="#6366f1" />
          </TouchableOpacity>
        </View>
        
        {!compact && (
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.benefitText}>Importação Excel com IA</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.benefitText}>Relatórios avançados</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.benefitText}>Rumo Operacional incluso</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

// Banner para mostrar no Rumo Operacional quando recebe bônus
export function BonusBanner() {
  return (
    <View style={styles.bonusContainer}>
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bonusGradient}
      >
        <Ionicons name="star" size={20} color="#fff" />
        <Text style={styles.bonusText}>
          Premium ativo via Rumo Finance!
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  containerCompact: {
    marginVertical: 8,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  titleCompact: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  subtitleCompact: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  benefitsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  bonusContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bonusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SubscriptionBanner;
