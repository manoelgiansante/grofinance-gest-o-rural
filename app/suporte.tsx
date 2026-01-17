import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Mail, Phone, MessageCircle, FileText, ChevronDown, ChevronUp, Clock, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FAQItem {
  question: string;
  answer: string;
}

export default function SuporteScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqs: FAQItem[] = [
    {
      question: 'Como cadastro uma nova despesa?',
      answer: 'Na tela inicial, toque no botão "+" ou acesse a aba Despesas e toque em "Nova Despesa". Preencha os campos obrigatórios como valor, categoria, data e descrição.',
    },
    {
      question: 'Como emito uma Nota Fiscal Eletrônica (NF-e)?',
      answer: 'Acesse o menu Fiscal > NF-e > "Emitir NF-e". Preencha os dados do destinatário, produtos/serviços, valores e informações fiscais. O sistema enviará automaticamente para a SEFAZ.',
    },
    {
      question: 'Posso importar extratos bancários?',
      answer: 'Sim! Acesse Fluxo de Caixa > Importar Extrato. Você pode importar arquivos OFX ou conectar sua conta via Open Finance para sincronização automática.',
    },
    {
      question: 'Como funciona o controle de estoque?',
      answer: 'O estoque é atualizado automaticamente quando você registra compras (entrada) ou vendas (saída). Você pode visualizar o estoque atual em Estoque e definir quantidades mínimas para alertas.',
    },
    {
      question: 'Como acompanho a rentabilidade dos meus talhões?',
      answer: 'Acesse Mais > Talhões & Rentabilidade. Lá você verá a margem bruta, ROI e custos por hectare de cada talhão, comparando orçamento vs. realizado.',
    },
    {
      question: 'Posso usar em múltiplas fazendas?',
      answer: 'Sim! Cadastre suas fazendas em Mais > Fazendas e alterne entre elas. Cada fazenda terá seu próprio controle financeiro, estoque e operações.',
    },
    {
      question: 'Como gero o DRE (Demonstrativo de Resultados)?',
      answer: 'Acesse Relatórios > DRE. O sistema gera automaticamente o demonstrativo com base nas receitas e despesas cadastradas, organizadas por categoria.',
    },
    {
      question: 'Os dados são sincronizados entre dispositivos?',
      answer: 'Sim! Todos os dados são salvos na nuvem e sincronizados automaticamente entre todos os seus dispositivos (celular, tablet, computador).',
    },
    {
      question: 'Como funciona o plano de assinatura?',
      answer: 'Oferecemos plano gratuito com recursos básicos e planos pagos com funcionalidades avançadas. Acesse Perfil > Assinatura para ver os detalhes e fazer upgrade.',
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Utilizamos criptografia de ponta a ponta, servidores seguros e fazemos backup automático diário. Seus dados nunca são compartilhados com terceiros.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:suporte@agrofinance.app');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+5511999999999');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/5511999999999');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos do formulário.');
      return;
    }

    const emailBody = `Nome: ${formData.name}\nEmail: ${formData.email}\n\nAssunto: ${formData.subject}\n\nMensagem:\n${formData.message}`;
    Linking.openURL(`mailto:suporte@agrofinance.app?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`);
    
    Alert.alert('Solicitação enviada', 'Entraremos em contato em breve!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Suporte',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Como podemos ajudar?</Text>
          <Text style={styles.subtitle}>
            Estamos aqui para resolver suas dúvidas e garantir a melhor experiência com o Agrofinance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato Rápido</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
              <Mail size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>suporte@agrofinance.app</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handlePhone}>
              <Phone size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>Telefone</Text>
              <Text style={styles.contactValue}>(11) 99999-9999</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
              <MessageCircle size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Chat Online</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('https://docs.agrofinance.app')}
            >
              <FileText size={28} color={Colors.primary} />
              <Text style={styles.contactLabel}>Documentação</Text>
              <Text style={styles.contactValue}>Guias e Tutoriais</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.hoursCard}>
            <Clock size={24} color={Colors.primary} />
            <View style={styles.hoursText}>
              <Text style={styles.hoursTitle}>Horário de Atendimento</Text>
              <Text style={styles.hoursSubtitle}>Segunda a Sexta: 8h às 18h</Text>
              <Text style={styles.hoursSubtitle}>Sábado: 8h às 12h</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expandedFAQ === index ? (
                  <ChevronUp size={20} color={Colors.textPrimary} />
                ) : (
                  <ChevronDown size={20} color={Colors.textPrimary} />
                )}
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Envie sua Mensagem</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Assunto"
              placeholderTextColor="#999"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva sua dúvida ou problema"
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Send size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Enviar Mensagem</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Agrofinance © 2024 - Gestão Agrícola Inteligente
          </Text>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  contactValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  hoursCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursText: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  hoursSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
