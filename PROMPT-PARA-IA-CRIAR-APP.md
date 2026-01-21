# Prompt Completo para IA Criar Agrofinance App

## 📱 Informações Básicas do App

**Nome**: Agrofinance Gestão Rural
**Bundle ID iOS**: app.rork.agrofinance-gestao-rural
**Package Android**: app.rork.agrofinance_gestao_rural
**Versão**: 1.0.0
**Categoria**: Finanças / Negócios / Produtividade Agrícola
**Público-alvo**: Produtores rurais, gestores de fazendas, contadores agrícolas no Brasil

## 🎯 Descrição do App

Crie um aplicativo mobile nativo (iOS e Android) de gestão financeira e operacional para o agronegócio brasileiro. O app deve permitir que produtores rurais controlem todas as operações financeiras de suas fazendas, incluindo despesas, receitas, contratos, estoque, notas fiscais e relatórios gerenciais.

## 🏗️ Stack Técnica Obrigatória

- **React Native 0.81.5** com **Expo SDK 54**
- **TypeScript** (strict mode)
- **Expo Router 6** (file-based routing)
- **React Query (@tanstack/react-query)** para server state
- **Supabase** como backend (PostgreSQL)
- **@nkzw/create-context-hook** para context management
- **Lucide React Native** para ícones
- **date-fns** para manipulação de datas
- **React Native StyleSheet** (sem bibliotecas de UI)

### Bibliotecas Expo Necessárias:

- expo-router, expo-image, expo-font, expo-haptics
- expo-document-picker, expo-image-picker, expo-file-system
- expo-linear-gradient, expo-blur, expo-status-bar
- @react-native-async-storage/async-storage
- react-native-safe-area-context, react-native-screens

## 🗄️ Estrutura de Dados (Supabase)

### Tabelas Principais:

#### **operations** (Operações/Fazendas)

- id (uuid, PK)
- name (text) - Nome da operação
- type (text) - 'confinamento' | 'cana' | 'compostagem' | 'sede' | 'other'
- color (text) - Cor para identificação visual
- icon (text) - Nome do ícone
- budget (numeric) - Orçamento
- spent (numeric) - Gasto acumulado
- farm_id (uuid, FK farms)
- created_at (timestamp)

#### **expenses** (Despesas)

- id (uuid, PK)
- description (text)
- supplier_id (uuid, FK suppliers)
- operation_id (uuid, FK operations)
- cost_center_id (uuid, FK cost_centers)
- category (text)
- subcategory (text)
- negotiated_value (numeric)
- invoice_value (numeric)
- actual_value (numeric)
- date (date) - Data da despesa
- due_date (date) - Data de vencimento
- competence (date) - Competência
- payment_method (text) - 'pix' | 'transfer' | 'boleto' | 'check' | 'card' | 'cash'
- installments (integer)
- current_installment (integer)
- status (text) - 'draft' | 'pending_validation' | 'pending_approval' | 'approved' | 'disputed' | 'scheduled' | 'paid' | 'reconciled'
- service_confirmed (boolean)
- service_confirmed_by (text)
- service_confirmed_at (timestamp)
- created_by (text)
- created_at (timestamp)
- approved_by (text)
- approved_at (timestamp)
- paid_by (text)
- paid_at (timestamp)
- notes (text)
- tags (text[])

#### **revenues** (Receitas)

- id (uuid, PK)
- description (text)
- client_id (uuid, FK clients)
- operation_id (uuid, FK operations)
- category (text)
- value (numeric)
- invoice_number (text)
- date (date)
- due_date (date)
- received_date (date)
- status (text) - 'pending' | 'received' | 'overdue' | 'cancelled'
- payment_method (text)
- contract_id (uuid, FK contracts)
- notes (text)
- created_by (text)
- created_at (timestamp)

#### **clients** (Clientes)

- id (uuid, PK)
- name (text)
- cpf_cnpj (text)
- type (text) - 'physical' | 'legal'
- email (text)
- phone (text)
- address (text)
- city (text)
- state (text)
- zip_code (text)
- state_registration (text)
- active (boolean)
- created_at (timestamp)

#### **suppliers** (Fornecedores)

- id (uuid, PK)
- name (text)
- cpf_cnpj (text)
- category (text)
- email (text)
- phone (text)
- address (text)
- city (text)
- state (text)
- active (boolean)
- created_at (timestamp)

#### **contracts** (Contratos)

- id (uuid, PK)
- type (text) - 'purchase' | 'sale'
- partner_id (uuid) - ID do cliente ou fornecedor
- operation_id (uuid, FK operations)
- product (text)
- quantity (numeric)
- unit (text)
- unit_price (numeric)
- total_value (numeric)
- start_date (date)
- end_date (date)
- status (text) - 'active' | 'completed' | 'cancelled'
- payment_terms (text)
- delivery_terms (text)
- notes (text)
- created_at (timestamp)

