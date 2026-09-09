import AsyncStorage from "@react-native-async-storage/async-storage";

import type { TradeBookBackup } from "@/utils/backup";
import { getGoogleAccessToken } from "@/utils/googleAuth";

const DRIVE_FILE_ID_KEY =
  "@tradebook/google-drive-backup-file-id";

const DRIVE_API =
  "https://www.googleapis.com/drive/v3";

const DRIVE_UPLOAD_API =
  "https://www.googleapis.com/upload/drive/v3";

const BACKUP_FILE_NAME =
  "TradeBook_Backup.json";

async function getStoredDriveFileId(): Promise<string | null> {
  return AsyncStorage.getItem(DRIVE_FILE_ID_KEY);
}

async function saveDriveFileId(fileId: string): Promise<void> {
  await AsyncStorage.setItem(
    DRIVE_FILE_ID_KEY,
    fileId,
  );
}

async function findExistingBackupFile(
  accessToken: string,
): Promise<string | null> {
  const query =
    "name = 'TradeBook_Backup.json' and trashed = false";

  const response = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(
      query,
    )}&fields=files(id,name,modifiedTime)&pageSize=10`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Drive search failed: ${response.status} ${errorText}`,
    );
  }

  const result = await response.json();

  return result.files?.[0]?.id ?? null;
}

async function createDriveBackupFile(
  accessToken: string,
  backup: TradeBookBackup,
): Promise<string> {
  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: "application/json",
  };

  const boundary =
    "tradebook_backup_boundary";

  const body =
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    "Content-Type: application/json\r\n\r\n" +
    `${JSON.stringify(backup)}\r\n` +
    `--${boundary}--`;

  const response = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type":
          `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Drive upload failed: ${response.status} ${errorText}`,
    );
  }

  const result = await response.json();

  if (!result.id) {
    throw new Error(
      "Google Drive did not return a backup file ID.",
    );
  }

  return result.id;
}

async function updateDriveBackupFile(
  accessToken: string,
  fileId: string,
  backup: TradeBookBackup,
): Promise<void> {
  const response = await fetch(
    `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(
      fileId,
    )}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backup),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Drive update failed: ${response.status} ${errorText}`,
    );
  }
}

export async function backupToGoogleDrive(): Promise<void> {
  const { restoreAutomaticBackup } =
    await import("@/utils/backup");

  const backup =
    await restoreAutomaticBackup();

  const accessToken =
    await getGoogleAccessToken();

  let fileId =
    await getStoredDriveFileId();

  if (fileId) {
    try {
      await updateDriveBackupFile(
        accessToken,
        fileId,
        backup,
      );

      return;
    } catch (error) {
      console.warn(
        "Stored Google Drive backup file could not be updated. Searching for the backup file.",
        error,
      );

      fileId = null;
    }
  }

  fileId =
    await findExistingBackupFile(
      accessToken,
    );

  if (fileId) {
    await updateDriveBackupFile(
      accessToken,
      fileId,
      backup,
    );

    await saveDriveFileId(fileId);

    return;
  }

  const newFileId =
    await createDriveBackupFile(
      accessToken,
      backup,
    );

  await saveDriveFileId(newFileId);
}

export async function findGoogleDriveBackup(): Promise<{
  fileId: string;
  modifiedTime?: string;
} | null> {
  const accessToken =
    await getGoogleAccessToken();

  const fileId =
    await getStoredDriveFileId();

  if (fileId) {
    const response = await fetch(
      `${DRIVE_API}/files/${encodeURIComponent(
        fileId,
      )}?fields=id,name,modifiedTime,trashed`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.ok) {
      const result = await response.json();

      if (
        result.id &&
        result.name === BACKUP_FILE_NAME &&
        !result.trashed
      ) {
        return {
          fileId: result.id,
          modifiedTime: result.modifiedTime,
        };
      }
    }
  }

  const discoveredFileId =
    await findExistingBackupFile(
      accessToken,
    );

  if (!discoveredFileId) {
    return null;
  }

  await saveDriveFileId(
    discoveredFileId,
  );

  return {
    fileId: discoveredFileId,
  };
}

export async function downloadGoogleDriveBackup(
  fileId: string,
): Promise<TradeBookBackup> {
  const accessToken =
    await getGoogleAccessToken();

  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(
      fileId,
    )}?alt=media`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Drive download failed: ${response.status} ${errorText}`,
    );
  }

  const backup =
    (await response.json()) as TradeBookBackup;

  if (
    !backup ||
    typeof backup !== "object" ||
    typeof backup.version !== "number" ||
    !Array.isArray(backup.trades) ||
    !Array.isArray(backup.journalEntries) ||
    !Array.isArray(backup.playbookRules)
  ) {
    throw new Error(
      "Invalid TradeBook backup from Google Drive.",
    );
  }

  return backup;
}