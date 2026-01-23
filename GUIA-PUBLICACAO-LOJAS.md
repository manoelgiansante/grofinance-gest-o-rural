# 🚀 GUIA COMPLETO PARA PUBLICAÇÃO DO RUMO FINANCE

## Versão: 1.0.0 | Atualizado: 22 de Janeiro de 2026

---

# 📱 PARTE 1: INFORMAÇÕES GERAIS DO APP

## Identificação do App

| Campo                    | Valor                    |
| ------------------------ | ------------------------ |
| **Nome do App**          | Rumo Finance             |
| **Subtítulo**            | Gestão Rural Inteligente |
| **Versão**               | 1.0.0                    |
| **Bundle ID (iOS)**      | `com.rumofinance.app`    |
| **Package (Android)**    | `com.rumofinance.app`    |
| **Scheme URL**           | `rumofinance://`         |
| **Categoria Principal**  | Finanças                 |
| **Categoria Secundária** | Negócios / Produtividade |

## Empresa

| Campo               | Valor                        |
| ------------------- | ---------------------------- |
| **Nome da Empresa** | Rumo Finance Tecnologia Ltda |
| **CNPJ**            | [A ser definido]             |
| **Website**         | https://finance.agrorumo.com |
| **E-mail Geral**    | contato@rumofinance.app      |
| **E-mail Suporte**  | suporte@rumofinance.app      |
| **E-mail DPO**      | dpo@rumofinance.app          |

---

# 🔗 PARTE 2: URLs OBRIGATÓRIAS

## URLs que funcionam no finance.agrorumo.com

| Página                      | URL                                        | Obrigatório         |
| --------------------------- | ------------------------------------------ | ------------------- |
| **Política de Privacidade** | https://finance.agrorumo.com/privacidade   | ✅ iOS + Android    |
| **Termos de Uso**           | https://finance.agrorumo.com/termos        | ✅ iOS + Android    |
| **Suporte**                 | https://finance.agrorumo.com/suporte       | ✅ iOS + Android    |
| **Exclusão de Conta**       | https://finance.agrorumo.com/excluir-conta | ✅ Obrigatório LGPD |
| **Marketing/Landing**       | https://finance.agrorumo.com               | Recomendado         |

---

# 🎯 PARTE 3: SOBRE O APP

## O que é o Rumo Finance?

O **Rumo Finance** é uma plataforma completa de **gestão financeira e operacional para propriedades rurais** no Brasil. O app permite que produtores rurais, gestores de fazendas e profissionais do agronegócio controlem todas as operações financeiras de suas propriedades em um único lugar.

## Funcionalidades Principais

### 💰 Gestão Financeira

- Controle de despesas e receitas
- Contas a pagar e a receber
- Fluxo de caixa em tempo real
- DRE (Demonstração do Resultado do Exercício)
- Livro Caixa
- Conciliação bancária
- Orçamento e previsões

### 🌾 Gestão de Operações

- Cadastro de múltiplas fazendas
- Controle de talhões
- Gestão de safras
- Registro de operações agrícolas
- Custo por hectare
- Rentabilidade por área

### 📦 Controle de Estoque

- Entradas e saídas de insumos
- Alertas de estoque mínimo
- Histórico de compras
- Custo médio de produtos

### 📄 Gestão de Contratos

- Contratos de compra e venda
- Cadastro de clientes e fornecedores
- Operações de Barter
- Controle de arrendamento
- Pedidos de compra

### 🧾 Fiscal e Tributário

- Emissão de NF-e (Nota Fiscal Eletrônica)
- Emissão de MDF-e (Manifesto de Documentos Fiscais)
- Gestão de documentos fiscais
- Integração com SEFAZ

### 📊 Relatórios

- Relatórios gerenciais
- Análises de desempenho
- Exportação de dados
- Gráficos e dashboards

### 🚜 Gestão de Patrimônio

- Cadastro de máquinas e equipamentos
- Controle de veículos
- Depreciação de ativos

## Público-Alvo

- Produtores rurais (pequenos, médios e grandes)
- Gestores de fazendas e propriedades rurais
- Contadores especializados em agronegócio
- Cooperativas agrícolas
- Empresas de consultoria agrícola

---

# 📊 PARTE 4: DADOS COLETADOS (PRIVACIDADE)

## Dados Fornecidos pelo Usuário

