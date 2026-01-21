import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Calendar,
  Settings,
  HelpCircle,
  Briefcase,
  Tractor,
  CheckSquare,
  MapPin,
  Sprout,
  CreditCard,
  BookOpen,
  Home,
  FileBarChart,
  Archive,
  Repeat,
  ChevronRight,
} from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import Colors from '@/constants/colors';

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/' },
      { icon: FileText, label: 'Despesas', route: '/expenses' },
      { icon: CheckSquare, label: 'Validações', route: '/validations', badge: 3 },
      { icon: BarChart3, label: 'Relatórios', route: '/reports' },
    ],
  },
  {
    title: 'CADASTROS',
    items: [
      { icon: Tractor, label: 'Fazendas', route: '/farms' },
      { icon: Users, label: 'Fornecedores', route: '/suppliers' },
      { icon: Users, label: 'Clientes', route: '/clients' },
      { icon: Package, label: 'Estoque', route: '/stock' },
    ],
  },
  {
    title: 'FINANCEIRO',
    items: [
      { icon: TrendingUp, label: 'Receitas', route: '/revenues' },
      { icon: DollarSign, label: 'Fluxo de Caixa', route: '/cash-flow' },
      { icon: CreditCard, label: 'Conciliação Bancária', route: '/bank-reconciliation' },
      { icon: BookOpen, label: 'Livro Caixa', route: '/livro-caixa' },
      { icon: FileBarChart, label: 'DRE', route: '/dre' },
    ],
  },
  {
    title: 'OPERACIONAL',
    items: [
      { icon: FileText, label: 'Fiscal', route: '/fiscal' },
      { icon: ShoppingCart, label: 'Compras', route: '/purchase-orders' },
      { icon: Briefcase, label: 'Contratos', route: '/contracts' },
    ],
  },
  {
    title: 'PRODUÇÃO',
    items: [
      { icon: MapPin, label: 'Talhões', route: '/fields' },
      { icon: Sprout, label: 'Safras', route: '/seasons' },
      { icon: Repeat, label: 'Barter', route: '/barter' },
      { icon: Home, label: 'Arrendamento', route: '/arrendamento' },
    ],
  },
];

export default function WebSidebar() {
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  const isActive = (route: string) => {
    if (route === '/')
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (route === '/expenses') return pathname.includes('expenses');
    if (route === '/validations') return pathname.includes('validations');
    if (route === '/reports') return pathname.includes('reports');
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logo}>Agrofinance</Text>
            <Text style={styles.subtitle}>GESTÃO RURAL</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.route);

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <Icon size={20} color={active ? '#fff' : '#94a3b8'} />
                  <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <Settings size={18} color="#94a3b8" />
          <Text style={styles.footerText}>Configurações</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          activeOpacity={0.7}
          onPress={() => router.push('/suporte')}
        >
          <HelpCircle size={18} color="#94a3b8" />
          <Text style={styles.footerText}>Ajuda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    height: '100%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 1,
  },
  menu: {
    flex: 1,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#334155',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  menuLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
