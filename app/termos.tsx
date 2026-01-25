import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermosScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Termos de Uso',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <Text style={styles.lastUpdate}>Última atualização: 25 de janeiro de 2026</Text>

        <Section title="1. Aceitação dos Termos">
          <Text style={styles.text}>
            Bem-vindo ao Rumo Finance. Ao acessar ou utilizar nosso aplicativo, você concorda em
            cumprir e estar vinculado a estes Termos de Uso (Termos). Se você não concordar com
            qualquer parte destes Termos, não deverá utilizar o aplicativo.
            {'\n\n'}
            Estes Termos constituem um acordo legal entre você (Usuário) e a Rumo Finance Tecnologia
            Ltda (Rumo Finance, nós, nosso).
          </Text>
        </Section>

        <Section title="2. Descrição do Serviço">
          <Text style={styles.text}>
            O Rumo Finance é uma plataforma de gestão financeira e operacional para propriedades
            rurais que oferece:{'\n\n'}• Controle financeiro (receitas, despesas, fluxo de caixa)
            {'\n'}• Gestão de operações agrícolas{'\n'}• Controle de estoque e insumos{'\n'}• Gestão
            de contratos e clientes{'\n'}• Emissão e gerenciamento de notas fiscais{'\n'}•
            Relatórios gerenciais e análises{'\n'}• DRE (Demonstração do Resultado do Exercício)
            {'\n'}• Gestão de safras e áreas cultivadas
          </Text>
        </Section>

        <Section title="3. Cadastro e Conta">
          <Text style={styles.subsectionTitle}>3.1 Requisitos de Cadastro</Text>
          <Text style={styles.text}>
            Para utilizar o Rumo Finance, você deve:{'\n'}• Ter no mínimo 18 anos de idade{'\n'}•
            Fornecer informações verdadeiras, precisas e atualizadas{'\n'}• Manter a
            confidencialidade de suas credenciais de acesso{'\n'}• Notificar-nos imediatamente sobre
            qualquer uso não autorizado
          </Text>

          <Text style={styles.subsectionTitle}>3.2 Responsabilidade pela Conta</Text>
          <Text style={styles.text}>
            Você é totalmente responsável por todas as atividades realizadas em sua conta. Não
            compartilhe suas credenciais de acesso com terceiros.
          </Text>
        </Section>

        <Section title="4. Uso Aceitável">
          <Text style={styles.text}>
            Ao utilizar o Rumo Finance, você concorda em NÃO:{'\n\n'}• Violar qualquer lei ou
            regulamento aplicável{'\n'}• Usar o serviço para fins fraudulentos ou ilícitos{'\n'}•
            Inserir dados falsos ou enganosos{'\n'}• Tentar obter acesso não autorizado ao sistema
            {'\n'}• Interferir no funcionamento do aplicativo{'\n'}• Fazer engenharia reversa,
            descompilar ou desmontar o software{'\n'}• Utilizar bots, scrapers ou automação não
            autorizada{'\n'}• Revender ou sublicenciar o serviço sem autorização{'\n'}• Transmitir
            vírus, malware ou código malicioso
          </Text>
        </Section>

        <Section title="5. Propriedade Intelectual">
          <Text style={styles.text}>
            Todo o conteúdo do Rumo Finance, incluindo mas não limitado a software, design, texto,
            gráficos, logos, ícones e código, é propriedade da Rumo Finance ou de seus licenciadores
            e está protegido por leis de direitos autorais e propriedade intelectual.{'\n\n'}
            Você recebe uma licença limitada, não exclusiva e revogável para usar o aplicativo
            conforme estes Termos. Esta licença não inclui direitos de:{'\n'}• Revenda ou uso
            comercial do serviço{'\n'}• Coleta ou uso de dados do aplicativo{'\n'}• Uso derivado do
            aplicativo ou seu conteúdo{'\n'}• Download ou cópia de informações para terceiros
          </Text>
        </Section>

        <Section title="6. Seus Dados">
          <Text style={styles.text}>
            Você mantém todos os direitos sobre os dados que insere no Rumo Finance (informações
            financeiras, operacionais, cadastros, etc.).{'\n\n'}
            Ao utilizar nosso serviço, você nos concede uma licença limitada para processar,
            armazenar e exibir seus dados exclusivamente para fornecer os serviços contratados.
            {'\n\n'}
            Você é responsável pela precisão, legalidade e qualidade dos dados inseridos. Para mais
            informações sobre como tratamos seus dados, consulte nossa Política de Privacidade.
          </Text>
        </Section>

        <Section title="7. Pagamento e Assinatura">
          <Text style={styles.text}>
            <Text style={styles.bold}>7.1 Planos e Preços:</Text> Os planos e preços estão
            disponíveis no aplicativo e podem ser alterados mediante aviso prévio.{'\n\n'}
            <Text style={styles.bold}>7.2 Renovação Automática:</Text> Assinaturas são renovadas
            automaticamente. Você pode cancelar a qualquer momento nas configurações.{'\n\n'}
            <Text style={styles.bold}>7.3 Reembolsos:</Text> Política de reembolso de acordo com o
            Código de Defesa do Consumidor (CDC) e termos da loja de aplicativos.{'\n\n'}
            <Text style={styles.bold}>7.4 Suspensão:</Text> Podemos suspender o acesso em caso de
            inadimplência ou violação destes Termos.
          </Text>
        </Section>

        <Section title="8. Assinaturas Auto-Renováveis (Apple/Google)">
          <Text style={styles.text}>
            <Text style={styles.bold}>IMPORTANTE - LEIA COM ATENÇÃO:</Text>
            {'\n\n'}
            <Text style={styles.bold}>8.1 Cobrança:</Text> O pagamento será cobrado na sua conta da
            App Store ou Google Play no momento da confirmação da compra.{'\n\n'}
            <Text style={styles.bold}>8.2 Renovação Automática:</Text> A assinatura é renovada
            automaticamente, a menos que seja cancelada pelo menos 24 horas antes do término do
            período atual. A renovação será cobrada nas 24 horas anteriores ao término do período
            vigente.{'\n\n'}
            <Text style={styles.bold}>8.3 Gerenciamento:</Text> Você pode gerenciar e cancelar suas
            assinaturas acessando as configurações da sua conta na App Store ou Google Play após a
            compra.{'\n\n'}
            <Text style={styles.bold}>8.4 Período Gratuito:</Text> Qualquer parte não utilizada de
            um período de avaliação gratuita será perdida quando você adquirir uma assinatura.
            {'\n\n'}
            <Text style={styles.bold}>8.5 Cancelamento:</Text> O cancelamento da assinatura atual
            não é permitido durante o período de assinatura ativo. O acesso continua até o final do
            período pago.{'\n\n'}
            <Text style={styles.bold}>8.6 Alteração de Preço:</Text> Os preços podem ser alterados.
            Você será notificado com antecedência e poderá cancelar antes da alteração entrar em
            vigor.
          </Text>
        </Section>

        <Section title="9. Disponibilidade do Serviço">
          <Text style={styles.text}>
            Nos esforçamos para manter o Rumo Finance disponível 24/7, porém:{'\n\n'}• Podem ocorrer
            interrupções para manutenção programada{'\n'}• Não garantimos disponibilidade
            ininterrupta{'\n'}• Não nos responsabilizamos por indisponibilidade causada por
            terceiros{'\n'}• Reservamos o direito de modificar ou descontinuar recursos{'\n\n'}
            Você deve manter backups adequados de seus dados importantes.
          </Text>
        </Section>

        <Section title="10. Limitação de Responsabilidade">
          <Text style={styles.text}>
            O Rumo Finance é fornecido como está e conforme disponível. Na extensão máxima permitida
            por lei:{'\n\n'}• Não garantimos que o serviço será livre de erros ou interrupções{'\n'}
            • Não nos responsabilizamos por decisões tomadas com base nos dados do app{'\n'}• Não
            somos responsáveis por perdas de dados, lucros ou prejuízos indiretos{'\n'}• Nossa
            responsabilidade total está limitada ao valor pago nos últimos 12 meses{'\n\n'}
            Você é responsável por verificar a exatidão de cálculos fiscais e contábeis com seu
            contador antes de tomar decisões financeiras importantes.
          </Text>
        </Section>

        <Section title="11. Indenização">
          <Text style={styles.text}>
            Você concorda em indenizar e isentar a Rumo Finance, seus diretores, funcionários e
            parceiros de quaisquer reivindicações, perdas, danos, responsabilidades e despesas
            (incluindo honorários advocatícios) resultantes de:{'\n\n'}• Seu uso do aplicativo{'\n'}
            • Violação destes Termos{'\n'}• Violação de direitos de terceiros{'\n'}• Informações
            falsas ou enganosas fornecidas por você
          </Text>
        </Section>

        <Section title="12. Modificações dos Termos">
          <Text style={styles.text}>
            Reservamos o direito de modificar estes Termos a qualquer momento. Alterações
            significativas serão notificadas por e-mail ou no aplicativo com pelo menos 30 dias de
            antecedência.{'\n\n'}O uso continuado do serviço após as alterações constitui aceitação
            dos novos Termos. Se não concordar, você deve descontinuar o uso e cancelar sua conta.
          </Text>
        </Section>

        <Section title="13. Rescisão">
          <Text style={styles.text}>
            <Text style={styles.bold}>13.1 Por Você:</Text> Você pode encerrar sua conta a qualquer
            momento através das configurações do aplicativo.{'\n\n'}
            <Text style={styles.bold}>13.2 Por Nós:</Text> Podemos suspender ou encerrar sua conta
            se você violar estes Termos, sem reembolso de valores pagos.{'\n\n'}
            <Text style={styles.bold}>13.3 Efeitos:</Text> Após o encerramento, você perderá acesso
            aos dados. Recomendamos exportar seus dados antes de cancelar.
          </Text>
        </Section>

        <Section title="14. Lei Aplicável e Jurisdição">
          <Text style={styles.text}>
            Estes Termos são regidos pelas leis da República Federativa do Brasil, especialmente:
            {'\n\n'}• Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018){'\n'}• Código de
            Defesa do Consumidor (CDC - Lei 8.078/1990){'\n'}• Marco Civil da Internet (Lei
            12.965/2014){'\n\n'}
            Fica eleito o foro da comarca de [Inserir Cidade], Brasil, para dirimir quaisquer
            controvérsias oriundas destes Termos, com renúncia a qualquer outro, por mais
            privilegiado que seja.
          </Text>
        </Section>

        <Section title="15. Disposições Gerais">
          <Text style={styles.text}>
            • <Text style={styles.bold}>Integralidade:</Text> Estes Termos constituem o acordo
            integral entre você e a Rumo Finance.{'\n\n'}•{' '}
            <Text style={styles.bold}>Renúncia:</Text> A não execução de qualquer disposição não
            constitui renúncia.{'\n\n'}• <Text style={styles.bold}>Divisibilidade:</Text> Se alguma
            disposição for considerada inválida, as demais permanecerão em vigor.{'\n\n'}•{' '}
            <Text style={styles.bold}>Cessão:</Text> Você não pode transferir seus direitos sem
            nosso consentimento.{'\n\n'}• <Text style={styles.bold}>Idioma:</Text> Em caso de
            conflito entre traduções, a versão em português prevalece.
          </Text>
        </Section>

        <Section title="16. Contato">
          <Text style={styles.text}>
            Para dúvidas sobre estes Termos de Uso:{'\n\n'}
            <Text style={styles.bold}>Rumo Finance Tecnologia Ltda</Text>
            {'\n'}
            <Text style={styles.bold}>CNPJ:</Text> [Inserir CNPJ]{'\n'}
            <Text style={styles.bold}>Endereço:</Text> [Inserir Endereço Completo]{'\n'}
            <Text style={styles.bold}>E-mail:</Text> contato@rumofinance.app{'\n'}
            <Text style={styles.bold}>Suporte:</Text> https://finance.agrorumo.com/suporte{'\n'}
            <Text style={styles.bold}>Telefone:</Text> [Inserir Telefone]
          </Text>
        </Section>

        <View style={styles.acceptance}>
          <Text style={styles.acceptanceText}>
            Ao utilizar o Rumo Finance, você declara ter lido, compreendido e concordado com estes
            Termos de Uso e com nossa Política de Privacidade.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://finance.agrorumo.com/privacidade')}
          >
            <Text style={styles.link}>Ver Política de Privacidade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://finance.agrorumo.com/suporte')}
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
  acceptance: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  acceptanceText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
    fontWeight: '500',
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
