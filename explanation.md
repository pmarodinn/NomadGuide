```md
# 📱 App de Controle Financeiro e Medicamentos - Especificação Técnica Detalhada

> **Objetivo**: Criar um app simples para Android (via Expo/React Native) com backend no Firebase, para publicação na Play Store. O app gerencia viagens financeiras e lembretes de medicamentos. Usuário único por dispositivo (sem login). Tudo será guiado para agentes de IA no VSCode Copilot.

---

## 🧩 Estrutura Geral do Projeto

### Tecnologias:
- **Frontend**: React Native via **Expo Go** (SDK 50+)
- **Backend**: **Firebase Firestore** (banco NoSQL) + **Firebase Auth** (modo anônimo)
- **State Management**: Context API + `useState`/`useReducer` (sem Redux para simplicidade)
- **Navegação**: `@react-navigation/native` + `@react-navigation/stack`
- **UI Components**: `react-native-paper` (Material Design) + `react-native-vector-icons`
- **Persistência Local**: `AsyncStorage` (para configurações offline)
- **Notificações**: `expo-notifications` + `expo-device`
- **Datas**: `date-fns` (manipulação e formatação)
- **Gráficos**: `react-native-chart-kit` (para visualização de gastos diários)

---

## 📦 Bibliotecas a Instalar (via `npm` ou `yarn`)

```bash
expo init FinanceMedApp --template blank
cd FinanceMedApp

npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-paper react-native-vector-icons
npm install firebase
npm install date-fns
npm install react-native-chart-kit react-native-svg
npm install expo-notifications expo-device
npm install @react-native-async-storage/async-storage
npm install expo-linking expo-constants expo-splash-screen
```

> ⚠️ Após instalar, execute `npx expo install --fix` para garantir compatibilidade de versões.

---

## 🔧 Configuração Inicial do Firebase

### Passo 1: Criar Projeto no Firebase Console

- Acesse [console.firebase.google.com](https://console.firebase.google.com/)
- Crie um novo projeto: `FinanceMedApp`
- Ative **Firestore Database** (modo teste inicial)
- Ative **Authentication** → Sign-in method → **Anonymous**

### Passo 2: Configurar no App

Crie o arquivo `src/config/firebaseConfig.js`:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Login anônimo automático
signInAnonymously(auth)
  .then(() => console.log("Usuário anônimo logado"))
  .catch(error => console.error("Erro login anônimo:", error));

export { db, auth };
```

> 🔐 Substitua os valores acima pelos do seu projeto Firebase (disponíveis em Project Settings > General).

---

## 🗃️ Estrutura de Dados no Firestore

### Coleções:

- `users/{userId}/trips` → Viagens do usuário
- `users/{userId}/transactions` → Transações (gastos/recebimentos)
- `users/{userId}/recurrences` → Transações recorrentes
- `users/{userId}/medications` → Medicamentos

> `userId` = `auth.currentUser.uid` (gerado automaticamente pelo Firebase Auth anônimo)

---

### Modelo de Dados Detalhado

#### 1. Trip (Viagem)

```ts
{
  id: string;           // auto-gerado pelo Firestore
  name: string;         // nome da viagem (ex: "Férias SP")
  budget: number;       // valor inicial (ex: 2000)
  startDate: Timestamp; // data de início
  endDate: Timestamp;   // data de fim
  createdAt: Timestamp; // quando foi criada
  isActive: boolean;    // se está ativa (apenas uma ativa por vez)
}
```

#### 2. Transaction (Transação)

```ts
{
  id: string;
  tripId: string;       // referência à viagem
  type: "expense" | "income"; // tipo
  amount: number;       // valor (positivo)
  description: string;  // descrição (ex: "Almoço")
  date: Timestamp;      // data da transação
  isRecurring: boolean; // false = transação única
  category?: string;    // opcional (ex: "Alimentação")
}
```

#### 3. Recurrence (Recorrência)

