import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Users,
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowUpRight,
  Check,
  Clock,
  Eye,
  Layers,
  Coins,
  Calculator,
  Save,
  Sparkles,
  Zap,
  CheckCheck
} from 'lucide-react';
import { AlBaikLogo } from './AlBaikLogo';
import { CashCounterModal } from './CashCounterModal';
import { QuickCalculator } from './QuickCalculator';
import { calculateShiftHours, computeHourlyWage } from './EmployeesSection';

interface PaperReplicaViewProps {
  report: DailyReport;
  summary: SummaryCalculations;
  onUpdateReport: (updated: Partial<DailyReport>) => void;
  onOpenEmployeesModal: () => void;
}

// Common fast purchase item presets for quick insertion
const COMMON_PURCHASE_PRESETS = [
  { name: 'زعيتر', amount: 0 },
  { name: 'شعبان', amount: 0 },
  { name: 'أبو المجد', amount: 0 },
  { name: 'فحم', amount: 0 },
  { name: 'خبز الشهم', amount: 0 },
  { name: 'علام', amount: 0 },
  { name: 'ابو خليل', amount: 0 },
  { name: 'خبز بروستد', amount: 0 },
  { name: 'صينية', amount: 0 },
  { name: 'الرفاعي', amount: 0 },
  { name: 'نوافلة', amount: 0 },
  { name: 'عهدة أبو الوفا', amount: 0 },
  { name: 'خضار', amount: 0 },
  { name: 'رفاكو', amount: 0 },
  { name: 'كهرباء الزعبي', amount: 0 },
  { name: 'عهدة محمد', amount: 0 },
  { name: 'عهدة سيف', amount: 0 }
];

