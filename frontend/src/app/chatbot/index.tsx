  import React, { useState } from 'react';
  import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
  import { Stack } from 'expo-router';
  import { chatWithTTS } from '@/utils/chatWithTTS'; // 👈 NEW import



  export default function ChatbotScreen() {
    const [messages, setMessages] = useState([
      { type: 'bot', text: '👋 Hi! What symptoms are you noticing?' },
      { type: 'bot', text: '💡 Want a custom diet plan based on your report?' },
      { type: 'bot', text: '🩺 Need help with your medical reports?' },
      { type: 'bot', text: '💬 Ask me anything about your health!' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
      if (!input.trim()) return;

      const userMessage = { type: 'user', text: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      try {
        const { reply, audioUrl } = await chatWithTTS(input);
console.log("Bot reply:", reply);
console.log("Audio URL:", audioUrl);

const botMessage = { type: 'bot', text: reply };
setMessages(prev => [...prev, botMessage]);

// 🔊 Play the audio
if (audioUrl) {
  const sound = new Audio(audioUrl);
  sound.play().catch(err => {
    console.error("🔇 Audio play error:", err);
  });
}

      } catch (err) {
        setMessages(prev => [...prev, { type: 'bot', text: "⚠️ Sorry, I couldn't understand that." }]);
      }

      setLoading(false);
    };

    return (
      <>
        <Stack.Screen options={{ title: 'Arogya Chatbot' }} />
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.chat}>
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={msg.type === 'bot' ? styles.botMsg : styles.userMsg}
              >
                <Text style={styles.msgText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type your question..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendText}>{loading ? '...' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    chat: { padding: 16 },
    botMsg: {
      alignSelf: 'flex-start',
      backgroundColor: '#D0ECE7',
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
      maxWidth: '80%',
    },
    userMsg: {
      alignSelf: 'flex-end',
      backgroundColor: '#ABEBC6',
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
      maxWidth: '80%',
    },
    msgText: { fontSize: 15 },
    inputBar: {
      flexDirection: 'row',
      padding: 12,
      borderTopWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
    },
    input: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 },
    sendBtn: { paddingHorizontal: 12, justifyContent: 'center' },
    sendText: { color: '#2E86C1', fontWeight: 'bold' },
  });
