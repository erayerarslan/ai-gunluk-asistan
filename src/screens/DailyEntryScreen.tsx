import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';

import { EntryCard } from '../components/EntryCard';
import { useJournal } from '../context/JournalContext';

export function DailyEntryScreen() {
  const { analyzeEntry, isProcessingEntry, lastResult, entries, error } =
    useJournal();
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);

  const handleAnalyze = async () => {
    setTouched(true);
    if (!text.trim()) {
      return;
    }
    await analyzeEntry(text);
    setText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Surface style={styles.surface} elevation={2}>
            <Text variant="headlineSmall" style={styles.title}>
              AI Günlük Asistanım
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Bugünkü duygu ve düşünceni tek cümleyle yaz, ücretsiz AI analiz etsin.
            </Text>
            <TextInput
              multiline
              mode="outlined"
              placeholder="Örn: Bugün motive hissediyorum ama biraz yorgunum."
              value={text}
              onChangeText={setText}
              style={styles.input}
            />
            {touched && !text.trim() && (
              <HelperText type="error">Lütfen bir metin gir.</HelperText>
            )}
            {!!error && <HelperText type="error">{error}</HelperText>}
            <Button
              mode="contained"
              onPress={handleAnalyze}
              loading={isProcessingEntry}
              disabled={isProcessingEntry}
            >
              Analiz Et
            </Button>
          </Surface>
          {lastResult && entries.length > 0 ? (
            <View style={styles.resultSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Son Analiz
              </Text>
              <EntryCard entry={entries[0]} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  surface: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
    minHeight: 120,
  },
  resultSection: {
    paddingBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
});

