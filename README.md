# NomadGuide

📱 **App de Controle Financeiro e Medicamentos**

Uma aplicação React Native desenvolvida com Expo para gerenciar viagens financeiras e lembretes de medicamentos.

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

- **Frontend**: React Native + Expo SDK 54
- **Backend**: Firebase Firestore + Firebase Auth (anônimo)
- **UI**: React Native Paper (Material Design)
- **Navegação**: React Navigation
- **Gráficos**: React Native Chart Kit
- **Notificações**: Expo Notifications
- **Datas**: date-fns

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/pmarodinn/NomadGuide.git

# Entre no diretório
cd NomadGuide

# Instale as dependências
npm install

# Configure o Firebase (veja seção abaixo)
# Edite src/config/firebaseConfig.js com suas credenciais

# Execute o app
npm start
```

## ⚙️ Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firestore Database** (modo teste)
3. Ative o **Authentication** → Anonymous
4. Copie as configurações para `src/config/firebaseConfig.js`

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

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface
│   └── charts/         # Componentes de gráficos
├── contexts/           # Contextos React (Auth, Trip, Medication)
├── screens/            # Telas da aplicação
├── services/           # Serviços (Firebase, Notifications)
├── utils/              # Utilitários (datas, cálculos)
├── config/             # Configurações (Firebase)
└── navigation/         # Configuração de navegação
```

## 🎯 Funcionalidades Principais

- [x] Autenticação anônima
- [x] CRUD de viagens
- [x] CRUD de transações
- [x] Sistema de recorrências
- [x] Cálculos de saldo
- [x] CRUD de medicamentos
- [x] Sistema de notificações
- [x] Interface Material Design
- [x] Navegação entre telas
- [x] Gráficos de gastos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para ajudar nômades digitais a gerenciar suas finanças e saúde**
