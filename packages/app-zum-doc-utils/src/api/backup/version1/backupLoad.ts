import { backupFileV1Parse } from './backup-file'
import { parseBackupDataV1, type BackupData } from './backup-data'
import { decryptBackupFileV1 } from './decryption'

export async function loadBackupV1(text: string, password: string): Promise<BackupData> {
  let file
  try {
    file = backupFileV1Parse(text)
  } catch {
    throw new Error('BackupLoadV1: File is not a valid azd-backup.')
  }
  let decrypted: string
  try {
    decrypted = await decryptBackupFileV1(file, password)
  } catch {
    throw new Error('BackupLoadV1: Backup content could not be decrypted.')
  }
  try {
    return parseBackupDataV1(decrypted)
  } catch {
    throw new Error('BackupLoadV1: Decrypted backup content could not been parsed to backup data.')
  }
}
