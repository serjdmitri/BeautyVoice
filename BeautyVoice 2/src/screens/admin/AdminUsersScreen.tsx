import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiAdminGetUsers, apiAdminMarkReferralPaid } from '../../services/api';
import { User } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token)!;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminGetUsers(token)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function handleMarkPaid(userId: string, name: string) {
    Alert.alert(t('admin.markPaid'), `Mark referral payment as paid for ${name}?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          try {
            await apiAdminMarkReferralPaid(userId, token);
            Alert.alert('', 'Marked as paid.');
          } catch {
            Alert.alert('', t('common.error'));
          }
        },
      },
    ]);
  }

  function renderUser({ item }: { item: User }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
          <StatusBadge status={item.status} small />
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>Tests: {item.testsCompleted}</Text>
          <Text style={styles.stat}>Certs: {item.certificates.length}</Text>
          <Text style={styles.stat}>Lang: {item.language.toUpperCase()}</Text>
        </View>

        <View style={styles.referralRow}>
          <Text style={styles.referralCode}>Ref: {item.referralCode}</Text>
          <TouchableOpacity
            style={styles.markPaidButton}
            onPress={() => handleMarkPaid(item.id, `${item.firstName} ${item.lastName}`)}
          >
            <Text style={styles.markPaidText}>{t('admin.markPaid')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('admin.users')}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e91e8c" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backText: { fontSize: 16, color: '#e91e8c', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  userEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  userPhone: { fontSize: 13, color: '#888' },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  stat: { fontSize: 13, color: '#555', fontWeight: '500' },
  referralRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referralCode: { fontSize: 13, color: '#aaa' },
  markPaidButton: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  markPaidText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
});
