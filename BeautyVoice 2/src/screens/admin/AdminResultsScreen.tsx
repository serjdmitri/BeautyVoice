import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiAdminGetResults, apiAdminExportExcel } from '../../services/api';
import { RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'AdminResults'>;

interface ResultRow {
  userId: string;
  userName: string;
  userLanguage: string;
  completedAt: string;
  answers: Record<string, string | string[] | number>;
}

export default function AdminResultsScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token)!;

  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    apiAdminGetResults(route.params.testId, token)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.testId]);

  async function handleExport() {
    setExporting(true);
    try {
      const downloadUrl = await apiAdminExportExcel(route.params.testId, token);
      await Linking.openURL(downloadUrl);
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setExporting(false);
    }
  }

  function renderResult({ item }: { item: ResultRow }) {
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.langBadge}>{item.userLanguage.toUpperCase()}</Text>
        </View>
        <Text style={styles.completedAt}>Completed: {new Date(item.completedAt).toLocaleString()}</Text>
        {Object.entries(item.answers).map(([qId, answer]) => (
          <View key={qId} style={styles.answerRow}>
            <Text style={styles.answerQ}>Q{qId}:</Text>
            <Text style={styles.answerVal}>
              {Array.isArray(answer) ? answer.join(', ') : String(answer)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('admin.results')}</Text>
        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.disabled]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.exportText}>{t('admin.exportExcel')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>{t('admin.totalResponses')}: {results.length}</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e91e8c" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.userId}
          renderItem={renderResult}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backText: { fontSize: 16, color: '#e91e8c', fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  exportButton: { backgroundColor: '#e91e8c', borderRadius: 10, padding: 10, alignItems: 'center' },
  exportText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  total: { fontSize: 14, color: '#888', padding: 16, paddingBottom: 4 },
  list: { padding: 16, gap: 12 },
  resultCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  langBadge: { fontSize: 11, color: '#888', fontWeight: '700', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  completedAt: { fontSize: 12, color: '#aaa', marginBottom: 10 },
  answerRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  answerQ: { fontSize: 13, fontWeight: '600', color: '#888', width: 40 },
  answerVal: { flex: 1, fontSize: 13, color: '#333' },
  disabled: { opacity: 0.6 },
});
