// Notification utilities for medication reminders and budget alerts in NomadGuide

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { format, addDays, addHours, addMinutes, parseISO } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationUtils = {
  // Request permissions
  requestPermissions: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        
        await Notifications.setNotificationChannelAsync('medication', {
          name: 'Medication Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
          sound: 'default',
        });
        
        await Notifications.setNotificationChannelAsync('budget', {
          name: 'Budget Alerts',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#FF9800',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },

  // Check if permissions are granted
  checkPermissions: async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  },

  // Schedule medication reminder
  scheduleMedicationReminder: async (medication, reminderTimes = []) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        console.warn('No notification permissions');
        return [];
      }

      const notificationIds = [];
      const { name, dosage, frequency, notes } = medication;

      for (const reminderTime of reminderTimes) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 Medication Reminder',
            body: `Time to take ${name} - ${dosage}`,
            data: {
              type: 'medication',
              medicationId: medication.id,
              medicationName: name,
              dosage,
              notes,
            },
            sound: 'default',
            priority: Notifications.AndroidImportance.HIGH,
          },
          trigger: {
            channelId: 'medication',
            date: new Date(reminderTime),
            repeats: true,
          },
        });
        
        notificationIds.push(identifier);
      }

      console.log(`Scheduled ${notificationIds.length} medication reminders for ${name}`);
      return notificationIds;
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
      return [];
    }
  },

  // Schedule recurring medication reminders
  scheduleRecurringMedicationReminders: async (medication, startDate, endDate, times = ['09:00', '21:00']) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        return [];
      }

      const notificationIds = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { name, dosage } = medication;

      // Create reminders for each day and time
      const currentDate = new Date(start);
      while (currentDate <= end) {
        for (const timeString of times) {
          const [hours, minutes] = timeString.split(':').map(Number);
          const reminderDate = new Date(currentDate);
          reminderDate.setHours(hours, minutes, 0, 0);

          if (reminderDate > new Date()) { // Only schedule future reminders
            const identifier = await Notifications.scheduleNotificationAsync({
              content: {
                title: '💊 Medication Time',
                body: `${name} - ${dosage}\nTap to mark as taken`,
                data: {
                  type: 'medication',
                  medicationId: medication.id,
                  medicationName: name,
                  dosage,
                  scheduledTime: reminderDate.toISOString(),
                },
                sound: 'default',
              },
              trigger: {
                channelId: 'medication',
                date: reminderDate,
              },
            });

            notificationIds.push(identifier);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling recurring medication reminders:', error);
      return [];
    }
  },

  // Schedule budget alert
  scheduleBudgetAlert: async (trip, alertType = 'warning', customMessage = null) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        return null;
      }

      let title, body, priority;
      
      switch (alertType) {
        case 'critical':
          title = '🚨 Budget Alert - Critical';
          body = customMessage || `Your ${trip.title} budget is critically low! Consider reviewing your expenses.`;
          priority = Notifications.AndroidImportance.HIGH;
          break;
        case 'warning':
          title = '⚠️ Budget Alert - Warning';
          body = customMessage || `You're getting close to your ${trip.title} budget limit.`;
          priority = Notifications.AndroidImportance.DEFAULT;
          break;
        case 'info':
          title = '💰 Budget Update';
          body = customMessage || `Budget update for ${trip.title}`;
          priority = Notifications.AndroidImportance.LOW;
          break;
        default:
          title = '💰 Budget Alert';
          body = customMessage || `Budget alert for ${trip.title}`;
          priority = Notifications.AndroidImportance.DEFAULT;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'budget',
            tripId: trip.id,
            tripTitle: trip.title,
            alertType,
          },
          sound: alertType === 'critical' ? 'default' : undefined,
          priority,
        },
        trigger: {
          channelId: 'budget',
          seconds: 1, // Show immediately
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling budget alert:', error);
      return null;
    }
  },

  // Schedule daily spending summary
  scheduleDailySummary: async (trip, summary) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const { totalSpent, transactionCount, remainingBudget } = summary;
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Daily Spending Summary',
          body: `Today: $${totalSpent.toFixed(2)} in ${transactionCount} transactions. Remaining: $${remainingBudget.toFixed(2)}`,
          data: {
            type: 'daily_summary',
            tripId: trip.id,
            summary,
          },
        },
        trigger: {
          channelId: 'default',
          hour: 20, // 8 PM
          minute: 0,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
      return null;
    }
  },

  // Schedule trip reminder
  scheduleTripReminder: async (trip, reminderType = 'start', hoursBeforeTrip = 24) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const tripDate = reminderType === 'start' ? new Date(trip.startDate) : new Date(trip.endDate);
      const reminderDate = new Date(tripDate.getTime() - (hoursBeforeTrip * 60 * 60 * 1000));

      if (reminderDate <= new Date()) {
        return null; // Don't schedule past reminders
      }

      let title, body;
      if (reminderType === 'start') {
        title = '✈️ Trip Starting Soon';
        body = `Your trip "${trip.title}" starts ${hoursBeforeTrip === 24 ? 'tomorrow' : `in ${hoursBeforeTrip} hours`}!`;
      } else {
        title = '🏁 Trip Ending Soon';
        body = `Your trip "${trip.title}" ends ${hoursBeforeTrip === 24 ? 'tomorrow' : `in ${hoursBeforeTrip} hours`}. Don't forget to backup your data!`;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'trip_reminder',
            tripId: trip.id,
            tripTitle: trip.title,
            reminderType,
          },
        },
        trigger: {
          channelId: 'default',
          date: reminderDate,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling trip reminder:', error);
      return null;
    }
  },

  // Cancel notification
  cancelNotification: async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  },

  // Cancel multiple notifications
  cancelNotifications: async (notificationIds) => {
    try {
      await Promise.all(
        notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );
      return true;
    } catch (error) {
      console.error('Error canceling notifications:', error);
      return false;
    }
  },

  // Cancel all notifications
  cancelAllNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  },

  // Get scheduled notifications
  getScheduledNotifications: async () => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  // Handle notification response
  handleNotificationResponse: (response) => {
    const { notification, actionIdentifier } = response;
    const { data } = notification.request.content;

    switch (data.type) {
      case 'medication':
        return {
          type: 'medication',
          action: 'open_medication',
          medicationId: data.medicationId,
        };
      
      case 'budget':
        return {
          type: 'budget',
          action: 'open_trip',
          tripId: data.tripId,
        };
      
      case 'daily_summary':
        return {
          type: 'summary',
          action: 'open_analytics',
          tripId: data.tripId,
        };
      
      case 'trip_reminder':
        return {
          type: 'trip',
          action: 'open_trip',
          tripId: data.tripId,
        };
      
      default:
        return {
          type: 'unknown',
          action: 'open_app',
        };
    }
  },

  // Show immediate notification
  showNotification: async (title, body, data = {}) => {
    try {
      const hasPermission = await notificationUtils.checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Show immediately
      });

      return identifier;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  },

  // Format notification body for medication
  formatMedicationBody: (medication, additionalInfo = '') => {
    const { name, dosage, frequency } = medication;
    let body = `${name} - ${dosage}`;
    
    if (frequency) {
      body += ` (${frequency})`;
    }
    
    if (additionalInfo) {
      body += `\n${additionalInfo}`;
    }
    
    return body;
  },

  // Format notification body for budget
  formatBudgetBody: (trip, currentBalance, totalBudget, percentage) => {
    const remainingPercentage = Math.max(0, 100 - percentage);
    return `${remainingPercentage.toFixed(0)}% budget remaining ($${currentBalance.toFixed(2)} of $${totalBudget.toFixed(2)})`;
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return {
        granted: settings.status === 'granted',
        canAskAgain: settings.canAskAgain,
        canSetBadge: settings.ios?.allowsBadge,
        canPlaySound: settings.ios?.allowsSound,
        canShowAlert: settings.ios?.allowsAlert,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        granted: false,
        canAskAgain: true,
        canSetBadge: false,
        canPlaySound: false,
        canShowAlert: false,
      };
    }
  },

  // Test notification
  testNotification: async () => {
    try {
      return await notificationUtils.showNotification(
        '🧪 Test Notification',
        'This is a test notification from NomadGuide!',
        { type: 'test' }
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      return null;
    }
  },
};

export default notificationUtils;
