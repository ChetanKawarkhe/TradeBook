import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { JournalEntry, PlaybookRule } from "@/types/journal";
import type { Trade } from "@/types/trade";

const TRADES_KEY = "@tradebook/trades";
const JOURNAL_KEY = "@tradebook/journal";
const PLAYBOOK_KEY = "@tradebook/playbook";

const BACKUP_DIRECTORY =
  `${FileSystem.documentDirectory}tradebook-backup/`;

const BACKUP_FILE =
  `${BACKUP_DIRECTORY}tradebook-backup.json`;

export const BACKUP_VERSION = 1;

export type TradeBookBackup = {
  version: number;
  exportedAt: string;
  trades: Trade[];
  journalEntries: JournalEntry[];
  playbookRules: PlaybookRule[];
};

async function getCurrentBackup(): Promise<TradeBookBackup> {
  const [tradesData, journalData, playbookData] =
    await Promise.all([
      AsyncStorage.getItem(TRADES_KEY),
      AsyncStorage.getItem(JOURNAL_KEY),
      AsyncStorage.getItem(PLAYBOOK_KEY),
    ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    trades: tradesData ? JSON.parse(tradesData) : [],
    journalEntries: journalData
      ? JSON.parse(journalData)
      : [],
    playbookRules: playbookData
      ? JSON.parse(playbookData)
      : [],
  };
}

export async function createAutomaticBackup(): Promise<void> {
  try {
    const directoryInfo =
      await FileSystem.getInfoAsync(BACKUP_DIRECTORY);

    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        BACKUP_DIRECTORY,
        {
          intermediates: true,
        },
      );
    }

    const backup = await getCurrentBackup();

    await FileSystem.writeAsStringAsync(
      BACKUP_FILE,
      JSON.stringify(backup, null, 2),
    );
  } catch (error) {
    console.error(
      "Failed to create automatic backup:",
      error,
    );

    throw error;
  }
}

export async function restoreAutomaticBackup(): Promise<TradeBookBackup> {
  try {
    const fileInfo =
      await FileSystem.getInfoAsync(BACKUP_FILE);

    if (!fileInfo.exists) {
      throw new Error("No TradeBook backup was found.");
    }

    const backupText =
      await FileSystem.readAsStringAsync(
        BACKUP_FILE,
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
      throw new Error(
        "Invalid TradeBook backup.",
      );
    }

    if (backup.version > BACKUP_VERSION) {
      throw new Error(
        "This backup was created by a newer version of TradeBook.",
      );
    }

    return backup;
  } catch (error) {
    console.error(
      "Failed to restore automatic backup:",
      error,
    );

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
      JSON.stringify(
        backup.journalEntries,
      ),
    ),
    AsyncStorage.setItem(
      PLAYBOOK_KEY,
      JSON.stringify(
        backup.playbookRules,
      ),
    ),
  ]);
}