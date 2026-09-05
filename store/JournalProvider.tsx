import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { JournalEntry, PlaybookRule } from "@/types/journal";

const JOURNAL_KEY = "@tradebook/journal";
const PLAYBOOK_KEY = "@tradebook/playbook";

type JournalContextType = {
  entries: JournalEntry[];
  rules: PlaybookRule[];
  loading: boolean;

  addEntry: (entry: JournalEntry) => Promise<void>;
  updateEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  addRule: (rule: PlaybookRule) => Promise<void>;
  updateRule: (rule: PlaybookRule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
};

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [rules, setRules] = useState<PlaybookRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [journalData, playbookData] = await Promise.all([
        AsyncStorage.getItem(JOURNAL_KEY),
        AsyncStorage.getItem(PLAYBOOK_KEY),
      ]);

      if (journalData) {
  const loadedEntries: JournalEntry[] =
    JSON.parse(journalData);

  const seen = new Set<string>();

  const cleanedEntries = loadedEntries.filter((entry) => {
    if (seen.has(entry.id)) {
      return false;
    }

    seen.add(entry.id);
    return true;
  });

  setEntries(cleanedEntries);

  await AsyncStorage.setItem(
    JOURNAL_KEY,
    JSON.stringify(cleanedEntries)
  );
}

      if (playbookData) {
        setRules(JSON.parse(playbookData));
      }
    } catch (error) {
      console.error("Failed to load journal data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addEntry(entry: JournalEntry) {
    setEntries((currentEntries) => {
      const updated = [entry, ...currentEntries];

      AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated)).catch(
        (error) => {
          console.error("Failed to save journal entry:", error);
        },
      );

      return updated;
    });
  }

  async function updateEntry(entry: JournalEntry) {
    setEntries((currentEntries) => {
      const updated = currentEntries.map((item) =>
        item.id === entry.id ? entry : item,
      );

      AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated)).catch(
        (error) => {
          console.error("Failed to update journal entry:", error);
        },
      );

      return updated;
    });
  }

  async function deleteEntry(id: string) {
    const updated = entries.filter((entry) => entry.id !== id);

    setEntries(updated);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
  }

  async function addRule(rule: PlaybookRule) {
    const updated = [rule, ...rules];

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));
  }

  async function updateRule(rule: PlaybookRule) {
    const updated = rules.map((item) => (item.id === rule.id ? rule : item));

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));
  }

  async function deleteRule(id: string) {
    const updated = rules.filter((rule) => rule.id !== id);

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));
  }
  async function removeDuplicateEntries() {
  setEntries((currentEntries) => {
    const seen = new Set<string>();

    const cleaned = currentEntries.filter((entry) => {
      if (seen.has(entry.id)) {
        return false;
      }

      seen.add(entry.id);
      return true;
    });

    AsyncStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify(cleaned)
    ).catch((error) => {
      console.error(
        "Failed to clean journal entries:",
        error
      );
    });

    return cleaned;
  });
}

  return (
    <JournalContext.Provider
      value={{
        entries,
        rules,
        loading,
        addEntry,
        updateEntry,
        deleteEntry,
        addRule,
        updateRule,
        deleteRule,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);

  if (!context) {
    throw new Error("useJournal must be used inside JournalProvider");
  }

  return context;
}
