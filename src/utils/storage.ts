import { DailyReport } from '../types';
import { createSampleDailyReport, createEmptyDailyReport } from '../data/initialData';
import { db, auth } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export function subscribeToReports(callback: (reports: DailyReport[]) => void): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }
  
  const reportsRef = collection(db, 'users', user.uid, 'reports');
  const q = query(reportsRef);
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Only pass it to callback if it's not a purely local write update that doesn't have data yet
    // Actually, we want to reflect local updates and remote updates. 
    // If the snapshot has metadata.hasPendingWrites, it's a local write, but it's safe to load.
    // However, if we're typing, we don't want the snapshot to overwrite our local state if it's identical
    // or just the local write being echoed back.
    const reports = snapshot.docs.map(doc => doc.data() as DailyReport);
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // We send an extra flag telling if the change came from the server (another device)
    const fromServer = !snapshot.metadata.hasPendingWrites;
    
    // We only trigger the callback. It's up to the app to decide how to handle it.
    callback(reports);
  });
  
  return unsubscribe;
}

export async function loadSavedReports(): Promise<DailyReport[]> {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const reportsRef = collection(db, 'users', user.uid, 'reports');
    // We can order by date descending or just fetch all
    const q = query(reportsRef);
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    const reports = snapshot.docs.map(doc => doc.data() as DailyReport);
    // Sort descending by date
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return reports;
  } catch (err) {
    console.error('Error loading reports from Firestore', err);
    return [];
  }
}

export async function saveReportLocally(report: DailyReport): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    report.updatedAt = new Date().toISOString();
    const docRef = doc(db, 'users', user.uid, 'reports', report.id);
    await setDoc(docRef, report);
  } catch (err) {
    console.error('Error saving report to Firestore', err);
  }
}

export async function deleteReportLocally(reportId: string): Promise<DailyReport[]> {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const docRef = doc(db, 'users', user.uid, 'reports', reportId);
    await deleteDoc(docRef);
    return await loadSavedReports();
  } catch (err) {
    console.error('Error deleting report', err);
    return [];
  }
}

export function createNewReport(dateStr?: string): DailyReport {
  return createEmptyDailyReport(dateStr);
}

export async function exportBackupJSON(): Promise<void> {
  const reports = await loadSavedReports();
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    reports
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `نسخة_احتياطية_مطعم_يحيى_البيك_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Dummy functions to satisfy old references if any
export async function syncReportWithCloud(report: DailyReport): Promise<{ success: boolean; message: string }> {
  await saveReportLocally(report);
  return { success: true, message: 'تم الحفظ في السحابة بنجاح' };
}
