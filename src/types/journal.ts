export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface JournalEntry {
  id: string;
  text: string;
  sentiment: SentimentLabel;
  summary: string;
  suggestion: string;
  createdAt: string;
}

export interface SentimentAnalysisResult {
  sentiment: SentimentLabel;
  summary: string;
  suggestion: string;
}

