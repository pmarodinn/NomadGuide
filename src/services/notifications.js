import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { calculateNextMedicationAlarm } from '../utils/dateUtils';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - True if permissions granted
 */
export const requestNotificationPermissions = async () => {
  try {
    if (!Device.isDevice) {
      console.log('❌ Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a medication notification
 * @param {Object} medication - Medication object
 * @returns {Promise<string|null>} - Notification ID or null if failed
 */
export const scheduleMedicationNotification = async (medication) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel existing notification if any
    if (medication.notificationId) {
      await cancelNotification(medication.notificationId);
    }

    const nextAlarm = calculateNextMedicationAlarm(medication.schedule);
    if (!nextAlarm) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Hora do Remédio!",
        body: `É hora de tomar ${medication.name} (${medication.dosage})`,
        sound: 'default',
        priority: 'high',
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
          type: 'medication-reminder'
        },
      },
      trigger: {
        date: nextAlarm,
        repeats: false, // We'll reschedule after taking
      },
    });

    console.log('✅ Medication notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling medication notification:', error);
    return null;
  }
};

/**
 * Schedule daily recurring medication notifications
 * @param {Object} medication - Medication object
 * @returns {Promise<string|null>} - Notification ID or null if failed
 */
export const scheduleDailyMedicationNotifications = async (medication) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel existing notification if any
    if (medication.notificationId) {
      await cancelNotification(medication.notificationId);
    }

    const notifications = [];

    // Schedule notification for each time in the schedule
    for (const hour of medication.schedule) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Lembrete de Medicamento",
          body: `É hora de tomar ${medication.name} (${medication.dosage})`,
          sound: 'default',
          priority: 'high',
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            type: 'medication-reminder',
            scheduledHour: hour,
          },
        },
        trigger: {
          hour,
          minute: 0,
          repeats: true, // Daily repetition
        },
      });

      notifications.push(notificationId);
    }

    console.log('✅ Daily medication notifications scheduled:', notifications);
    return notifications[0]; // Return first notification ID
  } catch (error) {
    console.error('❌ Error scheduling daily medication notifications:', error);
    return null;
  }
};

/**
 * Cancel a notification
 * @param {string} notificationId - Notification ID to cancel
 * @returns {Promise<void>}
 */
export const cancelNotification = async (notificationId) => {
  try {
    if (!notificationId) return;
    
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Notification cancelled:', notificationId);
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
  }
};

/**
 * Cancel all notifications for a medication
 * @param {Object} medication - Medication object
 * @returns {Promise<void>}
 */
export const cancelMedicationNotifications = async (medication) => {
  try {
    if (medication.notificationId) {
      await cancelNotification(medication.notificationId);
    }
    
    // If medication has multiple notifications (array), cancel all
    if (Array.isArray(medication.notificationIds)) {
      const cancelPromises = medication.notificationIds.map(id => 
        cancelNotification(id)
      );
      await Promise.all(cancelPromises);
    }

    console.log('✅ All medication notifications cancelled');
  } catch (error) {
    console.error('❌ Error cancelling medication notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} - Array of scheduled notifications
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Cancel all scheduled notifications
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
  }
};

/**
 * Handle notification response (when user taps notification)
 * @param {Object} response - Notification response
 * @returns {Object} - Parsed notification data
 */
export const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  
  if (data.type === 'medication-reminder') {
    return {
      type: 'medication',
      medicationId: data.medicationId,
      medicationName: data.medicationName,
      scheduledHour: data.scheduledHour,
    };
  }

  return null;
};

/**
 * Show immediate notification (for testing)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<string>} - Notification ID
 */
export const showImmediateNotification = async (title, body) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });

    console.log('✅ Immediate notification shown:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error showing immediate notification:', error);
    return null;
  }
};
