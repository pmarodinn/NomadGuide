import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  Snackbar
} from 'react-native-paper';
import { authService } from '../services/authService';

const RegisterScreen = ({ navigation }) => {
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
    if (!formData.name.trim()) {
      setSnackbar({ visible: true, message: 'Digite seu nome' });
      return false;
    }
    
    if (!formData.email.trim()) {
      setSnackbar({ visible: true, message: 'Digite seu email' });
      return false;
    }
    
    if (formData.password.length < 6) {
      setSnackbar({ visible: true, message: 'A senha deve ter pelo menos 6 caracteres' });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({ visible: true, message: 'As senhas não coincidem' });
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
      setSnackbar({ 
        visible: true, 
        message: 'Conta criada com sucesso! Redirecionando...' 
      });
      
      // Aguarda um pouco para mostrar a mensagem e depois o AuthContext navega automaticamente
      setTimeout(() => {
        console.log('Cadastro realizado com sucesso!');
      }, 1500);
    } else {
      const errorMessage = authService.getErrorMessage(result.error);
      setSnackbar({ visible: true, message: errorMessage });
    }
    
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Title style={styles.title}>Criar Conta</Title>
        <Paragraph style={styles.subtitle}>
          Junte-se à comunidade NomadGuide
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="👤 Nome Completo"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="📧 Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="🔒 Senha"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="🔒 Confirmar Senha"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            disabled={loading}
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
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
          >
            Criar Conta
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.backButton}
          >
            Já tenho uma conta
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
