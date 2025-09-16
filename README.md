# 🎒 NomadApp - Controle Financeiro para Viajantes

📱 **Aplicativo completo para geren## ✨ Funcionalidades Principais

### 🔐 **Autenticação Completa**
- Login/Cadastro com Firebase Auth
- Recuperação de senha
- Perfil de usuário personalizável

### 💰 **Gestão Financeira**
- **Controle de Gastos**: Registro detalhado de todas as despesas
- **Categorização Inteligente**: Alimentação, transporte, hospedagem, lazer, compras, saúde
- **Orçamento por Viagem**: Definição e monitoramento de limites financeiros
- **Análise de Gastos**: Visualização clara do que foi gasto vs orçamento
- **Histórico Completo**: Todas as transações organizadas por data

### 🧳 **Gerenciamento de Viagens**
- **Criação de Viagens**: Nome, destino, datas, orçamento
- **Dashboard por Viagem**: Visão completa dos gastos de cada viagem
- **Status da Viagem**: Planejada, em andamento ou concluída

### 💊 **Controle de Medicamentos**
- **Cadastro de Medicamentos**: Nome, dosagem, frequência
- **Lembretes Inteligentes**: Notificações nos horários corretos
- **Histórico de Medicação**: Controle do que foi tomado

### 📱 **Interface Moderna**
- **Design Responsivo**: Material Design 3 com React Native Paper
- **Navegação Intuitiva**: Bottom tabs e stack navigation
- **Tema Consistente**: Cores e tipografia padronizadas
- **UX Otimizada**: Feedback visual e animações suavesanceiro durante viagens**

Um aplicativo React Native completo para controle de gastos, orçamentos de viagem e gerenciamento de medicamentos, com sincronização em tempo real via Firebase.

## 🚀 Características

### 💰 Gestão Financeira
- Controle de orçamento de viagens
- Transações de receitas e despesas
- Transações recorrentes
- Cálculo de saldo real vs projetado
- Gráficos de gastos diários

### 💊 Gestão de Medicamentos
- Lembretes de medicamentos
- Notificações push locais
- Horários personalizáveis
- Controle de doses tomadas

## 🛠️ Tecnologias

## 🛠️ Stack Tecnológica

### 📱 **Frontend**
- **React Native** - Framework mobile multiplataforma
- **Expo SDK 54** - Toolkit de desenvolvimento
- **React Native Paper** - Material Design components
- **React Navigation 6** - Navegação entre telas
- **React Hook Form** - Gerenciamento de formulários

### ☁️ **Backend & Dados**
- **Firebase Authentication** - Sistema de autenticação
- **Cloud Firestore** - Banco de dados NoSQL em tempo real
- **Firebase Security Rules** - Controle de acesso aos dados

### 🔧 **Ferramentas de Desenvolvimento**
- **Firebase CLI** - Deploy e gerenciamento
- **Git** - Controle de versão
- **VS Code** - IDE de desenvolvimento

## � Configuração e Instalação

### 📋 **Pré-requisitos**
- Node.js 18+ instalado
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase CLI (`npm install -g firebase-tools`)

### 1️⃣ **Clone e Instale**
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd NomadApp

# Instale as dependências
npm install
```

### 2️⃣ **Configuração do Firebase**
```bash
# Faça login no Firebase
firebase login

# Selecione o projeto (já configurado)
firebase use nomadguide-5ea09

# Deploy das regras e índices (se necessário)
firebase deploy --only firestore:rules,firestore:indexes
```

### 3️⃣ **Configuração do Ambiente**
O projeto já está configurado com:
- ✅ Firebase Authentication ativo
- ✅ Cloud Firestore configurado
- ✅ Índices compostos criados
- ✅ Regras de segurança implementadas

### 4️⃣ **Executar o App**
```bash
# Inicie o servidor de desenvolvimento
npx expo start

# Opções de teste:
# - Pressione 'a' para Android
# - Pressione 'i' para iOS
# - Escaneie o QR code com Expo Go
```

## 🔥 Configuração Firebase

### **Projeto Ativo**: `nomadguide-5ea09`

#### **Serviços Configurados:**
- **Authentication**: Login com email/senha
- **Firestore Database**: Armazenamento em tempo real
- **Security Rules**: Acesso baseado em autenticação

#### **Collections Firestore:**
```
📁 users/{userId}
├── 📁 trips/
│   ├── name, destination, startDate, endDate, budget
│   └── 📁 transactions/
│       └── amount, category, description, date
├── 📁 categories/
│   └── name, icon, color
└── 📁 medications/
    └── name, dosage, frequency, times