### Dados de Identificação

| Dado          | Obrigatório | Finalidade                         |
| ------------- | ----------- | ---------------------------------- |
| Nome completo | ✅ Sim      | Identificação do usuário           |
| E-mail        | ✅ Sim      | Login, autenticação e comunicações |
| Telefone      | ❌ Não      | Contato e suporte (opcional)       |
| CPF/CNPJ      | ❌ Não      | Emissão de documentos fiscais      |
| Endereço      | ❌ Não      | Cadastro de propriedades           |

### Dados da Propriedade Rural

| Dado                         | Finalidade                         |
| ---------------------------- | ---------------------------------- |
| Nome da fazenda              | Identificação das operações        |
| Localização (cidade, estado) | Gestão e relatórios regionais      |
| Área em hectares             | Cálculos de produtividade e custos |
| Inscrição Estadual           | Emissão de documentos fiscais      |
| Coordenadas GPS              | Mapeamento de talhões (opcional)   |

### Dados Financeiros

| Dado                      | Finalidade                       |
| ------------------------- | -------------------------------- |
| Despesas e receitas       | Controle financeiro              |
| Valores de contratos      | Gestão de contratos              |
| Dados de pagamentos       | Fluxo de caixa                   |
| Informações de estoque    | Gestão de insumos                |
| Documentos fiscais (NF-e) | Cumprimento de obrigações legais |

## Dados Coletados Automaticamente

| Dado                         | Finalidade                         |
| ---------------------------- | ---------------------------------- |
| Modelo do dispositivo        | Suporte técnico e compatibilidade  |
| Sistema operacional e versão | Compatibilidade e atualizações     |
| Versão do app                | Controle de versões                |
| Endereço IP                  | Segurança e prevenção de fraudes   |
| Logs de uso do app           | Melhoria do serviço e diagnósticos |
| Dados de crash               | Correção de bugs                   |

## Permissões do Dispositivo

### iOS

| Permissão         | Descrição                          | Mensagem para o Usuário                                                 |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| **Câmera**        | Escanear documentos e comprovantes | "Permite que o Rumo Finance use a câmera para escanear documentos"      |
| **Galeria/Fotos** | Anexar comprovantes e documentos   | "Permite que o Rumo Finance acesse suas fotos para anexar comprovantes" |
| **Microfone**     | Futuras funcionalidades            | "Permite que o Rumo Finance use o microfone"                            |

### Android

| Permissão               | Código                   |
| ----------------------- | ------------------------ |
| Câmera                  | `CAMERA`                 |
| Armazenamento (Leitura) | `READ_EXTERNAL_STORAGE`  |
| Armazenamento (Escrita) | `WRITE_EXTERNAL_STORAGE` |

---

# 🍎 PARTE 5: CONFIGURAÇÃO iOS (APP STORE CONNECT)

## Informações Básicas

| Campo                    | Valor                            |
| ------------------------ | -------------------------------- |
| **Nome**                 | Rumo Finance                     |
| **Subtítulo**            | Gestão Rural Inteligente         |
| **Bundle ID**            | com.rumofinance.app              |
| **SKU**                  | RUMOFINANCE001                   |
| **Categoria Primária**   | Finance                          |
| **Categoria Secundária** | Business                         |
| **Content Rights**       | Não contém conteúdo de terceiros |

## Age Rating

| Pergunta                                         | Resposta |
| ------------------------------------------------ | -------- |
| Cartoon or Fantasy Violence                      | None     |
| Realistic Violence                               | None     |
| Prolonged Graphic or Sadistic Realistic Violence | None     |
| Profanity or Crude Humor                         | None     |
| Mature/Suggestive Themes                         | None     |
| Horror/Fear Themes                               | None     |
| Medical/Treatment Information                    | None     |
| Alcohol, Tobacco, or Drug Use                    | None     |
| Simulated Gambling                               | None     |
| Sexual Content or Nudity                         | None     |
| Unrestricted Web Access                          | No       |
| Gambling and Contests                            | None     |

**Resultado esperado: 4+ ou 12+** (devido a informações financeiras)

## App Privacy (Nutrition Labels)

### Data Used to Track You

- **NENHUM** - Não rastreamos usuários

### Data Linked to You

