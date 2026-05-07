import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiFetchTopTesters, apiFetchReferralRanking } from '../../services/api';
import { TesterEntry, ReferralEntry } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { statusColor } from '../../utils/helpers';

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [topTesters, setTopTesters] = useState<TesterEntry[]>([]);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [loadingLeaderboards, setLoadingLeaderboards] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([apiFetchTopTesters(token), apiFetchReferralRanking(token)])
      .then(([testers, refs]) => {
        setTopTesters(testers.slice(0, 10));
        setReferrals(refs.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoadingLeaderboards(false));
  }, [token]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>{t('home.greeting', { name: user.firstName })}</Text>
        <StatusBadge status={user.status} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.testsCompleted}</Text>
            <Text style={styles.statLabel}>{t('home.testsCompleted')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.certificates.filter(c => !c.used).length}</Text>
            <Text style={styles.statLabel}>{t('home.certificates')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('home.topTesters')}</Text>
        {loadingLeaderboards ? (
          <ActivityIndicator color="#e91e8c" />
        ) : (
          topTesters.map((entry, i) => (
            <View key={entry.userId} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>#{i + 1}</Text>
              <Text style={styles.leaderName}>{entry.userName}</Text>
              <Text style={styles.leaderStat}>{entry.testsThisWeek} tests</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>{t('home.referralRanking')}</Text>
        {loadingLeaderboards ? (
          <ActivityIndicator color="#e91e8c" />
        ) : (
          referrals.map((entry, i) => (
            <View key={entry.userId} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>#{i + 1}</Text>
              <Text style={styles.leaderName}>{entry.userName}</Text>
              <Text style={styles.leaderStat}>{entry.referralCount} referrals · ${entry.earned}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statCard: {
    flex: 1, backgroundColor: '#fde8f3', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  statNumber: { fontSize: 32, fontWeight: '800', color: '#e91e8c' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 12 },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  leaderRank: { width: 36, fontSize: 14, fontWeight: '700', color: '#e91e8c' },
  leaderName: { flex: 1, fontSize: 15, color: '#333' },
  leaderStat: { fontSize: 13, color: '#888' },
});
