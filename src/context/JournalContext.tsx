import React, { createContext, useContext, useEffect, useState } from 'react';

import { analyzeWithAI } from '../services/huggingFace';
import { loadEntries, saveEntries } from '../storage/journalStorage';
import { JournalEntry, SentimentAnalysisResult } from '../types/journal';

interface JournalContextValue {
  entries: JournalEntry[];
  isLoading: boolean;
  isProcessingEntry: boolean;
  lastResult?: SentimentAnalysisResult;
  error?: string;
  analyzeEntry: (text: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const JournalContext = createContext<JournalContextValue | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingEntry, setIsProcessingEntry] = useState(false);
  const [lastResult, setLastResult] = useState<SentimentAnalysisResult>();
  const [error, setError] = useState<string>();

  const refreshEntries = async () => {
    setIsLoading(true);
    try {
      const stored = await loadEntries();
      setEntries(stored);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEntries();
  }, []);

  const analyzeEntry = async (text: string) => {
    setIsProcessingEntry(true);
    setError(undefined);
    try {
      const result = await analyzeWithAI(text);
      const newEntry: JournalEntry = {
        id: `${Date.now()}`,
        text,
        sentiment: result.sentiment,
        summary: result.summary,
        suggestion: result.suggestion,
        createdAt: new Date().toISOString(),
      };

      setEntries(prevEntries => {
        const updatedEntries = [newEntry, ...prevEntries];
        saveEntries(updatedEntries).catch(console.warn);
        return updatedEntries;
      });

      setLastResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analiz sırasında beklenmedik bir hata oluştu.',
      );
    } finally {
      setIsProcessingEntry(false);
    }
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        isLoading,
        isProcessingEntry,
        lastResult,
        error,
        analyzeEntry,
        refreshEntries,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal sadece JournalProvider içinde kullanılabilir.');
  }
  return context;
}
