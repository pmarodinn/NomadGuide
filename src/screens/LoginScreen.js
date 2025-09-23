import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  Snackbar,
  useTheme,
  Text
} from 'react-native-paper';
import { authService } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setSnackbar({ visible: true, message: 'Preencha e-mail e senha.' });
      return;
    }
    setLoading(true);
    const result = await authService.login(email.trim(), password);
    if (!result.success) {
      const errorMessage = authService.getErrorMessage(result.error);
      setSnackbar({ visible: true, message: errorMessage });
      setLoading(false);
    }
    // On success, AuthContext handles navigation
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSnackbar({ visible: true, message: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }
    setLoading(true);
    const result = await authService.resetPassword(email.trim());
    const message = result.success 
      ? 'E-mail de recuperação enviado! Verifique sua caixa de entrada.'
      : authService.getErrorMessage(result.error);
    setSnackbar({ visible: true, message });
    setLoading(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={[styles.title, { color: theme.colors.primary }]}>NomadGuide</Title>
        <Paragraph style={styles.subtitle}>
          Suas viagens, suas finanças, seu controle.
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            left={<TextInput.Icon icon="at" />}
          />

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
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

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Entrar
          </Button>

          <View style={styles.linkContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              Criar conta
            </Button>
            <Text>|</Text>
            <Button
              mode="text"
              onPress={handleForgotPassword}
              disabled={loading}
            >
              Esqueci a senha
            </Button>
          </View>
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
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 16,
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
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 24,
  },
});

export default LoginScreen;
