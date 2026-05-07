import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiFetchEvents } from '../../services/api';
import { Event, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EventsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchEvents(token)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  function renderEvent({ item }: { item: Event }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.eventImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>BeautyVoice Event</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventMeta}>
            {formatDate(item.date)} · {item.time}
          </Text>
          <Text style={styles.eventLocation}>{item.location}</Text>
          <Text style={styles.capacity}>
            {t('events.capacity', { registered: item.registeredCount, capacity: item.capacity })}
          </Text>
        </View>
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
      <Text style={styles.screenTitle}>{t('events.title')}</Text>
      {events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('events.noEvents')}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
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
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  eventImage: { width: '100%', height: 160 },
  imagePlaceholder: {
    width: '100%', height: 120, backgroundColor: '#fde8f3',
    justifyContent: 'center', alignItems: 'center',
  },
  imagePlaceholderText: { color: '#e91e8c', fontWeight: '600', fontSize: 15 },
  cardBody: { padding: 16 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  eventMeta: { fontSize: 14, color: '#888', marginBottom: 4 },
  eventLocation: { fontSize: 14, color: '#555', marginBottom: 8 },
  capacity: { fontSize: 13, color: '#888' },
  emptyText: { fontSize: 16, color: '#999' },
});