#### **purchase_orders** (Pedidos de Compra)

- id (uuid, PK)
- supplier_id (uuid, FK suppliers)
- operation_id (uuid, FK operations)
- total_value (numeric)
- status (text) - 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
- requested_by (text)
- approved_by (text)
- request_date (date)
- expected_delivery_date (date)
- actual_delivery_date (date)
- notes (text)

#### **assets** (Ativos/Patrimônio)

- id (uuid, PK)
- name (text)
- type (text) - 'vehicle' | 'equipment' | 'building' | 'land' | 'other'
- operation_id (uuid, FK operations)
- purchase_date (date)
- purchase_value (numeric)
- current_value (numeric)
- depreciation_rate (numeric)
- brand (text)
- model (text)
- serial_number (text)
- status (text) - 'active' | 'maintenance' | 'inactive' | 'sold'
- notes (text)

#### **team_members** (Equipe)

- id (uuid, PK)
- name (text)
- email (text)
- cpf (text)
- phone (text)
- role (text) - 'admin' | 'field' | 'approver' | 'financial' | 'accountant' | 'auditor'
- permissions (jsonb)
- farm_ids (uuid[])
- operation_ids (uuid[])
- active (boolean)
- created_at (timestamp)

#### **farms** (Fazendas)

- id (uuid, PK)
- name (text)
- cpf_cnpj (text)
- state_registration (text)
- area (numeric)
- city (text)
- state (text)
- active (boolean)

#### **fields** (Talhões)

- id (uuid, PK)
- name (text)
- farm_id (uuid, FK farms)
- area (numeric)
- unit (text) - 'ha' | 'alqueire' | 'acre'
- latitude (numeric)
- longitude (numeric)
- soil_type (text)
- current_crop (text)
- active (boolean)
- notes (text)

#### **seasons** (Safras)

- id (uuid, PK)
- name (text)
- field_id (uuid, FK fields)
- crop (text)
- planting_date (date)
- expected_harvest_date (date)
- actual_harvest_date (date)
- area (numeric)
- expected_yield (numeric)
- actual_yield (numeric)
- yield_unit (text)
- budgeted_cost (numeric)
- actual_cost (numeric)
- budgeted_revenue (numeric)
- actual_revenue (numeric)
- status (text) - 'planning' | 'active' | 'completed' | 'cancelled'
- notes (text)
- created_at (timestamp)

#### **stock_items** (Itens de Estoque)

- id (uuid, PK)
- name (text)
- type (text) - 'input' | 'production'
- category (text)
- unit (text)
- current_stock (numeric)
- min_stock (numeric)
- avg_cost (numeric)
- last_purchase_price (numeric)
- last_purchase_date (date)

#### **nfes** (Notas Fiscais Eletrônicas)

- id (uuid, PK)
- number (integer)
- series (integer)
- issuer_id (uuid, FK fiscal_issuers)
- recipient_id (uuid, FK fiscal_recipients)
- nature (text)
- cfop (text)
- type (text) - 'saida' | 'entrada' | 'devolucao' | 'remessa'
- issue_date (timestamp)
- exit_date (timestamp)
- products_value (numeric)
- freight_value (numeric)
- insurance_value (numeric)
- other_expenses (numeric)
- discount (numeric)
- total_value (numeric)
- icms_base (numeric)
- icms_value (numeric)
- status (text) - 'draft' | 'authorized' | 'cancelled' | 'denied' | 'processing'
- access_key (text)
- protocol (text)
- xml_url (text)
- danfe_url (text)
- additional_info (text)
- created_by (text)
- created_at (timestamp)
- authorized_at (timestamp)
- cancelled_at (timestamp)

## 📱 Estrutura de Navegação (Expo Router)

### Tabs Principais (app/(tabs)/)

1. **index.tsx** - Dashboard/Visão Geral
   - Saldo em caixa, contas a pagar/receber
   - Resultado do período
   - Atividades recentes
   - Acesso rápido

2. **expenses.tsx** - Despesas/Contas a Pagar
   - Lista de despesas com filtros
   - Status workflow (draft → pending_validation → approved → paid)
   - Botão adicionar despesa

3. **validations.tsx** - Validações/Aprovações
   - Lista de itens pendentes de aprovação
   - Aprovação/rejeição de despesas

4. **reports.tsx** - Relatórios
   - Gráficos de receitas vs despesas
   - Análise por operação
   - Exportação de relatórios

5. **more.tsx** - Mais opções
   - Talhões & Rentabilidade
   - Safras & Orçamento
   - Barter/Troca
   - Arrendamento

### Rotas de Stack (app/)

