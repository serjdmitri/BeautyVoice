import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store/store';
import { submitTestAnswers } from '../../store/testsSlice';
import { apiFetchTestById } from '../../services/api';
import { Test, Question, RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'SurveyForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SurveyFormScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token)!;
  const { submitting } = useSelector((state: RootState) => state.tests);

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});

  useEffect(() => {
    apiFetchTestById(route.params.testId, token)
      .then(setTest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.testId]);

  function setAnswer(questionId: string, value: string | string[] | number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleMultiChoice(questionId: string, option: string) {
    const current = (answers[questionId] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(questionId, updated);
  }

  function handleNext() {
    if (!test) return;
    const q = test.questions[currentIndex];
    if (q.required && !answers[q.id]) {
      Alert.alert('', 'Please answer this question before continuing.');
      return;
    }
    if (currentIndex < test.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    if (!test) return;
    const result = await dispatch(submitTestAnswers({ testId: test.id, answers, token }));
    if (submitTestAnswers.fulfilled.match(result)) {
      navigation.replace('TestComplete', { certificateValue: test.certificateValue });
    } else {
      Alert.alert('', t('common.error'));
    }
  }

  if (loading || !test) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </SafeAreaView>
    );
  }

  const question: Question = test.questions[currentIndex];
  const isLast = currentIndex === test.questions.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          {t('tests.questionOf', { current: currentIndex + 1, total: test.questions.length })}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${((currentIndex + 1) / test.questions.length) * 100}%` }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.questionText}>{question.text}</Text>
        {question.required && <Text style={styles.required}>* Required</Text>}

        {question.type === 'text' && (
          <TextInput
            style={styles.textInput}
            value={(answers[question.id] as string) ?? ''}
            onChangeText={(v) => setAnswer(question.id, v)}
            multiline
            numberOfLines={4}
            placeholder="Your answer..."
            placeholderTextColor="#aaa"
            textAlignVertical="top"
          />
        )}

        {question.type === 'rating' && (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.ratingButton, answers[question.id] === n && styles.ratingSelected]}
                onPress={() => setAnswer(question.id, n)}
              >
                <Text style={[styles.ratingText, answers[question.id] === n && styles.ratingTextSelected]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'single_choice' && question.options?.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.choiceOption, answers[question.id] === opt.id && styles.choiceSelected]}
            onPress={() => setAnswer(question.id, opt.id)}
          >
            <Text style={[styles.choiceText, answers[question.id] === opt.id && styles.choiceTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {question.type === 'multiple_choice' && question.options?.map((opt) => {
          const selected = ((answers[question.id] as string[]) ?? []).includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.choiceOption, selected && styles.choiceSelected]}
              onPress={() => toggleMultiChoice(question.id, opt.id)}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentIndex(currentIndex - 1)}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.disabled]}
          onPress={handleNext}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>{isLast ? t('tests.submitAnswers') : t('common.next')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  progress: { fontSize: 14, color: '#888', marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#e91e8c', borderRadius: 3 },
  scroll: { padding: 20, paddingBottom: 20 },
  questionText: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', lineHeight: 28, marginBottom: 6 },
  required: { fontSize: 13, color: '#e91e8c', marginBottom: 20 },
  textInput: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1a1a1a', minHeight: 100,
  },
  ratingRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  ratingButton: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center',
  },
  ratingSelected: { backgroundColor: '#e91e8c', borderColor: '#e91e8c' },
  ratingText: { fontSize: 18, fontWeight: '700', color: '#333' },
  ratingTextSelected: { color: '#fff' },
  choiceOption: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    padding: 14, marginBottom: 10,
  },
  choiceSelected: { borderColor: '#e91e8c', backgroundColor: '#fde8f3' },
  choiceText: { fontSize: 15, color: '#333' },
  choiceTextSelected: { color: '#e91e8c', fontWeight: '600' },
  footer: {
    flexDirection: 'row', padding: 20, gap: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  backText: { fontSize: 16, color: '#333', fontWeight: '600' },
  nextButton: {
    flex: 2, backgroundColor: '#e91e8c',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  nextText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
