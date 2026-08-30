import { get, set, del } from 'idb-keyval';

export interface Attachment {
  id: string;
  dataUrl: string; // base64 string
  timestamp: string;
}

const getStoreKey = (reportId: string) => `report-attachments-${reportId}`;

export async function getAttachments(reportId: string): Promise<Attachment[]> {
  try {
    const data = await get<Attachment[]>(getStoreKey(reportId));
    return data || [];
  } catch (error) {
    console.error('Error getting attachments from IndexedDB:', error);
    return [];
  }
}

export async function saveAttachments(reportId: string, attachments: Attachment[]): Promise<void> {
  try {
    await set(getStoreKey(reportId), attachments);
  } catch (error) {
    console.error('Error saving attachments to IndexedDB:', error);
  }
}

export async function addAttachment(reportId: string, attachment: Attachment): Promise<void> {
  const existing = await getAttachments(reportId);
  await saveAttachments(reportId, [...existing, attachment]);
}

export async function removeAttachment(reportId: string, attachmentId: string): Promise<void> {
  const existing = await getAttachments(reportId);
  const updated = existing.filter(a => a.id !== attachmentId);
  await saveAttachments(reportId, updated);
}
