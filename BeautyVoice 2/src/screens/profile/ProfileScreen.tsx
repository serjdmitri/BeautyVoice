import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Clipboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store/store';
import { setLanguage, signOut } from '../../store/authSlice';
import { apiUpdateLanguage } from '../../services/api';
import { Language } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user)!;
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  function handleCopyReferral() {
    Clipboard.setString(user.referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function handleLanguageChange(lang: Language) {
    setShowLangPicker(false);
    dispatch(setLanguage(lang));
    await apiUpdateLanguage(user.id, lang, token);
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(signOut()) },
    ]);
  }

  const availableCerts = user.certificates.filter((c) => !c.used);
  const usedCerts = user.certificates.filter((c) => c.used);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <StatusBadge status={user.status} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{user.testsCompleted}</Text>
            <Text style={styles.statLabel}>{t('profile.testsCompleted')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{availableCerts.length}</Text>
            <Text style={styles.statLabel}>{t('profile.certificates')}</Text>
          </View>
        </View>

        {user.skinType && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.skinType')}</Text>
            <Text style={styles.infoValue}>{user.skinType}</Text>
          </View>
        )}
        {user.hairType && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.hairType')}</Text>
            <Text style={styles.infoValue}>{user.hairType}</Text>
          </View>
        )}
        {user.address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.address')}</Text>
            <Text style={styles.infoValue}>{user.address}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('profile.referralCode')}</Text>
        <Text style={styles.referralInfo}>{t('profile.referralInfo')}</Text>
        <View style={styles.referralRow}>
          <Text style={styles.referralCode}>{user.referralCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferral}>
            <Text style={styles.copyText}>{codeCopied ? t('profile.codeCopied') : t('profile.copyCode')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('profile.certificates')}</Text>
        {availableCerts.map((cert) => (
          <View key={cert.id} style={styles.certCard}>
            <View>
              <Text style={styles.certValue}>{t('profile.certificateValue', { value: cert.value })}</Text>
              <Text style={styles.certCode}>{t('profile.certificateCode', { code: cert.code })}</Text>
            </View>
            <View style={styles.certAvailable}>
              <Text style={styles.certAvailableText}>{t('profile.certificateAvailable')}</Text>
            </View>
          </View>
        ))}
        {usedCerts.map((cert) => (
          <View key={cert.id} style={[styles.certCard, styles.certUsed]}>
            <View>
              <Text style={[styles.certValue, { color: '#aaa' }]}>{t('profile.certificateValue', { value: cert.value })}</Text>
              <Text style={styles.certCode}>{t('profile.certificateCode', { code: cert.code })}</Text>
            </View>
            <Text style={styles.certUsedText}>{t('profile.certificateUsed')}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <TouchableOpacity style={styles.langButton} onPress={() => setShowLangPicker(!showLangPicker)}>
          <Text style={styles.langButtonText}>
            {LANGUAGES.find((l) => l.code === user.language)?.label ?? user.language}
          </Text>
        </TouchableOpacity>
        {showLangPicker && LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langOption, user.language === lang.code && styles.langOptionSelected]}
            onPress={() => handleLanguageChange(lang.code)}
          >
            <Text style={styles.langOptionText}>{lang.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 60 },
  name: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  email: { fontSize: 15, color: '#888', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statCard: { flex: 1, backgroundColor: '#fde8f3', borderRadius: 14, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: '800', color: '#e91e8c' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginTop: 28, marginBottom: 8 },
  referralInfo: { fontSize: 13, color: '#666', marginBottom: 10 },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  referralCode: { flex: 1, fontSize: 18, fontWeight: '800', color: '#e91e8c', letterSpacing: 1 },
  copyButton: { backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  copyText: { fontSize: 13, fontWeight: '600', color: '#333' },
  certCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  certUsed: { opacity: 0.6 },
  certValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  certCode: { fontSize: 12, color: '#888', marginTop: 2 },
  certAvailable: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  certAvailableText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  certUsedText: { fontSize: 12, color: '#aaa' },
  langButton: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 14 },
  langButtonText: { fontSize: 16, color: '#333', fontWeight: '500' },
  langOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  langOptionSelected: { backgroundColor: '#fde8f3' },
  langOptionText: { fontSize: 15, color: '#333' },
  signOutButton: { marginTop: 40, borderWidth: 1.5, borderColor: '#ffccdd', borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText: { fontSize: 16, color: '#e91e8c', fontWeight: '600' },
});
