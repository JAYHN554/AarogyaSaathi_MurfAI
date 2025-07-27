import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { supabase } from '@/utils/supabase';

type ReportType = {
  id: string;
  summary: string;
  audio_url: string;
  created_at: string;
  report: {
    name?: string;
    age?: string;
    blood_group?: string;
    date?: string;
    test_type?: string;
    hemoglobin?: string;
    blood_sugar?: string;
    cholesterol?: string;
    blood_pressure?: string;
  };
};

export default function PastReportsScreen() {
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not found:', userError?.message);
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error.message);
      } else {
        setReports(data as ReportType[]);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  const renderItem = ({ item }: { item: ReportType }) => (
    <View style={styles.reportCard}>
      <Text style={styles.dateText}>
        {new Date(item.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </Text>
      <Text style={styles.summaryText}>📝 Summary: {item.summary}</Text>
      <View style={styles.reportData}>
        <Text>👤 Name: {item.report?.name || 'N/A'}</Text>
        <Text>🎂 Age: {item.report?.age || 'N/A'}</Text>
        <Text>🩸 Blood Group: {item.report?.blood_group || 'N/A'}</Text>
        <Text>🗓️ Date: {item.report?.date || 'N/A'}</Text>
        <Text>🧪 Test Type: {item.report?.test_type || 'N/A'}</Text>
        <Text>💉 Hemoglobin: {item.report?.hemoglobin || 'N/A'}</Text>
        <Text>🧁 Blood Sugar: {item.report?.blood_sugar || 'N/A'}</Text>
        <Text>🥩 Cholesterol: {item.report?.cholesterol || 'N/A'}</Text>
        <Text>🫀 Blood Pressure: {item.report?.blood_pressure || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Past Summarized Reports' }} />
      <Text style={styles.header}>📄 Your Past Reports</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#27AE60" />
      ) : reports.length === 0 ? (
        <Text style={styles.noReports}>No reports found. Upload one to get started!</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCFC',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
  },
  reportData: {
    marginTop: 4,
    gap: 2,
  },
  noReports: {
    textAlign: 'center',
    marginTop: 50,
    color: '#7B241C',
    fontSize: 16,
  },
});
