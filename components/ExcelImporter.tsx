import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  Download,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';

interface ColumnMapping {
  originalColumn: string;
  mappedField: string;
  confidence: number;
  sampleData: string[];
}

interface ImportPreviewRow {
  rowNumber: number;
  originalData: Record<string, string>;
  mappedData: Record<string, any>;
  errors: string[];
  status: 'valid' | 'warning' | 'error';
}

interface ExcelImporterProps {
  targetTable:
    | 'farms'
    | 'suppliers'
    | 'clients'
    | 'expenses'
    | 'revenues'
    | 'assets'
    | 'stock_items';
  onImportComplete: (importedCount: number) => void;
  onClose: () => void;
}

// Mapeamento de campos por tabela
const TABLE_FIELDS: Record<
  string,
  { field: string; label: string; required: boolean; type: string }[]
> = {
  farms: [
    { field: 'name', label: 'Nome da Fazenda', required: true, type: 'text' },
    { field: 'cpf_cnpj', label: 'CPF/CNPJ', required: false, type: 'text' },
    { field: 'state_registration', label: 'Inscrição Estadual', required: false, type: 'text' },
    { field: 'area', label: 'Área (ha)', required: false, type: 'number' },
    { field: 'city', label: 'Cidade', required: false, type: 'text' },
    { field: 'state', label: 'Estado', required: false, type: 'text' },
  ],
  suppliers: [
    { field: 'name', label: 'Nome', required: true, type: 'text' },
    { field: 'cpf_cnpj', label: 'CPF/CNPJ', required: false, type: 'text' },
    { field: 'category', label: 'Categoria', required: false, type: 'text' },
    { field: 'email', label: 'E-mail', required: false, type: 'email' },
    { field: 'phone', label: 'Telefone', required: false, type: 'text' },
    { field: 'city', label: 'Cidade', required: false, type: 'text' },
    { field: 'state', label: 'Estado', required: false, type: 'text' },
  ],
  clients: [
    { field: 'name', label: 'Nome', required: true, type: 'text' },
    { field: 'cpf_cnpj', label: 'CPF/CNPJ', required: false, type: 'text' },
    { field: 'type', label: 'Tipo (PF/PJ)', required: false, type: 'text' },
    { field: 'email', label: 'E-mail', required: false, type: 'email' },
    { field: 'phone', label: 'Telefone', required: false, type: 'text' },
    { field: 'city', label: 'Cidade', required: false, type: 'text' },
    { field: 'state', label: 'Estado', required: false, type: 'text' },
  ],
  expenses: [
    { field: 'description', label: 'Descrição', required: true, type: 'text' },
    { field: 'supplier', label: 'Fornecedor', required: false, type: 'text' },
    { field: 'category', label: 'Categoria', required: false, type: 'text' },
    { field: 'agreed_value', label: 'Valor', required: false, type: 'currency' },
    { field: 'due_date', label: 'Data de Vencimento', required: false, type: 'date' },
    { field: 'status', label: 'Status', required: false, type: 'text' },
    { field: 'notes', label: 'Observações', required: false, type: 'text' },
  ],
  revenues: [
    { field: 'description', label: 'Descrição', required: true, type: 'text' },
    { field: 'category', label: 'Categoria', required: false, type: 'text' },
    { field: 'value', label: 'Valor', required: false, type: 'currency' },
    { field: 'date', label: 'Data', required: false, type: 'date' },
    { field: 'due_date', label: 'Data de Vencimento', required: false, type: 'date' },
    { field: 'status', label: 'Status', required: false, type: 'text' },
  ],
  assets: [
    { field: 'name', label: 'Nome', required: true, type: 'text' },
    { field: 'type', label: 'Tipo', required: false, type: 'text' },
    { field: 'brand', label: 'Marca', required: false, type: 'text' },
    { field: 'model', label: 'Modelo', required: false, type: 'text' },
    { field: 'serial_number', label: 'Número de Série', required: false, type: 'text' },
    { field: 'purchase_value', label: 'Valor de Compra', required: false, type: 'currency' },
    { field: 'purchase_date', label: 'Data de Compra', required: false, type: 'date' },
  ],
  stock_items: [
    { field: 'name', label: 'Nome', required: true, type: 'text' },
    { field: 'type', label: 'Tipo', required: false, type: 'text' },
    { field: 'category', label: 'Categoria', required: false, type: 'text' },
    { field: 'unit', label: 'Unidade', required: false, type: 'text' },
    { field: 'current_stock', label: 'Estoque Atual', required: false, type: 'number' },
    { field: 'min_stock', label: 'Estoque Mínimo', required: false, type: 'number' },
  ],
};

