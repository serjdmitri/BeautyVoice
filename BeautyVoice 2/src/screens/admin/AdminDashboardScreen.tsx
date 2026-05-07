import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiAdminGetAllTests, apiAdminSendPush, apiAdminMarkReferralPaid } from '../../services/api';
import { Test, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useSelector((state: RootState) => state.auth.token)!;
  const user = useSelector((state: RootState) => state.auth.user)!;

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminGetAllTests(token)
      .then(setTests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSendPush(test: Test) {
    Alert.alert(
      t('admin.sendNotification'),
      `Send push for "${test.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await apiAdminSendPush({
                testId: test.id,
                messageKey: 'newTest',
                params: { value: String(test.certificateValue) },
                token,
              });
              Alert.alert('', 'Push notification sent.');
            } catch {
              Alert.alert('', t('common.error'));
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('admin.dashboard')}</Text>
        <Text style={styles.welcome}>Welcome, {user.firstName}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateTest')}
          >
            <Text style={styles.actionText}>+ {t('admin.createTest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionSecondary]}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Text style={[styles.actionText, { color: '#333' }]}>{t('admin.users')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('admin.manageTests')}</Text>

        {loading ? (
          <ActivityIndicator color="#e91e8c" />
        ) : (
          tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testCardHeader}>
                <Text style={styles.testTitle} numberOfLines={1}>{test.title}</Text>
                <Text style={styles.testType}>{test.type}</Text>
              </View>
              <Text style={styles.testMeta}>
                {t('admin.createdBy', { name: test.createdBy })} · {formatDate(test.createdAt)}
              </Text>

              <View style={styles.testActions}>
                <TouchableOpacity
                  style={styles.testActionButton}
                  onPress={() => navigation.navigate('AdminResults', { testId: test.id })}
                >
                  <Text style={styles.testActionText}>{t('admin.viewResults')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.testActionButton, styles.testActionSecondary]}
                  onPress={() => handleSendPush(test)}
                >
                  <Text style={[styles.testActionText, { color: '#333' }]}>Push</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  welcome: { fontSize: 15, color: '#888', marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionButton: {
    flex: 1, backgroundColor: '#e91e8c', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  actionSecondary: { backgroundColor: '#f0f0f0' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  testCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  testCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  testTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginRight: 8 },
  testType: { fontSize: 12, color: '#888', fontWeight: '500' },
  testMeta: { fontSize: 13, color: '#aaa', marginBottom: 12 },
  testActions: { flexDirection: 'row', gap: 8 },
  testActionButton: {
    flex: 1, backgroundColor: '#e91e8c', borderRadius: 8,
    padding: 10, alignItems: 'center',
  },
  testActionSecondary: { backgroundColor: '#f0f0f0' },
  testActionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