- **add-expense.tsx** - Modal para adicionar despesa
- **expense-details.tsx** - Detalhes da despesa
- **revenues.tsx** - Lista de receitas
- **add-revenue.tsx** - Modal adicionar receita
- **cash-flow.tsx** - Fluxo de caixa
- **receivables.tsx** - Contas a receber
- **clients.tsx** - Gestão de clientes
- **suppliers.tsx** - Gestão de fornecedores
- **contracts.tsx** - Gestão de contratos
- **purchase-orders.tsx** - Pedidos de compra
- **stock.tsx** - Estoque
- **fields.tsx** - Talhões
- **seasons.tsx** - Safras
- **dre.tsx** - DRE (Demonstrativo de Resultados)
- **operations.tsx** - Operações
- **barter.tsx** - Contratos de barter
- **arrendamento.tsx** - Contratos de arrendamento
- **fiscal/index.tsx** - Lista de NF-e
- **fiscal/nfe-wizard.tsx** - Emissão de NF-e
- **fiscal/nfe-details.tsx** - Detalhes da NF-e
- **profile.tsx** - Perfil do usuário

## 🎨 Design e UX

### Paleta de Cores

- Primary: #10B981 (verde) - ações principais
- Secondary: #3B82F6 (azul) - informações
- Success: #22C55E (verde claro)
- Warning: #F59E0B (laranja)
- Error: #EF4444 (vermelho)
- Background: #F9FAFB (cinza claro)
- Surface: #FFFFFF (branco)
- Text: #111827 (preto)
- Text Secondary: #6B7280 (cinza)

### Componentes de UI

- Cards com bordas arredondadas (borderRadius: 12)
- Sombras sutis para elevação
- Ícones Lucide React Native
- Animações suaves com Animated API
- Feedback tátil com expo-haptics
- SafeAreaView em todas as telas
- ScrollView com RefreshControl

### Telas Principais

#### Dashboard

- Cards de estatísticas (saldo, contas a pagar/receber, lucro)
- Gráfico de receitas vs despesas do mês
- Lista de atividades recentes
- Botões de acesso rápido

#### Lista de Despesas

- Filtros: status, operação, período, fornecedor
- Cards com: descrição, fornecedor, valor, data, status
- Badges coloridos por status
- Swipe actions (aprovar, pagar, deletar)

#### Adicionar Despesa

- Formulário em modal
- Campos: descrição, fornecedor, operação, categoria, valor, data, vencimento, método de pagamento
- Upload de anexos (nota fiscal, boleto)
- Botão salvar e cancelar

#### Detalhes da Despesa

- Todas as informações da despesa
- Timeline de aprovações
- Anexos
- Ações: aprovar, disputar, pagar, editar, deletar

## 📊 Funcionalidades Críticas

### 1. Gestão de Despesas

- CRUD completo de despesas
- Workflow: draft → pending_validation → pending_approval → approved → paid → reconciled
- Upload de anexos (NF, boleto, recibo)
- Confirmação de serviço
- Parcelamento
- Divergências (valor negociado vs valor cobrado)

### 2. Gestão de Receitas

- CRUD de receitas
- Vincular com contratos
- Controle de recebimento
- Status: pending, received, overdue, cancelled

### 3. Fluxo de Caixa

- Saldo atual
- Entradas e saídas previstas
- Timeline de movimentações
- Saldo projetado

### 4. Contratos

- Contratos de compra e venda
- Status: active, completed, cancelled
- Vínculo com receitas

### 5. Estoque

- Inventário de insumos e produção
- Alertas de estoque mínimo
- Custo médio

### 6. Fiscal (NF-e)

- Emissão de NF-e (simulado)
- Importação de XML
- Listagem com filtros
- Status: draft, authorized, cancelled

### 7. Talhões e Safras

- Gestão de talhões
- Safras com orçamento vs realizado
- Rentabilidade por talhão
- Margem bruta e ROI

### 8. Relatórios

- DRE
- Fluxo de caixa projetado
- Custos por operação
- Margem por talhão

## 🔐 Dados Coletados do Usuário

### Dados Obrigatórios:

- **Cadastro básico**: Nome, email (para login)
- **Dados financeiros**: Despesas, receitas, valores, datas
- **Dados operacionais**: Operações, fazendas, talhões, safras
- **Dados de terceiros**: Clientes (nome, CPF/CNPJ), Fornecedores (nome, CPF/CNPJ)
- **Documentos**: Anexos de notas fiscais, boletos (armazenados no Supabase Storage)

### Dados Opcionais:

- Telefone, endereço de clientes/fornecedores
- Fotos de serviços executados
- Geolocalização de talhões (latitude/longitude)

### Uso dos Dados:

- Controle financeiro e operacional da fazenda
- Geração de relatórios gerenciais
- Emissão de notas fiscais
- Sincronização multi-dispositivo via Supabase

