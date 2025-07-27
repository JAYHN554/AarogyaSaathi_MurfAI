import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const UploadAndSummarize = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });

    if (!result.canceled) {
      setLoading(true);
      const uri = result.assets?.[0]?.uri;
      const name = result.assets?.[0]?.name;
      const type = result.assets?.[0]?.mimeType || 'image/jpeg';

      const file = {
        uri,
        name,
        type,
      };

      const formData = new FormData();
      formData.append('file', file as any);

      const response = await fetch('http://127.0.0.1:5000/process', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = await response.json();
      setSummary(data.summary);
      setAudioUrl(data.audioUrl);
      setLoading(false);

      const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
      await sound.playAsync();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Upload Report" onPress={pickDocument} />
      {loading && <ActivityIndicator size="large" />}
      {summary !== '' && <Text style={{ marginTop: 20 }}>{summary}</Text>}
    </View>
  );
};

export default UploadAndSummarize;
