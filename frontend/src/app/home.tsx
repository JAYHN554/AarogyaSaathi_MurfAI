import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';


export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Arogya Saathi', headerShown: false }} />
      <View style={styles.fullscreen}>
        {/* 🔝 Logo */}
        <Image source={require('@/assets/logo.png')} style={styles.logo} resizeMode="contain" />
  
        {/* 🩺 Title */}
       <Text style={styles.title}>Arogya Saathi</Text>
        <Text style={styles.subtitle}>Your Voice-Powered Health Guide</Text>

        {/* 🚀 Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="./upload" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>📤 Upload Report</Text>
            </TouchableOpacity>
          </Link>
          <View style={styles.buttonContainer}>
            <Link href="./pastreports" asChild>
              <TouchableOpacity style={styles.buttonOutline}>
                <Text style={styles.buttonOutlineText}>🔍 See Past Summarized Reports</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* 🤖 Floating Chatbot Button */}
        <Link href="./chatbot" asChild>
  <TouchableOpacity style={styles.chatbotFloat}>
    <Image source={require('@/assets/chatbot.png')} style={styles.chatbotFloatImage} />
    <Text style={styles.chatbotFloatText}>Chat with ArogyaSaathi</Text>
  </TouchableOpacity>
</Link>



        {/* ⚠️ Disclaimer */}
        <View style={styles.footerContainer}>
          <Text style={styles.disclaimer}>
            ⚠️ This is a student project made for learning purposes only.{"\n\n"}
            Always consult a certified medical professional.
          </Text>

          <Text style={styles.footer}>
            {"\n"}
            Made with ❤️ by JAY{"\n"}
            Tech that cares, not just computes.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1, // ✅ instead of fixed height
    padding: 24,
    backgroundColor: '#FEF9E7',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 180,
    height: 180,
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonOutline: {
    borderColor: '#27AE60',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
  },
  buttonOutlineText: {
    color: '#27AE60',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatbotFloat: {
    position: 'absolute',
    bottom: 160, // ✅ moved up from 100 to 160
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  chatbotFloatImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chatbotFloatText: {
    marginTop: 6,
    backgroundColor: '#D0ECE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  disclaimer: {
    fontSize: 15,
    color: '#B03A2E',
    textAlign: 'center',
    marginBottom: 6,
  },
  footer: {
    fontSize: 13,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
