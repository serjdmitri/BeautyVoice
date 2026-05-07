import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Image, Alert, TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiFetchTestById, apiSendQuestion } from '../../services/api';
import { Test, RootStackParamList } from '../../types';
import { formatDate } from '../../utils/helpers';

type Route = RouteProp<RootStackParamList, 'TestDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TestDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const token = useSelector((state: RootState) => state.auth.token)!;
  const user = useSelector((state: RootState) => state.auth.user)!;

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [sendingQuestion, setSendingQuestion] = useState(false);

  useEffect(() => {
    apiFetchTestById(route.params.testId, token)
      .then(setTest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.testId]);

  async function handleSendQuestion() {
    if (!question.trim() || !test) return;
    setSendingQuestion(true);
    try {
      await apiSendQuestion({ testId: test.id, question, language: user.language, token });
      setQuestion('');
      Alert.alert('', t('tests.questionSent'));
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setSendingQuestion(false);
    }
  }

  if (loading || !test) {
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

        <Text style={styles.title}>{test.title}</Text>
        <Text style={styles.certificate}>{t('tests.certificate', { value: test.certificateValue })}</Text>
        <Text style={styles.meta}>{t('tests.deadline', { date: formatDate(test.endDate) })}</Text>

        <Text style={styles.sectionTitle}>{t('tests.description')}</Text>
        <Text style={styles.description}>{test.description}</Text>

        {test.images && test.images.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('tests.viewImages')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
              {test.images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.testImage} />
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>{t('tests.questions')}</Text>
        <Text style={styles.questionCount}>{test.questions.length} questions</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('SurveyForm', { testId: test.id })}
        >
          <Text style={styles.startButtonText}>{t('tests.startTest')}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('tests.askQuestion')}</Text>
        <TextInput
          style={styles.questionInput}
          value={question}
          onChangeText={setQuestion}
          placeholder={t('tests.askQuestionPlaceholder')}
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.sendButton, sendingQuestion && styles.sendButtonDisabled]}
          onPress={handleSendQuestion}
          disabled={sendingQuestion}
        >
          {sendingQuestion ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>{t('tests.sendQuestion')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#e91e8c', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  certificate: { fontSize: 16, fontWeight: '700', color: '#e91e8c', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 22 },
  imageRow: { marginVertical: 8 },
  testImage: { width: 200, height: 150, borderRadius: 10, marginRight: 10 },
  questionCount: { fontSize: 14, color: '#666' },
  startButton: {
    backgroundColor: '#e91e8c', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 20,
  },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  questionInput: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#1a1a1a',
    minHeight: 80, textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#333', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 10,
  },
  sendButtonDisabled: { opacity: 0.6 },
  sendButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
