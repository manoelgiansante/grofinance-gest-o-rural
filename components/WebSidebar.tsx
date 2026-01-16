import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { 
  LayoutDashboard, FileText, TrendingUp, TrendingDown, 
  Building2, Users, Package, ShoppingCart, DollarSign,
  BarChart3, Calendar, Settings, HelpCircle, Briefcase
} from "lucide-react-native";
import { router, usePathname } from "expo-router";
import Colors from "@/constants/colors";

const menuSections: {
  title: string;
  items: {
    icon: any;
    label: string;
    route: string;
    badge?: number;
  }[];
}[] = [
  {
    title: "VISÃO GERAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "/" },
      { icon: BarChart3, label: "Relatórios", route: "/reports" },
    ]
  },
  {
    title: "FINANCEIRO",
    items: [
      { icon: TrendingDown, label: "Contas a Pagar", route: "/expenses" },
      { icon: TrendingUp, label: "Contas a Receber", route: "/receivables" },
      { icon: DollarSign, label: "Bancos e Caixa", route: "/cash-flow" },
      { icon: Calendar, label: "DRE", route: "/dre" },
    ]
  },
  {
    title: "OPERACIONAL",
    items: [
      { icon: FileText, label: "Fiscal", route: "/fiscal" },
      { icon: Package, label: "Estoque", route: "/stock" },
      { icon: ShoppingCart, label: "Compras", route: "/purchase-orders" },
      { icon: Briefcase, label: "Contratos", route: "/contracts" },
    ]
  },
  {
    title: "CADASTROS",
    items: [
      { icon: Building2, label: "Operações", route: "/operations" },
      { icon: Users, label: "Fornecedores", route: "/suppliers" },
      { icon: Users, label: "Clientes", route: "/clients" },
    ]
  },
];

export default function WebSidebar() {
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <Text style={styles.logo}>Agrofinance</Text>
        <Text style={styles.subtitle}>Gestão Rural</Text>
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
                  <Icon 
                    size={20} 
                    color={active ? Colors.primary : Colors.textMuted} 
                  />
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
          <Settings size={18} color={Colors.textMuted} />
          <Text style={styles.footerText}>Configurações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} activeOpacity={0.7}>
          <HelpCircle size={18} color={Colors.textMuted} />
          <Text style={styles.footerText}>Ajuda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: Colors.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: Colors.sidebarBorder,
    height: '100%',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  menu: {
    flex: 1,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    marginHorizontal: 12,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: Colors.sidebarActive,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  menuLabelActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.sidebarBorder,
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
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
});
