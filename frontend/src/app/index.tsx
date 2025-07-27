import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase'; 


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // ✅ Correct position

const handleLogin = async () => {
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Login successful!');
    router.replace('/home');
  }
};

  const handleRegister = () => {
    router.push('/Signup'); // ✅ navigate to your actual register screen
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Login' }} />

      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>🔓 Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>Don’t have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    color: '#2C3E50',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