```ts
{
  id: string;
  tripId: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;   // data final da recorrência
  interval: number;     // intervalo em horas (8, 12, 24, 48, etc)
  nextDate: Timestamp;  // próxima ocorrência (atualizada após cada execução)
  isActive: boolean;    // se ainda está ativa
}
```

#### 4. Medication (Medicamento)

```ts
{
  id: string;
  name: string;         // nome do remédio
  dosage: string;       // ex: "1 comprimido"
  schedule: number[];   // array de horas do dia (ex: [8, 16, 24])
  lastTaken: Timestamp; // última vez que tomou
  nextAlarm: Timestamp; // próximo alarme
  isActive: boolean;    // se o lembrete está ativo
  notificationId: string; // ID da notificação agendada (expo-notifications)
}
```

---

## 🖥️ Estrutura de Telas (React Navigation)

### Stack Navigator:

- `HomeScreen` → Tela inicial com resumo
- `TripListScreen` → Lista de viagens
- `TripDetailScreen` → Detalhes da viagem + saldo + transações
- `AddTransactionScreen` → Formulário para adicionar transação
- `RecurrenceScreen` → Gerenciar recorrências
- `MedicationListScreen` → Lista de medicamentos
- `AddMedicationScreen` → Formulário para adicionar medicamento
- `DailySpendingScreen` → Gráficos de gasto diário (real vs projetado)

---

## 🧠 Lógica de Negócio Detalhada

### 1. Saldo Real de uma Viagem

- Soma todas as transações (`type: income`) → total recebido
- Soma todas as transações (`type: expense`) → total gasto
- `saldoReal = budget + totalRecebido - totalGasto`

### 2. Saldo Projetado de uma Viagem

- Começa com `saldoReal`
- Para cada recorrência **ativa** cuja `nextDate` <= data atual:
  - Adiciona ou subtrai `amount` conforme `type`
  - Atualiza `nextDate = nextDate + interval hours`
  - Salva no Firestore a nova `nextDate`
- Resultado = saldo projetado

> ⚠️ O saldo projetado é recalculado toda vez que:
>
> - Uma transação real é adicionada/removida
> - Uma recorrência é adicionada/editada/removida
> - O app é aberto (para atualizar recorrências pendentes)

### 3. Gasto Diário (Real vs Projetado)

- Agrupa transações por dia (usando `date-fns` para truncar data)
- Para projetado: inclui transações reais + transações recorrentes que caem naquele dia
- Exibe gráfico de barras comparando os dois

---

## ⏰ Sistema de Notificações (Medicamentos)

### Passo a passo:

1. Ao salvar um medicamento, calcular `nextAlarm`:

   - Encontrar a próxima hora em `schedule` que ainda não passou hoje
   - Se todas já passaram, usar a primeira de amanhã
2. Agendar notificação local com `expo-notifications`:

   ```js
   import * as Notifications from 'expo-notifications';

   const notificationId = await Notifications.scheduleNotificationAsync({
     content: {
       title: "Hora do remédio!",
       body: `É hora de tomar ${medication.name} (${medication.dosage})`,
     },
     trigger: {
       hour: nextHour,
       minute: 0,
       repeats: true, // repete diariamente
     },
   });
   ```
3. Salvar `notificationId` no documento do medicamento (para cancelar depois se desativar)
4. Ao desativar medicamento → cancelar notificação:

   ```js
   await Notifications.cancelScheduledNotificationAsync(notificationId);
   ```
5. Ao tomar o remédio (botão "Tomei"):

   - Atualiza `lastTaken = now`
   - Recalcula `nextAlarm` (próxima dose)
   - Reagenda notificação com novo `nextAlarm`

---

## 📁 Estrutura de Pastas Recomendada

