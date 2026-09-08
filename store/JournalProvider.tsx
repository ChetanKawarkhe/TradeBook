import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { JournalEntry, PlaybookRule } from "@/types/journal";
import { createAutomaticBackup } from "@/utils/backup";

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

  replaceEntries: (entries: JournalEntry[]) => Promise<void>;
  replaceRules: (rules: PlaybookRule[]) => Promise<void>;
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
        const loadedEntries: JournalEntry[] = JSON.parse(journalData);

        const seen = new Set<string>();

        const cleanedEntries = loadedEntries.filter((entry) => {
          if (seen.has(entry.id)) {
            return false;
          }

          seen.add(entry.id);
          return true;
        });

        setEntries(cleanedEntries);

        await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(cleanedEntries));
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
    const updated = [entry, ...entries];

    setEntries(updated);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic journal backup failed:", error);
    }
  }

  async function updateEntry(entry: JournalEntry) {
    const updated = entries.map((item) =>
      item.id === entry.id ? entry : item,
    );

    setEntries(updated);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic journal backup failed:", error);
    }
  }

  async function deleteEntry(id: string) {
    const updated = entries.filter((entry) => entry.id !== id);

    setEntries(updated);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic journal backup failed:", error);
    }
  }

  async function addRule(rule: PlaybookRule) {
    const updated = [rule, ...rules];

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic playbook backup failed:", error);
    }
  }

  async function updateRule(rule: PlaybookRule) {
    const updated = rules.map((item) => (item.id === rule.id ? rule : item));

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic playbook backup failed:", error);
    }
  }

  async function deleteRule(id: string) {
    const updated = rules.filter((rule) => rule.id !== id);

    setRules(updated);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(updated));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic playbook backup failed:", error);
    }
  }

  async function replaceEntries(restoredEntries: JournalEntry[]) {
    setEntries(restoredEntries);

    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(restoredEntries));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic journal backup failed:", error);
    }
  }

  async function replaceRules(restoredRules: PlaybookRule[]) {
    setRules(restoredRules);

    await AsyncStorage.setItem(PLAYBOOK_KEY, JSON.stringify(restoredRules));

    try {
      await createAutomaticBackup();
    } catch (error) {
      console.error("Automatic playbook backup failed:", error);
    }
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
        replaceEntries,
        replaceRules,
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
