import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export const authService = {
  // Cadastrar novo usuário
  register: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualizar o perfil com o nome
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      console.log('✅ Usuário cadastrado com sucesso:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      return { success: false, error: error.message };
    }
  },

  // Fazer login
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login realizado com sucesso:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  },

  // Recuperar senha
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de recuperação enviado para:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      return { success: false, error: error.message };
    }
  },

  // Fazer logout
  logout: async () => {
    try {
      await signOut(auth);
      console.log('✅ Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter mensagens de erro em português
  getErrorMessage: (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email já está sendo usado por outra conta.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/user-not-found':
        return 'Nenhuma conta encontrada com este email.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }
};