```
/src
  /components
    /ui (botões, cards, inputs customizados)
    /charts (DailySpendingChart.js)
  /contexts
    AuthContext.js
    TripContext.js
    MedicationContext.js
  /screens
    HomeScreen.js
    TripListScreen.js
    TripDetailScreen.js
    AddTransactionScreen.js
    RecurrenceScreen.js
    MedicationListScreen.js
    AddMedicationScreen.js
    DailySpendingScreen.js
  /services
    firebase.js (CRUD para trips, transactions, recurrences, meds)
    notifications.js (lógica de agendamento/cancelamento)
  /utils
    dateUtils.js (funções com date-fns)
    currencyUtils.js (formatação de moeda)
  /config
    firebaseConfig.js
  /navigation
    AppNavigator.js
App.js
```

---

## 🎨 UI/UX Guidelines (Simples e Funcional)

- Usar `react-native-paper` para componentes estilizados
- Cores principais: Azul (#2196F3) para finanças, Verde (#4CAF50) para receitas, Vermelho (#F44336) para despesas
- Ícones do `react-native-vector-icons/MaterialIcons`
- Fonte padrão do sistema (não customizar para simplicidade)
- Tela de loading inicial enquanto carrega dados do Firestore

---

## 🔄 Fluxo de Atualização de Dados

1. App inicia → Login anônimo → Carrega `userId`
2. Carrega viagem ativa (se existir) + transações + recorrências + medicamentos
3. Calcula saldo real e projetado
4. Agenda notificações pendentes de medicamentos
5. Listener em tempo real no Firestore para atualizações automáticas

> Usar `onSnapshot` do Firestore para ouvir mudanças em:
>
> - `transactions` (where tripId = activeTripId)
> - `recurrences` (where tripId = activeTripId)
> - `medications`

---

## 📈 Tela de Gasto Diário

- Usar `react-native-chart-kit` → `BarChart`
- Dados:
  ```js
  const data = {
    labels: ["10/04", "11/04", "12/04", ...],
    datasets: [
      {
        data: [150, 200, 80, ...], // gasto real por dia
        color: () => '#F44336',
      },
      {
        data: [180, 220, 100, ...], // gasto projetado por dia
        color: () => '#FF9800',
      }
    ]
  }
  ```
- Tooltip ao tocar em barra mostra detalhes do dia

---

## 🧪 Testes Iniciais (Manuais)

1. Criar viagem → adicionar transações → verificar saldo
2. Criar recorrência → esperar atualização do saldo projetado
3. Adicionar medicamento → verificar se notificação aparece na hora
4. Tomar remédio → verificar atualização de `nextAlarm`
5. Rotacionar tela → verificar persistência de estado

---

## 🚀 Preparação para Play Store (Futuro)

1. Criar conta de desenvolvedor Google Play ($25)
2. Gerar `eas.json` para builds com EAS (Expo Application Services)
3. Configurar `app.json` com:
   - `android.package` (ex: com.yourname.financemedapp)
   - `version`, `icon`, `splash`, `permissions`
4. Rodar `eas build -p android --profile preview`
5. Submeter `.aab` gerado na Play Console

---

## 📝 Checklist de Implementação para IA Agent (Copilot)

- [ ] Configurar Firebase + Auth anônimo
- [ ] Criar estrutura de pastas
- [ ] Implementar navegação entre telas
- [ ] Criar contexto global de usuário (userId)
- [ ] CRUD de viagens (Firestore)
- [ ] CRUD de transações (vinculadas à viagem)
- [ ] CRUD de recorrências + lógica de atualização automática
- [ ] Cálculo de saldo real e projetado (em tempo real)
- [ ] Tela de gráfico de gasto diário
- [ ] CRUD de medicamentos
- [ ] Sistema de notificações com agendamento e cancelamento
- [ ] Botão "Tomei" que atualiza próximo alarme
- [ ] Estilização com react-native-paper
- [ ] Testes manuais de fluxo completo

---

✅ **PRONTO PARA IMPLEMENTAÇÃO POR IA AGENT NO VSCODE COPILOT**

> Instruções claras, estruturadas e detalhadas para cada componente, função e fluxo. Bibliotecas explicitamente listadas. Modelos de dados definidos. Lógica de negócio descrita passo a passo.

```

```
