import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  Snackbar,
  Divider
} from 'react-native-paper';
import { authService } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setSnackbar({ visible: true, message: 'Preencha todos os campos' });
      return;
    }

    setLoading(true);
    const result = await authService.login(email.trim(), password);
    
    if (result.success) {
      // O AuthContext vai detectar a mudança e navegar automaticamente
      console.log('Login realizado com sucesso!');
    } else {
      const errorMessage = authService.getErrorMessage(result.error);
      setSnackbar({ visible: true, message: errorMessage });
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSnackbar({ visible: true, message: 'Digite seu email primeiro' });
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email.trim());
    
    if (result.success) {
      setSnackbar({ 
        visible: true, 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
      });
    } else {
      const errorMessage = authService.getErrorMessage(result.error);
      setSnackbar({ visible: true, message: errorMessage });
    }
    
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={styles.title}>NomadGuide</Title>
        <Paragraph style={styles.subtitle}>
          Seu companheiro de viagem para finanças e medicamentos
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Entrar</Title>
          
          <TextInput
            label="📧 Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="🔒 Senha"
            value={password}
            onChangeText={setPassword}
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

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
          >
            Entrar
          </Button>

          <Button
            mode="text"
            onPress={handleForgotPassword}
            disabled={loading}
            style={styles.forgotButton}
          >
            Esqueci minha senha
          </Button>

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
          >
            Criar nova conta
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
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
  cardTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#6200ea',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  registerButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
