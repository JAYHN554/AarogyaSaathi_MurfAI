import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase'; // adjust path



export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

const handleRegister = async () => {
  if (!email || !password || !name) {
    alert('Please fill all fields');
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }, // optional metadata
    },
  });

  if (error) {
    alert('Registration failed: ' + error.message);
  } else {
    alert('Check your email to confirm registration!');
    router.replace('/');
  }
};

  const goToLogin = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Register' }} />
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>📝 Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToLogin} style={styles.loginLink}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
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
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#2C3E50',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
