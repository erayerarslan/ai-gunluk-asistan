import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { JournalEntry, SentimentLabel } from '../types/journal';

interface Props {
  entries: JournalEntry[];
}

export function WeeklySummary({ entries }: Props) {
  const summary = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recent = entries.filter(
      entry => new Date(entry.createdAt) >= sevenDaysAgo,
    );

    const counts: Record<SentimentLabel, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    recent.forEach(entry => {
      counts[entry.sentiment] += 1;
    });

    return {
      total: recent.length,
      counts,
    };
  }, [entries]);

  return (
    <Card style={styles.card}>
      <Card.Title title="Haftalık Özet" subtitle="Son 7 gün" />
      <Card.Content>
        {summary.total === 0 ? (
          <Text variant="bodyMedium">
            Henüz bu hafta için kayıt bulunmuyor. Bugünün duygusunu kaydet!
          </Text>
        ) : (
          <View style={styles.countRow}>
            <SummaryPill label="Pozitif" value={summary.counts.positive} />
            <SummaryPill label="Nötr" value={summary.counts.neutral} />
            <SummaryPill label="Negatif" value={summary.counts.negative} />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.pill}>
      <Text variant="labelSmall">{label}</Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F3F6F9',
  },
});

