import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

import { EntryCard } from '../components/EntryCard';
import { WeeklySummary } from '../components/WeeklySummary';
import { useJournal } from '../context/JournalContext';

export function HistoryScreen() {
  const { entries, isLoading, refreshEntries } = useJournal();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshEntries} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Geçmiş
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              İnternet olmasa bile tüm analizlerin burada.
            </Text>
            <WeeklySummary entries={entries} />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              Henüz kayıt yok. Günlük ekranından ilk notunu ekle.
            </Text>
          ) : null
        }
        renderItem={({ item }) => <EntryCard entry={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 48,
    color: '#4B5C6B',
  },
});

