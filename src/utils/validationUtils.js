// Validation utilities for NomadGuide forms and data

export const validationUtils = {
  // Email validation
  validateEmail: (email) => {
    const errors = [];
    
    if (!email || !email.trim()) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
    
    if (email.length > 254) {
      errors.push('Email address is too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Password validation
  validatePassword: (password, options = {}) => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = false,
      maxLength = 128,
    } = options;
    
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (password.length > maxLength) {
      errors.push(`Password must be no more than ${maxLength} characters long`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Confirm password validation
  validatePasswordConfirm: (password, confirmPassword) => {
    const errors = [];
    
    if (!confirmPassword) {
      errors.push('Please confirm your password');
      return { isValid: false, errors };
    }
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Name validation
  validateName: (name, fieldName = 'Name') => {
    const errors = [];
    
    if (!name || !name.trim()) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    }
    
    if (trimmedName.length > 50) {
      errors.push(`${fieldName} must be no more than 50 characters long`);
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmedName)) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Amount validation
  validateAmount: (amount, options = {}) => {
    const {
      fieldName = 'Amount',
      minValue = 0,
      maxValue = 1000000,
      allowZero = false,
      currency = 'USD',
    } = options;
    
    const errors = [];
    
    if (amount === null || amount === undefined || amount === '') {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      errors.push(`${fieldName} must be a valid number`);
      return { isValid: false, errors };
    }
    
    if (!allowZero && numericAmount <= 0) {
      errors.push(`${fieldName} must be greater than zero`);
    }
    
    if (allowZero && numericAmount < 0) {
      errors.push(`${fieldName} cannot be negative`);
    }
    
    if (numericAmount < minValue) {
      errors.push(`${fieldName} must be at least ${minValue}`);
    }
    
    if (numericAmount > maxValue) {
      errors.push(`${fieldName} cannot exceed ${maxValue}`);
    }
    
    // Check decimal places for currency
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF'];
    if (noDecimalCurrencies.includes(currency)) {
      if (numericAmount % 1 !== 0) {
        errors.push(`${fieldName} cannot have decimal places for ${currency}`);
      }
    } else {
      // Check for reasonable decimal places (max 2 for most currencies)
      const decimalPart = numericAmount.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        errors.push(`${fieldName} cannot have more than 2 decimal places`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Date validation
  validateDate: (date, options = {}) => {
    const {
      fieldName = 'Date',
      minDate = null,
      maxDate = null,
      required = true,
    } = options;
    
    const errors = [];
    
    if (!date) {
      if (required) {
        errors.push(`${fieldName} is required`);
      }
      return { isValid: !required, errors };
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      errors.push(`${fieldName} must be a valid date`);
      return { isValid: false, errors };
    }
    
    if (minDate) {
      const minDateObj = minDate instanceof Date ? minDate : new Date(minDate);
      if (dateObj < minDateObj) {
        errors.push(`${fieldName} cannot be earlier than ${minDateObj.toLocaleDateString()}`);
      }
    }
    
    if (maxDate) {
      const maxDateObj = maxDate instanceof Date ? maxDate : new Date(maxDate);
      if (dateObj > maxDateObj) {
        errors.push(`${fieldName} cannot be later than ${maxDateObj.toLocaleDateString()}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Trip validation
  validateTrip: (tripData) => {
    const errors = {};
    let isValid = true;
    
    // Title validation
    const titleValidation = validationUtils.validateName(tripData.title, 'Trip title');
    if (!titleValidation.isValid) {
      errors.title = titleValidation.errors;
      isValid = false;
    }
    
    // Description validation (optional but with length limit)
    if (tripData.description && tripData.description.length > 500) {
      errors.description = ['Description must be no more than 500 characters long'];
      isValid = false;
    }
    
    // Start date validation
    const startDateValidation = validationUtils.validateDate(tripData.startDate, {
      fieldName: 'Start date',
      minDate: null, // Allow past dates for trip planning
    });
    if (!startDateValidation.isValid) {
      errors.startDate = startDateValidation.errors;
      isValid = false;
    }
    
    // End date validation
    const endDateValidation = validationUtils.validateDate(tripData.endDate, {
      fieldName: 'End date',
      minDate: tripData.startDate,
    });
    if (!endDateValidation.isValid) {
      errors.endDate = endDateValidation.errors;
      isValid = false;
    }
    
    // Budget validation
    const budgetValidation = validationUtils.validateAmount(tripData.initialBudget, {
      fieldName: 'Initial budget',
      minValue: 0,
      allowZero: true,
      currency: tripData.currency,
    });
    if (!budgetValidation.isValid) {
      errors.initialBudget = budgetValidation.errors;
      isValid = false;
    }
    
    // Currency validation
    if (!tripData.currency || typeof tripData.currency !== 'string') {
      errors.currency = ['Please select a currency'];
      isValid = false;
    }
    
    // Location validation (optional)
    if (tripData.location && tripData.location.length > 100) {
      errors.location = ['Location must be no more than 100 characters long'];
      isValid = false;
    }
    
    return { isValid, errors };
  },

  // Transaction validation
  validateTransaction: (transactionData) => {
    const errors = {};
    let isValid = true;
    
    // Type validation
    if (!transactionData.type || !['income', 'outcome'].includes(transactionData.type)) {
      errors.type = ['Please select a transaction type'];
      isValid = false;
    }
    
    // Amount validation
    const amountValidation = validationUtils.validateAmount(transactionData.amount, {
      fieldName: 'Amount',
      currency: transactionData.currency,
    });
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.errors;
      isValid = false;
    }
    
    // Description validation
    const descriptionValidation = validationUtils.validateName(transactionData.description, 'Description');
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.errors;
      isValid = false;
    }
    
    // Date validation
    const dateValidation = validationUtils.validateDate(transactionData.date, {
      fieldName: 'Date',
    });
    if (!dateValidation.isValid) {
      errors.date = dateValidation.errors;
      isValid = false;
    }
    
    // Currency validation
    if (!transactionData.currency || typeof transactionData.currency !== 'string') {
      errors.currency = ['Please select a currency'];
      isValid = false;
    }
    
    // Category validation (optional for income, required for outcome)
    if (transactionData.type === 'outcome' && !transactionData.categoryId) {
      errors.categoryId = ['Please select a category'];
      isValid = false;
    }
    
    // Notes validation (optional but with length limit)
    if (transactionData.notes && transactionData.notes.length > 300) {
      errors.notes = ['Notes must be no more than 300 characters long'];
      isValid = false;
    }
    
    return { isValid, errors };
  },

  // Medication validation
  validateMedication: (medicationData) => {
    const errors = {};
    let isValid = true;
    
    // Name validation
    const nameValidation = validationUtils.validateName(medicationData.name, 'Medication name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors;
      isValid = false;
    }
    
    // Dosage validation
    if (!medicationData.dosage || !medicationData.dosage.trim()) {
      errors.dosage = ['Dosage is required'];
      isValid = false;
    } else if (medicationData.dosage.length > 50) {
      errors.dosage = ['Dosage must be no more than 50 characters long'];
      isValid = false;
    }
    
    // Frequency validation
    if (!medicationData.frequency || !medicationData.frequency.trim()) {
      errors.frequency = ['Frequency is required'];
      isValid = false;
    } else if (medicationData.frequency.length > 100) {
      errors.frequency = ['Frequency must be no more than 100 characters long'];
      isValid = false;
    }
    
    // Notes validation (optional)
    if (medicationData.notes && medicationData.notes.length > 300) {
      errors.notes = ['Notes must be no more than 300 characters long'];
      isValid = false;
    }
    
    return { isValid, errors };
  },

  // Currency code validation
  validateCurrencyCode: (code) => {
    const errors = [];
    
    if (!code || typeof code !== 'string') {
      errors.push('Currency code is required');
      return { isValid: false, errors };
    }
    
    const currencyRegex = /^[A-Z]{3}$/;
    if (!currencyRegex.test(code)) {
      errors.push('Currency code must be 3 uppercase letters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Generic required field validation
  validateRequired: (value, fieldName = 'Field') => {
    const errors = [];
    
    if (value === null || value === undefined || 
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)) {
      errors.push(`${fieldName} is required`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // URL validation
  validateUrl: (url, options = {}) => {
    const { required = false, fieldName = 'URL' } = options;
    const errors = [];
    
    if (!url || !url.trim()) {
      if (required) {
        errors.push(`${fieldName} is required`);
      }
      return { isValid: !required, errors };
    }
    
    try {
      new URL(url);
    } catch (e) {
      errors.push(`${fieldName} must be a valid URL`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Phone number validation (basic)
  validatePhoneNumber: (phone, options = {}) => {
    const { required = false, fieldName = 'Phone number' } = options;
    const errors = [];
    
    if (!phone || !phone.trim()) {
      if (required) {
        errors.push(`${fieldName} is required`);
      }
      return { isValid: !required, errors };
    }
    
    // Basic phone number regex (allows various formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      errors.push(`${fieldName} must be a valid phone number`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Sanitize string input
  sanitizeString: (str, maxLength = 1000) => {
    if (!str || typeof str !== 'string') return '';
    
    return str
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  },

  // Get all errors as flat array
  flattenErrors: (errorsObject) => {
    const flatErrors = [];
    
    Object.values(errorsObject).forEach(errors => {
      if (Array.isArray(errors)) {
        flatErrors.push(...errors);
      } else if (typeof errors === 'string') {
        flatErrors.push(errors);
      }
    });
    
    return flatErrors;
  },
};

export default validationUtils;
