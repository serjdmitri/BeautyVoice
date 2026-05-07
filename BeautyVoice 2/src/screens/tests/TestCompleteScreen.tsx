import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'TestComplete'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TestCompleteScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { certificateValue } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>{t('tests.thankYou')}</Text>
        <Text style={styles.message}>{t('tests.earned', { value: certificateValue })}</Text>

        <View style={styles.certificateCard}>
          <Text style={styles.certificateLabel}>Certificate Earned</Text>
          <Text style={styles.certificateValue}>${certificateValue}</Text>
          <Text style={styles.certificateNote}>Check your profile to use this on the website.</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 18, color: '#555', textAlign: 'center', marginBottom: 32, lineHeight: 26 },
  certificateCard: {
    backgroundColor: '#fde8f3', borderRadius: 20,
    padding: 28, alignItems: 'center', width: '100%', marginBottom: 32,
  },
  certificateLabel: { fontSize: 14, color: '#888', marginBottom: 6, fontWeight: '600' },
  certificateValue: { fontSize: 52, fontWeight: '900', color: '#e91e8c' },
  certificateNote: { fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center' },
  button: {
    backgroundColor: '#e91e8c', borderRadius: 14,
    paddingHorizontal: 48, paddingVertical: 16,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
