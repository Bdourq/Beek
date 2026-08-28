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
  AlertTriangle,
  Wallet,
  ShieldCheck,
  Users
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

  const custodyList = report.custodyClaims || [
    { id: 'cust_1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' }
  ];

  const totalCustodyForThem = custodyList.reduce((sum, c) => sum + (Number(c.forThem) || 0), 0);
  const totalCustodyOnThem = custodyList.reduce((sum, c) => sum + (Number(c.onThem) || 0), 0);

  return (
    <div id="unified-report-view" className="space-y-6 max-w-4xl mx-auto text-slate-900 font-sans pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <AlBaikLogo size="sm" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">عرض تقرير إغلاق الكاش اليومي الشامل</h3>
            <p className="text-xs text-slate-500">مطابق تماماً لنموذج PDF والإكسيل الرسمي مع جدول العُهد والمحفظة</p>
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
          <span>1. بيانات الكاش والمبيعات وملخص الجرد والمحفظة</span>
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
                <tr className="bg-yellow-50/50">
                  <td className="p-2 font-black text-slate-900">نقد (الكاش الفعلي)</td>
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

        {/* Custody Table (3 Rows - له وعليه) */}
        <div className="mt-6 border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2 font-black text-xs flex items-center justify-between">
            <span>جدول العُهد (3 أسطر - له وعليه)</span>
            <span className="text-[11px] font-normal text-slate-300">
              له: هو يريد من الكاش | عليه: الكاش يريد منه
            </span>
          </div>
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 w-10 text-center">م</th>
                <th className="p-2">الاسم / صاحب العهدة</th>
                <th className="p-2 text-center w-28 bg-emerald-50 text-emerald-950">له (يريد من الكاش)</th>
                <th className="p-2 text-center w-28 bg-rose-50 text-rose-950">عليه (الكاش يريد منه)</th>
                <th className="p-2">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {custodyList.slice(0, 3).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="p-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-2 font-semibold text-slate-900">{item.person || `عهدة ${idx + 1}`}</td>
                  <td className="p-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                    {item.forThem > 0 ? formatNumber(item.forThem) : '-'}
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-rose-700 bg-rose-50/40">
                    {item.onThem > 0 ? formatNumber(item.onThem) : '-'}
                  </td>
                  <td className="p-2 text-slate-600">{item.notes || '-'}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-300">
                <td colSpan={2} className="p-2 text-slate-900 text-center">المجموع</td>
                <td className="p-2 text-center font-mono text-emerald-800">{formatNumber(totalCustodyForThem)}</td>
                <td className="p-2 text-center font-mono text-rose-800">{formatNumber(totalCustodyOnThem)}</td>
                <td className="p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: 2. المصاريف والمشتريات التفصيلية (المشتريات أولاً) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 page-break-after">
        <h2 className="text-base font-black text-slate-900 border-b-2 border-sky-600 pb-1 mb-6">
          2. المشتريات والمصاريف التفصيلية (المشتريات أولاً)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* مشتريات (أول جدول) */}
          <div className="space-y-6">
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-orange-100 text-orange-950 font-black border-b border-orange-200">
                    <th className="p-2">جدول المشتريات (البيان)</th>
                    <th className="p-2 text-left">المبلغ (د.أ)</th>
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
                  <tr className="bg-orange-50 font-black">
                    <td className="p-2 text-orange-950">إجمالي المشتريات</td>
                    <td className="p-2 font-mono text-left text-orange-950 font-black">
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
                  <tr className="bg-indigo-100 text-indigo-950 font-black border-b border-indigo-200">
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
                  <tr className="bg-indigo-50 font-black">
                    <td className="p-2 text-indigo-950">إجمالي المحفظة</td>
                    <td className="p-2 font-mono text-left text-indigo-950">
                      {formatNumber(summary.totalWallet)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* مصاريف إدارية + شقة + حسابات */}
          <div className="space-y-6">
            <div className="border border-slate-300 rounded-lg overflow-hidden">
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

            {/* الذمم والمصاريف الأخرى */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <th className="p-2">سداد ذمم تجار ومصاريف أخرى</th>
                    <th className="p-2 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.vendorDebtsPaid.map((v) => (
                    <tr key={v.id}>
                      <td className="p-2 text-slate-700">سداد ذمة: {v.vendorName}</td>
                      <td className="p-2 font-mono font-bold text-left text-slate-900">
                        {formatNumber(v.amount)}
                      </td>
                    </tr>
                  ))}
                  {report.otherExpenses.map((o) => (
                    <tr key={o.id}>
                      <td className="p-2 text-slate-700">مصاريف أخرى: {o.name}</td>
                      <td className="p-2 font-mono font-bold text-left text-slate-900">
                        {formatNumber(o.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: 3. سجل سلف الموظفين والدوام واليوميات المحسوبة */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-8 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b-2 border-sky-600 pb-2 mb-4">
          <h2 className="text-base font-black text-slate-900">
            3. سجل كادر الموظفين والدوام والسلف واليوميات (28 موظفاً)
          </h2>
          <span className="text-xs font-bold text-slate-600">
            إجمالي السلف: <span className="font-mono font-black text-amber-800">{formatNumber(summary.totalAdvances)} د.أ</span>
          </span>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                <th className="p-2 text-center w-10">م</th>
                <th className="p-2">اسم الموظف</th>
                <th className="p-2 text-center w-24">نوع التوظيف</th>
                <th className="p-2 text-center w-24 bg-amber-50 text-amber-950">السلفة (د.أ)</th>
                <th className="p-2 text-center w-16">دخول</th>
                <th className="p-2 text-center w-16">خروج</th>
                <th className="p-2 text-center w-16">الساعات</th>
                <th className="p-2 text-center w-24">أجر الساعة</th>
                <th className="p-2 text-center w-28 bg-emerald-50 text-emerald-950">الأجرة المحسوبة</th>
                <th className="p-2 text-center w-28">التوقيع / ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.employees.map((emp, index) => {
                const isDaily = (emp.employmentType || 'daily') === 'daily';
                return (
                  <tr key={emp.id} className={emp.advance > 0 ? 'bg-amber-50/40' : !isDaily ? 'bg-indigo-50/20' : ''}>
                    <td className="p-2 text-center text-slate-500 font-mono">{index + 1}</td>
                    <td className="p-2 font-bold text-slate-900">{emp.name}</td>
                    <td className="p-2 text-center">
                      {isDaily ? (
                        <span className="text-[10px] bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded font-bold">
                          مياومة
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-100 text-indigo-950 px-1.5 py-0.5 rounded font-bold">
                          شهري
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-amber-900 bg-amber-50/30">
                      {emp.advance > 0 ? formatNumber(emp.advance) : '-'}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">{emp.shiftIn || '-'}</td>
                    <td className="p-2 text-center font-mono text-slate-700">{emp.shiftOut || '-'}</td>
                    <td className="p-2 text-center font-mono text-sky-800">
                      {emp.hoursWorked ? `${emp.hoursWorked} س` : '-'}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">
                      {isDaily && emp.hourlyRate ? `${formatNumber(emp.hourlyRate)} د.أ` : '-'}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-emerald-800 bg-emerald-50/30">
                      {isDaily && emp.calculatedWage && emp.calculatedWage > 0 ? `${formatNumber(emp.calculatedWage)} د.أ` : (
                        <span className="text-slate-400 font-normal text-[10px]">
                          {isDaily ? '0.00' : 'راتب شهري'}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center text-slate-600">
                      {emp.signed ? (emp.notes ? `موقع (${emp.notes})` : 'موقع ✓') : (emp.notes || '-')}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <td colSpan={3} className="p-2.5 text-center text-sm">
                  المجموع
                </td>
                <td className="p-2.5 text-center font-mono text-sm text-amber-950">
                  {formatNumber(summary.totalAdvances)}
                </td>
                <td colSpan={4}></td>
                <td className="p-2.5 text-center font-mono text-sm text-emerald-950">
                  {formatNumber(
                    report.employees.reduce((sum, e) => {
                      const isDaily = (e.employmentType || 'daily') === 'daily';
                      return sum + (isDaily ? (Number(e.calculatedWage) || 0) : 0);
                    }, 0)
                  )} د.أ
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
