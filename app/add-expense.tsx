import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, FileText } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { suppliers } from '@/mocks/data';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Expense, Attachment } from '@/types';

export default function AddExpenseScreen() {
  const { operations, addExpense, user } = useApp();
  const [description, setDescription] = useState('');
  const [supplierId, setSupplier] = useState('');
  const [operationId, setOperation] = useState('');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        type: 'photo',
        uri: result.assets[0].uri,
        name: `Foto_${Date.now()}.jpg`,
        uploadedAt: new Date(),
        uploadedBy: user.id,
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleSave = () => {
    if (!description || !supplierId || !operationId || !category || !value) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description,
      supplierId,
      operationId,
      category,
      negotiatedValue: parseFloat(value.replace(/\./g, '').replace(',', '.')),
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      competence: new Date(),
      paymentMethod: 'boleto',
      status: 'pending_validation',
      attachments,
      createdBy: user.id,
      createdAt: new Date(),
    };

    addExpense(newExpense);
    Alert.alert('Sucesso', 'Despesa criada com sucesso!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Despesa</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Ração para gado - Lote 15"
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fornecedor *</Text>
          {suppliers.length === 0 ? (
            <TouchableOpacity style={styles.emptyWarning} onPress={() => router.push('/suppliers')}>
              <Text style={styles.emptyWarningText}>Nenhum fornecedor cadastrado</Text>
              <Text style={styles.emptyWarningLink}>Toque aqui para cadastrar →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert('Selecionar Fornecedor', '', [
                    ...suppliers.map((s) => ({
                      text: s.name,
                      onPress: () => setSupplier(s.id),
                    })),
                    { text: '+ Cadastrar novo', onPress: () => router.push('/suppliers') },
                    { text: 'Cancelar', style: 'cancel' as const },
                  ]);
                }}
              >
                <Text style={supplierId ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                  {supplierId
                    ? suppliers.find((s) => s.id === supplierId)?.name
                    : 'Selecione o fornecedor'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Operação *</Text>
          {operations.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyWarning}
              onPress={() => router.push('/operations')}
            >
              <Text style={styles.emptyWarningText}>Nenhuma operação cadastrada</Text>
              <Text style={styles.emptyWarningLink}>Toque aqui para cadastrar →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => {
                  Alert.alert('Selecionar Operação', '', [
                    ...operations.map((op) => ({
                      text: op.name,
                      onPress: () => setOperation(op.id),
                    })),
                    { text: '+ Cadastrar nova', onPress: () => router.push('/operations') },
                    { text: 'Cancelar', style: 'cancel' as const },
                  ]);
                }}
              >
                <Text
                  style={operationId ? styles.pickerTextSelected : styles.pickerTextPlaceholder}
                >
                  {operationId
                    ? operations.find((o) => o.id === operationId)?.name
                    : 'Selecione a operação'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                const categories = [
                  'Insumos',
                  'Manutenção',
                  'Combustível',
                  'Utilidades',
                  'Mão de obra',
                ];
                Alert.alert(
                  'Selecionar Categoria',
                  '',
                  categories.map((cat) => ({
                    text: cat,
                    onPress: () => setCategory(cat),
                  }))
                );
              }}
            >
              <Text style={category ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                {category || 'Selecione a categoria'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor (R$) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor={Colors.textSecondary}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Anexos</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
            <Camera size={20} color={Colors.primary} />
            <Text style={styles.uploadButtonText}>Adicionar Foto/Documento</Text>
          </TouchableOpacity>
          {attachments.map((att) => (
            <View key={att.id} style={styles.attachmentItem}>
              <FileText size={16} color={Colors.textSecondary} />
              <Text style={styles.attachmentName}>{att.name}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Salvar Despesa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
    padding: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: 0.2,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  picker: {
    padding: 18,
  },
  pickerTextPlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  pickerTextSelected: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  footer: {
    padding: 24,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  emptyWarning: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 16,
    padding: 18,
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
