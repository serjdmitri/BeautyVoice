import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Language, RootStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LanguageSelect'>;

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'es', label: 'Spanish', native: 'Español' },
];

export default function LanguageSelectScreen() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<Language>('en');

  function handleContinue() {
    i18n.changeLanguage(selected);
    AsyncStorage.setItem('pendingLanguage', selected);
    navigation.navigate('Register');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Your Language</Text>
      <Text style={styles.subtitle}>You can change this anytime in your profile.</Text>

      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.option, selected === lang.code && styles.optionSelected]}
          onPress={() => setSelected(lang.code)}
        >
          <Text style={[styles.optionText, selected === lang.code && styles.optionTextSelected]}>
            {lang.native}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  option: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#e91e8c',
    backgroundColor: '#fde8f3',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#e91e8c',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#e91e8c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