| Tipo de Dado        | Coletado | Vinculado | Finalidade        |
| ------------------- | -------- | --------- | ----------------- |
| Name                | ✅       | ✅        | App Functionality |
| Email Address       | ✅       | ✅        | App Functionality |
| Phone Number        | ✅       | ✅        | App Functionality |
| Physical Address    | ✅       | ✅        | App Functionality |
| User ID             | ✅       | ✅        | App Functionality |
| Financial Info      | ✅       | ✅        | App Functionality |
| Coarse Location     | ✅       | ✅        | App Functionality |
| Product Interaction | ✅       | ✅        | Analytics         |

### Data Not Linked to You

| Tipo de Dado     | Coletado | Finalidade        |
| ---------------- | -------- | ----------------- |
| Crash Data       | ✅       | App Functionality |
| Performance Data | ✅       | App Functionality |

## URLs Obrigatórias no App Store Connect

| Campo              | URL                                      |
| ------------------ | ---------------------------------------- |
| Privacy Policy URL | https://finance.agrorumo.com/privacidade |
| Support URL        | https://finance.agrorumo.com/suporte     |
| Marketing URL      | https://finance.agrorumo.com             |

---

# 🤖 PARTE 6: CONFIGURAÇÃO ANDROID (GOOGLE PLAY CONSOLE)

## Informações Básicas

| Campo                 | Valor                                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| **Nome do App**       | Rumo Finance                                                                     |
| **Descrição Curta**   | Gestão financeira completa para fazendas. Controle despesas, receitas e estoque. |
| **Package Name**      | com.rumofinance.app                                                              |
| **Categoria**         | Finance                                                                          |
| **E-mail de Contato** | suporte@rumofinance.app                                                          |
| **Telefone**          | [A definir]                                                                      |

## Content Rating (Questionário)

| Pergunta             | Resposta  |
| -------------------- | --------- |
| Violence             | No        |
| Sexual Content       | No        |
| Language             | No        |
| Controlled Substance | No        |
| ESRB Generic         | All Ages  |
| PEGI                 | PEGI 3    |
| ClassInd             | L (Livre) |

## Data Safety Section

### Overview

| Pergunta                                                 | Resposta                                   |
| -------------------------------------------------------- | ------------------------------------------ |
| Does your app collect or share any user data?            | **Yes**                                    |
| Is all user data encrypted in transit?                   | **Yes**                                    |
| Do you provide a way for users to request data deletion? | **Yes**                                    |
| Data deletion request URL                                | https://finance.agrorumo.com/excluir-conta |

### Data Types Collected

| Categoria                    | Tipo                 | Coletado | Compartilhado | Obrigatório |
| ---------------------------- | -------------------- | -------- | ------------- | ----------- |
| **Personal info**            | Name                 | ✅       | ❌            | ✅ Sim      |
| **Personal info**            | Email address        | ✅       | ❌            | ✅ Sim      |
| **Personal info**            | Phone number         | ✅       | ❌            | ❌ Não      |
| **Personal info**            | Address              | ✅       | ❌            | ❌ Não      |
| **Financial info**           | User payment info    | ✅       | ❌            | ❌ Não      |
| **Financial info**           | Purchase history     | ✅       | ❌            | ✅ Sim      |
| **Location**                 | Approximate location | ✅       | ❌            | ❌ Não      |
| **App activity**             | App interactions     | ✅       | ❌            | ✅ Sim      |
| **App info and performance** | Crash logs           | ✅       | ❌            | ✅ Sim      |
| **App info and performance** | Diagnostics          | ✅       | ❌            | ✅ Sim      |
| **Device or other IDs**      | Device or other IDs  | ✅       | ❌            | ✅ Sim      |

### Data Usage and Handling

Para cada tipo de dado, responder:

| Pergunta                                                                        | Resposta Padrão                       |
| ------------------------------------------------------------------------------- | ------------------------------------- |
| Is this data collected, shared, or both?                                        | Collected                             |
| Is this data processed ephemerally?                                             | No                                    |
| Is this data required for your app, or can users choose whether it's collected? | Required (exceto telefone e endereço) |
| Why is this user data collected?                                                | App functionality                     |

### Security Practices

- ✅ Data is encrypted in transit using HTTPS/TLS
- ✅ Data is encrypted at rest
- ✅ Users can request that data be deleted

---

# 📝 PARTE 7: TEXTOS PARA AS LOJAS

## Descrição Curta (máx. 80 caracteres)

