# 🔥 Configuração do Firebase

## Passos para configurar o Firebase:

### 1. Criar projeto no Firebase Console
1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Nome sugerido: `nomadapp-[seunome]`
4. Ative o Google Analytics se desejar

### 2. Configurar Authentication
1. No painel do Firebase, vá em Authentication > Sign-in method
2. Ative "Anonymous" (autenticação anônima)
3. Salve as alterações

### 3. Configurar Firestore Database
1. Vá em Firestore Database
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização próxima (ex: southamerica-east1)

### 4. Obter configurações do projeto
1. Vá em Configurações do projeto (ícone de engrenagem)
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique no ícone "</>" para adicionar um app web
4. Registre o app com nome "NomadApp"
5. Copie o objeto `firebaseConfig`

### 5. Atualizar o arquivo de configuração
Substitua o conteúdo do arquivo `src/config/firebaseConfig.js` com suas configurações reais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 6. Configurar regras do Firestore (importante!)
No Firestore Database > Regras, substitua pelas regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso apenas ao próprio usuário autenticado
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Como testar
Após configurar tudo:
1. Execute `npm start` ou `expo start`
2. O app deve carregar sem erros
3. Verifique no Firebase Console se aparecem usuários anônimos em Authentication
4. Crie uma viagem ou medicamento e veja se aparecem dados no Firestore

## ⚠️ Importante
- As configurações atuais são apenas placeholders
- Sem configurar o Firebase real, o app mostrará erros de conexão
- Mantenha suas chaves privadas seguras
- Nunca commite suas chaves reais para repositórios públicos
