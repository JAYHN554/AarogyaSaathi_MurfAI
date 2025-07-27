import React, { useState } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from '@/utils/supabase'; // Adjust the import path as needed
export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
const [summary, setSummary] = useState<string | null>(null);
const [filename, setFilename] = useState<string | null>(null);
const [voiceId, setVoiceId] = useState<string | null>(null);
const [audioUrl, setAudioUrl] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);

  const SERVER_URL = 'http://127.0.0.1:5000/upload'; // 💡 Adjust for device testing (use LAN IP)

  // 📸 Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setPdfUri(null);
    }
  };

  // 📄 Pick PDF
  const pickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets && result.assets.length > 0) {
      setPdfUri(result.assets[0].uri);
      setImage(null);
    }
  };

  // 📤 Upload to Flask API
const uploadToServer = async () => {
  const uri = pdfUri || image;

  if (!uri) return Alert.alert("Please select a file first");

  const fileName = uri.split('/').pop() || 'report.pdf';
  const fileType = pdfUri ? 'application/pdf' : 'image/jpeg';

  const formData = new FormData();

   const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("❌ Failed to get user:", error);
    Alert.alert("Auth Error", "User not logged in.");
    return;
  }

  const userId = user.id;


  if (Platform.OS === 'web') {
  const fileUri = pdfUri || image;

  if (!fileUri) {
    console.error("❌ No file URI available");
    return;
  }

  const response = await fetch(fileUri); // ✅ Safe now
  const blob = await response.blob();

  const fileType = pdfUri ? 'application/pdf' : 'image/jpeg';
  const fileName = pdfUri ? 'report.pdf' : 'image.jpg';

  const file = new File([blob], fileName, { type: fileType });
  formData.append('file', file);


  } else {
    formData.append('file', {
      uri,
      name: fileName,
      type: fileType,
    } as any); // ignore TS error
  }
 formData.append('user_id', userId);

  try {
  console.log("📤 Uploading file...");
  const res = await fetch(SERVER_URL, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  console.log("✅ Server response:", json);

  if (json.error) {
    Alert.alert("⚠️ Upload Failed", json.error);
    return;
  }

  setSummary(json.summary);
  setFilename(json.filename);
  setVoiceId(json.voice_id);
  setAudioUrl(json.audio_url);
setMessage(json.message || "✅ Summary generated successfully");

} catch (err) {
  console.log("❌ Upload error:", err);
  Alert.alert("Error", "Something went wrong while uploading.");
}

};


  return (
    <>
      <Stack.Screen options={{ title: 'Upload Report' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📤 Upload Your Medical Report</Text>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📷 Upload Image Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline} onPress={pickPDF}>
          <Text style={styles.buttonOutlineText}>📄 Upload PDF Report</Text>
        </TouchableOpacity>

        {image && (
          <>
            <Text style={styles.previewLabel}>🖼️ Image Preview:</Text>
            <Image source={{ uri: image }} style={styles.preview} resizeMode="contain" />
          </>
        )}

        {pdfUri && (
          <>
            <Text style={styles.previewLabel}>📄 PDF Selected:</Text>
            <Text style={styles.pdfName}>{pdfUri.split('/').pop()}</Text>
          </>
        )}

        {/* 🆕 Upload Button */}
        <TouchableOpacity style={styles.buttonUpload} onPress={uploadToServer}>
          <Text style={styles.buttonText}>⬆️ Upload to Server</Text>
        </TouchableOpacity>

        {summary && (
  <View style={{ marginTop: 30, backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%', elevation: 3 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2C3E50' }}>
      📝 Summary of {filename || 'your report'}:
    </Text>
    <Text style={{ fontSize: 15, color: '#34495E', lineHeight: 22, marginBottom: 10 }}>
      {summary}
    </Text>

    {audioUrl && (
      <TouchableOpacity
        onPress={async () => {
          const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
          await sound.playAsync();
        }}
        style={{
          backgroundColor: '#E67E22',
          padding: 12,
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
          🎧 Listen to Summary
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}


      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4FFFB',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonOutline: {
    borderColor: '#27AE60',
    borderWidth: 2,
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  buttonOutlineText: {
    color: '#27AE60',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonUpload: {
    backgroundColor: '#2980B9',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#34495E',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  pdfName: {
    fontSize: 15,
    color: '#2C3E50',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
