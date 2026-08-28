import React from 'react';
import { SummaryCalculations } from '../types';
import { formatCurrency } from '../utils/calculations';
import { CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingBag, Users } from 'lucide-react';

interface DiscrepancyBannerProps {
  summary: SummaryCalculations;
  onQuickReconcileClick?: () => void;
}

export const DiscrepancyBanner: React.FC<DiscrepancyBannerProps> = ({ summary, onQuickReconcileClick }) => {
  const isBalanced = summary.differenceType === 'balanced';
  const isSurplus = summary.differenceType === 'surplus';
  const isShortage = summary.differenceType === 'shortage';

  return (
    <div
      id="discrepancy-alert-banner"
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 shadow-sm ${
        isBalanced
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
          : isSurplus
          ? 'bg-blue-950/20 border-blue-500/40 text-blue-900 dark:text-blue-100'
          : 'bg-rose-950/20 border-rose-500/40 text-rose-900 dark:text-rose-100 animate-pulse'
      }`}
      style={{
        backgroundColor: isBalanced ? '#ecfdf5' : isSurplus ? '#eff6ff' : '#fff1f2',
        borderColor: isBalanced ? '#10b981' : isSurplus ? '#3b82f6' : '#f43f5e'
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Main Status Message */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isBalanced
                ? 'bg-emerald-600 text-white'
                : isSurplus
                ? 'bg-blue-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isBalanced && <CheckCircle2 className="w-6 h-6" />}
            {isSurplus && <TrendingUp className="w-6 h-6" />}
            {isShortage && <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg text-slate-900">
                {isBalanced && 'الكاش مطابق تماماً 100% (جاهز للإغلاق اليومي)'}
                {isSurplus && 'تنبيه: يوجد زيادة كاش في الصندوق!'}
                {isShortage && 'تحذير مالي: يوجد نقص كاش في الصندوق!'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isBalanced
                    ? 'bg-emerald-100 text-emerald-800'
                    : isSurplus
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isBalanced && 'فرق 0.00 د.أ'}
                {isSurplus && `+${formatCurrency(summary.cashDifference)}`}
                {isShortage && `${formatCurrency(summary.cashDifference)}`}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              {isBalanced &&
                'مجموع الجرد الفعلي يطابق إجمالي المبيعات والنقد المتوفر بدقة تامة.'}
              {isSurplus &&
                `مجموع الجرد الفعلي أكبر من الإيراد المتوقع بفارق (+${formatCurrency(
                  summary.cashDifference
                )}). تأكد من تسجيل جميع المبيعات أو النقد الافتتاحي.`}
              {isShortage &&
                `مجموع الجرد الفعلي أقل من الإيراد المتوقع بفارق (${formatCurrency(
                  Math.abs(summary.cashDifference)
                )}). تأكد من عد الدرج أو تسجيل المصاريف الناقصة.`}
            </p>
          </div>
        </div>

        {/* Financial Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200/80">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>إجمالي المبيعات</span>
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {formatCurrency(summary.totalExpectedRevenue)}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200/80">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              <span>مجموع الجرد</span>
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {formatCurrency(summary.totalReconciledInventory)}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200/80">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
              <span>المشتريات</span>
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {formatCurrency(summary.totalPurchases)}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200/80">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>سلف الموظفين</span>
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {formatCurrency(summary.totalAdvances)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
