import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from '@/providers/AppProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import WebSidebar from '@/components/WebSidebar';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <WebSidebar />
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="expense-details" />
            <Stack.Screen name="add-expense" />
            <Stack.Screen name="add-revenue" />
            <Stack.Screen name="stock" />
            <Stack.Screen name="receivables" />
            <Stack.Screen name="revenues" />
            <Stack.Screen name="cash-flow" />
            <Stack.Screen name="bank-reconciliation" />
            <Stack.Screen name="conciliacao-bancaria" />
            <Stack.Screen name="livro-caixa" />
            <Stack.Screen name="dre" />
            <Stack.Screen name="fiscal/index" />
            <Stack.Screen name="fiscal/nfe-wizard" />
            <Stack.Screen name="fiscal/nfe-details" />
            <Stack.Screen name="fiscal/mdfe-wizard" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="purchase-orders" />
            <Stack.Screen name="contracts" />
            <Stack.Screen name="farms" />
            <Stack.Screen name="suppliers" />
            <Stack.Screen name="clients" />
            <Stack.Screen name="fields" />
            <Stack.Screen name="seasons" />
            <Stack.Screen name="barter" />
            <Stack.Screen name="arrendamento" />
            <Stack.Screen name="operations" />
            <Stack.Screen name="assets" />
            <Stack.Screen name="budget" />
            <Stack.Screen name="forecast" />
            <Stack.Screen name="closing" />
            <Stack.Screen name="suporte" />
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: 'Voltar' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Assinatura',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="expense-details"
        options={{
          title: 'Detalhes da Despesa',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          title: 'Nova Despesa',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="stock" options={{ title: 'Estoque' }} />
      <Stack.Screen name="receivables" options={{ title: 'Contas a Receber' }} />
      <Stack.Screen name="cash-flow" options={{ title: 'Fluxo de Caixa' }} />
      <Stack.Screen name="fiscal/index" options={{ title: 'Fiscal' }} />
      <Stack.Screen
        name="fiscal/nfe-wizard"
        options={{ title: 'Emitir NF-e', presentation: 'modal' }}
      />
      <Stack.Screen name="fiscal/nfe-details" options={{ title: 'Detalhes NF-e' }} />
      <Stack.Screen
        name="fiscal/mdfe-wizard"
        options={{ title: 'Emitir MDF-e', presentation: 'modal' }}
      />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
      <Stack.Screen name="purchase-orders" options={{ title: 'Pedidos de Compra' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
