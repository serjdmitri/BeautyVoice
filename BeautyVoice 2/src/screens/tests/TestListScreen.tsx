import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchTests } from '../../store/testsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Test, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TEST_TYPE_COLORS: Record<string, string> = {
  home: '#4CAF50',
  offline: '#2196F3',
  online: '#FF9800',
};

export default function TestListScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<Nav>();
  const { available, loading } = useSelector((state: RootState) => state.tests);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchTests(token));
  }, [token]);

  function renderTest({ item }: { item: Test }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TestDetail', { testId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: TEST_TYPE_COLORS[item.type] }]}>
            <Text style={styles.typeBadgeText}>{t(`tests.${item.type}`)}</Text>
          </View>
          <Text style={styles.certificate}>{t('tests.certificate', { value: item.certificateValue })}</Text>
        </View>

        <Text style={styles.testTitle}>{item.title}</Text>
        <Text style={styles.testDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.meta}>{t('tests.deadline', { date: formatDate(item.endDate) })}</Text>
          {item.slotsRemaining !== undefined && (
            <Text style={styles.slots}>{t('tests.slotsLeft', { count: item.slotsRemaining })}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.participateButton}
          onPress={() => navigation.navigate('TestDetail', { testId: item.id })}
        >
          <Text style={styles.participateText}>{t('tests.participate')}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>{t('tests.available')}</Text>
      {available.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('tests.noTests')}</Text>
        </View>
      ) : (
        <FlatList
          data={available}
          keyExtractor={(item) => item.id}
          renderItem={renderTest}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', padding: 20, paddingBottom: 8 },
  list: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  certificate: { fontSize: 14, fontWeight: '700', color: '#e91e8c' },
  testTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  testDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  meta: { fontSize: 13, color: '#888' },
  slots: { fontSize: 13, color: '#FF9800', fontWeight: '600' },
  participateButton: {
    backgroundColor: '#e91e8c', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  participateText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyText: { fontSize: 16, color: '#999' },
});