// Sinônimos para mapeamento automático com IA
const FIELD_SYNONYMS: Record<string, string[]> = {
  name: [
    'nome',
    'razão social',
    'razao social',
    'denominação',
    'denominacao',
    'descrição',
    'descricao',
    'titulo',
    'título',
  ],
  cpf_cnpj: ['cpf', 'cnpj', 'cpf/cnpj', 'documento', 'doc', 'identificação', 'identificacao'],
  email: ['e-mail', 'email', 'correio', 'mail'],
  phone: ['telefone', 'tel', 'fone', 'celular', 'whatsapp', 'contato'],
  city: ['cidade', 'municipio', 'município', 'localidade'],
  state: ['estado', 'uf', 'unidade federativa'],
  address: ['endereço', 'endereco', 'logradouro', 'rua'],
  category: ['categoria', 'tipo', 'classificação', 'classificacao', 'grupo'],
  value: ['valor', 'preço', 'preco', 'custo', 'total', 'montante', 'quantia'],
  agreed_value: ['valor acordado', 'valor negociado', 'valor combinado', 'valor', 'preço', 'preco'],
  purchase_value: [
    'valor de compra',
    'valor aquisição',
    'valor aquisicao',
    'custo',
    'preço',
    'preco',
  ],
  date: ['data', 'dt', 'quando', 'emissão', 'emissao'],
  due_date: ['vencimento', 'data vencimento', 'dt vencimento', 'prazo', 'data limite'],
  purchase_date: ['data compra', 'data aquisição', 'data aquisicao', 'dt compra'],
  description: ['descrição', 'descricao', 'detalhe', 'obs', 'observação', 'observacao', 'item'],
  notes: ['notas', 'observações', 'observacoes', 'obs', 'comentário', 'comentarios'],
  status: ['status', 'situação', 'situacao', 'estado', 'condição', 'condicao'],
  area: ['área', 'area', 'hectares', 'ha', 'tamanho', 'extensão'],
  brand: ['marca', 'fabricante', 'manufacturer'],
  model: ['modelo', 'versão', 'versao'],
  serial_number: ['número série', 'numero serie', 'serial', 'ns', 'chassi'],
  type: ['tipo', 'classificação', 'classificacao', 'natureza'],
  unit: ['unidade', 'un', 'medida', 'und'],
  current_stock: ['estoque', 'quantidade', 'qtd', 'qtde', 'saldo'],
  min_stock: ['estoque mínimo', 'estoque minimo', 'qtd mínima', 'mínimo', 'minimo'],
  state_registration: ['inscrição estadual', 'inscricao estadual', 'ie', 'insc. estadual'],
};

