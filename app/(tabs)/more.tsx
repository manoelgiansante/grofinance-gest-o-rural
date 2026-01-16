import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  User, Users, Package, ShoppingCart, TrendingUp, Briefcase, 
  FileText, Settings, HelpCircle, Building2, DollarSign,
  Archive, TrendingDown, Calendar, MapPin, Sprout, Repeat, Home,
  LineChart, FileBarChart
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { router } from "expo-router";

export default function MoreScreen() {

  const menuSections = [
    {
      title: "Produção & Rentabilidade",
      items: [
        { icon: MapPin, label: "Talhões", route: "/fields", color: "#10B981" },
        { icon: Sprout, label: "Safras", route: "/seasons", color: "#059669" },
        { icon: Repeat, label: "Barter/Troca", route: "/barter", color: "#F59E0B" },
        { icon: Home, label: "Arrendamento", route: "/leases", color: "#8B5CF6" },
      ]
    },
    {
      title: "Cadastros",
      items: [
        { icon: User, label: "Clientes", route: "/clients", color: Colors.info },
        { icon: Users, label: "Equipe", route: "/team", color: Colors.primary },
        { icon: Building2, label: "Fazendas", route: "/farms", color: Colors.success },
      ]
    },
    {
      title: "Operacional",
      items: [
        { icon: Package, label: "Estoque", route: "/stock", color: "#8B4513" },
        { icon: ShoppingCart, label: "Pedidos de Compra", route: "/purchase-orders", color: "#E67E22" },
        { icon: Briefcase, label: "Contratos", route: "/contracts", color: "#3498DB" },
      ]
    },
    {
      title: "Financeiro",
      items: [
        { icon: TrendingUp, label: "Receitas", route: "/revenues", color: "#27AE60" },
        { icon: TrendingDown, label: "Fluxo de Caixa", route: "/cash-flow", color: "#9B59B6" },
        { icon: LineChart, label: "Forecast", route: "/forecast", color: "#06B6D4" },
        { icon: FileBarChart, label: "DRE Gerencial", route: "/dre", color: "#EC4899" },
        { icon: Archive, label: "Patrimônio", route: "/assets", color: "#34495E" },
        { icon: DollarSign, label: "Orçamento", route: "/budget", color: "#F39C12" },
        { icon: Calendar, label: "Fechamento Mensal", route: "/closing", color: "#16A085" },
        { icon: FileText, label: "Fiscal", route: "/fiscal", color: "#C0392B" },
      ]
    },
    {
      title: "Configurações",
      items: [
        { icon: User, label: "Meu Perfil", route: "/profile", color: Colors.textSecondary },
        { icon: Settings, label: "Preferências", route: "/settings", color: Colors.textSecondary },
        { icon: HelpCircle, label: "Ajuda e Suporte", route: "/help", color: Colors.textSecondary },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mais</Text>
          <Text style={styles.subtitle}>Módulos e Configurações</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {menuSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.menuCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '18' }]}>
                      <Icon size={28} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Agrofinance v1.0.0</Text>
          <Text style={styles.versionSubtext}>Sistema de Gestão Financeira para o Agronegócio</Text>
        </View>
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
    paddingVertical: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '47.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  versionText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
