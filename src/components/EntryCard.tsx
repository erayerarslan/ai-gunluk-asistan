import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { JournalEntry } from '../types/journal';
import { getSentimentColor, sentimentEmoji } from '../utils/mood';

interface Props {
  entry: JournalEntry;
}

export function EntryCard({ entry }: Props) {
  const backgroundColor = getSentimentColor(entry.sentiment);
  const emoji = sentimentEmoji[entry.sentiment];

  return (
    <Card style={[styles.card, { backgroundColor }]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{emoji} Günlük Notu</Text>
          <Text style={styles.date}>
            {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            })}
          </Text>
        </View>
        <Text style={styles.text}>{entry.text}</Text>
        <View style={styles.section}>
          <Text variant="labelSmall">Özet</Text>
          <Text>{entry.summary}</Text>
        </View>
        <View style={styles.section}>
          <Text variant="labelSmall">Öneri</Text>
          <Text>{entry.suggestion}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#3F5661',
  },
  text: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 8,
  },
});

