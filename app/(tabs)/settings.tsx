import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Star,
  LogOut,
  User,
  Mail,
  Cloud,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  Tractor,
  Link,
  FileText,
  Settings,
  Palette,
  Globe,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, isAuthenticated, user, signIn, signUp } = useAuth();
  const [notifications, setNotifications] = useState(true);

  // Estados para login inline
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        Alert.alert('Sucesso', 'Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção de Conta - Sempre no topo */}
        {!isAuthenticated ? (
          // Usuário não logado - Tela de Login/Cadastro
          <View style={styles.heroSection}>
            <View style={styles.heroHeader}>
              <View style={styles.heroLogo}>
                <Leaf size={32} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.heroTitle}>Rumo Finance</Text>
              <Text style={styles.heroSubtitle}>Gestão Financeira Rural</Text>
            </View>

            <View style={styles.authCard}>
              <View style={styles.authTabs}>
                <TouchableOpacity
                  style={[styles.authTab, isLogin && styles.authTabActive]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.authTabText, isLogin && styles.authTabTextActive]}>
                    Entrar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authTab, !isLogin && styles.authTabActive]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.authTabText, !isLogin && styles.authTabTextActive]}>
                    Criar Conta
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.authForm}>
                <View style={styles.inputContainer}>
                  <Mail size={18} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Email"
                    placeholderTextColor={Colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Lock size={18} color={Colors.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Senha"
                    placeholderTextColor={Colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color={Colors.textSecondary} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} color={Colors.textSecondary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.authSubmitButton, isLoading && styles.authSubmitButtonDisabled]}
                  onPress={handleAuth}
                  disabled={isLoading}
                >
                  <Text style={styles.authSubmitButtonText}>
                    {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
                  </Text>
                </TouchableOpacity>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Por que criar uma conta?</Text>
              <View style={styles.benefitItem}>
                <Cloud size={16} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.benefitText}>Sincronize seus dados na nuvem</Text>
              </View>
              <View style={styles.benefitItem}>
                <Shield size={16} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.benefitText}>Backup automático e seguro</Text>
              </View>
              <View style={styles.benefitItem}>
                <User size={16} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.benefitText}>Acesse de qualquer dispositivo</Text>
              </View>
              <View style={styles.benefitItem}>
                <Link size={16} color={Colors.primary} strokeWidth={1.5} />
                <Text style={styles.benefitText}>Login único para todos os apps Rumo</Text>
              </View>
            </View>
          </View>
        ) : (
          // Usuário logado
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountAvatar}>
                  <User size={24} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountEmail}>{user?.email}</Text>
                  <View style={styles.syncBadge}>
                    <Cloud size={12} color={Colors.success} strokeWidth={1.5} />
                    <Text style={styles.syncText}>Sincronizado</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.accountButton}
                onPress={() => {
                  Alert.alert('Sair da Conta', 'Seus dados locais serão mantidos. Deseja sair?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Sair',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await signOut();
                        } catch (error) {
                          Alert.alert('Erro', 'Não foi possível sair da conta');
                        }
                      },
                    },
                  ]);
                }}
              >
                <LogOut size={16} color={Colors.error} strokeWidth={1.5} />
                <Text style={styles.accountButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={18} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.settingLabel}>Notificações</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={notifications ? Colors.primary : Colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Palette size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Aparência</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Globe size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Idioma e Região</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Assinatura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assinatura</Text>

          <TouchableOpacity
            style={styles.subscriptionCard}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.subscriptionIcon}>
              <Star size={20} color={Colors.warning} strokeWidth={1.5} />
            </View>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>Plano Premium</Text>
              <Text style={styles.subscriptionText}>Todas as funcionalidades liberadas</Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Integração Apps Rumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integração</Text>

          <TouchableOpacity
            style={styles.integrationCard}
            onPress={() => router.push('/machines-integration' as any)}
          >
            <View style={[styles.integrationIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Tractor size={20} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.integrationInfo}>
              <Text style={styles.integrationTitle}>Rumo Máquinas</Text>
              <Text style={styles.integrationText}>Gestão de frota conectada</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Link size={14} color="#fff" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <FileText size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Exportar Dados</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Sincronização</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help' as any)}>
            <View style={styles.menuIcon}>
              <HelpCircle size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Central de Ajuda</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/privacidade' as any)}
          >
            <View style={styles.menuIcon}>
              <Shield size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Privacidade</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/termos' as any)}>
            <View style={styles.menuIcon}>
              <FileText size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Termos de Uso</Text>
            <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Rumo Finance v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2026 Rumo Agro</Text>
        </View>

        <View style={styles.bottomSpacing} />
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Conta - Logado
  accountCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 12,
    color: Colors.success,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  accountButtonText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  // Hero Section - Login
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authTabActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  authTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  authForm: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  authInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  authSubmitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  authSubmitButtonDisabled: {
    opacity: 0.7,
  },
  authSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
  },
  benefitsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Preferências
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  // Assinatura
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  subscriptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.warning + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subscriptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  // Integração
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  integrationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  integrationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  connectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 30,
  },
});