```

#### **Índices Compostos Ativos:**
- `categories` ordenados por userId/name
- `trips` ordenados por userId/startDate
- `transactions` ordenados por userId/date
- `medications` filtrados por userId

---

## 📁 Estrutura do Projeto

```
NomadApp/
├── 📱 App.js                    # Componente raiz
├── 🔧 firebase.json            # Configuração Firebase
├── 📊 firestore.indexes.json   # Índices Firestore
├── 🛡️ firestore.rules         # Regras de segurança
├── 📝 package.json            # Dependências
├── 🎨 app.json               # Configuração Expo
│
├── 📂 src/
│   ├── 🔐 auth/
│   │   ├── AuthContext.js     # Context de autenticação
│   │   ├── LoginScreen.js     # Tela de login
│   │   └── RegisterScreen.js  # Tela de cadastro
│   │
│   ├── 🧭 navigation/
│   │   └── AppNavigator.js    # Configuração de rotas
│   │
│   ├── 📱 screens/
│   │   ├── HomeScreen.js      # Dashboard principal
│   │   ├── TripsScreen.js     # Lista de viagens
│   │   ├── ExpensesScreen.js  # Controle de gastos
│   │   └── MedicationsScreen.js # Lembretes medicamentos
│   │
│   ├── 🔧 services/
│   │   ├── firebase.js        # Configuração Firebase
│   │   ├── tripService.js     # CRUD de viagens
│   │   ├── expenseService.js  # CRUD de despesas
│   │   └── medicationService.js # CRUD medicamentos
│   │
│   └── 🎨 components/
│       ├── TripCard.js        # Card de viagem
│       ├── ExpenseItem.js     # Item de despesa
│       └── AddExpenseModal.js # Modal nova despesa
│
└── 🖼️ assets/                 # Imagens e ícones
```

---

## 📱 Como Usar

### Viagens Financeiras
1. Crie uma nova viagem com orçamento inicial
2. Adicione transações (receitas/despesas)
3. Configure transações recorrentes se necessário
4. Acompanhe o saldo real vs projetado
5. Visualize gráficos de gastos diários

### Medicamentos
1. Adicione medicamentos com nome e dosagem
2. Configure horários de lembretes
3. Receba notificações na hora certa
4. Marque como "tomado" quando necessário

## 📖 Como Usar

### 1️⃣ **Primeiro Acesso**
1. Abra o app e faça cadastro com email/senha
2. Confirme seu email (se necessário)
3. Faça login e acesse o dashboard

### 2️⃣ **Criando uma Viagem**
1. Vá para a aba "Viagens"
2. Toque em "+" para adicionar nova viagem
3. Preencha: nome, destino, datas e orçamento
4. Salve e comece a registrar gastos

### 3️⃣ **Registrando Gastos**
1. Na tela da viagem, toque "Adicionar Gasto"
2. Escolha categoria, valor e descrição
3. O app atualiza automaticamente seu orçamento
4. Veja gráficos de gastos por categoria

### 4️⃣ **Lembretes de Medicamentos**
1. Acesse a aba "Medicamentos"
2. Cadastre seus medicamentos com horários
3. Receba notificações nos horários corretos
4. Marque como "tomado" quando usar

---

## 🔧 Para Desenvolvedores

### **Comandos Úteis**
```bash
# Verificar status do Firebase
firebase projects:list

# Deploy apenas regras
firebase deploy --only firestore:rules

# Deploy apenas índices
firebase deploy --only firestore:indexes

# Verificar erros em tempo real
npx expo start --dev-client
```

### **Estrutura de Dados Firestore**
- **Segurança**: Todos os dados são isolados por `userId`
- **Performance**: Índices otimizados para queries frequentes
- **Escalabilidade**: Subcollections para relacionamentos

### **Principais Dependencies**
```json
{
  "@react-navigation/native": "^6.0.2",
  "@react-navigation/bottom-tabs": "^6.0.5",
  "react-native-paper": "^5.0.0",
  "firebase": "^10.3.1",
  "react-hook-form": "^7.45.4",
  "expo": "~54.0.0"
}
```

---

## 🐛 Resolução de Problemas

### **Erro de Índices Firestore**
```bash
# Recriar índices automaticamente
firebase deploy --only firestore:indexes
```

### **Problemas de Autenticação**
- Verifique se o projeto Firebase está ativo
- Confirme as configurações em `firebase.js`

### **App não carrega**
```bash
# Limpar cache do Expo
expo r -c
```

---

## 📈 Roadmap Futuro

- [ ] 📊 Relatórios avançados de gastos
- [ ] 🌍 Conversão automática de moedas
- [ ] 📷 Upload de comprovantes de gastos
- [ ] 🤝 Viagens compartilhadas entre usuários
- [ ] 📱 Notificações push personalizadas
- [ ] 🎯 Metas de economia por categoria

---

## 👨‍💻 Desenvolvimento

**Status**: ✅ **Produção Ready**

- ✅ Autenticação implementada
- ✅ CRUD completo para todas entidades
- ✅ Firebase configurado e otimizado
- ✅ Interface responsiva e intuitiva
- ✅ Tratamento de erros implementado
- ✅ Documentação completa

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🎒 NomadApp** - *Sua viagem financeira sob controle!*
