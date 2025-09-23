import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Title, 
  Card, 
  TextInput, 
  Button, 
  Snackbar,
  useTheme,
  Text
} from 'react-native-paper';
import { authService } from '../services/authService';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setSnackbar({ visible: true, message: 'Preencha todos os campos.' });
      return false;
    }
    if (password.length < 6) {
      setSnackbar({ visible: true, message: 'A senha deve ter no mínimo 6 caracteres.' });
      return false;
    }
    if (password !== confirmPassword) {
      setSnackbar({ visible: true, message: 'As senhas não coincidem.' });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await authService.register(
      formData.email.trim(), 
      formData.password,
      formData.name.trim()
    );
    
    if (result.success) {
      // AuthContext will handle navigation on user state change
    } else {
      const errorMessage = authService.getErrorMessage(result.error);
      setSnackbar({ visible: true, message: errorMessage });
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Title style={[styles.title, { color: theme.colors.primary }]}>Crie sua Conta</Title>
        <Text style={styles.subtitle}>É rápido e fácil.</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Nome Completo"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="account-outline" />}
          />

          <TextInput
            label="E-mail"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="at" />}
          />

          <TextInput
            label="Senha"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="lock-check-outline" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Criar Conta
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>{snackbar.message}</Text>
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
