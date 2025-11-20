import AsyncStorage from '@react-native-async-storage/async-storage';

import { JournalEntry } from '../types/journal';

const STORAGE_KEY = '@ai_journal_entries';

export async function loadEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as JournalEntry[];
    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.warn('Kayıtlar yüklenirken hata oluştu', error);
    return [];
  }
}

export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Kayıtlar kaydedilirken hata oluştu', error);
    throw error;
  }
}

