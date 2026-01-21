import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Video,
  Headphones,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

const faqItems = [
  {
    question: 'Como adicionar uma nova despesa?',
    answer:
      'Vá para a aba Despesas e toque no botão + no canto inferior direito. Preencha os dados da despesa e toque em Salvar.',
  },
  {
    question: 'Como exportar meus relatórios?',
    answer:
      'Acesse Relatórios, selecione o período desejado e toque em Exportar. Você pode escolher entre PDF ou Excel.',
  },
  {
    question: 'Como funciona a assinatura premium?',
    answer:
      'A assinatura premium por R$49,90/mês libera recursos avançados como importação de Excel, previsões financeiras e relatórios ilimitados.',
  },
  {
    question: 'Como cadastrar minhas fazendas?',
    answer:
      'Acesse o menu Fazendas na tela principal. Toque em + para adicionar uma nova propriedade com nome, área e localização.',
  },
  {
    question: 'Posso usar o app offline?',
    answer:
      'Sim! Os dados ficam salvos localmente e sincronizam automaticamente quando você reconectar à internet.',
  },
];

const helpResources = [
  {
    icon: BookOpen,
    title: 'Guia do Usuário',
    description: 'Manual completo do aplicativo',
    action: 'guide',
  },
  {
    icon: Video,
    title: 'Tutoriais em Vídeo',
    description: 'Aprenda com vídeos passo a passo',
    action: 'videos',
  },
  {
    icon: MessageCircle,
    title: 'Chat de Suporte',
    description: 'Fale conosco em tempo real',
    action: 'chat',
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: 'suporte@rumoagro.com.br',
    action: 'email',
  },
  {
    icon: Headphones,
    title: 'Telefone',
    description: '0800 123 4567',
    action: 'phone',
  },
];

export default function HelpScreen() {
  const isWeb = Platform.OS === 'web';

  const handleResourcePress = (action: string) => {
    switch (action) {
      case 'guide':
        Linking.openURL('https://rumoagro.com.br/guia');
        break;
      case 'videos':
        Linking.openURL('https://youtube.com/@rumoagro');
        break;
      case 'chat':
        Linking.openURL('https://rumoagro.com.br/chat');
        break;
      case 'email':
        Linking.openURL('mailto:suporte@rumoagro.com.br');
        break;
      case 'phone':
        Linking.openURL('tel:08001234567');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Ajuda e Suporte</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <HelpCircle size={40} color={Colors.primary} />
            <Text style={styles.welcomeTitle}>Como podemos ajudar?</Text>
            <Text style={styles.welcomeText}>
              Encontre respostas para suas dúvidas ou entre em contato com nossa equipe de suporte.
            </Text>
          </View>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          <View style={styles.faqContainer}>
            {faqItems.map((item, index) => (
              <View
                key={index}
                style={[styles.faqItem, index < faqItems.length - 1 && styles.faqItemBorder]}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          {/* Help Resources */}
          <Text style={styles.sectionTitle}>Recursos de Ajuda</Text>
          <View style={styles.resourcesContainer}>
            {helpResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress(resource.action)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resourceIcon}>
                    <Icon size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceDescription}>{resource.description}</Text>
                  </View>
                  <ExternalLink size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>Rumo Finance</Text>
            <Text style={styles.appInfoVersion}>Versão 1.0.0</Text>
            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => router.push('/termos')}>
                <Text style={styles.linkText}>Termos de Uso</Text>
              </TouchableOpacity>
              <Text style={styles.linkSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push('/privacidade')}>
                <Text style={styles.linkText}>Privacidade</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  faqContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  resourcesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resourceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  appInfoVersion: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
  },
  linkSeparator: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },
});
