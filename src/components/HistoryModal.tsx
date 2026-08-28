import React from 'react';
import { DailyReport } from '../types';
import { calculateDailySummary, formatCurrency } from '../utils/calculations';
import { X, Calendar, Plus, Trash2, CheckCircle2, ChevronLeft } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: DailyReport[];
  currentReportId: string;
  onSelectReport: (report: DailyReport) => void;
  onNewReport: () => void;
  onDeleteReport: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedReports,
  currentReportId,
  onSelectReport,
  onNewReport,
  onDeleteReport
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">سجل اليوميات والتقارير السابقة</h3>
              <p className="text-xs text-slate-500">استعراض الأيام المحفوظة ومتابعة السجلات السابقة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onNewReport();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>يومية جديدة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedReports.map((r) => {
            const summary = calculateDailySummary(r);
            const isSelected = r.id === currentReportId;

            return (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectReport(r);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {r.date || 'بدون تاريخ'} ({r.dayName})
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                        الحالي
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>الكاشير: <b className="text-slate-700">{r.cashierName || 'غير محدد'}</b></span>
                    <span>المبيعات: <b className="text-amber-800 font-mono">{formatCurrency(r.sales)}</b></span>
                    <span>المشتريات: <b className="text-orange-800 font-mono">{formatCurrency(summary.totalPurchases)}</b></span>
                    <span>السلف: <b className="text-teal-800 font-mono">{formatCurrency(summary.totalAdvances)}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <span
                      className={`text-xs font-black font-mono block ${
                        summary.differenceType === 'balanced'
                          ? 'text-emerald-700'
                          : summary.differenceType === 'surplus'
                          ? 'text-blue-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {summary.differenceType === 'balanced' && 'مطابق'}
                      {summary.differenceType === 'surplus' && `+${formatCurrency(summary.cashDifference)}`}
                      {summary.differenceType === 'shortage' && `${formatCurrency(summary.cashDifference)}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectReport(r);
                      onClose();
                    }}
                    className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl transition-colors"
                    title="فتح اليومية"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {savedReports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteReport(r.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="حذف اليومية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {savedReports.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              لا توجد تقارير سابقة محفوظة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
