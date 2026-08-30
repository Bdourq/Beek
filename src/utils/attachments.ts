import { db, auth } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

export interface Attachment {
  id: string;
  dataUrl: string; // base64 string
  timestamp: string;
}

export async function getAttachments(reportId: string): Promise<Attachment[]> {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const attachmentsRef = collection(db, 'users', user.uid, 'reports', reportId, 'attachments');
    const snapshot = await getDocs(attachmentsRef);
    return snapshot.docs.map(doc => doc.data() as Attachment);
  } catch (error) {
    console.error('Error getting attachments from Firestore:', error);
    return [];
  }
}

export async function addAttachment(reportId: string, attachment: Attachment): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const docRef = doc(db, 'users', user.uid, 'reports', reportId, 'attachments', attachment.id);
    await setDoc(docRef, attachment);
  } catch (error) {
    console.error('Error saving attachment to Firestore:', error);
  }
}

export async function removeAttachment(reportId: string, attachmentId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const docRef = doc(db, 'users', user.uid, 'reports', reportId, 'attachments', attachmentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting attachment from Firestore:', error);
  }
}
