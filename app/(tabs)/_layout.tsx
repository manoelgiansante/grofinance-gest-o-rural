import { Tabs } from "expo-router";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Menu,
  Tractor,
  Users,
  Package,
  Calculator,
  Settings,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Building2,
  Truck,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Colors from "@/constants/colors";

// Menu items para a sidebar
const MENU_ITEMS = [
  { 
    section: 'Principal',
    items: [
      { name: "index", title: "Dashboard", icon: LayoutDashboard, href: "/(tabs)" },
      { name: "expenses", title: "Despesas", icon: FileText, href: "/(tabs)/expenses" },
      { name: "validations", title: "Validações", icon: CheckSquare, href: "/(tabs)/validations", badge: 3 },
      { name: "reports", title: "Relatórios", icon: BarChart3, href: "/(tabs)/reports" },
    ]
  },
  {
    section: 'Cadastros',
    items: [
      { name: "farms", title: "Fazendas", icon: Tractor, href: "/farms" },
      { name: "suppliers", title: "Fornecedores", icon: Truck, href: "/suppliers" },
      { name: "clients", title: "Clientes", icon: Users, href: "/clients" },
      { name: "stock", title: "Estoque", icon: Package, href: "/stock" },
    ]
  },
  {
    section: 'Financeiro',
    items: [
      { name: "revenues", title: "Receitas", icon: TrendingUp, href: "/revenues" },
      { name: "accounts", title: "Contas Bancárias", icon: Landmark, href: "/accounts" },
      { name: "cashflow", title: "Fluxo de Caixa", icon: DollarSign, href: "/cashflow" },
      { name: "dre", title: "DRE", icon: Calculator, href: "/dre" },
    ]
  },
  {
    section: 'Fiscal',
    items: [
      { name: "nfe", title: "Notas Fiscais", icon: FileSpreadsheet, href: "/nfe" },
      { name: "company", title: "Empresa", icon: Building2, href: "/company" },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { name: "more", title: "Configurações", icon: Settings, href: "/(tabs)/more" },
    ]
  },
];

// Componente da Sidebar para Web
function WebSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index')) {
      return true;
    }
    return pathname.includes(href.replace('/(tabs)', ''));
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      {/* Header */}
      <View style={styles.sidebarHeader}>
        {!collapsed && (
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Tractor size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.logoText}>Rumo</Text>
              <Text style={styles.logoSubtext}>Finance</Text>
            </View>
          </View>
        )}
        {collapsed && (
          <View style={styles.logoIconOnly}>
            <Tractor size={24} color="#fff" />
          </View>
        )}
        <TouchableOpacity style={styles.collapseButton} onPress={onToggle}>
          {collapsed ? (
            <ChevronRight size={20} color="#fff" />
          ) : (
            <ChevronLeft size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.menuSection}>
            {!collapsed && (
              <Text style={styles.menuSectionTitle}>{section.section}</Text>
            )}
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuItem,
                    active && styles.menuItemActive,
                    collapsed && styles.menuItemCollapsed,
                  ]}
                  onPress={() => router.push(item.href as any)}
                >
                  <View style={[styles.menuItemIcon, active && styles.menuItemIconActive]}>
                    <Icon size={20} color={active ? '#fff' : '#9ca3af'} />
                  </View>
                  {!collapsed && (
                    <>
                      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                        {item.title}
                      </Text>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <View style={styles.badgeCollapsed}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.sidebarFooter}>
        {!collapsed && (
          <View style={styles.promoBox}>
            <Text style={styles.promoTitle}>Rumo Operacional</Text>
            <Text style={styles.promoText}>Grátis para assinantes!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 1024;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Se for web em tela grande, usa layout com sidebar
  if (isWeb && isLargeScreen) {
    return (
      <View style={styles.webContainer}>
        <WebSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <View style={styles.webContent}>
          <Tabs
            screenOptions={{
              tabBarStyle: { display: 'none' },
              headerShown: false,
            }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="expenses" />
            <Tabs.Screen name="validations" />
            <Tabs.Screen name="reports" />
            <Tabs.Screen name="settings" />
            <Tabs.Screen name="more" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
          </Tabs>
        </View>
      </View>
    );
  }

  // Layout mobile padrão com tabs na parte inferior
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surfaceElevated,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 10,
          height: 68,
          elevation: 8,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Despesas",
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="validations"
        options={{
          title: "Validações",
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Config",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Web Layout
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  webContent: {
    flex: 1,
  },
  
  // Sidebar
  sidebar: {
    width: 260,
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  sidebarCollapsed: {
    width: 72,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    minHeight: 72,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconOnly: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: -2,
  },
  collapseButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Menu
  sidebarContent: {
    flex: 1,
    paddingVertical: 8,
  },
  menuSection: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
    gap: 12,
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: '#334155',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIconActive: {
    backgroundColor: '#2E7D32',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeCollapsed: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Footer
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  promoBox: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  promoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});
