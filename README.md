# 🎒 NomadGuide - Travel Expense Management App

A comprehensive React Native application for managing travel expenses with multi-currency support, recurring transactions, medication reminders, and a modern banking-style user interface.

## 🚀 Features

### 💰 Financial Management
- **Multi-trip expense tracking** - Manage multiple trips simultaneously
- **Real-time currency conversion** - Support for 20+ currencies with live exchange rates
- **Banking-style dashboard** - Modern financial interface with balance cards
- **Recurring transactions** - Automate regular income and expenses
- **Expense categorization** - Organize transactions with custom categories
- **Budget tracking** - Monitor spending against trip budgets

### 💊 Health Management
- **Medication reminders** - Set up medication schedules with notifications
- **Health tracking** - Monitor medication adherence during travel

### 📊 Analytics & Reporting
- **Spending charts** - Visual representation of expenses over time
- **Category breakdown** - See where your money goes
- **Budget projections** - Forecast future expenses with recurring transactions

### 🔐 Security & Sync
- **Firebase Authentication** - Secure user accounts
- **Real-time synchronization** - Data synced across devices
- **Offline support** - Cached currency rates for offline use

## 🛠 Technology Stack

- **React Native** with Expo SDK 54
- **React Navigation 6** for navigation
- **React Native Paper** for Material Design 3 UI
- **Firebase** for authentication and Firestore database
- **Context API** for state management
- **React Native Chart Kit** for data visualization
- **Expo Notifications** for medication reminders

## 📱 App Structure

```
src/
├── components/           # Reusable UI components
│   ├── BankingComponents.js  # Financial UI components
│   ├── ui/              # Generic UI components
│   └── charts/          # Chart components
├── contexts/            # React contexts
│   ├── AuthContext.js   # Authentication state
│   ├── TripContext.js   # Trip and transaction management
│   └── CurrencyContext.js # Currency conversion
├── screens/             # App screens
│   ├── LoginScreen.js   # User authentication
│   ├── HomeScreen.js    # Main dashboard
│   ├── TripListScreen.js # Trip management
│   └── ...
├── services/            # API services
│   ├── authService.js   # Firebase auth
│   ├── tripService.js   # Firestore operations
│   └── currencyService.js # Exchange rates
├── navigation/          # Navigation configuration
├── theme/              # Design system
│   ├── colors.js       # Color palette
│   └── theme.js        # Material Design theme
└── utils/              # Utility functions
```

## 🗃 Database Structure

The app uses Firebase Firestore with the following hierarchical structure:

```
users/{userId}/
├── trips/{tripId}/
│   ├── name, description, initialBudget, defaultCurrency
│   ├── startDate, endDate, isActive
│   ├── createdAt, updatedAt
│   │
│   ├── incomes/{incomeId}/
│   │   ├── amount, description, currency, date
│   │   └── categoryId, categoryName
│   │
│   ├── outcomes/{outcomeId}/
│   │   ├── amount, description, currency, date
│   │   └── categoryId, categoryName
│   │
│   ├── medications/{medicationId}/
│   │   ├── name, dosage, frequency, duration
│   │   ├── isActive, nextAlarm
│   │   └── notes, createdAt, updatedAt
│   │
│   └── recurringTransactions/{id}/
│       ├── amount, description, type, frequency
│       ├── currency, startDate, endDate
│       └── lastAppliedDate, categoryId
```

## 🎨 Design System

### Color Palette
- **Primary**: #1565C0 (Blue) - Banking professional
- **Secondary**: #FFC107 (Gold) - Accent color
- **Success**: #4CAF50 (Green) - Positive transactions
- **Error**: #F44336 (Red) - Negative transactions
- **Warning**: #FF9800 (Orange) - Alerts and warnings

### Typography
Material Design 3 text styles with proper hierarchy and accessibility.

### Components
- **BalanceCard** - Financial overview cards
- **QuickActionButton** - Dashboard action buttons
- **TransactionItem** - Transaction list items
- **StatsCard** - Statistical information cards
- **ProgressCard** - Budget progress indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository** (or use the provided project)
```bash
cd NomadGuide
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Update `src/config/firebaseConfig.js` with your Firebase credentials
   - Enable Authentication and Firestore in your Firebase console
   - Set up Firestore security rules (see below)

4. **Start the development server**
```bash
npm start
```

5. **Run on device/simulator**
```bash
npm run android   # for Android
npm run ios       # for iOS (macOS only)
npm run web       # for web browser
```

### Firebase Configuration

Update `src/config/firebaseConfig.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Firestore Security Rules

Deploy these security rules to your Firestore database:

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

## 📸 Screenshots

*Screenshots will be available once the app is fully implemented*

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run in web browser
- `npm run eject` - Eject from Expo (not recommended)

### Project Structure Guidelines

- Keep components small and focused
- Use TypeScript-style prop documentation
- Implement proper error handling
- Follow Material Design 3 principles
- Maintain consistent banking UI patterns
- Use meaningful component and variable names

### State Management

The app uses React Context API for state management:

- **AuthContext** - User authentication and session
- **TripContext** - Trip and transaction data
- **CurrencyContext** - Exchange rates and currency conversion

## 🧪 Testing

*Testing setup will be added in future updates*

## 📦 Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## 🤝 Contributing

*Contributing guidelines will be added in future updates*

## 📄 License

*License information will be added*

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Firebase console for backend issues

## 🔮 Future Enhancements

- [ ] Expense receipt scanning with OCR
- [ ] Trip sharing and collaboration
- [ ] Advanced analytics and reporting
- [ ] Integration with banking APIs
- [ ] Offline-first architecture
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Export data to CSV/PDF
- [ ] Cryptocurrency support
- [ ] Travel itinerary management

---

**NomadGuide** - Making travel expense management simple and beautiful! 🌍✈️
