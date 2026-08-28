import React from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { exportDailyReportToExcel } from '../utils/excelExport';
import { AlBaikLogo } from './AlBaikLogo';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface UnifiedReportViewProps {
  report: DailyReport;
  summary: SummaryCalculations;
}

export const UnifiedReportView: React.FC<UnifiedReportViewProps> = ({ report, summary }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportDailyReportToExcel(report);
  };

  return (
    <div id="unified-report-view" className="space-y-6 max-w-4xl mx-auto text-slate-900 font-sans pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <AlBaikLogo size="sm" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">عرض تقرير إغلاق الكاش اليومي الشامل</h3>
            <p className="text-xs text-slate-500">مطابق تماماً لنموذج PDF والإكسيل الرسمي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel طبق الأصل</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-yellow-400" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: 1. بيانات الكاش والمبيعات وملخص الجرد */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 page-break-after">
        {/* Header Title Box */}
        <div className="bg-slate-900 text-white p-5 rounded-xl text-center mb-6">
          <h1 className="text-2xl font-black tracking-wide">مطعم يحيى البيك</h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">تقرير إغلاق الكاش اليومي الشامل</p>
        </div>

        {/* Date and Day Row */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-6 font-bold text-sm">
          <div>
            <span className="text-slate-500">اليوم: </span>
            <span className="text-slate-900">{report.dayName}</span>
          </div>
          <div>
            <span className="text-slate-500">التاريخ: </span>
            <span className="text-slate-900 font-mono">{report.date}</span>
          </div>
        </div>

        {/* Section 1 Title */}
        <h2 className="text-base font-black text-slate-900 border-b-2 border-sky-600 pb-1 mb-4 flex items-center gap-2">
          <span>1. بيانات الكاش والمبيعات وملخص الجرد</span>
        </h2>

        {/* Two-Column Side-by-Side Table (Exact to image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Right Column: بيانات الكاش والمبيعات */}
          <div className="border border-slate-300 rounded-lg overflow-hidden h-fit">
            <div className="bg-slate-100 px-4 py-2 font-black text-center text-xs border-b border-slate-300 text-slate-800">
              بيانات الكاش والمبيعات
            </div>
            <table className="w-full text-xs text-right">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium text-slate-700">النقد الافتتاحي</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.openingCash > 0 ? formatNumber(report.openingCash) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">اضافة ذمم</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalVendorDebtsAdded > 0 ? formatNumber(summary.totalVendorDebtsAdded) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">تسديد ذمم قديمة</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalVendorDebtsPaid > 0 ? formatNumber(summary.totalVendorDebtsPaid) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مبيعات</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.sales > 0 ? formatNumber(report.sales) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مبيعات أخرى</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.otherSales > 0 ? formatNumber(report.otherSales) : '-'}
                  </td>
                </tr>
                <tr className="bg-slate-200/80 font-black">
                  <td className="p-2.5 text-slate-900">مجموع الكاش</td>
                  <td className="p-2.5 font-mono text-left text-slate-950">
                    {formatNumber(summary.totalGrossCashAvailable)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Left Column: ملخص الجرد الفعلي */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-black text-center text-xs border-b border-slate-300 text-slate-800">
              ملخص الجرد الفعلي
            </div>
            <table className="w-full text-xs text-right">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium text-slate-700">نقد (الكاش الفعلي)</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.actualCashInDrawer > 0 ? formatNumber(report.actualCashInDrawer) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">فيزا</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.visaPOS > 0 ? formatNumber(report.visaPOS) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">Rt</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.rtPOS > 0 ? formatNumber(report.rtPOS) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مايسترو</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.maestroPOS > 0 ? formatNumber(report.maestroPOS) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">فرق سعر</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {report.priceDiff > 0 ? formatNumber(report.priceDiff) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">سلف</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalAdvances > 0 ? formatNumber(summary.totalAdvances) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">المحفظة</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalWallet > 0 ? formatNumber(summary.totalWallet) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مشتريات</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalPurchases > 0 ? formatNumber(summary.totalPurchases) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">سداد ذمم تجار</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalVendorDebtsPaid > 0 ? formatNumber(summary.totalVendorDebtsPaid) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مصاريف أخرى</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalOtherExpenses > 0 ? formatNumber(summary.totalOtherExpenses) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">الشقة</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalApartmentExpenses > 0 ? formatNumber(summary.totalApartmentExpenses) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">مصاريف إدارية</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalAdminExpenses > 0 ? formatNumber(summary.totalAdminExpenses) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">يحيى</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalYahya > 0 ? formatNumber(summary.totalYahya) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">أبو عبدالله</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalAbuAbdullah > 0 ? formatNumber(summary.totalAbuAbdullah) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">بهارات</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalSpices > 0 ? formatNumber(summary.totalSpices) : '0.00'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-700">معدات وصيانة</td>
                  <td className="p-2 font-mono font-bold text-left text-slate-900">
                    {summary.totalMaintenance > 0 ? formatNumber(summary.totalMaintenance) : '0.00'}
                  </td>
                </tr>
                <tr className="bg-sky-50 font-black border-t-2 border-slate-300">
                  <td className="p-2.5 text-slate-900">مجموع الجرد</td>
                  <td className="p-2.5 font-mono text-left text-slate-950">
                    {formatNumber(summary.totalReconciledInventory)}
                  </td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td className="p-2 font-bold text-slate-800">نقص الكاش</td>
                  <td className="p-2 font-mono font-bold text-left text-rose-700">
                    {summary.differenceType === 'shortage' ? formatNumber(Math.abs(summary.cashDifference)) : '0.00'}
                  </td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="p-2 font-bold text-slate-800">زيادة الكاش</td>
                  <td className="p-2 font-mono font-bold text-left text-emerald-700">
                    {summary.differenceType === 'surplus' ? formatNumber(summary.cashDifference) : '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: 2. المصاريف والمشتريات التفصيلية */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 page-break-after">
        <h2 className="text-base font-black text-slate-900 border-b-2 border-sky-600 pb-1 mb-6">
          2. المصاريف والمشتريات التفصيلية
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* مشتريات (البيان) + المحفظة */}
          <div className="space-y-6">
            {/* مشتريات */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <th className="p-2">مشتريات (البيان)</th>
                    <th className="p-2 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.purchases.length > 0 ? (
                    report.purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 text-slate-700">{p.name || 'مادة'}</td>
                        <td className="p-2 font-mono font-bold text-left text-slate-900">
                          {formatNumber(p.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-slate-400">
                        لا توجد مسجلات
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2 text-slate-900">الإجمالي</td>
                    <td className="p-2 font-mono text-left text-slate-950">
                      {formatNumber(summary.totalPurchases)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* المحفظة الإلكترونية */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <th className="p-2">المحفظة الإلكترونية</th>
                    <th className="p-2 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.walletExpenses && report.walletExpenses.length > 0 ? (
                    report.walletExpenses.map((w) => (
                      <tr key={w.id}>
                        <td className="p-2 text-slate-700">{w.name || 'محفظة'}</td>
                        <td className="p-2 font-mono font-bold text-left text-slate-900">
                          {formatNumber(w.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-slate-400">
                        لا توجد مسجلات
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2 text-slate-900">الإجمالي</td>
                    <td className="p-2 font-mono text-left text-slate-950">
                      {formatNumber(summary.totalWallet)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* مصاريف إدارية */}
          <div className="border border-slate-300 rounded-lg overflow-hidden h-fit">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th className="p-2">مصاريف إدارية</th>
                  <th className="p-2 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'].map(
                  (item) => {
                    const match = report.adminExpenses.find((a) => a.name.includes(item));
                    const val = match?.amount || 0;
                    return (
                      <tr key={item}>
                        <td className="p-2 text-slate-700">{item}</td>
                        <td className="p-2 font-mono font-bold text-left text-slate-900">
                          {val > 0 ? formatNumber(val) : '-'}
                        </td>
                      </tr>
                    );
                  }
                )}
                {report.adminExpenses
                  .filter(
                    (a) =>
                      !['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'].some(
                        (x) => a.name.includes(x)
                      )
                  )
                  .map((extra) => (
                    <tr key={extra.id}>
                      <td className="p-2 text-slate-700">{extra.name}</td>
                      <td className="p-2 font-mono font-bold text-left text-slate-900">
                        {extra.amount > 0 ? formatNumber(extra.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                <tr className="bg-slate-50 font-black">
                  <td className="p-2 text-slate-900">الإجمالي</td>
                  <td className="p-2 font-mono text-left text-slate-950">
                    {formatNumber(summary.totalAdminExpenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: 3. سجل سلف الموظفين اليومية */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
        <h2 className="text-base font-black text-slate-900 border-b-2 border-sky-600 pb-1 mb-4">
          3. سجل سلف الموظفين اليومية
        </h2>

        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                <th className="p-2 text-center w-12">م</th>
                <th className="p-2">اسم الموظف</th>
                <th className="p-2 text-center w-28">قيمة السلفة</th>
                <th className="p-2 text-center w-36">التوقيع / ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.employees.map((emp, index) => (
                <tr key={emp.id} className={emp.advance > 0 ? 'bg-amber-50/40' : ''}>
                  <td className="p-2 text-center text-slate-500 font-mono">{index + 1}</td>
                  <td className="p-2 font-semibold text-slate-800">{emp.name}</td>
                  <td className="p-2 text-center font-mono font-bold text-slate-900">
                    {emp.advance > 0 ? formatNumber(emp.advance) : '-'}
                  </td>
                  <td className="p-2 text-center text-slate-600">
                    {emp.signed ? (emp.notes ? `موقع (${emp.notes})` : 'موقع') : (emp.notes || '-')}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <td colSpan={2} className="p-2.5 text-center text-sm">
                  إجمالي السلف
                </td>
                <td className="p-2.5 text-center font-mono text-sm text-slate-950">
                  {formatNumber(summary.totalAdvances)}
                </td>
                <td className="p-2.5"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
