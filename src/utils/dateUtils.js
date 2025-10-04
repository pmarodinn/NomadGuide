// Date utility functions for the NomadGuide app

import { format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';

export const dateUtils = {
  // Format date for display
  formatDate: (date, formatString = 'MMM dd, yyyy') => {
    if (!date) return '';
    
    let dateObj;
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString);
  },

  // Format date for form inputs
  formatDateForInput: (date) => {
    if (!date) return '';
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'yyyy-MM-dd');
  },

  // Get readable time ago
  getTimeAgo: (date) => {
    if (!date) return '';
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const diffInDays = differenceInDays(now, dateObj);
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  },

  // Calculate trip duration
  getTripDuration: (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    let startObj, endObj;
    
    if (startDate.toDate) {
      startObj = startDate.toDate();
    } else if (typeof startDate === 'string') {
      startObj = parseISO(startDate);
    } else {
      startObj = startDate;
    }
    
    if (endDate.toDate) {
      endObj = endDate.toDate();
    } else if (typeof endDate === 'string') {
      endObj = parseISO(endDate);
    } else {
      endObj = endDate;
    }
    
    if (!isValid(startObj) || !isValid(endObj)) return 0;
    
    return Math.abs(differenceInDays(endObj, startObj)) + 1; // +1 to include both start and end dates
  },

  // Get trip progress percentage
  getTripProgress: (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    let startObj, endObj;
    
    if (startDate.toDate) {
      startObj = startDate.toDate();
    } else if (typeof startDate === 'string') {
      startObj = parseISO(startDate);
    } else {
      startObj = startDate;
    }
    
    if (endDate.toDate) {
      endObj = endDate.toDate();
    } else if (typeof endDate === 'string') {
      endObj = parseISO(endDate);
    } else {
      endObj = endDate;
    }
    
    if (!isValid(startObj) || !isValid(endObj)) return 0;
    
    const now = new Date();
    const totalDays = differenceInDays(endObj, startObj);
    const daysPassed = differenceInDays(now, startObj);
    
    if (daysPassed < 0) return 0; // Trip hasn't started
    if (daysPassed > totalDays) return 100; // Trip has ended
    
    return Math.round((daysPassed / totalDays) * 100);
  },

  // Check if trip is active (current date is between start and end)
  isTripActive: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    
    let startObj, endObj;
    
    if (startDate.toDate) {
      startObj = startDate.toDate();
    } else if (typeof startDate === 'string') {
      startObj = parseISO(startDate);
    } else {
      startObj = startDate;
    }
    
    if (endDate.toDate) {
      endObj = endDate.toDate();
    } else if (typeof endDate === 'string') {
      endObj = parseISO(endDate);
    } else {
      endObj = endDate;
    }
    
    if (!isValid(startObj) || !isValid(endObj)) return false;
    
    const now = new Date();
    const today = startOfDay(now);
    const tripStart = startOfDay(startObj);
    const tripEnd = endOfDay(endObj);
    
    return today >= tripStart && today <= tripEnd;
  },

  // Get days remaining in trip
  getDaysRemaining: (endDate) => {
    if (!endDate) return 0;
    
    let endObj;
    if (endDate.toDate) {
      endObj = endDate.toDate();
    } else if (typeof endDate === 'string') {
      endObj = parseISO(endDate);
    } else {
      endObj = endDate;
    }
    
    if (!isValid(endObj)) return 0;
    
    const now = new Date();
    const remaining = differenceInDays(endObj, now);
    
    return Math.max(0, remaining);
  },

  // Calculate next occurrence for recurring transactions
  getNextRecurrenceDate: (lastDate, frequency) => {
    if (!lastDate) return new Date();
    
    let dateObj;
    if (lastDate.toDate) {
      dateObj = lastDate.toDate();
    } else if (typeof lastDate === 'string') {
      dateObj = parseISO(lastDate);
    } else {
      dateObj = lastDate;
    }
    
    if (!isValid(dateObj)) return new Date();
    
    switch (frequency) {
      case 'daily':
        return addDays(dateObj, 1);
      case 'weekly':
        return addDays(dateObj, 7);
      case 'monthly':
        // Simple monthly calculation - add 30 days
        return addDays(dateObj, 30);
      case 'quarterly':
        return addDays(dateObj, 90);
      case 'biannual':
        return addDays(dateObj, 180);
      default:
        return dateObj;
    }
  },

  // Check if date is today
  isToday: (date) => {
    if (!date) return false;
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return false;
    
    const today = startOfDay(new Date());
    const checkDate = startOfDay(dateObj);
    
    return today.getTime() === checkDate.getTime();
  },

  // Convert date to Firestore timestamp format
  toFirestoreTimestamp: (date) => {
    if (!date) return null;
    
    let dateObj;
    if (date.toDate) {
      return date; // Already a Firestore timestamp
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return null;
    
    return dateObj;
  },

  // Get start and end of day
  getStartOfDay: (date) => {
    if (!date) return null;
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return null;
    
    return startOfDay(dateObj);
  },

  getEndOfDay: (date) => {
    if (!date) return null;
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return null;
    
    return endOfDay(dateObj);
  },
};

export default dateUtils;
