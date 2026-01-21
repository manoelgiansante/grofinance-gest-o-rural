import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, DollarSign } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';

export default function AddRevenueScreen() {
  const { addRevenue, operations, clients } = useApp();
  const [description, setDescription] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [value, setValue] = useState('');

  const handleSave = async () => {
    if (!description || !selectedOperation || !selectedClient || !value) {
      return;
    }

    await addRevenue({
      description,
      clientId: selectedClient,
      operationId: selectedOperation,
      category: 'Venda',
      value: parseFloat(value.replace(/\./g, '').replace(',', '.')),
      date: new Date(),
      dueDate: new Date(),
      status: 'pending',
      paymentMethod: 'transfer',
      attachments: [],
      createdBy: 'user-1',
    });

    router.back();
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={isWeb ? [] : ['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Nova Receita</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Venda de gado"
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Cliente</Text>
            {clients.length === 0 ? (
              <TouchableOpacity style={styles.emptyWarning} onPress={() => router.push('/clients')}>
                <Text style={styles.emptyWarningText}>Nenhum cliente cadastrado</Text>
                <Text style={styles.emptyWarningLink}>Toque aqui para cadastrar →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectContainer}>
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.selectOption,
                      selectedClient === client.id && styles.selectOptionActive,
                    ]}
                    onPress={() => setSelectedClient(client.id)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedClient === client.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {client.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Operação</Text>
            {operations.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyWarning}
                onPress={() => router.push('/operations')}
              >
                <Text style={styles.emptyWarningText}>Nenhuma operação cadastrada</Text>
                <Text style={styles.emptyWarningLink}>Toque aqui para cadastrar →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectContainer}>
                {operations.map((op) => (
                  <TouchableOpacity
                    key={op.id}
                    style={[
                      styles.selectOption,
                      selectedOperation === op.id && styles.selectOptionActive,
                    ]}
                    onPress={() => setSelectedOperation(op.id)}
                  >
                    <View style={[styles.operationDot, { backgroundColor: op.color }]} />
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedOperation === op.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {op.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Valor</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.inputIconned}
                placeholder="0,00"
                placeholderTextColor={Colors.textTertiary}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIconned: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  selectContainer: {
    gap: 10,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  operationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyWarning: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    alignItems: 'center',
  },
  emptyWarningText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  emptyWarningLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
