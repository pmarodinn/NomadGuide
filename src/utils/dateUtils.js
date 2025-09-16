import { format, addHours, startOfDay, isBefore, isAfter, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date for display
 * @param {Date|Timestamp} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd/MM/yyyy')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return format(dateObj, formatStr, { locale: ptBR });
};

/**
 * Format a date and time for display
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} - Formatted date and time
 */
export const formatDateTime = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

/**
 * Format time only
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} - Formatted time
 */
export const formatTime = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return format(dateObj, 'HH:mm', { locale: ptBR });
};

/**
 * Check if a date is today
 * @param {Date|Timestamp} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isDateToday = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return isToday(dateObj);
};

/**
 * Calculate next medication alarm time
 * @param {Array} schedule - Array of hour numbers (e.g., [8, 16, 24])
 * @returns {Date} - Next alarm time
 */
export const calculateNextMedicationAlarm = (schedule) => {
  if (!schedule || schedule.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const today = startOfDay(now);

  // Find next scheduled time today
  const nextTodayHour = schedule.find(hour => hour > currentHour);
  
  if (nextTodayHour) {
    // Next alarm is today
    return addHours(today, nextTodayHour);
  } else {
    // Next alarm is tomorrow at the first scheduled time
    const tomorrow = addHours(today, 24);
    return addHours(tomorrow, schedule[0]);
  }
};

/**
 * Get the next occurrence of a recurrence
 * @param {Date|Timestamp} lastDate - Last occurrence date
 * @param {number} intervalHours - Interval in hours
 * @returns {Date} - Next occurrence date
 */
export const getNextRecurrenceDate = (lastDate, intervalHours) => {
  const dateObj = lastDate.toDate ? lastDate.toDate() : new Date(lastDate);
  return addHours(dateObj, intervalHours);
};

/**
 * Check if a date is in the past
 * @param {Date|Timestamp} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isDateInPast = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return isBefore(dateObj, new Date());
};

/**
 * Check if a date is in the future
 * @param {Date|Timestamp} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export const isDateInFuture = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return isAfter(dateObj, new Date());
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 30 minutes")
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Math.abs(diffMinutes) < 1) {
    return 'agora';
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `em ${diffMinutes}min` : `${Math.abs(diffMinutes)}min atrás`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `em ${diffHours}h` : `${Math.abs(diffHours)}h atrás`;
  } else {
    return diffDays > 0 ? `em ${diffDays}d` : `${Math.abs(diffDays)}d atrás`;
  }
};
