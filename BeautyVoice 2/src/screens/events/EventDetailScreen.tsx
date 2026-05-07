import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiFetchEvents, apiRegisterForEvent } from '../../services/api';
import { Event, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Route = RouteProp<{ EventDetail: { eventId: string } }, 'EventDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const token = useSelector((state: RootState) => state.auth.token)!;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    apiFetchEvents(token)
      .then((events) => {
        const found = events.find((e) => e.id === route.params.eventId);
        if (found) setEvent(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.eventId]);

  async function handleRegister() {
    if (!event) return;
    setRegistering(true);
    try {
      await apiRegisterForEvent(event.id, token);
      setRegistered(true);
      Alert.alert('', t('events.reminder'));
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setRegistering(false);
    }
  }

  if (loading || !event) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        {event.image && <Image source={{ uri: event.image }} style={styles.heroImage} />}

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.metaBlock}>
          <Text style={styles.metaRow}>📅 {t('events.date')}: {formatDate(event.date)}</Text>
          <Text style={styles.metaRow}>🕐 {t('events.time')}: {event.time}</Text>
          <Text style={styles.metaRow}>📍 {t('events.location')}: {event.location}</Text>
          <Text style={styles.metaRow}>
            👥 {t('events.capacity', { registered: event.registeredCount, capacity: event.capacity })}
          </Text>
        </View>

        <Text style={styles.description}>{event.description}</Text>

        {event.photos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('events.photos')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
              {event.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </>
        )}

        <TouchableOpacity
          style={[styles.registerButton, registered && styles.registeredButton]}
          onPress={handleRegister}
          disabled={registered || registering}
        >
          {registering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>
              {registered ? t('events.registered') : t('events.register')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  backButton: { padding: 20, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#e91e8c', fontWeight: '600' },
  heroImage: { width, height: 220 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', padding: 20, paddingBottom: 8 },
  metaBlock: { paddingHorizontal: 20, paddingBottom: 16, gap: 6 },
  metaRow: { fontSize: 14, color: '#555' },
  description: { fontSize: 15, color: '#555', lineHeight: 22, paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 10 },
  photoRow: { paddingHorizontal: 20, marginBottom: 20 },
  photo: { width: 180, height: 130, borderRadius: 10, marginRight: 10 },
  registerButton: {
    backgroundColor: '#e91e8c', borderRadius: 14,
    margin: 20, padding: 16, alignItems: 'center',
  },
  registeredButton: { backgroundColor: '#4CAF50' },
  registerText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
