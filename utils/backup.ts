  import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { JournalEntry, PlaybookRule } from "@/types/journal";
import type { Trade } from "@/types/trade";

const TRADES_KEY = "@tradebook/trades";
const JOURNAL_KEY = "@tradebook/journal";
const PLAYBOOK_KEY = "@tradebook/playbook";

export const BACKUP_VERSION = 1;

export type TradeBookBackup = {
  version: number;
  exportedAt: string;
  trades: Trade[];
  journalEntries: JournalEntry[];
  playbookRules: PlaybookRule[];
};

export async function createTradeBookBackup(
  directoryUri: string,
): Promise<string | null> {
  try {
    const [tradesData, journalData, playbookData] =
      await Promise.all([
        AsyncStorage.getItem(TRADES_KEY),
        AsyncStorage.getItem(JOURNAL_KEY),
        AsyncStorage.getItem(PLAYBOOK_KEY),
      ]);

    const backup: TradeBookBackup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      trades: tradesData ? JSON.parse(tradesData) : [],
      journalEntries: journalData ? JSON.parse(journalData) : [],
      playbookRules: playbookData ? JSON.parse(playbookData) : [],
    };

    const fileName = `TradeBook_Backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const fileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "application/json",
      );

    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(backup, null, 2),
    );

    return fileName;
  } catch (error) {
    console.error("Failed to create TradeBook backup:", error);
    throw error;
  }
}

export async function restoreTradeBookBackup(
  backupFileUri: string,
): Promise<TradeBookBackup> {
  try {
    const backupText = await FileSystem.readAsStringAsync(
      backupFileUri,
    );

    const backup: TradeBookBackup =
      JSON.parse(backupText);

    if (
      !backup ||
      typeof backup !== "object" ||
      typeof backup.version !== "number" ||
      !Array.isArray(backup.trades) ||
      !Array.isArray(backup.journalEntries) ||
      !Array.isArray(backup.playbookRules)
    ) {
      throw new Error("Invalid TradeBook backup file.");
    }

    if (backup.version > BACKUP_VERSION) {
      throw new Error(
        "This backup was created by a newer version of TradeBook.",
      );
    }

    return backup;
  } catch (error) {
    console.error("Failed to read TradeBook backup:", error);
    throw error;
  }
}

export async function saveRestoredTradeBookBackup(
  backup: TradeBookBackup,
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(
      TRADES_KEY,
      JSON.stringify(backup.trades),
    ),
    AsyncStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify(backup.journalEntries),
    ),
    AsyncStorage.setItem(
      PLAYBOOK_KEY,
      JSON.stringify(backup.playbookRules),
    ),
  ]);
}