### Privacidade:

- Dados armazenados em Supabase (PostgreSQL seguro)
- Não compartilhamento com terceiros
- Row Level Security (RLS) ativado no Supabase
- Dados acessíveis apenas ao usuário proprietário

## 🔒 Permissões Necessárias (iOS)

### Info.plist:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>O Agrofinance precisa acessar suas fotos para anexar comprovantes de despesas e notas fiscais.</string>

<key>NSCameraUsageDescription</key>
<string>O Agrofinance precisa acessar sua câmera para fotografar notas fiscais e documentos.</string>

<key>NSMicrophoneUsageDescription</key>
<string>O Agrofinance precisa acessar seu microfone para recursos de áudio.</string>
```

### Razões das Permissões:

- **Câmera**: Fotografar notas fiscais, boletos e comprovantes
- **Galeria de Fotos**: Anexar documentos às despesas/receitas
- **Microfone**: Reservado para futuras funcionalidades (não usado atualmente)

## 🌐 Variáveis de Ambiente

```
EXPO_PUBLIC_SUPABASE_URL=https://jxcnfyeemdltdfqtgbcl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Arquivo app.json

```json
{
  "expo": {
    "name": "Agrofinance Gestão Rural",
    "slug": "agrofinance-gestao-rural",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "agrofinance",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "app.rork.agrofinance-gestao-rural",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "O Agrofinance precisa acessar suas fotos para anexar comprovantes de despesas e notas fiscais.",
        "NSCameraUsageDescription": "O Agrofinance precisa acessar sua câmera para fotografar notas fiscais e documentos.",
        "NSMicrophoneUsageDescription": "O Agrofinance precisa acessar seu microfone para recursos de áudio."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "app.rork.agrofinance_gestao_rural",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          "photosPermission": "O Agrofinance precisa acessar suas fotos para anexar comprovantes."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## 🚀 Requisitos de Implementação

### Provider Global (AppProvider.tsx)

- Criar context com @nkzw/create-context-hook
- Integrar React Query
- Queries para expenses, revenues, clients, contracts, etc.
- Mutations para CRUD de cada entidade
- Error handling robusto

### Lib Supabase (lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Types (types/index.ts)

- Todos os tipos TypeScript para cada entidade
- Enums para status, roles, payment methods, etc.

### Web Compatibility

- SafeAreaView em todas as telas
- Platform checks quando necessário
- React Native Web compatible

## 📋 Checklist de Aprovação Apple

### Funcionalidades Essenciais

- [ ] App funciona offline (dados locais com AsyncStorage)
- [ ] Loading states em todas as queries
- [ ] Error handling com mensagens amigáveis
- [ ] Formulários com validação
- [ ] Feedback visual em ações (haptics, animações)
- [ ] Botão voltar/cancelar em todos os modals

### Privacidade

- [ ] Descrições claras de permissões
- [ ] Não coletar dados sem consentimento
- [ ] Política de privacidade implementada

### Design

- [ ] Suporte a Safe Area em todas as telas
- [ ] Suporte a modo escuro (se aplicável)
- [ ] Fontes legíveis
- [ ] Contraste adequado
- [ ] Botões com tamanho mínimo de toque (44x44)

### Performance

- [ ] App inicia em menos de 3 segundos
- [ ] Scroll suave em listas longas
- [ ] Imagens otimizadas
- [ ] Sem memory leaks

### Conteúdo

- [ ] Sem conteúdo placeholder/lorem ipsum
- [ ] Textos em português correto
- [ ] Screenshots reais nas stores
- [ ] Descrição completa do app

## 🎯 Objetivo Final

Criar um app mobile profissional e completo para gestão financeira rural que:

1. Seja aprovado na Apple Store de primeira
2. Funcione perfeitamente em iOS e Android
3. Tenha excelente UX/UI mobile-native
4. Integre com Supabase de forma robusta
5. Tenha todos os dados mock removidos
6. Esteja 100% funcional e pronto para produção
7. Siga todas as guidelines da Apple e Google

---

## 📦 Comandos de Instalação

```bash
# Instalar dependências
bun install

# Adicionar se necessário
bun add @supabase/supabase-js @tanstack/react-query @nkzw/create-context-hook
bun add date-fns lucide-react-native zustand
bun add expo-image-picker expo-document-picker expo-file-system
```

## 🔧 Configuração Supabase

1. Criar projeto no Supabase
2. Executar SQL schema (supabase-schema.sql)
3. Configurar Row Level Security (RLS)
4. Adicionar env variables no projeto
5. Testar conexão

---

**IMPORTANTE**: Este app deve ser 100% funcional, sem dados mock, sem rotas não implementadas, e pronto para submissão nas lojas. Toda funcionalidade mencionada deve estar implementada ou removida do menu.
