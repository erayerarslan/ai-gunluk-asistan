import { SentimentLabel } from '../types/journal';

export const sentimentColors: Record<SentimentLabel, string> = {
  positive: '#FFE066',
  neutral: '#F0F4F8',
  negative: '#D9E4EC',
};

export const sentimentEmoji: Record<SentimentLabel, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😔',
};

export function getSentimentColor(sentiment: SentimentLabel): string {
  return sentimentColors[sentiment] ?? sentimentColors.neutral;
}

