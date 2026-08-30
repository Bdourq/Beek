import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DailyReport, EmployeeRecord } from './types';
import { calculateDailySummary } from './utils/calculations';
import { exportDailyReportToExcel } from './utils/excelExport';
import { createSampleDailyReport } from './data/initialData';
import {
  loadSavedReports,
  saveReportLocally,
  deleteReportLocally,
  createNewReport,
  syncReportWithCloud
} from './utils/storage';
import { DiscrepancyBanner } from './components/DiscrepancyBanner';
import { PaperReplicaView } from './components/PaperReplicaView';
import { CashierEntryView } from './components/CashierEntryView';
import { UnifiedReportView } from './components/UnifiedReportView';
import { AttachmentsSection } from './components/AttachmentsSection';
import { EmployeesModal } from './components/EmployeesModal';
import { ShareModal } from './components/ShareModal';
import { HistoryModal } from './components/HistoryModal';
import { AlBaikLogo } from './components/AlBaikLogo';
import {
  FileSpreadsheet,
  Share2,
  Printer,
  History,
  PlusCircle,
  Users,
  LayoutTemplate,
  SlidersHorizontal,
  FileCheck,
  CloudCheck,
  RotateCcw,
  Sparkles,
  Flame
} from 'lucide-react';

export function App() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
  const [viewMode, setViewMode] = useState<'paper' | 'cashier' | 'audit'>('paper');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Modals state
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize data on mount: enforce one report per day restriction
  useEffect(() => {
    const saved = loadSavedReports();
    const todayStr = new Date().toISOString().split('T')[0];
    const existingToday = saved.find(r => r.date === todayStr);

    if (existingToday) {
      setReports(saved);
      setCurrentReport(existingToday);
    } else if (saved.length > 0) {
      setReports(saved);
      setCurrentReport(saved[0]);
    } else {
      const fresh = createNewReport();
      setReports([fresh]);
      setCurrentReport(fresh);
      saveReportLocally(fresh);
    }
  }, []);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update handler for current report with auto-save & status indicator
  const handleUpdateReport = useCallback((updatedFields: Partial<DailyReport>) => {
    setSaveStatus('saving');
    setCurrentReport(prev => {
      if (!prev) return prev;
      const updated: DailyReport = {
        ...prev,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      
      // Update in state list
      setReports((prevList) =>
        prevList.map((r) => (r.id === updated.id ? updated : r))
      );

      // Debounce heavy localStorage writing & trigger auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveReportLocally(updated);
        setSaveStatus('saved');
      }, 300);

      return updated;
    });
  }, []);

  // Switch to a new empty report or open today's existing report (only once per day)
  const handleNewReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existingToday = reports.find(r => r.date === todayStr);
    if (existingToday) {
      setCurrentReport(existingToday);
      alert('يوجد بالفعل تقرير مسجل لتاريخ اليوم. لا يمكن فتح أكثر من صفحة لنفس اليوم، وتم فتح التقرير الحالي للتعديل عليه فقط.');
      return;
    }
    const newRep = createNewReport();
    const updatedList = [newRep, ...reports];
    setReports(updatedList);
    setCurrentReport(newRep);
    saveReportLocally(newRep);
  };

  // Reload yesterday's real closing data from paper sheet
  const handleLoadYesterdayRealClosing = () => {
    const realReport = createSampleDailyReport();
    const updatedList = [realReport, ...reports.filter((r) => r.id !== realReport.id)];
    setReports(updatedList);
    setCurrentReport(realReport);
    saveReportLocally(realReport);
  };

  // Delete report
  const handleDeleteReport = (id: string) => {
    const updatedList = deleteReportLocally(id);
    setReports(updatedList);
    if (currentReport?.id === id) {
      setCurrentReport(updatedList[0] || createNewReport());
    }
  };

  // Close day handler
  const handleCloseDay = () => {
    if (!currentReport) return;
    if (currentReport.status === 'closed') {
      alert('هذا التقرير مغلق مسبقاً.');
      return;
    }
    
    // Check if there are active custody claims
    if (summary.totalCustodyForThem > 0 || summary.totalCustodyOnThem > 0) {
      alert('لا يمكن إغلاق الجرد بوجود عهدات نشطة! يرجى تصفير جدول العُهد أولاً (تأكد أن جميع القيم له/عليه تساوي صفر).');
      return;
    }

    const confirmClose = window.confirm(`هل أنت متأكد من إغلاق جرد تاريخ ${currentReport.date} نهائياً؟ بعد الإغلاق سيتم اعتماد فرق الكاش (نقص/زيادة) ولن يمكن التعديل عليه، والبدء بيوم جديد.`);
    if (!confirmClose) return;

    const closedRep: DailyReport = {
      ...currentReport,
      status: 'closed',
      updatedAt: new Date().toISOString()
    };
    saveReportLocally(closedRep);

    // Create next day report
    const currDateObj = new Date(currentReport.date + 'T00:00:00');
    currDateObj.setDate(currDateObj.getDate() + 1);
    const nextDateStr = currDateObj.toISOString().split('T')[0];

    const existingNext = reports.find(r => r.date === nextDateStr);
    if (existingNext) {
      setCurrentReport(existingNext);
      setReports(reports.map(r => r.id === closedRep.id ? closedRep : r));
    } else {
      const newNextRep = createNewReport(nextDateStr);
      newNextRep.openingCash = currentReport.actualCashInDrawer || 0;
      const updatedList = [newNextRep, ...reports.map(r => r.id === closedRep.id ? closedRep : r)];
      setReports(updatedList);
      setCurrentReport(newNextRep);
      saveReportLocally(newNextRep);
    }
    alert('تم إغلاق جرد اليوم بنجاح وانتقال النظام لتاريخ اليوم التالي.');
  };

  // Cloud Sync
  const handleSyncCloud = async () => {
    if (!currentReport) return;
    setIsSyncing(true);
    try {
      await syncReportWithCloud(currentReport);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // Excel Export
  const handleExcelExport = () => {
    if (!currentReport) return;
    exportDailyReportToExcel(currentReport);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  if (!currentReport) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-bold gap-3">
        <AlBaikLogo size="md" />
        <p className="text-yellow-400 text-sm animate-pulse">جاري تحميل نظام شاورما البيك - يحيى...</p>
      </div>
    );
  }

  const summary = calculateDailySummary(currentReport);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-['IBM_Plex_Sans_Arabic','Cairo',sans-serif] flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Brand Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950 text-white border-b-2 border-yellow-400/70 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Date with Official Logo */}
          <div className="flex items-center gap-3">
            <AlBaikLogo size="xs" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>شاورما البيك</span>
                  <span className="text-yellow-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/30">يحيى AL-Baik</span>
                </h1>
                <span className="text-[10px] font-bold bg-red-600/90 text-white px-2 py-0.5 rounded shadow-2xs">
                  الجرد والمصاريف
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                {currentReport.date} ({currentReport.dayName}) &bull; الكاشير:{' '}
                <span className="font-bold text-yellow-400">
                  {currentReport.cashierName || 'كاشير الشفت'}
                </span>
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('paper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'paper'
                  ? 'bg-red-600 text-white shadow-xs font-black ring-1 ring-yellow-400/60'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-yellow-300" />
              <span>الورقة اليومية الأصلية</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cashier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'cashier'
                  ? 'bg-red-600 text-white shadow-xs font-black ring-1 ring-yellow-400/60'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-300" />
              <span>الإدخال السريع (أقسام)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'audit'
                  ? 'bg-red-600 text-white shadow-xs font-black ring-1 ring-yellow-400/60'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-yellow-300" />
              <span>التدقيق والطباعة</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-save status indicator */}
            <div className="flex items-center text-xs">
              {saveStatus === 'saving' ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-pulse font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  جارٍ الحفظ...
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  تم الحفظ تلقائياً ✓
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleLoadYesterdayRealClosing}
              className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="تحميل إغلاق يوم أمس الفعلي المأخوذ من ورقة المطعم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إغلاق أمس الفعلي</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEmployeesModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white border-2 border-teal-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-teal-900/40 transition-all hover:scale-102 cursor-pointer"
              title="كشف كادر الموظفين والدوام والسلف واليوميات"
            >
              <Users className="w-4 h-4 text-yellow-300" />
              <span>👥 كادر الموظفين (28)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="إرسال عبر واتساب للإدارة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </button>

            <button
              type="button"
              onClick={handleExcelExport}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="تصدير إكسل"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-colors"
              title="طباعة"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-colors"
              title="سجل اليوميات السابقة"
            >
              <History className="w-3.5 h-3.5 text-yellow-400" />
            </button>

            <button
              type="button"
              onClick={handleCloseDay}
              disabled={currentReport.status === 'closed'}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm ${
                currentReport.status === 'closed'
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
              title="إغلاق جرد اليوم نهائياً والبدء بيوم جديد"
            >
              <span>🔒 {currentReport.status === 'closed' ? 'اليوم مغلق' : 'إغلاق اليوم'}</span>
            </button>

            <button
              type="button"
              onClick={handleNewReport}
              className="p-2 bg-red-600 hover:bg-red-500 text-white border border-yellow-400 rounded-xl text-xs font-bold transition-colors shadow-sm"
              title="بدء يومية جديدة"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
        {currentReport.status === 'closed' && (
          <div className="bg-amber-500/10 border-2 border-amber-500 text-amber-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔒</span>
              <div>
                <h4 className="font-black text-sm">هذا التقرير مغلق نهائياً</h4>
                <p className="text-xs text-amber-700">تم إغلاق هذا اليوم ولا يمكن التعديل على بياناته أو قيمه المالية.</p>
              </div>
            </div>
            <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-xl">مغلق ومؤرشف</span>
          </div>
        )}
        {/* Live Discrepancy Banner */}
        <DiscrepancyBanner
          summary={summary}
          onOpenDetails={() => setViewMode('audit')}
        />

        {/* Active View */}
        {viewMode === 'paper' && (
          <PaperReplicaView
            report={currentReport}
            summary={summary}
            onUpdateReport={handleUpdateReport}
            onOpenEmployeesModal={() => setIsEmployeesModalOpen(true)}
          />
        )}

        {viewMode === 'cashier' && (
          <CashierEntryView
            report={currentReport}
            summary={summary}
            onUpdateReport={handleUpdateReport}
          />
        )}

        {viewMode === 'audit' && (
          <UnifiedReportView report={currentReport} summary={summary} />
        )}

        {/* Paper Photos Archive */}
        <AttachmentsSection 
          reportId={currentReport.id} 
          isClosed={currentReport.status === 'closed'}
          onHasAttachmentsChange={(has: boolean) => {
            if (currentReport.hasAttachments !== has) {
              handleUpdateReport({ hasAttachments: has });
            }
          }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 border-t-2 border-yellow-400/40 py-3 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">نظام ملخص الجرد والمصاريف</span>
            <span className="text-yellow-400 font-bold">&bull; مطعم شاورما البيك - يحيى (AL-Baik)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-400">
            <span>مطابقة فورية للكاش</span>
            <span>تصدير Excel متعدد الصفحات</span>
            <span>تكامل WhatsApp للإدارة</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmployeesModal
        isOpen={isEmployeesModalOpen}
        onClose={() => setIsEmployeesModalOpen(false)}
        employees={currentReport.employees}
        onChange={(employees) => handleUpdateReport({ employees })}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        report={currentReport}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedReports={reports}
        currentReportId={currentReport.id}
        onSelectReport={(r) => setCurrentReport(r)}
        onNewReport={handleNewReport}
        onDeleteReport={handleDeleteReport}
      />
    </div>
  );
}

export default App;
