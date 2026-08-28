import React, { useState } from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { PurchasesSection } from './PurchasesSection';
import { EmployeesSection } from './EmployeesSection';
import { ExpensesSection } from './ExpensesSection';
import { KitchenShiftsSection } from './KitchenShiftsSection';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Banknote,
  ShoppingBag,
  Users,
  Receipt,
  UtensilsCrossed,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Wallet,
  ShieldAlert
} from 'lucide-react';

interface CashierEntryViewProps {
  report: DailyReport;
  summary: SummaryCalculations;
  onUpdateReport: (updated: Partial<DailyReport>) => void;
  onOpenEmployeesModal?: () => void;
}

export const CashierEntryView: React.FC<CashierEntryViewProps> = ({
  report,
  summary,
  onUpdateReport,
  onOpenEmployeesModal
}) => {
  const [activeTab, setActiveTab] = useState<'quick_excel' | 'purchases' | 'staff' | 'expenses' | 'kitchen'>('quick_excel');

  // Direct numeric category override handlers
  const handleDirectSingleExpenseUpdate = (
    field: 'apartmentExpenses' | 'adminExpenses' | 'maintenance' | 'spices' | 'yahyaAccount' | 'abuAbdullahAccount' | 'walletExpenses' | 'otherExpenses',
    totalVal: number,
    defaultName: string
  ) => {
    const list = report[field] || [];
    if (list.length <= 1) {
      onUpdateReport({
        [field]: [{ id: `${field}_1`, name: list[0]?.name || defaultName, amount: totalVal }]
      });
    } else {
      // update first item with remainder or set proportional
      const otherItemsSum = list.slice(1).reduce((s, i) => s + (i.amount || 0), 0);
      const firstItemAmount = Math.max(0, parseFloat((totalVal - otherItemsSum).toFixed(2)));
      const updated = [{ ...list[0], amount: firstItemAmount }, ...list.slice(1)];
      onUpdateReport({ [field]: updated });
    }
  };

  const handleDirectPurchasesUpdate = (totalVal: number) => {
    if (report.purchases.length <= 1) {
      onUpdateReport({
        purchases: [{ id: 'p_1', name: report.purchases[0]?.name || 'مشتريات متنوعة', amount: totalVal }]
      });
    } else {
      const otherSum = report.purchases.slice(1).reduce((s, i) => s + (i.amount || 0), 0);
      const firstAmount = Math.max(0, parseFloat((totalVal - otherSum).toFixed(2)));
      onUpdateReport({
        purchases: [{ ...report.purchases[0], amount: firstAmount }, ...report.purchases.slice(1)]
      });
    }
  };

  const handleDirectVendorDebtsPaidUpdate = (totalVal: number) => {
    if (report.vendorDebtsPaid.length <= 1) {
      onUpdateReport({
        vendorDebtsPaid: [{ id: 'vdp_1', vendorName: report.vendorDebtsPaid[0]?.vendorName || 'سداد تجار', amount: totalVal }]
      });
    } else {
      onUpdateReport({
        vendorDebtsPaid: [{ id: 'vdp_1', vendorName: 'سداد تجار إجمالي', amount: totalVal }]
      });
    }
  };

  const handleDirectVendorDebtsAddedUpdate = (totalVal: number) => {
    if (report.vendorDebtsAdded.length <= 1) {
      onUpdateReport({
        vendorDebtsAdded: [{ id: 'vda_1', vendorName: report.vendorDebtsAdded[0]?.vendorName || 'إضافة ذمم', amount: totalVal }]
      });
    } else {
      onUpdateReport({
        vendorDebtsAdded: [{ id: 'vda_1', vendorName: 'إضافة ذمم إجمالي', amount: totalVal }]
      });
    }
  };

  return (
    <div id="cashier-entry-view-container" className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Floating Banner for Staff Management */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-4 rounded-2xl shadow-md border-2 border-teal-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-500/30 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-yellow-300">سجل كادر الموظفين والدوام والسلف اليومية</h3>
              <span className="bg-teal-700/80 text-teal-100 text-[11px] font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                28 موظفاً
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              إدخال السلف، ساعات الدخول والخروج، وحساب اليوميات التلقائي لكافة الكادر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (onOpenEmployeesModal) {
                onOpenEmployeesModal();
              } else {
                setActiveTab('staff');
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition-all hover:scale-102 cursor-pointer ring-2 ring-yellow-300/60"
          >
            <Users className="w-4 h-4 text-slate-900" />
            <span>👥 فتح كشف الموظفين وحساب اليوميات</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('quick_excel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'quick_excel'
              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
          <span>⚡ الإدخال السريع وحساب النقص والزيادة (طبق الأصل)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'bg-orange-700 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>المشتريات التفصيلية ({report.purchases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-teal-700 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سلف الموظفين واليوميات ({formatCurrency(summary.totalAdvances)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-blue-700 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>المصاريف والذمم والبهارات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kitchen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'kitchen'
              ? 'bg-red-700 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>استهلاك المطبخ والإنتاج</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXACT QUICK EXCEL ENTRY SHEET (Replicating IMG_8360.jpeg 1:1) */}
      {/* ========================================================================= */}
      {activeTab === 'quick_excel' && (
        <div className="space-y-6">
          {/* Top Status Alert Banner */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              summary.differenceType === 'balanced'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : summary.differenceType === 'surplus'
                ? 'bg-teal-50 border-teal-400 text-teal-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {summary.differenceType === 'balanced' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : summary.differenceType === 'surplus' ? (
                <TrendingUp className="w-8 h-8 text-teal-600 shrink-0" />
              ) : (
                <TrendingDown className="w-8 h-8 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-black text-base">
                  {summary.differenceType === 'balanced' && 'الكاش متطابق تماماً بدون أي فروقات'}
                  {summary.differenceType === 'surplus' && `يوجد زيادة في الكاش بقيمة: ${formatCurrency(summary.cashDifference)}`}
                  {summary.differenceType === 'shortage' && `يوجد عجز ونقص في الكاش بقيمة: ${formatCurrency(Math.abs(summary.cashDifference))}`}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  مجموع الكاش المتوفر: <span className="font-mono font-bold">{formatCurrency(summary.totalGrossCashAvailable)}</span> | مجموع الجرد الفعلي: <span className="font-mono font-bold">{formatCurrency(summary.totalReconciledInventory)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/80 border border-current shadow-2xs">
                {summary.differenceType === 'surplus' ? '+ زيادة' : summary.differenceType === 'shortage' ? '- نقص' : 'متطابق'}
              </span>
            </div>
          </div>

          {/* Side-by-Side Dual Form Tables (Direct replica of IMG_8360.jpeg) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 1. بيانات الكاش والمبيعات .1 */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
              <div className="bg-sky-800 text-white font-black text-sm px-4 py-3 text-center border-b border-sky-900">
                1. بيانات الكاش والمبيعات
              </div>

              <table className="w-full text-right text-xs">
                <tbody className="divide-y divide-slate-200">
                  {/* النقد الافتتاحي */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 text-sm">النقد الافتتاحي</td>
                    <td className="p-2 w-44">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={report.openingCash === 0 ? '' : report.openingCash}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ openingCash: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-center font-mono font-black text-sm rounded-lg border border-slate-300 bg-white focus:bg-amber-50 focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* اضافة ذمم */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 text-sm">اضافة ذمم</td>
                    <td className="p-2 w-44">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalVendorDebtsAdded === 0 ? '' : summary.totalVendorDebtsAdded}
                        placeholder="0.00"
                        onChange={(e) => handleDirectVendorDebtsAddedUpdate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-center font-mono font-black text-sm rounded-lg border border-slate-300 bg-white focus:bg-amber-50 focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* مبيعات */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 text-sm">مبيعات</td>
                    <td className="p-2 w-44">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={report.sales === 0 ? '' : report.sales}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ sales: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-center font-mono font-black text-sm rounded-lg border-2 border-sky-400 bg-sky-50/50 text-sky-950 focus:bg-sky-50 focus:border-sky-600 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* مبيعات أخرى */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800 text-sm">مبيعات أخرى</td>
                    <td className="p-2 w-44">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={report.otherSales === 0 ? '' : report.otherSales}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ otherSales: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-center font-mono font-black text-sm rounded-lg border border-slate-300 bg-white focus:bg-amber-50 focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* مجموع الكاش (Auto Calculated) */}
                  <tr className="bg-sky-100/90 font-black border-t-2 border-sky-300">
                    <td className="p-3.5 text-slate-950 text-sm">مجموع الكاش</td>
                    <td className="p-3.5 text-center font-mono text-base font-black text-sky-950">
                      {formatNumber(summary.totalGrossCashAvailable)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tips */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
                💡 <span className="font-bold">معادلة مجموع الكاش:</span> النقد الافتتاحي + إضافة ذمم + المبيعات + مبيعات أخرى.
              </div>
            </div>

            {/* 2. ملخص الجرد والمصاريف .2 */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
              <div className="bg-sky-800 text-white font-black text-sm px-4 py-3 text-center border-b border-sky-900">
                2. ملخص الجرد والمصاريف
              </div>

              <table className="w-full text-right text-xs">
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* نقد (الكاش الفعلي) - Yellow Highlight in image */}
                  <tr className="bg-yellow-100/70 hover:bg-yellow-100">
                    <td className="p-2.5 font-black text-slate-900 text-xs">نقد (الكاش الفعلي)</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.1"
                        value={report.actualCashInDrawer === 0 ? '' : report.actualCashInDrawer}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ actualCashInDrawer: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-400 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* فيزا - Yellow Highlight in image */}
                  <tr className="bg-yellow-100/70 hover:bg-yellow-100">
                    <td className="p-2.5 font-black text-slate-900 text-xs">فيزا</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.01"
                        value={report.visaPOS === 0 ? '' : report.visaPOS}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ visaPOS: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-400 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* Rt - Yellow Highlight in image */}
                  <tr className="bg-yellow-100/70 hover:bg-yellow-100">
                    <td className="p-2.5 font-black text-slate-900 text-xs">Rt</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.01"
                        value={report.rtPOS === 0 ? '' : report.rtPOS}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ rtPOS: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-400 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* مايسترو - Yellow Highlight in image */}
                  <tr className="bg-yellow-100/70 hover:bg-yellow-100">
                    <td className="p-2.5 font-black text-slate-900 text-xs">مايسترو</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.01"
                        value={report.maestroPOS === 0 ? '' : report.maestroPOS}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ maestroPOS: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-400 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* فرق سعر - Yellow Highlight in image */}
                  <tr className="bg-yellow-100/70 hover:bg-yellow-100">
                    <td className="p-2.5 font-black text-slate-900 text-xs">فرق سعر</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.01"
                        value={report.priceDiff === 0 ? '' : report.priceDiff}
                        placeholder="0.00"
                        onChange={(e) => onUpdateReport({ priceDiff: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-400 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* سلف */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>سلف</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('staff')}
                        className="text-[10px] text-teal-700 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded font-bold border border-teal-200"
                      >
                        تفصيل السلف 👥
                      </button>
                    </td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalAdvances === 0 ? '' : summary.totalAdvances}
                        placeholder="0.00"
                        readOnly
                        title="يتم احتسابها تلقائياً من كشف الموظفين أو يمكن تعديلها في كشف الموظفين"
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-slate-100 text-slate-900"
                      />
                    </td>
                  </tr>

                  {/* المحفظة */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">المحفظة</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.1"
                        value={summary.totalWallet === 0 ? '' : summary.totalWallet}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('walletExpenses', parseFloat(e.target.value) || 0, 'محفظة')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* مشتريات */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>مشتريات</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('purchases')}
                        className="text-[10px] text-orange-700 bg-orange-50 hover:bg-orange-100 px-1.5 py-0.5 rounded font-bold border border-orange-200"
                      >
                        كشف الفواتير 📋
                      </button>
                    </td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.1"
                        value={summary.totalPurchases === 0 ? '' : summary.totalPurchases}
                        placeholder="0.00"
                        onChange={(e) => handleDirectPurchasesUpdate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* سداد ذمم تجار */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">سداد ذمم تجار</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalVendorDebtsPaid === 0 ? '' : summary.totalVendorDebtsPaid}
                        placeholder="0.00"
                        onChange={(e) => handleDirectVendorDebtsPaidUpdate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* مصاريف أخرى */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">مصاريف أخرى</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalOtherExpenses === 0 ? '' : summary.totalOtherExpenses}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('otherExpenses', parseFloat(e.target.value) || 0, 'متفرقات')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* الشقة */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">الشقة</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.05"
                        value={summary.totalApartmentExpenses === 0 ? '' : summary.totalApartmentExpenses}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('apartmentExpenses', parseFloat(e.target.value) || 0, 'أغراض الشقة')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* مصاريف إدارية */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">مصاريف إدارية</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalAdminExpenses === 0 ? '' : summary.totalAdminExpenses}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('adminExpenses', parseFloat(e.target.value) || 0, 'مصاريف إدارية')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* يحيى */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">يحيى</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalYahya === 0 ? '' : summary.totalYahya}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('yahyaAccount', parseFloat(e.target.value) || 0, 'اوردر')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* أبو عبدالله */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">أبو عبدالله</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalAbuAbdullah === 0 ? '' : summary.totalAbuAbdullah}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('abuAbdullahAccount', parseFloat(e.target.value) || 0, 'سحب')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* بهارات */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">بهارات</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalSpices === 0 ? '' : summary.totalSpices}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('spices', parseFloat(e.target.value) || 0, 'بهارات')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* معدات وصيانة */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 text-xs">معدات وصيانة</td>
                    <td className="p-1.5 w-40">
                      <input
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={summary.totalMaintenance === 0 ? '' : summary.totalMaintenance}
                        placeholder="0.00"
                        onChange={(e) => handleDirectSingleExpenseUpdate('maintenance', parseFloat(e.target.value) || 0, 'صيانة')}
                        className="w-full px-2.5 py-1.5 text-center font-mono font-black text-xs rounded border border-slate-300 bg-white focus:border-sky-500 text-slate-950"
                      />
                    </td>
                  </tr>

                  {/* مجموع الجرد (Auto Calculated) */}
                  <tr className="bg-sky-100/90 font-black border-t-2 border-sky-300">
                    <td className="p-3 text-slate-950 text-sm">مجموع الجرد</td>
                    <td className="p-3 text-center font-mono text-base font-black text-sky-950">
                      {formatNumber(summary.totalReconciledInventory)}
                    </td>
                  </tr>

                  {/* نقص الكاش (Auto Calculated) */}
                  <tr className="bg-rose-50 font-bold border-t border-rose-200">
                    <td className="p-2.5 text-rose-950 text-xs">نقص الكاش</td>
                    <td className="p-2.5 text-center font-mono font-black text-sm text-rose-700">
                      {summary.differenceType === 'shortage' ? formatNumber(Math.abs(summary.cashDifference)) : '0.00'}
                    </td>
                  </tr>

                  {/* زيادة الكاش (Auto Calculated) */}
                  <tr className="bg-emerald-50 font-bold border-t border-emerald-200">
                    <td className="p-2.5 text-emerald-950 text-xs">زيادة الكاش</td>
                    <td className="p-2.5 text-center font-mono font-black text-sm text-emerald-700">
                      {summary.differenceType === 'surplus' ? formatNumber(summary.cashDifference) : '0.00'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Purchases */}
      {activeTab === 'purchases' && (
        <PurchasesSection
          purchases={report.purchases}
          onChange={(purchases) => onUpdateReport({ purchases })}
        />
      )}

      {/* Tab 3: Staff */}
      {activeTab === 'staff' && (
        <EmployeesSection
          employees={report.employees}
          onChange={(employees) => onUpdateReport({ employees })}
        />
      )}

      {/* Tab 4: Expenses & Debts */}
      {activeTab === 'expenses' && (
        <ExpensesSection report={report} onChange={onUpdateReport} />
      )}

      {/* Tab 5: Kitchen & Production */}
      {activeTab === 'kitchen' && (
        <KitchenShiftsSection
          kitchenConsumption={report.kitchenConsumption}
          productionItems={report.productionItems}
          onChangeKitchen={(kitchenConsumption) => onUpdateReport({ kitchenConsumption })}
          onChangeProduction={(productionItems) => onUpdateReport({ productionItems })}
        />
      )}
    </div>
  );
};
