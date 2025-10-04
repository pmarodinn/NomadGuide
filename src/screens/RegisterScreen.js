import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Snackbar, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, elevation, borderRadius } from '../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { register, loading, error, clearError } = useAuth();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      await register(
        formData.email.trim().toLowerCase(), 
        formData.password, 
        formData.name.trim()
      );
      
      setSnackbarMessage('Account created successfully! Welcome to NomadGuide!');
      setSnackbarVisible(true);
      
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="account-plus" 
                size={48} 
                color={colors.primary} 
              />
            </View>
            <Text style={styles.title}>Join NomadGuide</Text>
            <Text style={styles.subtitle}>
              Create your account to start tracking your travel expenses
            </Text>
          </View>

          {/* Register Form */}
          <Card style={styles.formCard}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Account</Text>

              {/* Name Input */}
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                error={!!errors.name}
                disabled={loading}
                left={<TextInput.Icon icon="account" />}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              {/* Email Input */}
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                error={!!errors.email}
                disabled={loading}
                left={<TextInput.Icon icon="email" />}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input */}
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                textContentType="newPassword"
                error={!!errors.password}
                disabled={loading}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Confirm Password Input */}
              <TextInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                textContentType="newPassword"
                error={!!errors.confirmPassword}
                disabled={loading}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={styles.requirementText}>• At least 6 characters</Text>
                <Text style={styles.requirementText}>• At least one uppercase letter</Text>
                <Text style={styles.requirementText}>• At least one lowercase letter</Text>
                <Text style={styles.requirementText}>• At least one number</Text>
              </View>

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Back to Login Button */}
              <Button
                mode="outlined"
                onPress={handleBackToLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                disabled={loading}
              >
                Already have an account? Sign In
              </Button>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar for messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[styles.snackbar, { 
          backgroundColor: snackbarMessage.includes('successfully') ? colors.success : colors.error 
        }]}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...elevation.level2,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    borderRadius: borderRadius.xl,
    ...elevation.level3,
  },
  formContainer: {
    padding: spacing.xl,
  },
  formTitle: {
    ...typography.headlineMedium,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
  },
  requirementsContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  requirementsTitle: {
    ...typography.labelMedium,
    marginBottom: spacing.sm,
  },
  requirementText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  registerButton: {
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  registerButtonText: {
    ...typography.labelLarge,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray300,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginHorizontal: spacing.md,
  },
  loginButton: {
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderColor: colors.primary,
  },
  loginButtonText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

export default RegisterScreen;
