import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { apiAdminCreateTest } from '../../services/api';
import { TestType, QuestionType, Question } from '../../types';

const TEST_TYPES: TestType[] = ['home', 'offline', 'online'];
const QUESTION_TYPES: QuestionType[] = ['text', 'rating', 'single_choice', 'multiple_choice'];

export default function CreateTestScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token)!;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TestType>('home');
  const [certificateValue, setCertificateValue] = useState('');
  const [slots, setSlots] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    const newQ: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      required: true,
    };
    setQuestions([...questions, newQ]);
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function addOption(questionId: string) {
    setQuestions(questions.map((q) => {
      if (q.id !== questionId) return q;
      const options = q.options ?? [];
      return {
        ...q,
        options: [...options, { id: Date.now().toString(), label: '' }],
      };
    }));
  }

  function updateOption(questionId: string, optionId: string, label: string) {
    setQuestions(questions.map((q) => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        options: (q.options ?? []).map((o) => (o.id === optionId ? { ...o, label } : o)),
      };
    }));
  }

  async function handleSave() {
    if (!title.trim() || !description.trim() || !certificateValue || !endDate) {
      Alert.alert('', 'Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      await apiAdminCreateTest(
        {
          title,
          description,
          type,
          certificateValue: Number(certificateValue),
          slots: slots ? Number(slots) : undefined,
          endDate,
          startDate: new Date().toISOString(),
          questions,
        },
        token
      );
      Alert.alert('', 'Test created successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{t('admin.createTest')}</Text>

        <Text style={styles.label}>{t('admin.testTitle')} *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Summer Moisturizer Test" placeholderTextColor="#aaa" />

        <Text style={styles.label}>{t('admin.testDescription')} *</Text>
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Describe the test..." placeholderTextColor="#aaa" textAlignVertical="top" />

        <Text style={styles.label}>{t('admin.testType')}</Text>
        <View style={styles.typeRow}>
          {TEST_TYPES.map((tt) => (
            <TouchableOpacity
              key={tt}
              style={[styles.typeButton, type === tt && styles.typeButtonSelected]}
              onPress={() => setType(tt)}
            >
              <Text style={[styles.typeText, type === tt && styles.typeTextSelected]}>{tt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('admin.certificateValue')} *</Text>
        <TextInput style={styles.input} value={certificateValue} onChangeText={setCertificateValue} keyboardType="numeric" placeholder="50" placeholderTextColor="#aaa" />

        <Text style={styles.label}>{t('admin.slots')} (optional)</Text>
        <TextInput style={styles.input} value={slots} onChangeText={setSlots} keyboardType="numeric" placeholder="Leave blank for unlimited" placeholderTextColor="#aaa" />

        <Text style={styles.label}>{t('admin.endDate')} * (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2025-12-31" placeholderTextColor="#aaa" />

        <Text style={styles.label}>{t('admin.questionText')}</Text>
        {questions.map((q, i) => (
          <View key={q.id} style={styles.questionBlock}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNum}>Q{i + 1}</Text>
              <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={q.text}
              onChangeText={(v) => updateQuestion(q.id, { text: v })}
              placeholder="Question text..."
              placeholderTextColor="#aaa"
            />

            <View style={styles.typeRow}>
              {QUESTION_TYPES.map((qt) => (
                <TouchableOpacity
                  key={qt}
                  style={[styles.typeButton, q.type === qt && styles.typeButtonSelected]}
                  onPress={() => updateQuestion(q.id, { type: qt })}
                >
                  <Text style={[styles.typeText, q.type === qt && styles.typeTextSelected]}>{qt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
              <View>
                {(q.options ?? []).map((opt) => (
                  <TextInput
                    key={opt.id}
                    style={[styles.input, styles.optionInput]}
                    value={opt.label}
                    onChangeText={(v) => updateOption(q.id, opt.id, v)}
                    placeholder={`Option...`}
                    placeholderTextColor="#aaa"
                  />
                ))}
                <TouchableOpacity onPress={() => addOption(q.id)}>
                  <Text style={styles.addOptionText}>+ Add Option</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addQuestion} onPress={addQuestion}>
          <Text style={styles.addQuestionText}>+ {t('admin.addQuestion')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('admin.saveTest')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 60 },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#e91e8c', fontWeight: '600' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  typeButton: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  typeButtonSelected: { borderColor: '#e91e8c', backgroundColor: '#fde8f3' },
  typeText: { fontSize: 13, color: '#555' },
  typeTextSelected: { color: '#e91e8c', fontWeight: '700' },
  questionBlock: { backgroundColor: '#fafafa', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  questionNum: { fontSize: 14, fontWeight: '700', color: '#888' },
  removeText: { fontSize: 13, color: '#e91e8c' },
  optionInput: { marginTop: 6 },
  addOptionText: { fontSize: 13, color: '#e91e8c', fontWeight: '600', marginTop: 8 },
  addQuestion: { borderWidth: 1.5, borderColor: '#e91e8c', borderStyle: 'dashed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  addQuestionText: { color: '#e91e8c', fontWeight: '700', fontSize: 15 },
  saveButton: { backgroundColor: '#e91e8c', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
