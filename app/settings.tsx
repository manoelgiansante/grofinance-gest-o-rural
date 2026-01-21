import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Settings,
  Bell,
  HelpCircle,
  Shield,
  FileText,
  Palette,
  Globe,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const isWeb = Platform.OS === 'web';

  const settingsSections = [
    {
      title: 'Geral',
      items: [
        {
          icon: Bell,
          label: 'Notificações',
          route: '/settings/notifications',
          description: 'Alertas e lembretes',
        },
        {
          icon: Palette,
          label: 'Aparência',
          route: '/settings/appearance',
          description: 'Tema e cores',
        },
        {
          icon: Globe,
          label: 'Idioma e Região',
          route: '/settings/language',
          description: 'Português (BR)',
        },
      ],
    },
    {
      title: 'Dados',
      items: [
        {
          icon: FileText,
          label: 'Exportar Dados',
          route: '/settings/export',
          description: 'Backup em Excel/PDF',
        },
        {
          icon: Settings,
          label: 'Sincronização',
          route: '/settings/sync',
          description: 'Configurar nuvem',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: Shield,
          label: 'Privacidade',
          route: '/privacidade',
          description: 'Política de privacidade',
        },
        {
          icon: FileText,
          label: 'Termos de Uso',
          route: '/termos',
          description: 'Termos e condições',
        },
        {
          icon: HelpCircle,
          label: 'Ajuda e Suporte',
          route: '/suporte',
          description: 'Central de ajuda',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={itemIndex}
                      style={[
                        styles.settingItem,
                        itemIndex < section.items.length - 1 && styles.settingItemBorder,
                      ]}
                      onPress={() => router.push(item.route as any)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingIcon}>
                        <Icon size={22} color={Colors.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingDescription}>{item.description}</Text>
                      </View>
                      <ChevronRight size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Rumo Finance v1.0.0</Text>
            <Text style={styles.versionSubtext}>© 2026 Rumo Agro</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