```
Gestão financeira completa para fazendas. Controle despesas, receitas e estoque.
```

## Descrição Longa

```
Rumo Finance é o app completo de gestão financeira para produtores rurais brasileiros.

Controle todas as operações financeiras da sua fazenda em um único lugar: despesas, receitas, contratos, estoque e muito mais.

═══════════════════════════════════
💰 CONTROLE FINANCEIRO COMPLETO
═══════════════════════════════════
• Registre despesas e receitas facilmente
• Acompanhe contas a pagar e receber
• Fluxo de caixa em tempo real
• DRE automático por período
• Livro Caixa digital
• Conciliação bancária simplificada

═══════════════════════════════════
🌾 GESTÃO DE OPERAÇÕES AGRÍCOLAS
═══════════════════════════════════
• Cadastre múltiplas fazendas
• Controle safras e talhões
• Acompanhe custos por hectare
• Calcule rentabilidade por área
• Registre operações de campo

═══════════════════════════════════
📦 CONTROLE DE ESTOQUE E INSUMOS
═══════════════════════════════════
• Gerencie entradas e saídas
• Alertas de estoque mínimo
• Histórico completo de compras
• Custo médio automático

═══════════════════════════════════
📄 GESTÃO DE CONTRATOS
═══════════════════════════════════
• Contratos de compra e venda
• Cadastro de clientes e fornecedores
• Operações de Barter
• Controle de arrendamento
• Pedidos de compra

═══════════════════════════════════
🧾 FISCAL E TRIBUTÁRIO
═══════════════════════════════════
• Emissão de NF-e integrada
• Emissão de MDF-e
• Gestão de documentos fiscais
• Conformidade com a legislação

═══════════════════════════════════
📊 RELATÓRIOS GERENCIAIS
═══════════════════════════════════
• Dashboards intuitivos
• Análises de desempenho
• Exportação de dados
• Gráficos e indicadores

═══════════════════════════════════
🔒 SEGURANÇA E PRIVACIDADE
═══════════════════════════════════
• Dados criptografados
• Backup automático na nuvem
• Em conformidade com a LGPD
• Sincronização entre dispositivos

Desenvolvido especialmente para o agronegócio brasileiro, com suporte à legislação fiscal e práticas contábeis do setor rural.

Baixe agora e transforme a gestão financeira da sua fazenda!
```

## Keywords para iOS (máx. 100 caracteres)

```
agro,fazenda,gestão rural,finanças,agricultura,nfe,estoque,safra,produtor,rural
```

## Tags para Google Play

```
gestão rural
finanças agro
controle fazenda
nfe agro
produtor rural
agronegócio
safra
estoque rural
contabilidade rural
gestão agrícola
```

---

# 🖼️ PARTE 8: ASSETS VISUAIS

## Ícone do App

- **Tamanho iOS**: 1024x1024px (sem transparência, sem cantos arredondados)
- **Tamanho Android**: 512x512px (adaptive icon)
- **Cor de fundo**: #2E7D32 (verde)

## Screenshots

### Tamanhos Necessários

**iOS:**
| Dispositivo | Tamanho |
|-------------|---------|
| iPhone 6.7" | 1290 x 2796 px |
| iPhone 6.5" | 1284 x 2778 px |
| iPhone 5.5" | 1242 x 2208 px |
| iPad Pro 12.9" | 2048 x 2732 px |

**Android:**
| Tipo | Tamanho |
|------|---------|
| Phone | 1080 x 1920 px (mín.) |
| Tablet 7" | 1200 x 1920 px |
| Tablet 10" | 1920 x 1200 px |

### Sugestão de Screenshots (em ordem)

1. **Dashboard** - Visão geral com saldo, gráficos
2. **Despesas** - Lista de despesas com filtros
3. **Fluxo de Caixa** - Gráfico de entradas e saídas
4. **Gestão de Fazendas** - Múltiplas propriedades
5. **Emissão NF-e** - Tela fiscal
6. **Relatórios** - DRE e análises

## Feature Graphic (Android)

- **Tamanho**: 1024 x 500 px
- **Conteúdo sugerido**: Logo + slogan "Gestão Rural Inteligente" + imagem de fazenda

---

# ✅ PARTE 9: CHECKLIST DE SUBMISSÃO

## Antes de Submeter

### Geral

