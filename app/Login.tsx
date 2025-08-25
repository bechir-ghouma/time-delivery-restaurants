import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { handleSignIn } from '../services/users';

const { width, height } = Dimensions.get('window');

const Login = ({ onLogin }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    console.log('Logging in with:', emailOrPhone, password);
    setLoginLoading(true);

    try {
      // Replace this with your actual API call
      const response = await handleSignIn(emailOrPhone, password);
      console.log('Login response:', response.data);

      // Check if the user role is Restaurant
      if (response.data.role !== 'Restaurant') {
        console.log('Access denied for role:', response.data.role);
        setShowErrorModal(true);
        setLoginLoading(false);
        return;
      }

      // Store authentication data
      await AsyncStorage.setItem('role', response.data.role);
      await AsyncStorage.setItem('id', response.data.id.toString());
      await AsyncStorage.setItem('authToken', 'your-auth-token'); // Store actual token
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));

      // Call the onLogin callback to update parent component
      if (onLogin) {
        onLogin(response.data, 'your-auth-token');
      }

      Alert.alert('Connexion réussie', 'Vous êtes maintenant connecté !');

    } catch (error) {
      console.error('Login failed:', error.message);
      Alert.alert('Échec de la connexion', error.message || 'Une erreur est survenue');
      setLoginLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />
      
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Replace the emoji with your PNG logo */}
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../assets/images/logoTimeD.jpg')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Time Delivery</Text>
            <Text style={styles.appSubtitle}>Restaurant Dashboard</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.welcomeSubtitle}>Connectez-vous à votre compte restaurant</Text>

            {/* Email/Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Email ou numéro de téléphone"
                placeholderTextColor="#9CA3AF"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity 
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loginLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loginLoading ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#059669']}
                style={styles.loginButtonGradient}
              >
                {loginLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showErrorModal}
          onRequestClose={closeErrorModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="close-circle" size={60} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Accès refusé</Text>
              <Text style={styles.modalMessage}>
                Cette application est réservée aux restaurants uniquement.
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={closeErrorModal}
              >
                <Text style={styles.modalButtonText}>Compris</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent background
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8, // Add some padding around the logo
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 0.6,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6B7280',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;