import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacidadeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Política de Privacidade',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        <Text style={styles.lastUpdate}>Última atualização: 17 de janeiro de 2025</Text>

        <Section title="1. Introdução">
          <Text style={styles.text}>
            A AgroFinance (nós, nosso ou nossa) está comprometida em proteger e respeitar 
            sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, 
            divulgamos e protegemos suas informações pessoais de acordo com a Lei Geral de 
            Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
          </Text>
        </Section>

        <Section title="2. Responsável pelo Tratamento de Dados">
          <Text style={styles.text}>
            <Text style={styles.bold}>Razão Social:</Text> AgroFinance Tecnologia Ltda{'\n'}
            <Text style={styles.bold}>CNPJ:</Text> [Inserir CNPJ]{'\n'}
            <Text style={styles.bold}>Endereço:</Text> [Inserir Endereço Completo]{'\n'}
            <Text style={styles.bold}>E-mail:</Text> contato@agrofinance.app{'\n'}
            <Text style={styles.bold}>Encarregado (DPO):</Text> dpo@agrofinance.app
          </Text>
        </Section>

        <Section title="3. Dados Coletados">
          <Text style={styles.subsectionTitle}>3.1 Dados Fornecidos por Você</Text>
          <Text style={styles.text}>
            • Informações de cadastro (nome, e-mail, telefone){'\n'}
            • Dados da propriedade rural (nome da fazenda, localização, área){'\n'}
            • Informações financeiras e contábeis inseridas no aplicativo{'\n'}
            • Dados de operações agrícolas, safras e culturas{'\n'}
            • Informações de clientes, fornecedores e contratos{'\n'}
            • Dados fiscais (notas fiscais, documentos tributários)
          </Text>

          <Text style={styles.subsectionTitle}>3.2 Dados Coletados Automaticamente</Text>
          <Text style={styles.text}>
            • Informações do dispositivo (modelo, sistema operacional, versão){'\n'}
            • Dados de uso do aplicativo (funcionalidades acessadas, tempo de uso){'\n'}
            • Endereço IP e informações de rede{'\n'}
            • Logs de acesso e interações com o aplicativo
          </Text>
        </Section>

        <Section title="4. Base Legal e Finalidades do Tratamento">
          <Text style={styles.text}>
            Tratamos seus dados pessoais com base nas seguintes hipóteses legais:{'\n\n'}
            
            <Text style={styles.bold}>a) Execução de Contrato (Art. 7º, V da LGPD):</Text>{'\n'}
            Para fornecer os serviços de gestão financeira e agrícola contratados.{'\n\n'}
            
            <Text style={styles.bold}>b) Legítimo Interesse (Art. 7º, IX da LGPD):</Text>{'\n'}
            Para melhorar nossos serviços, prevenir fraudes e garantir a segurança.{'\n\n'}
            
            <Text style={styles.bold}>c) Cumprimento de Obrigação Legal (Art. 7º, II da LGPD):</Text>{'\n'}
            Para cumprir obrigações fiscais, contábeis e regulatórias.{'\n\n'}
            
            <Text style={styles.bold}>d) Consentimento (Art. 7º, I da LGPD):</Text>{'\n'}
            Para finalidades específicas que requerem sua autorização expressa.
          </Text>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <Text style={styles.text}>
            Seus dados pessoais podem ser compartilhados com:{'\n\n'}
            
            • <Text style={styles.bold}>Prestadores de serviço:</Text> Empresas que nos auxiliam na operação 
            do aplicativo (hospedagem em nuvem, análise de dados, suporte técnico){'\n\n'}
            
            • <Text style={styles.bold}>Autoridades governamentais:</Text> Quando exigido por lei ou ordem judicial{'\n\n'}
            
            • <Text style={styles.bold}>Parceiros comerciais:</Text> Mediante seu consentimento expresso{'\n\n'}
            
            Garantimos que todos os terceiros que acessam seus dados estão obrigados a 
            protegê-los de acordo com esta Política e a LGPD.
          </Text>
        </Section>

        <Section title="6. Armazenamento e Segurança">
          <Text style={styles.text}>
            Seus dados são armazenados em servidores seguros com criptografia e protegidos 
            por medidas técnicas e organizacionais adequadas, incluindo:{'\n\n'}
            
            • Criptografia de dados em trânsito e em repouso{'\n'}
            • Controles de acesso rigorosos{'\n'}
            • Monitoramento contínuo de segurança{'\n'}
            • Backups regulares{'\n'}
            • Auditoria de segurança periódica{'\n\n'}
            
            Os dados são mantidos pelo tempo necessário para as finalidades informadas ou 
            conforme exigido por lei.
          </Text>
        </Section>

        <Section title="7. Seus Direitos (LGPD)">
          <Text style={styles.text}>
            Você tem os seguintes direitos em relação aos seus dados pessoais:{'\n\n'}
            
            • <Text style={styles.bold}>Confirmação e acesso:</Text> Saber se tratamos seus dados e acessá-los{'\n'}
            • <Text style={styles.bold}>Correção:</Text> Solicitar correção de dados incompletos ou incorretos{'\n'}
            • <Text style={styles.bold}>Anonimização ou exclusão:</Text> Solicitar eliminação de dados desnecessários{'\n'}
            • <Text style={styles.bold}>Portabilidade:</Text> Receber seus dados em formato estruturado{'\n'}
            • <Text style={styles.bold}>Revogação de consentimento:</Text> Retirar consentimento a qualquer momento{'\n'}
            • <Text style={styles.bold}>Informação sobre compartilhamento:</Text> Saber com quem compartilhamos{'\n'}
            • <Text style={styles.bold}>Oposição:</Text> Se opor ao tratamento de dados{'\n\n'}
            
            Para exercer seus direitos, entre em contato conosco através de:{'\n'}
            <Text style={styles.bold}>E-mail:</Text> dpo@agrofinance.app{'\n'}
            <Text style={styles.bold}>Formulário:</Text> https://agrofinance.app/suporte
          </Text>
        </Section>

        <Section title="8. Cookies e Tecnologias Similares">
          <Text style={styles.text}>
            Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
            analisar o uso do aplicativo e personalizar conteúdo. Você pode gerenciar 
            suas preferências de cookies nas configurações do aplicativo.
          </Text>
        </Section>

        <Section title="9. Transferência Internacional de Dados">
          <Text style={styles.text}>
            Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil. 
            Nestes casos, garantimos que a transferência internacional de dados é realizada 
            de acordo com a LGPD e mediante garantias adequadas de proteção.
          </Text>
        </Section>

        <Section title="10. Alterações nesta Política">
          <Text style={styles.text}>
            Podemos atualizar esta Política de Privacidade periodicamente. A versão mais 
            recente estará sempre disponível no aplicativo e em nosso site. Alterações 
            significativas serão comunicadas por e-mail ou notificação no aplicativo.
          </Text>
        </Section>

        <Section title="11. Crianças e Adolescentes">
          <Text style={styles.text}>
            Nosso serviço não é direcionado a menores de 18 anos. Não coletamos 
            intencionalmente dados de crianças e adolescentes sem o consentimento dos 
            responsáveis legais.
          </Text>
        </Section>

        <Section title="12. Contato">
          <Text style={styles.text}>
            Para dúvidas, solicitações ou reclamações sobre esta Política de Privacidade 
            ou o tratamento de seus dados pessoais:{'\n\n'}
            
            <Text style={styles.bold}>E-mail:</Text> contato@agrofinance.app{'\n'}
            <Text style={styles.bold}>DPO:</Text> dpo@agrofinance.app{'\n'}
            <Text style={styles.bold}>Suporte:</Text> https://agrofinance.app/suporte{'\n\n'}
            
            Você também pode entrar em contato com a Autoridade Nacional de Proteção de 
            Dados (ANPD) em: https://www.gov.br/anpd
          </Text>
        </Section>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://agrofinance.app/termos')}
          >
            <Text style={styles.link}>Ver Termos de Uso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://agrofinance.app/suporte')}
            style={styles.footerButton}
          >
            <Text style={styles.link}>Central de Suporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  bold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerButton: {
    marginTop: 12,
  },
  link: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