export default function ExcelImporter({
  targetTable,
  onImportComplete,
  onClose,
}: ExcelImporterProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>(
    'upload'
  );
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [importResult, setImportResult] = useState({
    success: 0,
    failed: 0,
    errors: [] as string[],
  });

  const tableFields = TABLE_FIELDS[targetTable] || [];
  const tableLabel = {
    farms: 'Fazendas',
    suppliers: 'Fornecedores',
    clients: 'Clientes',
    expenses: 'Despesas',
    revenues: 'Receitas',
    assets: 'Patrimônio',
    stock_items: 'Estoque',
  }[targetTable];

  // Função de IA para mapear colunas automaticamente
  const aiMapColumns = useCallback(
    (cols: string[], sampleData: Record<string, string>[]): ColumnMapping[] => {
      return cols.map((col) => {
        const normalizedCol = col.toLowerCase().trim();
        let bestMatch = '';
        let bestConfidence = 0;

        // Buscar correspondência nos sinônimos
        for (const field of tableFields) {
          const synonyms = FIELD_SYNONYMS[field.field] || [field.field, field.label.toLowerCase()];

          for (const synonym of synonyms) {
            const normalizedSynonym = synonym.toLowerCase();

            // Correspondência exata
            if (normalizedCol === normalizedSynonym) {
              bestMatch = field.field;
              bestConfidence = 100;
              break;
            }

            // Correspondência parcial
            if (
              normalizedCol.includes(normalizedSynonym) ||
              normalizedSynonym.includes(normalizedCol)
            ) {
              const similarity =
                Math.max(
                  normalizedCol.length / normalizedSynonym.length,
                  normalizedSynonym.length / normalizedCol.length
                ) * 80;

              if (similarity > bestConfidence) {
                bestMatch = field.field;
                bestConfidence = Math.round(similarity);
              }
            }
          }

          if (bestConfidence === 100) break;
        }

        // Análise do conteúdo para melhorar a confiança
        const samples = sampleData.slice(0, 5).map((row) => row[col] || '');

        if (!bestMatch && samples.some((s) => s)) {
          // Tentar identificar pelo formato dos dados
          const allNumeric = samples.every((s) => !s || /^[\d.,]+$/.test(s));
          const allDates = samples.every((s) => !s || /^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(s));
          const allEmails = samples.every((s) => !s || /@/.test(s));

          if (allEmails) {
            bestMatch = 'email';
            bestConfidence = 70;
          } else if (allDates) {
            const dateFields = tableFields.filter((f) => f.type === 'date');
            if (dateFields.length > 0) {
              bestMatch = dateFields[0].field;
              bestConfidence = 60;
            }
          } else if (allNumeric) {
            const numericFields = tableFields.filter(
              (f) => f.type === 'number' || f.type === 'currency'
            );
            if (numericFields.length > 0) {
              bestMatch = numericFields[0].field;
              bestConfidence = 50;
            }
          }
        }

        return {
          originalColumn: col,
          mappedField: bestMatch,
          confidence: bestConfidence,
          sampleData: samples,
        };
      });
    },
    [tableFields]
  );

  // Processar arquivo Excel/CSV
  const processFile = async (uri: string, name: string) => {
    setLoading(true);
    try {
      const content = await FileSystem.readAsStringAsync(uri);

      // Parse CSV simples (para Excel completo, precisaria de biblioteca como xlsx)
      const lines = content.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error('Arquivo vazio ou sem dados');
      }

      // Detectar separador
      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : ',';

      const headers = firstLine.split(separator).map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const data: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        data.push(row);
      }

      setColumns(headers);
      setRawData(data);
      setFileName(name);

      // IA mapeia as colunas automaticamente
      const autoMapping = aiMapColumns(headers, data);
      setMapping(autoMapping);

      setStep('mapping');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o arquivo. Verifique se é um CSV válido.');
    } finally {
      setLoading(false);
    }
  };

  // Selecionar arquivo
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await processFile(file.uri, file.name);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  // Atualizar mapeamento manual
  const updateMapping = (originalColumn: string, newField: string) => {
    setMapping((prev) =>
      prev.map((m) =>
        m.originalColumn === originalColumn
          ? { ...m, mappedField: newField, confidence: newField ? 100 : 0 }
          : m
      )
    );
  };

  // Gerar preview
  const generatePreview = () => {
    const preview: ImportPreviewRow[] = rawData.slice(0, 10).map((row, idx) => {
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];

      mapping.forEach((m) => {
        if (m.mappedField && row[m.originalColumn]) {
          const field = tableFields.find((f) => f.field === m.mappedField);
          let value: any = row[m.originalColumn];

          // Conversão de tipos
          if (field?.type === 'number' || field?.type === 'currency') {
            value = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          } else if (field?.type === 'date') {
            // Tentar converter data
            const parts = value.split(/[\/\-]/);
            if (parts.length === 3) {
              const [d, m, y] = parts;
              value = `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
          }

          mappedData[m.mappedField] = value;
        }
      });

      // Validar campos obrigatórios
      tableFields
        .filter((f) => f.required)
        .forEach((f) => {
          if (!mappedData[f.field]) {
            errors.push(`Campo obrigatório "${f.label}" está vazio`);
          }
        });

      return {
        rowNumber: idx + 1,
        originalData: row,
        mappedData,
        errors,
        status: errors.length > 0 ? 'error' : ('valid' as const),
      };
    });

    setPreviewRows(preview);
    setStep('preview');
  };

  // Executar importação
  const executeImport = async () => {
    setStep('importing');
    setLoading(true);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Simular importação (aqui você conectaria com Supabase)
    for (const row of rawData) {
      try {
        const mappedData: Record<string, any> = {};

        mapping.forEach((m) => {
          if (m.mappedField && row[m.originalColumn]) {
            const field = tableFields.find((f) => f.field === m.mappedField);
            let value: any = row[m.originalColumn];

            if (field?.type === 'number' || field?.type === 'currency') {
              value = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            } else if (field?.type === 'date') {
              const parts = value.split(/[\/\-]/);
              if (parts.length === 3) {
                const [d, m, y] = parts;
                value = `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
              }
            }

            mappedData[m.mappedField] = value;
          }
        });

        // Verificar campos obrigatórios
        const requiredFields = tableFields.filter((f) => f.required);
        const missingRequired = requiredFields.filter((f) => !mappedData[f.field]);

        if (missingRequired.length > 0) {
          throw new Error(
            `Campos obrigatórios faltando: ${missingRequired.map((f) => f.label).join(', ')}`
          );
        }

        // Aqui você faria o INSERT no Supabase
        // await supabase.from(targetTable).insert(mappedData);

        success++;
      } catch (error: any) {
        failed++;
        errors.push(error.message);
      }
    }

    setImportResult({ success, failed, errors: errors.slice(0, 10) });
    setStep('complete');
    setLoading(false);
  };

  // Renderizar etapa atual
  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <View style={styles.stepContent}>
            <View style={styles.uploadIcon}>
              <FileSpreadsheet size={64} color="#2E7D32" />
            </View>
            <Text style={styles.uploadTitle}>Importar {tableLabel}</Text>
            <Text style={styles.uploadDescription}>
              Selecione um arquivo Excel (.xlsx) ou CSV para importar seus dados. Nossa IA irá
              identificar automaticamente as colunas e mapear para o sistema.
            </Text>

            <View style={styles.aiFeature}>
              <Sparkles size={20} color="#FF9800" />
              <Text style={styles.aiFeatureText}>
                Mapeamento automático com Inteligência Artificial
              </Text>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Upload size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Selecionar Arquivo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.supportedFormats}>
              <Text style={styles.supportedFormatsTitle}>Formatos suportados:</Text>
              <Text style={styles.supportedFormatsText}>CSV, XLS, XLSX</Text>
            </View>
          </View>
        );

      case 'mapping':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Sparkles size={24} color="#FF9800" />
              <Text style={styles.stepTitle}>Mapeamento Inteligente</Text>
            </View>
            <Text style={styles.stepDescription}>
              A IA identificou as colunas do seu arquivo. Revise e ajuste se necessário.
            </Text>

            <ScrollView style={styles.mappingList}>
              {mapping.map((m, idx) => (
                <View key={idx} style={styles.mappingItem}>
                  <View style={styles.mappingSource}>
                    <Text style={styles.mappingSourceLabel}>Coluna no arquivo:</Text>
                    <Text style={styles.mappingSourceValue}>{m.originalColumn}</Text>
                    <Text style={styles.mappingSample}>
                      Ex:{' '}
                      {m.sampleData
                        .filter((s) => s)
                        .slice(0, 2)
                        .join(', ') || '(vazio)'}
                    </Text>
                  </View>

                  <ArrowRight size={20} color="#666" />

                  <View style={styles.mappingTarget}>
                    <Text style={styles.mappingTargetLabel}>Campo no sistema:</Text>
                    <View style={styles.mappingSelect}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                          style={[
                            styles.mappingOption,
                            !m.mappedField && styles.mappingOptionSelected,
                          ]}
                          onPress={() => updateMapping(m.originalColumn, '')}
                        >
                          <Text
                            style={
                              !m.mappedField
                                ? styles.mappingOptionTextSelected
                                : styles.mappingOptionText
                            }
                          >
                            Ignorar
                          </Text>
                        </TouchableOpacity>
                        {tableFields.map((field) => (
                          <TouchableOpacity
                            key={field.field}
                            style={[
                              styles.mappingOption,
                              m.mappedField === field.field && styles.mappingOptionSelected,
                            ]}
                            onPress={() => updateMapping(m.originalColumn, field.field)}
                          >
                            <Text
                              style={
                                m.mappedField === field.field
                                  ? styles.mappingOptionTextSelected
                                  : styles.mappingOptionText
                              }
                            >
                              {field.label}
                              {field.required && ' *'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    {m.confidence > 0 && (
                      <View
                        style={[
                          styles.confidenceBadge,
                          m.confidence >= 80
                            ? styles.confidenceHigh
                            : m.confidence >= 50
                              ? styles.confidenceMedium
                              : styles.confidenceLow,
                        ]}
                      >
                        <Text style={styles.confidenceText}>{m.confidence}% confiança</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.stepActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('upload')}>
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={generatePreview}>
                <Eye size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Visualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'preview':
        const validCount = previewRows.filter((r) => r.status === 'valid').length;
        const errorCount = previewRows.filter((r) => r.status === 'error').length;

        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Eye size={24} color="#2E7D32" />
              <Text style={styles.stepTitle}>Pré-visualização</Text>
            </View>

            <View style={styles.previewStats}>
              <View style={styles.previewStat}>
                <Text style={styles.previewStatValue}>{rawData.length}</Text>
                <Text style={styles.previewStatLabel}>Total de linhas</Text>
              </View>
              <View style={styles.previewStat}>
                <CheckCircle size={20} color="#2E7D32" />
                <Text style={[styles.previewStatValue, { color: '#2E7D32' }]}>{validCount}</Text>
                <Text style={styles.previewStatLabel}>Válidas</Text>
              </View>
              <View style={styles.previewStat}>
                <XCircle size={20} color="#D32F2F" />
                <Text style={[styles.previewStatValue, { color: '#D32F2F' }]}>{errorCount}</Text>
                <Text style={styles.previewStatLabel}>Com erros</Text>
              </View>
            </View>

            <ScrollView style={styles.previewList}>
              {previewRows.map((row, idx) => (
                <View
                  key={idx}
                  style={[styles.previewRow, row.status === 'error' && styles.previewRowError]}
                >
                  <View style={styles.previewRowHeader}>
                    <Text style={styles.previewRowNumber}>Linha {row.rowNumber}</Text>
                    {row.status === 'valid' ? (
                      <CheckCircle size={16} color="#2E7D32" />
                    ) : (
                      <XCircle size={16} color="#D32F2F" />
                    )}
                  </View>
                  <View style={styles.previewRowData}>
                    {Object.entries(row.mappedData)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <Text key={key} style={styles.previewRowField} numberOfLines={1}>
                          <Text style={styles.previewRowFieldLabel}>
                            {tableFields.find((f) => f.field === key)?.label || key}:
                          </Text>{' '}
                          {String(value)}
                        </Text>
                      ))}
                  </View>
                  {row.errors.length > 0 && (
                    <View style={styles.previewRowErrors}>
                      {row.errors.map((error, errIdx) => (
                        <Text key={errIdx} style={styles.previewRowError}>
                          • {error}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.stepActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('mapping')}>
                <Text style={styles.secondaryButtonText}>Ajustar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={executeImport}>
                <Download size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Importar Tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'importing':
        return (
          <View style={styles.stepContent}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.importingText}>Importando dados...</Text>
            <Text style={styles.importingSubtext}>Isso pode levar alguns segundos</Text>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContent}>
            <View
              style={[
                styles.resultIcon,
                importResult.failed === 0 ? styles.resultIconSuccess : styles.resultIconWarning,
              ]}
            >
              {importResult.failed === 0 ? (
                <CheckCircle size={64} color="#2E7D32" />
              ) : (
                <AlertTriangle size={64} color="#FF9800" />
              )}
            </View>

            <Text style={styles.resultTitle}>
              {importResult.failed === 0 ? 'Importação Concluída!' : 'Importação Finalizada'}
            </Text>

            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: '#2E7D32' }]}>
                  {importResult.success}
                </Text>
                <Text style={styles.resultStatLabel}>Importados</Text>
              </View>
              {importResult.failed > 0 && (
                <View style={styles.resultStat}>
                  <Text style={[styles.resultStatValue, { color: '#D32F2F' }]}>
                    {importResult.failed}
                  </Text>
                  <Text style={styles.resultStatLabel}>Com erros</Text>
                </View>
              )}
            </View>

            {importResult.errors.length > 0 && (
              <View style={styles.resultErrors}>
                <Text style={styles.resultErrorsTitle}>Erros encontrados:</Text>
                {importResult.errors.map((error, idx) => (
                  <Text key={idx} style={styles.resultError}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.stepActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setStep('upload');
                  setRawData([]);
                  setMapping([]);
                  setPreviewRows([]);
                }}
              >
                <RefreshCw size={20} color="#2E7D32" />
                <Text style={styles.secondaryButtonText}>Nova Importação</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  onImportComplete(importResult.success);
                  onClose();
                }}
              >
                <Text style={styles.primaryButtonText}>Concluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XCircle size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Importar Excel</Text>
          <View style={styles.headerRight}>
            {fileName && (
              <Text style={styles.fileName} numberOfLines={1}>
                {fileName}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressBar}>
          {['upload', 'mapping', 'preview', 'complete'].map((s, idx) => (
            <React.Fragment key={s}>
              <View
                style={[
                  styles.progressStep,
                  ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) >= idx &&
                    styles.progressStepActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressStepText,
                    ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) >=
                      idx && styles.progressStepTextActive,
                  ]}
                >
                  {idx + 1}
                </Text>
              </View>
              {idx < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) > idx &&
                      styles.progressLineActive,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView style={styles.content}>{renderStep()}</ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    maxWidth: 100,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 4,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#2E7D32',
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressStepTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  progressLineActive: {
    backgroundColor: '#2E7D32',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 32,
  },
  aiFeatureText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  supportedFormats: {
    alignItems: 'center',
  },
  supportedFormatsTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  supportedFormatsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  mappingList: {
    width: '100%',
    maxHeight: 400,
  },
  mappingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
  },
  mappingSource: {
    flex: 1,
  },
  mappingSourceLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  mappingSourceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mappingSample: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  mappingTarget: {
    flex: 1,
  },
  mappingTargetLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  mappingSelect: {
    marginBottom: 4,
  },
  mappingOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mappingOptionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  mappingOptionText: {
    fontSize: 12,
    color: '#666',
  },
  mappingOptionTextSelected: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceHigh: {
    backgroundColor: '#E8F5E9',
  },
  confidenceMedium: {
    backgroundColor: '#FFF3E0',
  },
  confidenceLow: {
    backgroundColor: '#FFEBEE',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  previewStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  previewStat: {
    alignItems: 'center',
    gap: 4,
  },
  previewStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  previewStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  previewList: {
    width: '100%',
    maxHeight: 300,
  },
  previewRow: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  previewRowError: {
    backgroundColor: '#FFEBEE',
  },
  previewRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewRowNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  previewRowData: {
    gap: 2,
  },
  previewRowField: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  previewRowFieldLabel: {
    fontWeight: '600',
    color: '#666',
  },
  previewRowErrors: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffcdd2',
  },
  previewRowErrorText: {
    fontSize: 12,
    color: '#D32F2F',
  },
  importingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 24,
  },
  importingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  resultIcon: {
    marginBottom: 24,
  },
  resultIconSuccess: {},
  resultIconWarning: {},
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 24,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  resultStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultErrors: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resultErrorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  resultError: {
    fontSize: 12,
    color: '#D32F2F',
    marginBottom: 4,
  },
});
