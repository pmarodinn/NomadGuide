# 🎒 NomadGuide - Documentação Completa do Aplicativo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura e Stack Tecnológica](#arquitetura-e-stack-tecnológica)
3. [Estrutura do Banco de Dados (Firestore)](#estrutura-do-banco-de-dados-firestore)
4. [Telas e Funcionalidades](#telas-e-funcionalidades)
5. [Contextos e Estado](#contextos-e-estado)
6. [Serviços e APIs](#serviços-e-apis)
7. [Componentes Reutilizáveis](#componentes-reutilizáveis)
8. [Sistema de Autenticação](#sistema-de-autenticação)
9. [Navegação](#navegação)
10. [Tema e Design System](#tema-e-design-system)

---

## 🎯 Visão Geral

O **NomadGuide** é um aplicativo móvel para controle financeiro de viagens desenvolvido em React Native com Expo. O app permite aos usuários gerenciar múltiplas viagens, acompanhar gastos, configurar transações recorrentes e gerenciar medicamentos com lembretes.

### Principais Funcionalidades:

- 💰 **Controle Financeiro**: Gestão de receitas e gastos por viagem
- 🔄 **Transações Recorrentes**: Agendamento automático de transações
- 💊 **Gerenciamento de Medicamentos**: Lembretes e controle de medicamentos
- 📊 **Relatórios e Gráficos**: Visualização de gastos diários e por categoria
- 💱 **Multi-moeda**: Suporte a múltiplas moedas com conversão automática
- 🏦 **Interface Bancária**: Design inspirado em aplicativos bancários modernos

---

## 🏗️ Arquitetura e Stack Tecnológica

### Frontend

- **React Native** (via Expo SDK)
- **React Navigation 6** (Stack Navigator)
- **React Native Paper** (Material Design 3)
- **Context API** (Gerenciamento de estado)
- **React Hook Form** (Formulários)

### Backend

- **Firebase Authentication** (Autenticação de usuários)
- **Cloud Firestore** (Banco de dados NoSQL)
- **Firebase Security Rules** (Controle de acesso)

### Ferramentas e Utilitários

- **Expo Notifications** (Notificações push)
- **React Native Chart Kit** (Gráficos)
- **Date-fns** (Manipulação de datas)
- **React Native Safe Area Context** (SafeAreaView)

---

## 🗃️ Estrutura do Banco de Dados (Firestore)

### Hierarquia Completa:



users (collection)
└── {userId} (document)
    └── trips (collection)
        └── {tripId} (document)
            ├── name: string
            ├── description: string
            ├── initial_budget: number
            ├── defaultCurrency: string
            ├── startDate: timestamp
            ├── endDate: timestamp
            ├── isActive: boolean
            ├── createdAt: timestamp
            └── updatedAt: timestamp
            │
            ├── incomes (collection)
            │   └── {incomeId} (document)
            │       ├── amount: number
            │       ├── description: string
            │       ├── currency: string
            │       ├── date: timestamp
            │       ├── createdAt: timestamp
            │       └── updatedAt: timestamp
            │       │
            │       └── categories (collection)
            │           └── {categoryId} (document)
            │               ├── name: string
            │               ├── icon: string
            │               ├── color: string
            │               ├── createdAt: timestamp
            │               └── updatedAt: timestamp
            │
            ├── outcomes (collection)
            │   └── {outcomeId} (document)
            │       ├── amount: number
            │       ├── description: string
            │       ├── currency: string
            │       ├── date: timestamp
            │       ├── createdAt: timestamp
            │       └── updatedAt: timestamp
            │       │
            │       └── categories (collection)
            │           └── {categoryId} (document)
            │               ├── name: string
            │               ├── icon: string
            │               ├── color: string
            │               ├── createdAt: timestamp
            │               └── updatedAt: timestamp
            │
            ├── medications (collection)
            │   └── {medicationId} (document)
            │       ├── name: string
            │       ├── dosage: string
            │       ├── frequency: number (hours)
            │       ├── duration: string
            │       ├── notes: string
            │       ├── isActive: boolean
            │       ├── nextAlarm: timestamp
            │       ├── createdAt: timestamp
            │       └── updatedAt: timestamp
            │
            └── recurringTransactions (collection)
                └── {recurringTransactionId} (document)
                    ├── amount: number
                    ├── description: string
                    ├── type: string ("income" | "expense")
                    ├── frequency: string ("daily" | "weekly" | "monthly" | "quarterly" | "biannual")
                    ├── currency: string
                    ├── startDate: timestamp
                    ├── endDate: timestamp
                    ├── lastAppliedDate: timestamp
                    ├── categoryId: string (optional)
                    ├── categoryName: string (optional)
                    ├── createdAt: timestamp
                    └── updatedAt: timestamp

### Características da Estrutura:

- **Hierárquica**: Todos os dados são organizados por usuário e viagem
- **Subcoleções**: Incomes, outcomes, medications e recurring transactions são subcoleções de cada trip
- **Categorias**: Categorizadas por tipo de transação (income/outcome)
- **Timestamps**: Todos os documentos possuem createdAt e updatedAt
- **Flexível**: Suporte a múltiplas moedas e configurações por viagem

---

## 📱 Telas e Funcionalidades

### 1. **Tela de Login** (`LoginScreen.js`)

**Funcionalidades:**

- Autenticação com email/senha
- Link para cadastro de novo usuário
- Recuperação de senha
- Validação de formulário

**Componentes Utilizados:**

- TextInput (email, senha)
- Button (entrar, criar conta, esqueci senha)
- Snackbar (mensagens de erro/sucesso)

---

### 2. **Tela de Cadastro** (`RegisterScreen.js`)

**Funcionalidades:**

- Criação de nova conta
- Validação de email e senha
- Confirmação de senha
- Redirect automático após cadastro

**Componentes Utilizados:**

- TextInput (nome, email, senha, confirmar senha)
- Button (cadastrar)
- Snackbar (feedback)

---

### 3. **Tela Principal** (`HomeScreen.js`)

**Funcionalidades:**

- **Dashboard financeiro**: Saldos atual e projetado da viagem ativa
- **Ações rápidas**: Grid 2x2 com botões para principais ações
  - ➕ Adicionar Gasto
  - 🔄 Transação Recorrente
  - 💊 Medicamentos
  - ✈️ Nova Viagem
- **Status de medicamentos**: Lembretes próximos ou status "tudo em dia"
- **Navegação rápida**: Botões para ver todas as viagens e gráficos

**Layout:**

- Header bancário com informações da viagem ativa
- Cards de saldo compactos (atual vs projetado)
- Grid de ações rápidas
- Cards de status de medicamentos
- Botões de navegação

---

### 4. **Lista de Viagens** (`TripListScreen.js`)

**Funcionalidades:**

- **Visão geral de todas as viagens**
- **Card da viagem ativa** em destaque no topo
- **Saldos de cada viagem**: Orçamento, gasto, saldo restante
- **Ações por viagem**: Ativar, editar, excluir
- **Criação de nova viagem**

**Layout:**

- Header com saldos da viagem ativa
- Grid de ações rápidas (mesmo da home)
- Lista de cards de viagens
- FAB para nova viagem

---

### 5. **Detalhes da Viagem** (`TripDetailScreenNew.js`)

**Funcionalidades:**

- **Overview completo da viagem**
- **4 cards de saldo**: Orçamento, Gasto Total, Saldo Efetivo, Saldo Projetado
- **Barra de progresso**: Percentual do orçamento gasto
- **Confirmações pendentes**: Transações recorrentes devidas
- **Transações recentes**: Lista das últimas movimentações
- **Gastos por categoria**: Breakdown dos gastos

**Layout:**

- Header com nome e datas da viagem
- Grid 2x2 de cards de saldo
- Barra de progresso visual
- Seções expandíveis para diferentes tipos de dados
- FAB para nova transação

---

### 6. **Adicionar Transação** (`AddTransactionScreenNew.js`)

**Funcionalidades:**

- **Seleção de tipo**: Receita ou Gasto (chips visuais)
- **Formulário organizado**: Cards separados por tipo de informação
- **Conversão de moeda**: Preview da conversão quando diferente da moeda da viagem
- **Seleção de categoria**: Interface diferenciada para receitas e gastos
- **Validação**: Campos obrigatórios e formatos

**Layout:**

- Header com título dinâmico
- Chips para seleção de tipo
- Cards organizados:
  - Informações básicas (valor, descrição)
  - Data e moeda
  - Categoria
  - Preview da conversão (se aplicável)

---

### 7. **Transações Recorrentes** (`AddRecurringTransactionScreen.js`)

**Funcionalidades:**

- **Configuração de recorrência**: Diária, semanal, mensal, trimestral, semestral
- **Período de validade**: Data de início e fim
- **Conversão automática**: Para moeda da viagem
- **Previsão de ocorrências**: Cálculo automático do número de transações

**Campos:**

- Valor e descrição
- Tipo (receita/gasto)
- Frequência
- Datas de início e fim
- Categoria (opcional)

---

### 8. **Gerenciar Recorrências** (`RecurrenceScreen.js`)

**Funcionalidades:**

- **Lista de todas as recorrências** da viagem ativa
- **Status visual**: Ativas, pausadas, expiradas
- **Confirmar ocorrências**: Aplicar manualmente transações devidas
- **Editar/excluir**: Gestão completa das recorrências

---

### 9. **Medicamentos** (`MedicationsScreen.js`)

**Funcionalidades:**

- **Visão geral completa**: Cards com estatísticas (total, ativos, lembretes)
- **Lista de medicamentos**: Separados por ativos e inativos
- **Gestão de lembretes**: Ativar/desativar notificações
- **Detalhes completos**: Nome, dosagem, frequência, notas
- **Ações**: Marcar como tomado, editar, excluir

**Layout:**

- Header com ícone de medicamento
- Cards de estatísticas
- Tabs ou seções para ativos/inativos
- Lista com informações detalhadas

---

### 10. **Adicionar Medicamento** (`AddMedicationScreen.js`)

**Funcionalidades:**

- **Informações básicas**: Nome, dosagem
- **Configuração de frequência**: Intervalo em horas
- **Duração do tratamento**
- **Notas adicionais**
- **Configuração de lembretes**

---

### 11. **Gráficos de Gastos** (`DailySpendingScreen.js`)

**Funcionalidades:**

- **Gráfico de linha**: Gastos diários ao longo do tempo
- **Gráfico de pizza**: Gastos por categoria
- **Métricas**: Gasto médio diário, maior gasto, categoria mais cara
- **Filtros**: Por período ou categoria

**Dados Visualizados:**

- Evolução temporal dos gastos
- Distribuição por categoria
- Comparação com orçamento planejado
- Tendências e padrões

---

### 12. **Configurações de Moeda** (`CurrencySettingsScreen.js`)

**Funcionalidades:**

- **Seleção de moeda padrão**
- **Visualização de taxas de câmbio**
- **Cache de taxas**: Para uso offline
- **Atualização manual**: Forçar refresh das taxas

---

## 🧠 Contextos e Estado

### 1. **AuthContext** (`src/contexts/AuthContext.js`)

**Responsabilidades:**

- Gerenciar estado de autenticação
- Login/logout/cadastro
- Persistência da sessão
- Informações do usuário

**Estado:**

```javascript
{
  user: User | null,
  loading: boolean,
  login: (email, password) => Promise,
  register: (email, password, name) => Promise,
  logout: () => Promise,
  resetPassword: (email) => Promise
}
```

---

### 2. **TripContext** (`src/contexts/TripContext.js`)

**Responsabilidades:**

- Gerenciar todas as viagens do usuário
- Transações (receitas e gastos)
- Transações recorrentes
- Operações CRUD completas

**Estado:**

```javascript
{
  trips: Trip[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  categories: Category[],
  medications: Medication[],
  loading: boolean,
  
  // Trip management
  createTrip: (tripData) => Promise,
  updateTrip: (tripId, updates) => Promise,
  deleteTrip: (tripId) => Promise,
  activateTrip: (tripId) => Promise,
  
  // Transaction management
  addTransaction: (transactionData) => Promise,
  addIncome: (tripId, incomeData) => Promise,
  addOutcome: (tripId, outcomeData) => Promise,
  updateTransaction: (transactionId, updates) => Promise,
  deleteTransaction: (transactionId) => Promise,
  
  // Recurring transactions
  addRecurringTransaction: (data) => Promise,
  deleteRecurringTransaction: (id) => Promise,
  confirmRecurringOccurrence: (recurring) => Promise,
  
  // Helper functions
  getActiveTrip: () => Trip | null,
  getTripTransactions: (tripId) => Transaction[],
  getTripBalance: (tripId) => number,
  getProjectedBalance: (tripId) => number,
  getCategoryById: (categoryId) => Category | null
}
```

---

### 3. **MedicationContext** (`src/contexts/MedicationContext.js`)

**Responsabilidades:**

- Gerenciar medicamentos da viagem ativa
- Calcular lembretes próximos
- Integração com sistema de notificações

**Estado:**

```javascript
{
  medications: Medication[],
  activeMedications: Medication[],
  medicationsDueSoon: Medication[],
  loading: boolean,
  
  addMedication: (medicationData) => Promise,
  updateMedication: (medicationId, updates) => Promise,
  deleteMedication: (medicationId) => Promise,
  takeMedication: (medicationId) => Promise
}
```

---

### 4. **CurrencyContext** (`src/contexts/CurrencyContext.js`)

**Responsabilidades:**

- Gerenciar taxas de câmbio
- Conversão entre moedas
- Cache de taxas
- Formatação de valores

**Estado:**

```javascript
{
  exchangeRates: Object,
  loading: boolean,
  
  convertCurrency: (amount, from, to) => number,
  formatCurrency: (amount, currency) => string,
  getSupportedCurrencies: () => string[],
  updateExchangeRates: () => Promise
}
```

---

## 🔧 Serviços e APIs

### 1. **tripService.js** (`src/services/tripService.js`)

**Principais Funções:**

#### Trip Management:

- `createTrip(userId, tripData)`: Criar nova viagem
- `updateTrip(userId, tripId, updates)`: Atualizar viagem
- `deleteTrip(userId, tripId)`: Excluir viagem
- `activateTrip(tripId, userId)`: Ativar viagem

#### Income/Outcome Management:

- `addIncome(userId, tripId, incomeData)`: Adicionar receita
- `addOutcome(userId, tripId, outcomeData)`: Adicionar gasto
- `updateIncome/updateOutcome`: Atualizar transações
- `deleteIncome/deleteOutcome`: Excluir transações

#### Category Management:

- `createCategoryForIncome(userId, tripId, incomeId, categoryData)`
- `createCategoryForOutcome(userId, tripId, outcomeId, categoryData)`
- `initializeDefaultCategoriesForIncome/ForOutcome`: Criar categorias padrão

#### Recurring Transactions:

- `addRecurringTransaction(userId, tripId, data)`: Criar recorrência
- `updateRecurringTransaction(userId, id, updates)`: Atualizar
- `deleteRecurringTransaction(userId, id)`: Excluir

#### Medication Management:

- `addMedication(userId, tripId, medicationData)`: Adicionar medicamento
- `updateMedication(userId, tripId, medicationId, updates)`: Atualizar
- `deleteMedication(userId, tripId, medicationId)`: Excluir

#### Subscriptions (Real-time):

- `subscribeToTrips(userId, callback)`: Ouvir mudanças em viagens
- `subscribeToIncomes/Outcomes(userId, tripId, callback)`: Transações
- `subscribeToRecurringTransactions(userId, tripId, callback)`: Recorrências
- `subscribeToMedications(userId, tripId, callback)`: Medicamentos

---

### 2. **authService.js** (`src/services/authService.js`)

**Principais Funções:**

- `login(email, password)`: Autenticação
- `register(email, password, displayName)`: Cadastro
- `logout()`: Desconexão
- `resetPassword(email)`: Recuperar senha
- `getCurrentUser()`: Usuário atual

---

### 3. **currencyService.js** (`src/services/currencyService.js`)

**Principais Funções:**

- `fetchExchangeRates()`: Buscar taxas de câmbio
- `convertAmount(amount, fromCurrency, toCurrency, rates)`: Converter valores
- `formatCurrency(amount, currency)`: Formatar display
- `getCachedRates()`: Taxas em cache
- `getSupportedCurrencies()`: Moedas suportadas

---

### 4. **notifications.js** (`src/services/notifications.js`)

**Principais Funções:**

- `requestNotificationPermissions()`: Solicitar permissões
- `scheduleNotification(medication)`: Agendar lembrete
- `cancelNotification(notificationId)`: Cancelar lembrete
- `rescheduleNotification(medication)`: Reagendar

---

## 🎨 Componentes Reutilizáveis

### 1. **BankingComponents.js** (`src/components/BankingComponents.js`)

#### **BalanceCard**

```javascript
<BalanceCard
  title="Saldo Atual"
  balance="R$ 1.500,00"
  subtitle="disponível"
  type="primary" // primary, success, error, warning
  style={customStyle}
/>
```

#### **QuickActionButton**

```javascript
<QuickActionButton
  title="Adicionar Gasto"
  icon="plus"
  onPress={() => handleAddExpense()}
  type="primary"
/>
```

#### **TransactionItem**

```javascript
<TransactionItem
  transaction={transactionData}
  onPress={() => handleViewTransaction()}
/>
```

#### **SectionHeader**

```javascript
<SectionHeader
  title="Transações Recentes"
  action="Ver todas"
  onActionPress={() => handleViewAll()}
/>
```

#### **CardContainer**

```javascript
<CardContainer style={customStyle}>
  {/* Conteúdo do card */}
</CardContainer>
```

---

### 2. **UI Components** (`src/components/ui/`)

#### **LoadingScreen**

- Tela de carregamento global
- Spinner centralizado
- Mensagem customizável

#### **CustomButton**

- Botão personalizado baseado no tema
- Variações de estilo
- Estados de loading

---

### 3. **Charts** (`src/components/charts/`)

#### **DailySpendingChart**

- Gráfico de linha para gastos diários
- Integração com react-native-chart-kit
- Dados formatados para visualização

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação:

1. **Verificação inicial**: App verifica se usuário está logado
2. **Telas condicionais**: Login/Register ou App principal
3. **Persistência**: Firebase mantém sessão ativa
4. **Logout**: Limpa dados e retorna ao login

### Estados de Autenticação:

- **Loading**: Verificando autenticação
- **Authenticated**: Usuário logado
- **Unauthenticated**: Usuário não logado

### Segurança:

- **Firebase Auth**: Gerenciamento seguro de credenciais
- **Firestore Rules**: Acesso restrito por usuário
- **Validação**: Email/senha com critérios mínimos

---

## 🧭 Navegação

### Estrutura (Stack Navigator):

```
AuthStack (quando não logado):
├── Login
└── Register

MainStack (quando logado):
├── Home (tela inicial)
├── TripList (lista de viagens)
├── TripDetail (detalhes da viagem)
├── AddTransaction (nova transação)
├── AddRecurringTransaction (nova recorrência)
├── Recurrence (gerenciar recorrências)
├── MedicationList (lista de medicamentos)
├── AddMedication (novo medicamento)
├── Medications (tela completa de medicamentos)
├── DailySpending (gráficos)
└── CurrencySettings (configurações)
```

### Navegação Condicional:

- Usuário logado → MainStack
- Usuário não logado → AuthStack
- Verificação automática no AppNavigator

### Headers Customizados:

- Cores do tema aplicadas
- Ícones personalizados
- Ações específicas por tela (logout, configurações)

---

## 🎨 Tema e Design System

### Paleta de Cores (`src/theme/colors.js`):

```javascript
export const colors = {
  // Primary (Azul)
  primary: '#1565C0',
  primaryContainer: '#E3F2FD',
  
  // Secondary (Amarelo)
  secondary: '#FFC107',
  secondaryContainer: '#FFF8E1',
  
  // Background
  background: '#F7F9FC',
  backgroundSecondary: '#FFFFFF',
  
  // Surface
  surface: '#FFFFFF',
  surfaceVariant: '#F7F9FC',
  
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  
  // Text
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F'
};
```

### Espaçamentos:

```javascript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

### Tipografia:

```javascript
export const typography = {
  headlineLarge: { fontSize: 32, fontWeight: '400' },
  headlineMedium: { fontSize: 28, fontWeight: '400' },
  titleLarge: { fontSize: 22, fontWeight: '400' },
  bodyLarge: { fontSize: 16, fontWeight: '400' },
  bodyMedium: { fontSize: 14, fontWeight: '400' }
};
```

### Elevações e Bordas:

```javascript
export const elevation = {
  level1: { elevation: 1, shadowOpacity: 0.05 },
  level2: { elevation: 2, shadowOpacity: 0.08 },
  level3: { elevation: 3, shadowOpacity: 0.12 }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24
};
```

---

## 📁 Estrutura de Arquivos Completa

```
/NomadGuide
├── App.js                           # Componente raiz
├── index.js                         # Entry point
├── package.json                     # Dependências
├── app.json                         # Configuração Expo
├── firestore.rules                  # Regras de segurança
├── 
├── /src
│   ├── /components
│   │   ├── BankingComponents.js     # Componentes do design system
│   │   ├── /ui
│   │   │   ├── LoadingScreen.js     # Tela de carregamento
│   │   │   └── CustomButton.js      # Botão personalizado
│   │   └── /charts
│   │       └── DailySpendingChart.js # Gráfico de gastos
│   │
│   ├── /contexts
│   │   ├── AuthContext.js           # Contexto de autenticação
│   │   ├── TripContext.js           # Contexto de viagens
│   │   ├── MedicationContext.js     # Contexto de medicamentos
│   │   └── CurrencyContext.js       # Contexto de moedas
│   │
│   ├── /screens
│   │   ├── LoginScreen.js           # Login
│   │   ├── RegisterScreen.js        # Cadastro
│   │   ├── HomeScreen.js            # Dashboard principal
│   │   ├── TripListScreen.js        # Lista de viagens
│   │   ├── TripDetailScreen.js      # Detalhes da viagem
│   │   ├── AddTransactionScreen.js  # Nova transação
│   │   ├── AddRecurringTransaction.js # Nova recorrência
│   │   ├── RecurrenceScreen.js      # Gerenciar recorrências
│   │   ├── MedicationsScreen.js     # Tela completa medicamentos
│   │   ├── MedicationListScreen.js  # Lista medicamentos
│   │   ├── AddMedicationScreen.js   # Novo medicamento
│   │   ├── DailySpendingScreen.js   # Gráficos de gastos
│   │   └── CurrencySettingsScreen.js # Configurações moeda
│   │
│   ├── /services
│   │   ├── tripService.js           # CRUD viagens/transações
│   │   ├── authService.js           # Autenticação
│   │   ├── currencyService.js       # Conversão de moedas
│   │   ├── notifications.js         # Notificações push
│   │   └── firebase.js              # Configuração Firebase
│   │
│   ├── /navigation
│   │   └── AppNavigator.js          # Configuração de rotas
│   │
│   ├── /theme
│   │   ├── colors.js                # Paleta de cores
│   │   └── theme.js                 # Tema Material Design
│   │
│   ├── /utils
│   │   ├── currencyUtils.js         # Formatação de moeda
│   │   ├── dateUtils.js             # Manipulação de datas
│   │   └── balanceUtils.js          # Cálculos financeiros
│   │
│   └── /config
│       └── firebaseConfig.js        # Configuração Firebase
│
└── /assets
    ├── icon.png                     # Ícone do app
    ├── adaptive-icon.png            # Ícone adaptativo
    ├── splash.png                   # Splash screen
    └── logo.jpg                     # Logo do app
```

---

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação

- [X] Login com email/senha
- [X] Cadastro de usuários
- [X] Recuperação de senha
- [X] Logout
- [X] Persistência de sessão

### ✅ Gerenciamento de Viagens

- [X] Criar, editar, excluir viagens
- [X] Ativar/desativar viagens
- [X] Múltiplas viagens simultâneas
- [X] Configuração de orçamento
- [X] Suporte a múltiplas moedas

### ✅ Controle Financeiro

- [X] Adicionar receitas e gastos
- [X] Categorização de transações
- [X] Conversão automática de moedas
- [X] Cálculo de saldos (atual vs projetado)
- [X] Relatórios por categoria

### ✅ Transações Recorrentes

- [X] Configurar recorrências (diária, semanal, mensal, etc.)
- [X] Aplicação automática ou manual
- [X] Gestão de recorrências ativas
- [X] Previsão de impacto no orçamento

### ✅ Medicamentos

- [X] Cadastro de medicamentos
- [X] Configuração de lembretes
- [X] Notificações push
- [X] Gestão de medicamentos ativos/inativos
- [X] Interface completa de gerenciamento

### ✅ Visualizações e Relatórios

- [X] Gráficos de gastos diários
- [X] Gráficos por categoria
- [X] Dashboard com métricas principais
- [X] Projeções financeiras

### ✅ Interface e UX

- [X] Design bancário moderno
- [X] Tema consistente
- [X] Navegação intuitiva
- [X] Feedback visual adequado
- [X] Responsividade mobile

---

## 🔄 Fluxos Principais

### 1. **Fluxo de Nova Viagem**

Home → Lista de Viagens → Criar Nova → Configurar Orçamento → Ativar

### 2. **Fluxo de Transação**

Home → Adicionar Gasto → Selecionar Categoria → Configurar Moeda → Salvar

### 3. **Fluxo de Medicamento**

Home → Medicamentos → Adicionar → Configurar Lembretes → Ativar Notificações

### 4. **Fluxo de Recorrência**

Home → Recorrente → Configurar Frequência → Definir Período → Ativar

---

## 📊 Métricas e Cálculos

### Saldo Atual:

```
Saldo = Orçamento - (Total de Gastos - Total de Receitas)
```

### Saldo Projetado:

```
Projetado = Saldo Atual - Impacto de Recorrências Futuras
```

### Gasto Médio Diário:

```
Média = Total Gasto / Dias Decorridos da Viagem
```

### Orçamento Diário Restante:

```
Diário = Saldo Atual / Dias Restantes da Viagem
```

---

## 🔧 Configurações Técnicas

### Firebase Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/trips/{tripId}/{subcollection=**}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Principais Dependências:

```json
{
  "expo": "~54.0.0",
  "react-native": "0.81.4",
  "react-navigation": "^6.0.0",
  "react-native-paper": "^5.0.0",
  "firebase": "^10.0.0",
  "react-native-chart-kit": "^6.12.0",
  "@react-native-community/datetimepicker": "^8.0.0",
  "react-native-safe-area-context": "^4.0.0"
}
```

---

## 🎯 Considerações Finais

O **NomadGuide** é um aplicativo completo e robusto para controle financeiro de viagens, desenvolvido seguindo as melhores práticas de desenvolvimento React Native. A arquitetura modular, o design system consistente e a integração completa com Firebase garantem uma experiência de usuário fluida e confiável.

### Pontos Fortes:

- ✅ **Arquitetura escalável** com Context API
- ✅ **Design moderno** inspirado em apps bancários
- ✅ **Funcionalidade completa** incluindo medicamentos
- ✅ **Real-time sync** com Firestore
- ✅ **Multi-moeda** com conversão automática
- ✅ **Interface intuitiva** e responsiva

### Tecnologias Consolidadas:

- React Native + Expo (desenvolvimento ágil)
- Firebase (backend completo)
- Material Design 3 (UI consistente)
- Context API (estado global)
- Real-time subscriptions (dados atualizados)

O aplicativo está pronto para uso em produção e pode ser facilmente expandido com novas funcionalidades seguindo os padrões já estabelecidos.