export const PaperReplicaView: React.FC<PaperReplicaViewProps> = ({
  report,
  summary,
  onUpdateReport,
  onOpenEmployeesModal
}) => {
  const [paperFace, setPaperFace] = useState<'face1' | 'face2' | 'both'>('face1');
  const [isCashCounterOpen, setIsCashCounterOpen] = useState(false);
  const [isQuickCalcOpen, setIsQuickCalcOpen] = useState(false);

  // Auto-Save indicator status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('الآن');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update wrapper
  const triggerDebouncedUpdate = useCallback(
    (updates: Partial<DailyReport>) => {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

       
        onUpdateReport(updates);
        setSaveStatus('saved');
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(
          now.getSeconds()
        ).padStart(2, '0')}`;
        setLastSavedTime(timeStr);
       
    },
    [onUpdateReport]
  );

  // Helper to update specific sub-lists
  const updateListField = (
    listName: keyof DailyReport,
    id: string,
    field: string,
    value: any
  ) => {
    const list = ((report[listName] as any[]) || []).map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    triggerDebouncedUpdate({ [listName]: list });
  };

  const addListItem = (listName: keyof DailyReport, defaultName = '', defaultAmount = 0) => {
    const list = (report[listName] as any[]) || [];
    const newItem = {
      id: `${String(listName)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: defaultName,
      vendorName: defaultName,
      amount: defaultAmount
    };
    onUpdateReport({ [listName]: [...list, newItem] });
  };

  const deleteListItem = (listName: keyof DailyReport, id: string) => {
    const list = (report[listName] as any[]) || [];
    onUpdateReport({ [listName]: list.filter((i) => i.id !== id) });
  };

  // Direct fast edit for any expense/purchases category total from the summary box
  const handleDirectCategoryTotalChange = (
    field:
      | 'purchases'
      | 'employees'
      | 'vendorDebtsPaid'
      | 'otherExpenses'
      | 'apartmentExpenses'
      | 'adminExpenses'
      | 'walletExpenses'
      | 'yahyaAccount'
      | 'abuAbdullahAccount'
      | 'maintenance'
      | 'spices',
    newTotal: number,
    defaultName: string = 'إجمالي'
  ) => {
    const currentList = ((report[field] as any[]) || []).slice();
    if (currentList.length === 0) {
      if (field === 'employees') {
        triggerDebouncedUpdate({
          employees: [{ id: 'emp_1', name: 'سلف كادر', role: 'كادر', advance: newTotal, signed: true }]
        });
      } else if (field === 'vendorDebtsPaid') {
        triggerDebouncedUpdate({
          vendorDebtsPaid: [{ id: 'v_paid_1', vendorName: 'سداد تجار', amount: newTotal }]
        });
      } else {
        triggerDebouncedUpdate({
          [field]: [{ id: `${field}_1`, name: defaultName, amount: newTotal }]
        });
      }
    } else if (currentList.length === 1) {
      if (field === 'employees') {
        triggerDebouncedUpdate({
          employees: [{ ...currentList[0], advance: newTotal, signed: newTotal > 0 ? true : currentList[0].signed }]
        });
      } else if (field === 'vendorDebtsPaid') {
        triggerDebouncedUpdate({
          vendorDebtsPaid: [{ ...currentList[0], amount: newTotal }]
        });
      } else {
        triggerDebouncedUpdate({
          [field]: [{ ...currentList[0], amount: newTotal }]
        });
      }
    } else {
      // If multiple detailed items exist, adjust the first row with the difference so total equals newTotal
      const currentSum = currentList.reduce(
        (acc, it) => acc + (Number(it.amount || it.advance || 0) || 0),
        0
      );
      const diff = newTotal - currentSum;
      if (field === 'employees') {
        const first = currentList[0];
        const newAdvance = Math.max(0, parseFloat(((Number(first.advance) || 0) + diff).toFixed(2)));
        const updated = currentList.map((emp, idx) =>
          idx === 0 ? { ...emp, advance: newAdvance, signed: newAdvance > 0 ? true : emp.signed } : emp
        );
        triggerDebouncedUpdate({ employees: updated });
      } else if (field === 'vendorDebtsPaid') {
        const first = currentList[0];
        const newAmt = Math.max(0, parseFloat(((Number(first.amount) || 0) + diff).toFixed(2)));
        const updated = currentList.map((v, idx) =>
          idx === 0 ? { ...v, amount: newAmt } : v
        );
        triggerDebouncedUpdate({ vendorDebtsPaid: updated });
      } else {
        const first = currentList[0];
        const newAmt = Math.max(0, parseFloat(((Number(first.amount) || 0) + diff).toFixed(2)));
        const updated = currentList.map((it, idx) =>
          idx === 0 ? { ...it, amount: newAmt } : it
        );
        triggerDebouncedUpdate({ [field]: updated });
      }
    }
  };

  // Helper for employees update with automatic wage calculation
  const updateEmployee = (id: string, field: string, val: any) => {
    const updated = report.employees.map((emp) => {
      if (emp.id === id) {
        const newEmp = { ...emp, [field]: val };
        const empType = (field === 'employmentType' ? val : (newEmp.employmentType || 'daily')) as 'daily' | 'monthly';
        const shiftIn = field === 'shiftIn' ? val : newEmp.shiftIn;
        const shiftOut = field === 'shiftOut' ? val : newEmp.shiftOut;
        const rate = (field === 'hourlyRate' ? Number(val) : (Number(newEmp.hourlyRate) || 1.5)) || 0;

        const hours = calculateShiftHours(shiftIn, shiftOut);
        newEmp.hoursWorked = hours;

        if (empType === 'monthly') {
          newEmp.calculatedWage = 0;
          newEmp.hourlyRate = 0;
        } else {
          newEmp.hourlyRate = rate > 0 ? rate : 1.5;
          newEmp.calculatedWage = computeHourlyWage(hours, newEmp.hourlyRate, 'daily');
        }
        return newEmp;
      }
      return emp;
    });
    triggerDebouncedUpdate({ employees: updated });
  };

  // Helper for custody claims update (جدول العهد: له وعليه)
  const updateCustodyClaim = (
    id: string,
    field: 'person' | 'forThem' | 'onThem' | 'notes',
    val: any
  ) => {
    const current = report.custodyClaims || [
      { id: 'cust_1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
      { id: 'cust_2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
      { id: 'cust_3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' }
    ];
    const updated = current.map((c) => (c.id === id ? { ...c, [field]: val } : c));
    triggerDebouncedUpdate({ custodyClaims: updated });
  };

  // Quick set employee advance
  const setEmployeeAdvanceQuick = (id: string, amount: number) => {
    const updated = report.employees.map((emp) =>
      emp.id === id ? { ...emp, advance: amount, signed: amount > 0 ? true : emp.signed } : emp
    );
    onUpdateReport({ employees: updated });
  };

  // Sign all employees who took advances
  const handleSignAllAdvanceReceivers = () => {
    const updated = report.employees.map((emp) =>
      emp.advance > 0 ? { ...emp, signed: true } : emp
    );
    onUpdateReport({ employees: updated });
  };

  // Handle Enter key for fast spreadsheet-style keyboard navigation
  const handleKeyDownNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest('form, div[id^="paper-sheet"]') || document;
      const focusable = Array.from(
        form.querySelectorAll('input:not([disabled]), button:not([disabled])')
      ) as HTMLElement[];
      const index = focusable.indexOf(e.target as HTMLElement);
      if (index > -1 && index + 1 < focusable.length) {
        focusable[index + 1].focus();
        if (focusable[index + 1] instanceof HTMLInputElement) {
          (focusable[index + 1] as HTMLInputElement).select?.();
        }
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-['IBM_Plex_Sans_Arabic','Cairo',sans-serif]">
      {/* ========================================================================= */}
      {/* CASHIER CONTROL TOOLBAR & AUTO-SAVE INDICATOR */}
      {/* ========================================================================= */}
      <div className="bg-zinc-950 p-3 rounded-2xl border-2 border-yellow-400/90 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlBaikLogo size="xs" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-xs sm:text-sm">
                الورقة اليومية اليدوية الرسمية (طبق الأصل من ورق المطعم)
              </h3>
              {/* Live Debounced Auto-Save Status Badge */}
              <div
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  saveStatus === 'saving'
                    ? 'bg-amber-500/20 text-yellow-400 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
                title="يتم حفظ كل رقم تدخله فوراً وتلقائياً في ذاكرة الجهاز"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    <span>جاري الحفظ التلقائي...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم الحفظ تلقائياً ({lastSavedTime})</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] hidden sm:block">
              جميع الحقول تحفظ فورياً وتلقائياً مع كل نقرة وزر إدخال لمنع فقدان أي بيانات
            </p>
          </div>
        </div>

        {/* Action Tools & Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Cash Denomination Counter Trigger */}
          <button
            type="button"
            onClick={() => setIsCashCounterOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all transform active:scale-95"
            title="فتح حاسبة عد النقود الأردنية في الدرج"
          >
            <Coins className="w-4 h-4 text-yellow-300" />
            <span>حاسبة عد كاش الدرج</span>
          </button>

          {/* Quick Calculator Trigger */}
          <button
            type="button"
            onClick={() => setIsQuickCalcOpen(!isQuickCalcOpen)}
            className={`px-3 py-1.5 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all ${
              isQuickCalcOpen
                ? 'bg-yellow-400 text-zinc-950 ring-2 ring-yellow-300'
                : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-zinc-700'
            }`}
            title="آلة حاسبة سريعة"
          >
            <Calculator className="w-3.5 h-3.5 text-yellow-400" />
            <span>حاسبة</span>
          </button>

          {/* Faces Switcher Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setPaperFace('face1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                paperFace === 'face1'
                  ? 'bg-red-600 text-white shadow ring-2 ring-yellow-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الوجه 1 (الجرد)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperFace('face2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                paperFace === 'face2'
                  ? 'bg-red-600 text-white shadow ring-2 ring-yellow-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>الوجه 2 (الموظفين 28)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperFace('both')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                paperFace === 'both'
                  ? 'bg-yellow-400 text-zinc-950 shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">الوجهين معاً</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FACE 1: Main Closing & Expenses Sheet */}
      {/* ========================================================================= */}
      {(paperFace === 'face1' || paperFace === 'both') && (
        <div
          id="paper-sheet-replica-container"
          className="bg-white rounded-2xl border-2 border-slate-400 p-4 sm:p-6 shadow-md text-slate-900 space-y-4"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #fbfbfb 100%)'
          }}
        >
          {/* Badge for Face 1 */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-300">
            <span className="text-xs font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
              الوجه الأول (الأمامي) - كشف الجرد والمصاريف والمشتريات وحركة الإنتاج
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold">
                تاريخ: {report.date} | يوم: {report.dayName}
              </span>
            </div>
          </div>

          {/* 1. Sheet Header (مطعم يحيى البيك - البيانات اليومية) */}
          <div className="border-2 border-slate-800 rounded-xl p-3 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Col 1: Financial Inflow inputs */}
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-700">النقد الافتتاحي:</span>
                  <input
                    type="number" inputMode="decimal"
                    step="0.5"
                    value={report.openingCash === 0 ? '' : report.openingCash}
                    placeholder="0"
                    onKeyDown={handleKeyDownNavigation}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        openingCash: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-24 px-2 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded focus:border-slate-800 focus:bg-yellow-50"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-700">إضافة ذمم جديدة:</span>
                  <input
                    type="number" inputMode="decimal"
                    step="0.5"
                    value={report.newDebtsTotal === 0 ? '' : report.newDebtsTotal}
                    placeholder="0"
                    onKeyDown={handleKeyDownNavigation}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        newDebtsTotal: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-24 px-2 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded focus:border-slate-800 focus:bg-yellow-50"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-700">سداد ذمم قديمة:</span>
                  <input
                    type="number" inputMode="decimal"
                    step="0.5"
                    value={report.oldDebtsPaidTotal === 0 ? '' : report.oldDebtsPaidTotal}
                    placeholder="0"
                    onKeyDown={handleKeyDownNavigation}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        oldDebtsPaidTotal: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-24 px-2 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded focus:border-slate-800 focus:bg-yellow-50"
                  />
                </div>
              </div>

              {/* Col 2: Sales */}
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-900 font-extrabold">المبيعات:</span>
                  <input
                    type="number" inputMode="decimal"
                    step="1"
                    value={report.sales === 0 ? '' : report.sales}
                    placeholder="0"
                    onKeyDown={handleKeyDownNavigation}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        sales: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-28 px-2 py-1 text-center font-mono font-black text-sm bg-amber-50/70 border-2 border-amber-500 rounded text-amber-950 focus:outline-none focus:bg-yellow-100"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-700">مبيعات أخرى:</span>
                  <input
                    type="number" inputMode="decimal"
                    step="0.5"
                    value={report.otherSales === 0 ? '' : report.otherSales}
                    placeholder="0"
                    onKeyDown={handleKeyDownNavigation}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        otherSales: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-28 px-2 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200">
                  <span className="text-slate-900 font-extrabold">مجموع الكاش:</span>
                  <span className="w-28 text-center font-mono font-black text-sm text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {formatNumber(summary.totalGrossCashAvailable)}
                  </span>
                </div>
              </div>

              {/* Col 3: Restaurant Brand Center */}
              <div className="flex flex-col items-center justify-center md:col-span-1 border-x md:border-x-slate-200 px-2">
                <AlBaikLogo size="xs" variant="badge" />
                <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <span className="font-bold">الكاشير:</span>
                  <input
                    type="text"
                    value={report.cashierName}
                    onChange={(e) => triggerDebouncedUpdate({ cashierName: e.target.value })}
                    className="font-bold text-slate-900 text-center border-b border-dashed border-red-500 bg-transparent focus:outline-none text-xs w-28"
                    placeholder="اسم الكاشير"
                  />
                </div>
              </div>

              {/* Col 4: Date & Day */}
              <div className="space-y-1 text-xs font-bold bg-white p-2 rounded-lg border border-slate-200 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">التاريخ:</span>
                  <input
                    type="date"
                    value={report.date}
                    onChange={(e) =>
                      triggerDebouncedUpdate({
                        date: e.target.value,
                        dayName: e.target.value
                          ? new Date(e.target.value).toLocaleDateString('ar-JO', {
                              weekday: 'long'
                            })
                          : report.dayName
                      })
                    }
                    className="font-mono text-xs font-bold text-slate-800 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-600">اليوم:</span>
                  <span className="font-bold text-amber-800 px-2 py-0.5 bg-amber-50 rounded">
                    {report.dayName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Main Paper Grid (5 Parallel Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-2 border-slate-800 rounded-xl p-2 bg-white">
            {/* ======================================================== */}
            {/* Column 1 (md:col-span-3): ملخص الجرد والمصاريف BOX */}
            {/* ======================================================== */}
            <div className="md:col-span-3 border-2 border-slate-800 rounded-lg p-2.5 bg-slate-50/70 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-center font-black text-xs sm:text-sm bg-slate-800 text-white py-1 rounded-md mb-2 flex items-center justify-between px-2">
                  <span>ملخص الجرد والمصاريف</span>
                  <button
                    type="button"
                    onClick={() => setIsCashCounterOpen(true)}
                    className="text-[10px] bg-yellow-400 text-zinc-950 px-1.5 py-0.5 rounded font-black hover:bg-yellow-300"
                    title="عد نقد الدرج"
                  >
                    عد النقد 💵
                  </button>
                </div>

                <div className="space-y-1 text-xs divide-y divide-slate-200/80">
                  <div className="flex items-center justify-between py-1 bg-yellow-100/60 -mx-1 px-1 rounded">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-slate-900">نقد (في الدرج):</span>
                      <button
                        type="button"
                        onClick={() => setIsCashCounterOpen(true)}
                        className="text-[10px] text-emerald-700 font-bold hover:underline"
                      >
                        (عد)
                      </button>
                    </div>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={report.actualCashInDrawer === 0 ? '' : report.actualCashInDrawer}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        triggerDebouncedUpdate({
                          actualCashInDrawer: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-black bg-white border-2 border-slate-800 rounded text-slate-950 text-xs focus:bg-yellow-50"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">مشتريات:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={summary.totalPurchases === 0 ? '' : summary.totalPurchases}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'purchases',
                          parseFloat(e.target.value) || 0,
                          'مشتريات'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">سلف:</span>
                      <button
                        type="button"
                        onClick={onOpenEmployeesModal}
                        title="فتح كشف الموظفين"
                        className="text-[10px] text-teal-700 hover:underline inline-flex items-center"
                      >
                        <Users className="w-3 h-3 ml-0.5" />
                        (الموظفين)
                      </button>
                    </div>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalAdvances === 0 ? '' : summary.totalAdvances}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'employees',
                          parseFloat(e.target.value) || 0,
                          'سلف'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-teal-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">سداد تجار:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="1"
                      value={summary.totalVendorDebtsPaid === 0 ? '' : summary.totalVendorDebtsPaid}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'vendorDebtsPaid',
                          parseFloat(e.target.value) || 0,
                          'سداد تجار'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">مصاريف أخرى:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalOtherExpenses === 0 ? '' : summary.totalOtherExpenses}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'otherExpenses',
                          parseFloat(e.target.value) || 0,
                          'مصاريف أخرى'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">الشقة:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalApartmentExpenses === 0 ? '' : summary.totalApartmentExpenses}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'apartmentExpenses',
                          parseFloat(e.target.value) || 0,
                          'الشقة'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-purple-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">مصاريف إدارية:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.25"
                      value={summary.totalAdminExpenses === 0 ? '' : summary.totalAdminExpenses}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'adminExpenses',
                          parseFloat(e.target.value) || 0,
                          'مصاريف إدارية'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-blue-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">محفظة:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={summary.totalWallet === 0 ? '' : summary.totalWallet}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'walletExpenses',
                          parseFloat(e.target.value) || 0,
                          'محفظة'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-indigo-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">يحيى:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalYahya === 0 ? '' : summary.totalYahya}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'yahyaAccount',
                          parseFloat(e.target.value) || 0,
                          'اوردر'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-emerald-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">أبو عبدالله:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalAbuAbdullah === 0 ? '' : summary.totalAbuAbdullah}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'abuAbdullahAccount',
                          parseFloat(e.target.value) || 0,
                          'سحب'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-cyan-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">فيزا:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={report.visaPOS === 0 ? '' : report.visaPOS}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        triggerDebouncedUpdate({
                          visaPOS: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1" title="RT: قيمة الأوردرات المرتجعة / الملغاة">
                      <span className="font-bold text-slate-700">RT (أوردرات ملغاة):</span>
                    </div>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={report.rtPOS === 0 ? '' : report.rtPOS}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        triggerDebouncedUpdate({
                          rtPOS: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">مايسترو:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={report.maestroPOS === 0 ? '' : report.maestroPOS}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        triggerDebouncedUpdate({
                          maestroPOS: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">فرق سعر:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={report.priceDiff === 0 ? '' : report.priceDiff}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        triggerDebouncedUpdate({
                          priceDiff: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">صيانة:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      value={summary.totalMaintenance === 0 ? '' : summary.totalMaintenance}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'maintenance',
                          parseFloat(e.target.value) || 0,
                          'صيانة'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-amber-900"
                    />
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className="font-bold text-slate-700">بهارات:</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={summary.totalSpices === 0 ? '' : summary.totalSpices}
                      placeholder="0"
                      onKeyDown={handleKeyDownNavigation}
                      onChange={(e) =>
                        handleDirectCategoryTotalChange(
                          'spices',
                          parseFloat(e.target.value) || 0,
                          'بهارات'
                        )
                      }
                      className="w-20 px-1 py-0.5 text-center font-mono font-bold bg-white border border-slate-300 rounded text-xs focus:border-slate-800 focus:bg-yellow-50 text-rose-900"
                    />
                  </div>
                </div>
              </div>

              {/* Reconciled Totals Bottom */}
              <div className="border-t-2 border-slate-800 pt-2 space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between bg-slate-200/90 p-1.5 rounded">
                  <span className="text-slate-900 font-extrabold">مجموع الجرد:</span>
                  <span className="font-mono font-black text-sm text-slate-950">
                    {formatNumber(summary.totalReconciledInventory)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-amber-100/70 p-1.5 rounded">
                  <span className="text-amber-900 font-extrabold">المبيعات:</span>
                  <span className="font-mono font-black text-sm text-amber-950">
                    {formatNumber(report.sales)}
                  </span>
                </div>

                {/* Difference indicator */}
                <div
                  className={`p-2 rounded text-center font-black text-xs ${
                    summary.differenceType === 'balanced'
                      ? 'bg-emerald-600 text-white'
                      : summary.differenceType === 'surplus'
                      ? 'bg-blue-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {summary.differenceType === 'balanced' && 'مطابقة تامة (0.00 د.أ)'}
                  {summary.differenceType === 'surplus' &&
                    `زيادة كاش: +${formatNumber(summary.cashDifference)} د.أ`}
                  {summary.differenceType === 'shortage' &&
                    `نقص كاش: ${formatNumber(summary.cashDifference)} د.أ`}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Column 2 (md:col-span-3): مشتريات (Purchases - أول جدول) */}
            {/* ======================================================== */}
            <div className="md:col-span-3 border-2 border-orange-300 rounded-lg p-2 bg-orange-50/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-black text-xs bg-orange-600 text-white px-2 py-1 rounded mb-2">
                  <span>جدول المشتريات (أول جدول)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">{formatNumber(summary.totalPurchases)}</span>
                    <button
                      type="button"
                      onClick={() => addListItem('purchases', 'مادة')}
                      className="bg-white text-orange-900 px-1.5 py-0.5 rounded text-[10px] hover:bg-orange-100 font-black cursor-pointer"
                    >
                      + سطر جديد
                    </button>
                  </div>
                </div>

                {/* Cashier Quick-Add Preset Chips */}
                <div className="mb-2 p-1.5 bg-orange-100/70 rounded border border-orange-200">
                  <span className="text-[10px] font-black text-orange-950 block mb-1">
                    إضافة سريعة لبنود المشتريات:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_PURCHASE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addListItem('purchases', preset.name, preset.amount)}
                        className="px-1.5 py-0.5 bg-white hover:bg-orange-200 border border-orange-300 text-orange-950 rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        +{preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto pr-1 text-xs">
                  {report.purchases.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-1 py-0.5 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}</span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateListField('purchases', item.id, 'name', e.target.value)
                          }
                          className="w-full bg-transparent text-[11px] font-bold text-slate-900 truncate focus:outline-none focus:bg-yellow-50"
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number" inputMode="decimal"
                          step="0.01"
                          value={item.amount === 0 ? '' : item.amount}
                          placeholder="0"
                          onKeyDown={handleKeyDownNavigation}
                          onChange={(e) =>
                            updateListField(
                              'purchases',
                              item.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-14 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded py-0.5 focus:border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => deleteListItem('purchases', item.id)}
                          className="text-slate-300 hover:text-rose-600 p-0.5"
                          title="حذف البند"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-orange-200 mt-2 flex items-center justify-between text-xs font-bold bg-orange-100 p-1.5 rounded">
                <span className="text-orange-950 font-black">مجموع المشتريات:</span>
                <span className="font-mono text-orange-950 font-black">
                  {formatNumber(summary.totalPurchases)} د.أ
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Column 3 (md:col-span-2): المحفظة + جدول العُهد (3 أسطر) */}
            {/* ======================================================== */}
            <div className="md:col-span-2 space-y-3">
              {/* المحفظة الإلكترونية (Zain Cash, CliQ, إلخ) */}
              <div className="border border-indigo-300 rounded-lg p-2 bg-indigo-50/30">
                <div className="flex items-center justify-between font-bold text-xs bg-indigo-700 text-white px-2 py-0.5 rounded mb-1">
                  <span>المحفظة الإلكترونية</span>
                  <button
                    type="button"
                    onClick={() => addListItem('walletExpenses', 'محفظة')}
                    className="text-[10px] bg-white text-indigo-900 px-1.5 rounded hover:bg-indigo-100 font-bold"
                  >
                    + محفظة
                  </button>
                </div>
                <div className="space-y-1 text-xs max-h-36 overflow-y-auto">
                  {report.walletExpenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('walletExpenses', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.01"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'walletExpenses',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-1 mt-1 border-t border-indigo-200 flex justify-between text-[11px] font-black text-indigo-950">
                  <span>المجموع:</span>
                  <span className="font-mono">{formatNumber(summary.totalWallet)} د.أ</span>
                </div>
              </div>

              {/* جدول العُهد */}
              <div className="border border-slate-700 rounded-lg p-0 bg-white overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between font-black text-xs bg-slate-800 text-white px-2 py-1">
                  <span>جدول العُهد</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-[10px]">
                      <tr>
                        <th className="py-1 border-l border-slate-300 w-8">م</th>
                        <th className="py-1 border-l border-slate-300 min-w-[70px]">البيان</th>
                        <th className="py-1 border-l border-slate-300 w-16">له</th>
                        <th className="py-1 border-l border-slate-300 w-16">عليه</th>
                        <th className="py-1 min-w-[60px]">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(report.custodyClaims || [
                        { id: 'cust_1', person: '', forThem: 0, onThem: 0, notes: '' },
                        { id: 'cust_2', person: '', forThem: 0, onThem: 0, notes: '' },
                        { id: 'cust_3', person: '', forThem: 0, onThem: 0, notes: '' },
                        { id: 'cust_4', person: '', forThem: 0, onThem: 0, notes: '' }
                      ]).slice(0, 4).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-0.5 border-l border-slate-200 text-[10px] text-slate-500 font-mono bg-slate-50">
                            {idx + 1}
                          </td>
                          <td className="p-0 border-l border-slate-200">
                            <input
                              type="text"
                              value={item.person || ''}
                              placeholder="البيان"
                              onKeyDown={handleKeyDownNavigation}
                              onChange={(e) => updateCustodyClaim(item.id, 'person', e.target.value)}
                              className="w-full h-full min-h-[28px] px-1 text-[11px] font-bold text-slate-900 bg-transparent focus:bg-yellow-50 outline-none"
                            />
                          </td>
                          <td className="p-0 border-l border-slate-200 bg-emerald-50/40">
                            <input
                              type="number" inputMode="decimal"
                              step="0.5"
                              value={item.forThem === 0 ? '' : item.forThem}
                              placeholder="0"
                              onKeyDown={handleKeyDownNavigation}
                              onChange={(e) => updateCustodyClaim(item.id, 'forThem', parseFloat(e.target.value) || 0)}
                              className="w-full h-full min-h-[28px] text-center font-mono font-bold text-emerald-950 bg-transparent focus:bg-yellow-50 outline-none"
                            />
                          </td>
                          <td className="p-0 border-l border-slate-200 bg-rose-50/40">
                            <input
                              type="number" inputMode="decimal"
                              step="0.5"
                              value={item.onThem === 0 ? '' : item.onThem}
                              placeholder="0"
                              onKeyDown={handleKeyDownNavigation}
                              onChange={(e) => updateCustodyClaim(item.id, 'onThem', parseFloat(e.target.value) || 0)}
                              className="w-full h-full min-h-[28px] text-center font-mono font-bold text-rose-950 bg-transparent focus:bg-yellow-50 outline-none"
                            />
                          </td>
                          <td className="p-0">
                            <input
                              type="text"
                              value={item.notes || ''}
                              placeholder="ملاحظات"
                              onKeyDown={handleKeyDownNavigation}
                              onChange={(e) => updateCustodyClaim(item.id, 'notes', e.target.value)}
                              className="w-full h-full min-h-[28px] px-1 text-[10px] text-slate-600 bg-transparent focus:bg-yellow-50 outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Column 4 (md:col-span-2): يحيى + بهارات + صيانة + أبو عبدالله */}
            {/* ======================================================== */}
            <div className="md:col-span-2 space-y-3">
              {/* حساب يحيى */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded mb-1">
                  <span>يحيى</span>
                  <button
                    type="button"
                    onClick={() => addListItem('yahyaAccount', 'اوردر')}
                    className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold"
                  >
                    + بند
                  </button>
                </div>
                <div className="space-y-1">
                  {report.yahyaAccount.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('yahyaAccount', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'yahyaAccount',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* بهارات */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-rose-100 text-rose-900 px-2 py-0.5 rounded mb-1">
                  <span>بهارات</span>
                  <span className="font-mono text-xs">{formatNumber(summary.totalSpices)}</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5 text-xs">
                  {report.spices.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateListField('spices', item.id, 'name', e.target.value)}
                        className="w-20 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'spices',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* معدات وصيانة */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded mb-1">
                  <span>معدات وصيانة</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">{formatNumber(summary.totalMaintenance)}</span>
                    <button
                      type="button"
                      onClick={() => addListItem('maintenance', 'صيانة')}
                      className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold text-amber-900"
                      title="إضافة بند جديد"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  {report.maintenance.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1 group">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('maintenance', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number" inputMode="decimal"
                          step="1"
                          value={item.amount === 0 ? '' : item.amount}
                          placeholder="0"
                          onKeyDown={handleKeyDownNavigation}
                          onChange={(e) =>
                            updateListField(
                              'maintenance',
                              item.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => deleteListItem('maintenance', item.id)}
                          className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          title="حذف البند"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* أبو عبدالله */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded mb-1">
                  <span>أبو عبدالله</span>
                  <button
                    type="button"
                    onClick={() => addListItem('abuAbdullahAccount', 'سحب')}
                    className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {report.abuAbdullahAccount.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('abuAbdullahAccount', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'abuAbdullahAccount',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Column 5 (md:col-span-2): مصاريف إدارية + الشقة + ذمم تجار + مصاريف أخرى */}
            {/* ======================================================== */}
            <div className="md:col-span-2 space-y-3">
              {/* مصاريف إدارية */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded mb-1">
                  <span>مصاريف إدارية</span>
                  <span className="font-mono text-xs">{formatNumber(summary.totalAdminExpenses)}</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5 text-xs">
                  {report.adminExpenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('adminExpenses', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'adminExpenses',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* الشقة */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded mb-1">
                  <span>الشقة</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs">
                      {formatNumber(summary.totalApartmentExpenses)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addListItem('apartmentExpenses', 'أغراض')}
                      className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold text-purple-900"
                      title="إضافة بند جديد"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  {report.apartmentExpenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1 group">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('apartmentExpenses', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number" inputMode="decimal"
                          step="0.05"
                          value={item.amount === 0 ? '' : item.amount}
                          placeholder="0"
                          onKeyDown={handleKeyDownNavigation}
                          onChange={(e) =>
                            updateListField(
                              'apartmentExpenses',
                              item.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => deleteListItem('apartmentExpenses', item.id)}
                          className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          title="حذف البند"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* إضافة ذمم تجار */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded mb-1">
                  <span>إضافة ذمم تجار</span>
                  <button
                    type="button"
                    onClick={() => addListItem('vendorDebtsAdded', 'تاجر')}
                    className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold"
                  >
                    + ذمة
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {report.vendorDebtsAdded.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.vendorName}
                        onChange={(e) =>
                          updateListField('vendorDebtsAdded', item.id, 'vendorName', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="1"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'vendorDebtsAdded',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* سداد ذمم تجار */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded mb-1">
                  <span>سداد ذمم تجار</span>
                  <button
                    type="button"
                    onClick={() => addListItem('vendorDebtsPaid', 'لحم')}
                    className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold"
                  >
                    + سداد
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {report.vendorDebtsPaid.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.vendorName}
                        onChange={(e) =>
                          updateListField('vendorDebtsPaid', item.id, 'vendorName', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="1"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'vendorDebtsPaid',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* مصاريف أخرى */}
              <div className="border border-slate-700 rounded-lg p-2 bg-slate-50/40">
                <div className="flex items-center justify-between font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded mb-1">
                  <span>مصاريف أخرى</span>
                  <button
                    type="button"
                    onClick={() => addListItem('otherExpenses', 'متفرقات')}
                    className="text-[10px] bg-white px-1.5 rounded hover:bg-slate-300 font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {report.otherExpenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateListField('otherExpenses', item.id, 'name', e.target.value)
                        }
                        className="w-16 bg-transparent text-[11px] font-semibold truncate"
                      />
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={item.amount === 0 ? '' : item.amount}
                        placeholder="0"
                        onKeyDown={handleKeyDownNavigation}
                        onChange={(e) =>
                          updateListField(
                            'otherExpenses',
                            item.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-12 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bottom Kitchen & Shifts Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-2 border-slate-800 rounded-xl p-3 bg-slate-50/60 text-xs">
            {/* Left: Consumables */}
            <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">سيخ 1 (استهلاك رز):</span>
                <input
                  type="number" inputMode="decimal"
                  value={report.kitchenConsumption.rice1 === 0 ? '' : report.kitchenConsumption.rice1}
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        rice1: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">سيخ 2 (رز):</span>
                <input
                  type="number" inputMode="decimal"
                  value={report.kitchenConsumption.rice2 === 0 ? '' : report.kitchenConsumption.rice2}
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        rice2: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">استهلاك لوز:</span>
                <input
                  type="number" inputMode="decimal"
                  step="0.1"
                  value={
                    report.kitchenConsumption.almonds === 0
                      ? ''
                      : report.kitchenConsumption.almonds
                  }
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        almonds: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">استهلاك بطاطا:</span>
                <input
                  type="number" inputMode="decimal"
                  step="0.1"
                  value={
                    report.kitchenConsumption.potatoes === 0
                      ? ''
                      : report.kitchenConsumption.potatoes
                  }
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        potatoes: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">تزويد:</span>
                <input
                  type="number" inputMode="decimal"
                  value={
                    report.kitchenConsumption.supplyIn === 0
                      ? ''
                      : report.kitchenConsumption.supplyIn
                  }
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        supplyIn: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">مرتجع:</span>
                <input
                  type="number" inputMode="decimal"
                  value={
                    report.kitchenConsumption.returns === 0
                      ? ''
                      : report.kitchenConsumption.returns
                  }
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        returns: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">جنات:</span>
                <input
                  type="number" inputMode="decimal"
                  value={
                    report.kitchenConsumption.jannat === 0
                      ? ''
                      : report.kitchenConsumption.jannat
                  }
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        jannat: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>

              <div className="bg-white p-1.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-600 block">قشرة:</span>
                <input
                  type="number" inputMode="decimal"
                  value={report.kitchenConsumption.peel === 0 ? '' : report.kitchenConsumption.peel}
                  placeholder="0"
                  onKeyDown={handleKeyDownNavigation}
                  onChange={(e) =>
                    triggerDebouncedUpdate({
                      kitchenConsumption: {
                        ...report.kitchenConsumption,
                        peel: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-full text-center font-mono font-bold text-xs bg-transparent"
                />
              </div>
            </div>

            {/* Right: Shifts Production table */}
            <div className="md:col-span-6 overflow-hidden rounded-lg border border-slate-300 bg-white">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-1 px-2 text-right">البيان</th>
                    {report.productionItems.map((p) => (
                      <th key={p.id} className="py-1 px-2">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold">
                  <tr>
                    <td className="py-1 px-2 text-right font-bold text-slate-700">الشفت الأول</td>
                    {report.productionItems.map((p) => (
                      <td key={p.id} className="py-1 px-2">
                        <input
                          type="number" inputMode="decimal"
                          value={p.shift1 === 0 ? '' : p.shift1}
                          placeholder="0"
                          onKeyDown={handleKeyDownNavigation}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const items = report.productionItems.map((item) =>
                              item.id === p.id
                                ? { ...item, shift1: val, total: val + item.shift2 }
                                : item
                            );
                            triggerDebouncedUpdate({ productionItems: items });
                          }}
                          className="w-12 text-center font-mono font-bold bg-transparent"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1 px-2 text-right font-bold text-slate-700">الشفت الثاني</td>
                    {report.productionItems.map((p) => (
                      <td key={p.id} className="py-1 px-2">
                        <input
                          type="number" inputMode="decimal"
                          value={p.shift2 === 0 ? '' : p.shift2}
                          placeholder="0"
                          onKeyDown={handleKeyDownNavigation}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const items = report.productionItems.map((item) =>
                              item.id === p.id
                                ? { ...item, shift2: val, total: item.shift1 + val }
                                : item
                            );
                            triggerDebouncedUpdate({ productionItems: items });
                          }}
                          className="w-12 text-center font-mono font-bold bg-transparent"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="py-1 px-2 text-right font-bold text-slate-900">المجموع</td>
                    {report.productionItems.map((p) => (
                      <td key={p.id} className="py-1 px-2 font-mono text-slate-900">
                        {p.total}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACE 2: Staff Roster, Shifts, Advances & Production (28 Staff Table) */}
      {/* ========================================================================= */}
      {(paperFace === 'face2' || paperFace === 'both') && (
        <div
          id="paper-sheet-face2-container"
          className="bg-white rounded-2xl border-2 border-slate-400 p-4 sm:p-6 shadow-md text-slate-900 space-y-4"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #fbfbfb 100%)'
          }}
        >
          {/* Badge & Summary for Face 2 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                الوجه الثاني (الخلفي) - كشف سلف وشفتات وحضور الموظفين (28 موظف)
              </span>
              <span className="text-xs font-black text-zinc-700 bg-yellow-400/20 px-2.5 py-1 rounded border border-yellow-400/50 font-mono">
                مجموع سلف اليوم: {formatNumber(summary.totalAdvances)} د.أ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSignAllAdvanceReceivers}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                title="توقيع جميع الموظفين الذين أخذوا سلفة اليوم"
              >
                <Check className="w-3.5 h-3.5" />
                <span>توقيع جميع مستلمي السلف</span>
              </button>
            </div>
          </div>

          {/* Top Categories Grid from Image 2 */}
          <div className="border border-slate-400 rounded-xl p-3 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800">
                سجل الأقسام اليومي (أعلى الورقة الخلفية):
              </span>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                دجاج حب: 1 دجاجة 25
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-300 bg-white rounded-lg">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                  <tr>
                    <th className="py-1.5 px-3 border-l border-slate-200 text-right">القسم</th>
                    <th className="py-1.5 px-3 border-l border-slate-200">مسؤول شفت 1</th>
                    <th className="py-1.5 px-3 border-l border-slate-200">التوقيع</th>
                    <th className="py-1.5 px-3 border-l border-slate-200">مسؤول شفت 2</th>
                    <th className="py-1.5 px-3">التوقيع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold">
                  <tr>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-right font-bold text-slate-900 bg-slate-50">
                      دجاج حب (1 دجاجة 25)
                    </td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">شفت 1</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-emerald-600 font-bold">✓ موقع</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 font-mono text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-right font-bold text-slate-900 bg-slate-50">
                      زنجر
                    </td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 font-mono text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-right font-bold text-slate-900 bg-slate-50">
                      سكالوب
                    </td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 font-mono text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-right font-bold text-slate-900 bg-slate-50">
                      كولا وشنينة
                    </td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">مبردات</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 text-emerald-600 font-bold">✓ موقع</td>
                    <td className="py-1.5 px-3 border-l border-slate-200 font-mono text-slate-700">-</td>
                    <td className="py-1.5 px-3 font-mono text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 28 Staff Table from Image 2 */}
          <div className="border-2 border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-900 text-white p-2.5 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>كشف الموظفين وسجل الدوام والسلف واليوميات (28 موظف - مطعم يحيى البيك)</span>
                <button
                  type="button"
                  onClick={onOpenEmployeesModal}
                  className="px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold"
                >
                  فتح الكشف الكامل والتحكم المتقدم
                </button>
              </div>
              <span className="text-yellow-400 font-mono font-black">
                إجمالي السلف: {formatNumber(summary.totalAdvances)} د.أ
              </span>
            </div>

            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-100 font-extrabold text-slate-900 sticky top-0 border-b-2 border-slate-300 shadow-sm z-10">
                  <tr>
                    <th className="py-2 px-2 border-l border-slate-200 w-10">م</th>
                    <th className="py-2 px-3 border-l border-slate-200 text-right min-w-[130px]">
                      اسم الموظف
                    </th>
                    <th className="py-2 px-2 border-l border-slate-200 w-24">
                      نوع التوظيف
                    </th>
                    <th className="py-2 px-2 border-l border-slate-200 w-20">
                      أجر الساعة
                    </th>
                    <th className="py-2 px-2 border-l border-slate-200 min-w-[65px]">دخول</th>
                    <th className="py-2 px-2 border-l border-slate-200 min-w-[65px]">خروج</th>
                    <th className="py-2 px-2 border-l border-slate-200 w-16">الساعات</th>
                    <th className="py-2 px-2 border-l border-slate-200 min-w-[90px] text-emerald-800 bg-emerald-50">
                      اليومية المحسوبة
                    </th>
                    <th className="py-2 px-3 border-l border-slate-200 text-red-700 min-w-[140px]">
                      السلفة (د.أ)
                    </th>
                    <th className="py-2 px-3 border-l border-slate-200 min-w-[90px]">ملاحظات</th>
                    <th className="py-2 px-2 w-16">توقيع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold">
                  {report.employees.map((emp, index) => {
                    const isDaily = (emp.employmentType || 'daily') === 'daily';
                    const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
                    const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, emp.hourlyRate || 1.5, 'daily')) : 0;

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-amber-50/50 transition-colors ${
                          !isDaily ? 'bg-indigo-50/15' : ''
                        } ${emp.advance > 0 || emp.signed ? 'bg-amber-50/20' : ''}`}
                      >
                        <td className="py-1.5 px-2 border-l border-slate-200 font-mono font-bold text-slate-500">
                          {emp.number || index + 1}
                        </td>
                        <td className="py-1.5 px-3 border-l border-slate-200 text-right font-black text-slate-900">
                          <input
                            type="text"
                            value={emp.name}
                            onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                            className="w-full bg-transparent font-bold focus:outline-none focus:bg-yellow-100 rounded px-1"
                          />
                        </td>
                        {/* Employment type toggle */}
                        <td className="py-1.5 px-1 border-l border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateEmployee(
                                emp.id,
                                'employmentType',
                                isDaily ? 'monthly' : 'daily'
                              )
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              isDaily
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : 'bg-indigo-100 text-indigo-950 border-indigo-300'
                            }`}
                          >
                            {isDaily ? 'مياومة' : 'شهري'}
                          </button>
                        </td>
                        {/* Hourly rate */}
                        <td className="py-1.5 px-1 border-l border-slate-200">
                          {isDaily ? (
                            <input
                              type="number" inputMode="decimal"
                              step="0.1"
                              value={emp.hourlyRate || 1.5}
                              onChange={(e) =>
                                updateEmployee(
                                  emp.id,
                                  'hourlyRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-12 text-center font-mono font-bold text-xs bg-amber-50/50 border border-amber-200 rounded py-0.5"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="py-1.5 px-1 border-l border-slate-200">
                          <input
                            type="text"
                            value={emp.shiftIn || ''}
                            placeholder="10:00"
                            onKeyDown={handleKeyDownNavigation}
                            onChange={(e) => updateEmployee(emp.id, 'shiftIn', e.target.value)}
                            className="w-14 text-center font-mono text-xs py-0.5 bg-slate-50 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="py-1.5 px-1 border-l border-slate-200">
                          <input
                            type="text"
                            value={emp.shiftOut || ''}
                            placeholder="22:00"
                            onKeyDown={handleKeyDownNavigation}
                            onChange={(e) => updateEmployee(emp.id, 'shiftOut', e.target.value)}
                            className="w-14 text-center font-mono text-xs py-0.5 bg-slate-50 border border-slate-200 rounded"
                          />
                        </td>
                        <td className="py-1.5 px-1 border-l border-slate-200">
                          <span className="font-mono font-bold text-xs text-sky-900 bg-sky-50 px-1 py-0.5 rounded">
                            {hours > 0 ? `${hours}س` : '-'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 border-l border-slate-200 bg-emerald-50/30">
                          {isDaily ? (
                            <span className="font-mono font-black text-xs text-emerald-900">
                              {wage > 0 ? `${formatNumber(wage)}` : '0.00'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">
                              راتب شهري
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 border-l border-slate-200">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number" inputMode="decimal"
                              step="0.5"
                              value={emp.advance === 0 ? '' : emp.advance}
                              placeholder="-"
                              onKeyDown={handleKeyDownNavigation}
                              onChange={(e) =>
                                updateEmployee(
                                  emp.id,
                                  'advance',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-14 text-center font-mono font-black py-0.5 rounded border ${
                                emp.advance > 0
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            />
                            <div className="hidden sm:flex items-center gap-0.5">
                              {[5, 10, 20].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setEmployeeAdvanceQuick(emp.id, amt)}
                                  className={`px-1 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                                    emp.advance === amt
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 border-l border-slate-200">
                          <input
                            type="text"
                            value={emp.notes || ''}
                            placeholder="-"
                            onChange={(e) => updateEmployee(emp.id, 'notes', e.target.value)}
                            className="w-full text-right text-xs py-0.5 bg-transparent border-b border-transparent focus:border-slate-400 focus:bg-yellow-50"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <button
                            type="button"
                            onClick={() => updateEmployee(emp.id, 'signed', !emp.signed)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 mx-auto ${
                              emp.signed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {emp.signed ? <Check className="w-3 h-3" /> : 'توقيع'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-extrabold sticky bottom-0 border-t-2 border-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right">
                      المجموع الكلي لسلف ويوميات الموظفين:
                    </td>
                    <td colSpan={4} className="py-2 px-2 text-center text-emerald-300 font-mono">
                      مجموع أجور المياومة: {formatNumber(
                        report.employees.reduce((sum, e) => {
                          const isDaily = (e.employmentType || 'daily') === 'daily';
                          return sum + (isDaily ? (Number(e.calculatedWage) || 0) : 0);
                        }, 0)
                      )} د.أ
                    </td>
                    <td className="py-2 px-3 font-mono text-yellow-400 text-sm">
                      {formatNumber(summary.totalAdvances)} د.أ
                    </td>
                    <td colSpan={3} className="py-2 px-3 text-left text-zinc-400 text-[11px]">
                      تم توقيع واستلام السلف واليوميات
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cash Counter Denomination Modal */}
      <CashCounterModal
        isOpen={isCashCounterOpen}
        onClose={() => setIsCashCounterOpen(false)}
        currentAmount={report.actualCashInDrawer}
        onApplyCash={(total) => triggerDebouncedUpdate({ actualCashInDrawer: total })}
      />

      {/* Floating Quick Pocket Calculator */}
      <QuickCalculator isOpen={isQuickCalcOpen} onClose={() => setIsQuickCalcOpen(false)} />
    </div>
  );
};
