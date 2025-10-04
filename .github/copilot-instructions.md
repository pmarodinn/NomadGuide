<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# NomadGuide - Travel Expense Management App

## Project Overview
NomadGuide is a React Native Expo app for managing travel expenses with multi-currency support, recurring transactions, medication reminders, and banking-style UI.

## Technology Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 6 (Stack Navigator)
- **UI Library**: React Native Paper (Material Design 3)
- **State Management**: Context API
- **Backend**: Firebase Authentication + Cloud Firestore
- **Charts**: React Native Chart Kit
- **Notifications**: Expo Notifications

## Architecture
- **src/components/**: Reusable UI components (BankingComponents.js for financial UI)
- **src/contexts/**: React contexts for state management (Auth, Trip, Currency)
- **src/screens/**: All app screens with banking-inspired design
- **src/services/**: API services for Firebase and currency conversion
- **src/theme/**: Design system with colors, typography, spacing
- **src/utils/**: Utility functions for calculations and formatting

## Design System
- **Colors**: Primary blue (#1565C0), secondary yellow (#FFC107), banking-style palette
- **Typography**: Material Design 3 text styles
- **Components**: Banking-inspired cards, buttons, and layouts
- **Elevation**: Consistent shadow system

## Firebase Structure
```
users/{userId}/
├── trips/{tripId}/
│   ├── Basic trip data (name, budget, dates, currency)
│   ├── incomes/{incomeId}/ (income transactions)
│   ├── outcomes/{outcomeId}/ (expense transactions)
│   ├── medications/{medicationId}/ (medication reminders)
│   └── recurringTransactions/{id}/ (recurring transactions)
```

## Key Features
- Multi-trip expense tracking
- Real-time currency conversion
- Recurring transaction automation
- Medication reminders with notifications
- Banking-style financial dashboard
- Expense analytics and charts

## Development Guidelines
- Use TypeScript-style prop validation in comments
- Follow Material Design 3 principles
- Implement proper error handling and loading states
- Use React Navigation best practices
- Maintain consistent banking UI patterns
- Ensure proper Firebase security rules

## Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Use meaningful variable names
- Keep components modular and reusable
- Follow React Native performance best practices