- [ ] App testado em dispositivos reais
- [ ] Sem crashes conhecidos
- [ ] Todas as funcionalidades funcionando
- [ ] Textos revisados (português correto)
- [ ] URLs funcionando (privacidade, termos, suporte)

### iOS (App Store Connect)

- [ ] Conta de desenvolvedor Apple ativa ($99/ano)
- [ ] Certificados e provisioning profiles configurados
- [ ] Bundle ID registrado
- [ ] Ícone 1024x1024 sem transparência
- [ ] Screenshots para todos os tamanhos
- [ ] Privacy Policy URL preenchida
- [ ] Support URL preenchida
- [ ] App Privacy (Nutrition Labels) configurado
- [ ] Age Rating preenchido
- [ ] Descrição e keywords preenchidos
- [ ] Build enviada via Xcode/Transporter
- [ ] TestFlight testado (recomendado)

### Android (Google Play Console)

- [ ] Conta de desenvolvedor Google ativa ($25 única)
- [ ] Keystore gerado e guardado com segurança
- [ ] Package name registrado
- [ ] Ícone e feature graphic prontos
- [ ] Screenshots para phone e tablet
- [ ] Privacy Policy URL preenchida
- [ ] Data Safety section completa
- [ ] Content Rating preenchido
- [ ] Descrição curta e longa preenchidas
- [ ] App Bundle (.aab) gerado
- [ ] Internal testing testado (recomendado)

---

# 🔐 PARTE 10: SEGURANÇA E LGPD

## Medidas de Segurança Implementadas

- ✅ Criptografia de dados em trânsito (HTTPS/TLS 1.3)
- ✅ Criptografia de dados em repouso (AES-256)
- ✅ Autenticação segura com e-mail/senha
- ✅ Tokens JWT para sessões
- ✅ Controle de acesso baseado em funções (RBAC)
- ✅ Backups automáticos diários
- ✅ Servidores Supabase (AWS com certificações)
- ✅ Logs de auditoria
- ✅ Monitoramento de segurança

## Conformidade LGPD

### Direitos do Titular Garantidos

- ✅ Acesso aos dados pessoais
- ✅ Correção de dados incompletos
- ✅ Exclusão de dados (conta)
- ✅ Portabilidade (exportação)
- ✅ Revogação de consentimento
- ✅ Informação sobre compartilhamento

### Exclusão de Dados

- **Prazo**: 30 dias corridos
- **URL**: https://finance.agrorumo.com/excluir-conta
- **E-mail**: dpo@rumofinance.app
- **Exceções**: Documentos fiscais (5 anos por lei)

---

# 📞 PARTE 11: CONTATOS

## E-mails Oficiais

| Tipo              | E-mail                  |
| ----------------- | ----------------------- |
| Geral             | contato@rumofinance.app |
| Suporte           | suporte@rumofinance.app |
| DPO (Privacidade) | dpo@rumofinance.app     |

## URLs

| Página      | URL                                        |
| ----------- | ------------------------------------------ |
| Website     | https://finance.agrorumo.com               |
| Privacidade | https://finance.agrorumo.com/privacidade   |
| Termos      | https://finance.agrorumo.com/termos        |
| Suporte     | https://finance.agrorumo.com/suporte       |
| Exclusão    | https://finance.agrorumo.com/excluir-conta |

---

# 📋 PARTE 12: CONFIGURAÇÃO TÉCNICA

## Stack Tecnológica

| Tecnologia   | Versão | Uso                           |
| ------------ | ------ | ----------------------------- |
| React Native | 0.81.5 | Framework mobile              |
| Expo SDK     | 54     | Plataforma de desenvolvimento |
| TypeScript   | 5.x    | Linguagem                     |
| Expo Router  | 6      | Navegação                     |
| Supabase     | -      | Backend (PostgreSQL)          |
| React Query  | 5.x    | Estado do servidor            |

## Comandos de Build

### iOS

```bash
# Desenvolvimento
npx expo run:ios

# Build para produção
eas build --platform ios --profile production
```

### Android

```bash
# Desenvolvimento
npx expo run:android

# Build para produção (AAB para Play Store)
eas build --platform android --profile production
```

## Variáveis de Ambiente Necessárias

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

**Documento criado em**: 22 de Janeiro de 2026  
**Versão do documento**: 1.0  
**Próxima revisão**: Antes de cada release
