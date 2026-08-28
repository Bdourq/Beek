import { DailyReport } from '../types';
import { createSampleDailyReport, createEmptyDailyReport } from '../data/initialData';

const STORAGE_KEY_CURRENT = 'yahya_albaik_current_report';
const STORAGE_KEY_REPORTS_LIST = 'yahya_albaik_all_reports';

export function loadCurrentReport(): DailyReport {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.date) return parsed;
    }
  } catch (err) {
    console.error('Error loading current report from localStorage', err);
  }
  // If no current report, load the sample report from paper sheet as starting template
  return createSampleDailyReport();
}

export function saveCurrentReport(report: DailyReport): void {
  try {
    report.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(report));
    
    // Also save into the archived list
    saveReportToArchive(report);
  } catch (err) {
    console.error('Error saving current report', err);
  }
}

export function getAllSavedReports(): DailyReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REPORTS_LIST);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error loading archive', err);
  }
  const sample = createSampleDailyReport();
  return [sample];
}

export function saveReportToArchive(report: DailyReport): void {
  try {
    const all = getAllSavedReports();
    const existingIndex = all.findIndex(r => r.id === report.id || r.date === report.date);
    if (existingIndex >= 0) {
      all[existingIndex] = report;
    } else {
      all.unshift(report);
    }
    localStorage.setItem(STORAGE_KEY_REPORTS_LIST, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving to archive', err);
  }
}

export function deleteReportFromArchive(reportId: string): DailyReport[] {
  try {
    const all = getAllSavedReports().filter(r => r.id !== reportId);
    localStorage.setItem(STORAGE_KEY_REPORTS_LIST, JSON.stringify(all));
    return all;
  } catch (err) {
    console.error('Error deleting report', err);
    return [];
  }
}

export function exportBackupJSON(): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    reports: getAllSavedReports()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `نسخة_احتياطية_مطعم_يحيى_البيك_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function createNewReport(): DailyReport {
  return createEmptyDailyReport();
}

export const loadSavedReports = getAllSavedReports;
export const saveReportLocally = saveCurrentReport;
export const deleteReportLocally = deleteReportFromArchive;

export async function syncReportWithCloud(report: DailyReport): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/reports/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (res.ok) {
      return { success: true, message: 'تم المزامنة بنجاح' };
    }
  } catch (e) {
    console.log('Local fallback active, sync offline', e);
  }
  return { success: true, message: 'تم الحفظ محلياً' };
}
