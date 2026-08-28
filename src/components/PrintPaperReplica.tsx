import React from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { formatNumber } from '../utils/calculations';
import { calculateShiftHours, computeHourlyWage } from './EmployeesSection';
import { AlBaikLogo } from './AlBaikLogo';

interface PrintPaperReplicaProps {
  report: DailyReport;
  summary: SummaryCalculations;
}

export const PrintPaperReplica: React.FC<PrintPaperReplicaProps> = ({ report, summary }) => {
  const custodyList = report.custodyClaims || [
    { id: 'cust_1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' }
  ];

  const totalDailyWages = report.employees.reduce((sum, e) => {
    const isDaily = (e.employmentType || 'daily') === 'daily';
    if (!isDaily) return sum;
    const hours = e.hoursWorked ?? calculateShiftHours(e.shiftIn, e.shiftOut);
    const wage = e.calculatedWage ?? computeHourlyWage(hours, e.hourlyRate || 1.5, 'daily');
    return sum + (Number(wage) || 0);
  }, 0);

  const totalStaffHours = report.employees.reduce((sum, e) => {
    const hours = e.hoursWorked ?? calculateShiftHours(e.shiftIn, e.shiftOut);
    return sum + (Number(hours) || 0);
  }, 0);

  return (
    <div className="print-only-container hidden print:block text-black bg-white text-[10px] leading-tight font-['IBM_Plex_Sans_Arabic','Cairo',sans-serif]">
      {/* ========================================================================= */}
      {/* PAGE 1 (الوجه الأول - كشف الجرد والمصاريف والمشتريات وحركة الإنتاج) */}
      {/* ========================================================================= */}
      <div className="print-page page-break-after p-3 border-2 border-black rounded-lg mb-4 min-h-[980px] flex flex-col justify-between">
        <div>
          {/* Header Banner */}
          <div className="border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlBaikLogo size="xs" />
                <div>
                  <h1 className="text-base font-black text-black">مطعم يحيى البيك - شاورما وسناكات</h1>
                  <h2 className="text-xs font-bold text-gray-800">
                    كشف إغلاق الكاش اليومي والجرد الفعلي والمصاريف (الوجه الأول)
                  </h2>
                </div>
              </div>
              <div className="text-left border border-black p-1.5 rounded bg-gray-50 text-[11px] font-bold">
                <div>اليوم: <span className="font-black text-black">{report.dayName}</span></div>
                <div>التاريخ: <span className="font-mono font-black">{report.date}</span></div>
                <div>الكاشير: <span className="font-black">{report.cashierName || 'كاشير الشفت'}</span></div>
              </div>
            </div>
          </div>

          {/* Section 1: Side-by-Side Cash Balance and Inventory Summary */}
          <div className="grid grid-cols-12 gap-2 mb-2 border border-black p-2 rounded bg-gray-50/50">
            {/* Left: ملخص الجرد الفعلي والمصاريف المقابلة (7 cols) */}
            <div className="col-span-7 border-l border-black pl-2">
              <div className="bg-black text-white font-black text-center py-0.5 rounded mb-1 text-[11px]">
                ملخص الجرد الفعلي والمصاريف المقابلة
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-black bg-yellow-50 px-1">
                  <span>نقد (في الدرج):</span>
                  <span className="font-mono">{formatNumber(report.actualCashInDrawer)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>مشتريات:</span>
                  <span className="font-mono">{formatNumber(summary.totalPurchases)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>سلف الكادر:</span>
                  <span className="font-mono">{formatNumber(summary.totalAdvances)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>سداد تجار:</span>
                  <span className="font-mono">{formatNumber(summary.totalVendorDebtsPaid)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>المحفظة الإلكترونية:</span>
                  <span className="font-mono">{formatNumber(summary.totalWallet)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>مصاريف إدارية:</span>
                  <span className="font-mono">{formatNumber(summary.totalAdminExpenses)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>الشقة:</span>
                  <span className="font-mono">{formatNumber(summary.totalApartmentExpenses)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>مصاريف أخرى:</span>
                  <span className="font-mono">{formatNumber(summary.totalOtherExpenses)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>حساب يحيى:</span>
                  <span className="font-mono">{formatNumber(summary.totalYahya)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>أبو عبدالله:</span>
                  <span className="font-mono">{formatNumber(summary.totalAbuAbdullah)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>فيزا (بطاقات):</span>
                  <span className="font-mono">{formatNumber(report.visaPOS)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>RT (ملغاة):</span>
                  <span className="font-mono">{formatNumber(report.rtPOS)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>مايسترو:</span>
                  <span className="font-mono">{formatNumber(report.maestroPOS)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>فرق سعر:</span>
                  <span className="font-mono">{formatNumber(report.priceDiff)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>بهارات:</span>
                  <span className="font-mono">{formatNumber(summary.totalSpices)} د.أ</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                  <span>معدات وصيانة:</span>
                  <span className="font-mono">{formatNumber(summary.totalMaintenance)} د.أ</span>
                </div>
              </div>

              {/* Total Reconciled */}
              <div className="mt-1.5 pt-1 border-t-2 border-black flex justify-between items-center bg-gray-100 p-1 rounded font-black text-[11px]">
                <span>مجموع الجرد الفعلي:</span>
                <span className="font-mono text-sm">{formatNumber(summary.totalReconciledInventory)} د.أ</span>
              </div>
            </div>

            {/* Right: حركة الكاش والمبيعات والفرق (5 cols) */}
            <div className="col-span-5 pr-1 flex flex-col justify-between">
              <div>
                <div className="bg-black text-white font-black text-center py-0.5 rounded mb-1 text-[11px]">
                  حركة الكاش والمبيعات
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                    <span>النقد الافتتاحي:</span>
                    <span className="font-mono">{formatNumber(report.openingCash)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                    <span>إضافة ذمم تجار:</span>
                    <span className="font-mono">{formatNumber(summary.totalVendorDebtsAdded)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                    <span>تسديد ذمم قديمة:</span>
                    <span className="font-mono">{formatNumber(summary.totalVendorDebtsPaid)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 py-0.5 font-black bg-amber-50 px-1">
                    <span>مبيعات اليوم:</span>
                    <span className="font-mono">{formatNumber(report.sales)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 py-0.5 font-bold">
                    <span>مبيعات أخرى:</span>
                    <span className="font-mono">{formatNumber(report.otherSales)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-black pt-1 font-black bg-indigo-50 px-1 text-[11px]">
                    <span>مجموع الكاش المتوفر:</span>
                    <span className="font-mono">{formatNumber(summary.totalGrossCashAvailable)} د.أ</span>
                  </div>
                </div>
              </div>

              {/* Status / Difference Box */}
              <div className="mt-2 border-2 border-black p-1.5 rounded text-center font-black text-xs">
                {summary.differenceType === 'balanced' && (
                  <div className="bg-emerald-100 text-emerald-950 p-1 rounded">
                    مطابقة تامة للكاش (0.00 د.أ)
                  </div>
                )}
                {summary.differenceType === 'surplus' && (
                  <div className="bg-blue-100 text-blue-950 p-1 rounded">
                    زيادة في الكاش: +{formatNumber(summary.cashDifference)} د.أ
                  </div>
                )}
                {summary.differenceType === 'shortage' && (
                  <div className="bg-rose-100 text-rose-950 p-1 rounded">
                    نقص / عجز في الكاش: {formatNumber(summary.cashDifference)} د.أ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: جدول العُهد (3 أسطر: له وعليه) */}
          <div className="mb-2 border border-black rounded overflow-hidden">
            <div className="bg-gray-800 text-white font-black px-2 py-0.5 text-[10px] flex justify-between">
              <span>جدول العُهد (له وعليه - 3 أسطر)</span>
              <span>المجموع: له ({formatNumber(custodyList.reduce((s, c) => s + (Number(c.forThem) || 0), 0))} د.أ) - عليه ({formatNumber(custodyList.reduce((s, c) => s + (Number(c.onThem) || 0), 0))} د.أ)</span>
            </div>
            <table className="w-full text-center text-[10px] border-collapse">
              <thead className="bg-gray-100 font-bold border-b border-black">
                <tr>
                  <th className="p-0.5 border-l border-gray-300 w-8">م</th>
                  <th className="p-0.5 border-l border-gray-300 text-right pr-2">البيان / صاحب العهدة</th>
                  <th className="p-0.5 border-l border-gray-300 w-28">له (يريد من الكاش)</th>
                  <th className="p-0.5 border-l border-gray-300 w-28">عليه (الكاش يريد منه)</th>
                  <th className="p-0.5 text-right pr-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {custodyList.slice(0, 3).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="p-0.5 border-l border-gray-300 font-mono font-bold">{idx + 1}</td>
                    <td className="p-0.5 border-l border-gray-300 text-right pr-2 font-bold">{item.person || `عهدة ${idx + 1}`}</td>
                    <td className="p-0.5 border-l border-gray-300 font-mono font-bold">{item.forThem > 0 ? `${formatNumber(item.forThem)} د.أ` : '-'}</td>
                    <td className="p-0.5 border-l border-gray-300 font-mono font-bold">{item.onThem > 0 ? `${formatNumber(item.onThem)} د.أ` : '-'}</td>
                    <td className="p-0.5 text-right pr-2 text-gray-700">{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Tables Grid: المشتريات أولاً والمصاريف التفصيلية */}
          <div className="grid grid-cols-12 gap-2 mb-2">
            {/* المشتريات أولاً (6 cols) */}
            <div className="col-span-6 border border-black rounded overflow-hidden">
              <div className="bg-orange-700 text-white font-black px-2 py-0.5 text-[10px] flex justify-between">
                <span>جدول المشتريات اليومية (المشتريات أولاً)</span>
                <span className="font-mono">{formatNumber(summary.totalPurchases)} د.أ</span>
              </div>
              <table className="w-full text-[9.5px] border-collapse">
                <thead className="bg-gray-100 font-bold border-b border-black text-center">
                  <tr>
                    <th className="p-0.5 border-l border-gray-300 w-6">م</th>
                    <th className="p-0.5 border-l border-gray-300 text-right pr-1">بيان المادة</th>
                    <th className="p-0.5 w-16">المبلغ (د.أ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.purchases.length > 0 ? (
                    report.purchases.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td className="p-0.5 text-center border-l border-gray-300 font-mono">{idx + 1}</td>
                        <td className="p-0.5 border-l border-gray-300 font-bold pr-1">{p.name}</td>
                        <td className="p-0.5 text-center font-mono font-bold">{formatNumber(p.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-1 text-center text-gray-400">لا توجد مسجلات مشتريات</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100 font-black border-t border-black">
                  <tr>
                    <td colSpan={2} className="p-0.5 text-right pr-2">إجمالي المشتريات:</td>
                    <td className="p-0.5 text-center font-mono">{formatNumber(summary.totalPurchases)} د.أ</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* المحفظة والمصاريف الإدارية والشقة وباقي البنود (6 cols) */}
            <div className="col-span-6 space-y-1.5">
              {/* المحفظة الإلكترونية */}
              <div className="border border-black rounded overflow-hidden">
                <div className="bg-indigo-800 text-white font-black px-2 py-0.5 text-[10px] flex justify-between">
                  <span>المحفظة الإلكترونية والمصاريف الإدارية</span>
                  <span className="font-mono">{formatNumber(summary.totalWallet + summary.totalAdminExpenses)} د.أ</span>
                </div>
                <div className="p-1 grid grid-cols-2 gap-1 text-[9.5px]">
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">المحفظة (Zain/CliQ):</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalWallet)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">الشقة وسكن العمال:</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalApartmentExpenses)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">حساب يحيى:</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalYahya)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">حساب أبو عبدالله:</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalAbuAbdullah)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">بهارات:</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalSpices)} د.أ</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-0.5">
                    <span className="font-bold">معدات وصيانة:</span>
                    <span className="font-mono font-bold">{formatNumber(summary.totalMaintenance)} د.أ</span>
                  </div>
                </div>
              </div>

              {/* ذمم التجار (إضافة وسداد) */}
              <div className="border border-black rounded overflow-hidden">
                <div className="bg-gray-700 text-white font-black px-2 py-0.5 text-[10px] flex justify-between">
                  <span>حركة ذمم التجار</span>
                  <span>إضافة: {formatNumber(summary.totalVendorDebtsAdded)} | سداد: {formatNumber(summary.totalVendorDebtsPaid)}</span>
                </div>
                <div className="p-1 grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="font-black text-gray-900 block border-b border-gray-300 pb-0.5">سداد تجار:</span>
                    {report.vendorDebtsPaid.map((v, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span>{v.vendorName}:</span>
                        <span className="font-mono font-bold">{formatNumber(v.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="font-black text-gray-900 block border-b border-gray-300 pb-0.5">إضافة ذمم:</span>
                    {report.vendorDebtsAdded.map((v, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span>{v.vendorName}:</span>
                        <span className="font-mono font-bold">{formatNumber(v.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Kitchen Consumables & Shifts Production */}
          <div className="border border-black rounded p-1.5 bg-gray-50/80 mb-2">
            <div className="font-black text-[10px] text-gray-900 border-b border-black pb-0.5 mb-1 flex justify-between">
              <span>استهلاك المطبخ والإنتاج اليومي</span>
              <span>حركة الأسياخ والوجبات</span>
            </div>
            <div className="grid grid-cols-8 gap-1 text-center text-[9px]">
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">سيخ 1 (رز):</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.rice1 || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">سيخ 2 (رز):</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.rice2 || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">لوز:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.almonds || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">بطاطا:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.potatoes || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">تزويد:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.supplyIn || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">مرتجع:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.returns || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">جنات:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.jannat || '-'}</span>
              </div>
              <div className="border border-gray-300 bg-white p-0.5 rounded">
                <span className="block text-gray-600">قشرة:</span>
                <span className="font-mono font-bold">{report.kitchenConsumption.peel || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures Page 1 */}
        <div className="border-t-2 border-black pt-1.5 flex justify-between items-center text-[10px] font-bold">
          <div>توقيع الكاشير: <span className="underline mr-2">{report.cashierName || '___________________'}</span></div>
          <div>ختم واعتماد الإدارة: <span className="underline mr-2">مطعم يحيى البيك</span></div>
          <div className="font-mono text-gray-500">صفحة 1 من 2 (الوجه الأمامي)</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2 (الوجه الثاني - كشف كادر الموظفين الـ 28 وسجل الأقسام) */}
      {/* ========================================================================= */}
      <div className="print-page p-3 border-2 border-black rounded-lg min-h-[980px] flex flex-col justify-between">
        <div>
          {/* Header Banner Page 2 */}
          <div className="border-b-2 border-black pb-2 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlBaikLogo size="xs" />
                <div>
                  <h1 className="text-base font-black text-black">مطعم يحيى البيك - كشف كادر الموظفين</h1>
                  <h2 className="text-xs font-bold text-gray-800">
                    سجل الدوام والحضور والسلف واليوميات المحسوبة (28 موظف - الوجه الثاني)
                  </h2>
                </div>
              </div>
              <div className="text-left border border-black p-1.5 rounded bg-gray-50 text-[11px] font-bold">
                <div>التاريخ: <span className="font-mono font-black">{report.date}</span> ({report.dayName})</div>
                <div>إجمالي السلف: <span className="font-mono font-black text-red-700">{formatNumber(summary.totalAdvances)} د.أ</span></div>
                <div>أجور المياومة: <span className="font-mono font-black text-emerald-800">{formatNumber(totalDailyWages)} د.أ</span></div>
              </div>
            </div>
          </div>

          {/* سجل الأقسام بالأعلى من ورقة المطعم */}
          <div className="border border-black rounded overflow-hidden mb-2">
            <div className="bg-gray-800 text-white font-black px-2 py-0.5 text-[10px] flex justify-between">
              <span>سجل الأقسام ومسؤولي الشفتات (أعلى الورقة الخلفية)</span>
              <span>دجاج حب: 1 دجاجة 25</span>
            </div>
            <table className="w-full text-center text-[9px] border-collapse">
              <thead className="bg-gray-100 font-bold border-b border-black">
                <tr>
                  <th className="p-0.5 border-l border-gray-300 text-right pr-2">القسم</th>
                  <th className="p-0.5 border-l border-gray-300">مسؤول شفت 1</th>
                  <th className="p-0.5 border-l border-gray-300">توقيع شفت 1</th>
                  <th className="p-0.5 border-l border-gray-300">مسؤول شفت 2</th>
                  <th className="p-0.5">توقيع شفت 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-semibold">
                <tr>
                  <td className="p-0.5 border-l border-gray-300 text-right pr-2 font-bold bg-gray-50">دجاج حب (1 دجاجة 25)</td>
                  <td className="p-0.5 border-l border-gray-300">شفت 1</td>
                  <td className="p-0.5 border-l border-gray-300 font-bold text-emerald-800">موقع ✓</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5">-</td>
                </tr>
                <tr>
                  <td className="p-0.5 border-l border-gray-300 text-right pr-2 font-bold bg-gray-50">زنجر وسناكات</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5">-</td>
                </tr>
                <tr>
                  <td className="p-0.5 border-l border-gray-300 text-right pr-2 font-bold bg-gray-50">سكالوب وبرجر</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5">-</td>
                </tr>
                <tr>
                  <td className="p-0.5 border-l border-gray-300 text-right pr-2 font-bold bg-gray-50">كولا وشنينة ومبردات</td>
                  <td className="p-0.5 border-l border-gray-300">مسؤول البرادات</td>
                  <td className="p-0.5 border-l border-gray-300 font-bold text-emerald-800">موقع ✓</td>
                  <td className="p-0.5 border-l border-gray-300">-</td>
                  <td className="p-0.5">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 28 Staff Table Full */}
          <div className="border border-black rounded overflow-hidden">
            <table className="w-full text-center text-[9px] border-collapse">
              <thead className="bg-black text-white font-extrabold border-b border-black">
                <tr>
                  <th className="py-1 px-1 border-l border-gray-600 w-6">م</th>
                  <th className="py-1 px-2 border-l border-gray-600 text-right pr-2 min-w-[110px]">اسم الموظف</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-14">النوع</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-12">أجر/س</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-12">دخول</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-12">خروج</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-10">ساعات</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-16 bg-gray-800 text-emerald-300">اليومية</th>
                  <th className="py-1 px-1 border-l border-gray-600 w-16 text-yellow-300">السلفة</th>
                  <th className="py-1 px-1 border-l border-gray-600 min-w-[70px]">ملاحظات</th>
                  <th className="py-1 px-1 w-14">التوقيع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 font-semibold">
                {report.employees.map((emp, index) => {
                  const isDaily = (emp.employmentType || 'daily') === 'daily';
                  const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
                  const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, emp.hourlyRate || 1.5, 'daily')) : 0;

                  return (
                    <tr key={emp.id || index} className={index % 2 === 1 ? 'bg-gray-50/70' : 'bg-white'}>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono font-bold">{emp.number || index + 1}</td>
                      <td className="py-0.5 px-2 border-l border-gray-300 text-right pr-2 font-black text-black truncate max-w-[120px]">
                        {emp.name}
                      </td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-bold">
                        <span className={`px-1 rounded text-[8.5px] ${isDaily ? 'bg-amber-100 text-amber-950' : 'bg-indigo-100 text-indigo-950'}`}>
                          {isDaily ? 'مياومة' : 'شهري'}
                        </span>
                      </td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono">
                        {isDaily ? `${emp.hourlyRate || 1.5}` : '-'}
                      </td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono">{emp.shiftIn || '-'}</td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono">{emp.shiftOut || '-'}</td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono font-bold">
                        {hours > 0 ? `${hours}س` : '-'}
                      </td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono font-black text-emerald-900 bg-emerald-50/40">
                        {isDaily ? (wage > 0 ? formatNumber(wage) : '0.00') : 'شهري'}
                      </td>
                      <td className="py-0.5 px-0.5 border-l border-gray-300 font-mono font-black text-red-700">
                        {emp.advance > 0 ? formatNumber(emp.advance) : '-'}
                      </td>
                      <td className="py-0.5 px-1 border-l border-gray-300 text-right pr-1 text-gray-700 truncate max-w-[80px]">
                        {emp.notes || '-'}
                      </td>
                      <td className="py-0.5 px-0.5 text-center font-bold">
                        {emp.signed ? (
                          <span className="text-emerald-800 font-black text-[9px]">موقع ✓</span>
                        ) : (
                          <span className="text-gray-400 text-[8.5px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-black text-white font-extrabold border-t-2 border-black text-[9.5px]">
                <tr>
                  <td colSpan={3} className="py-1 px-2 text-right">المجموع الكلي لكادر الموظفين:</td>
                  <td colSpan={3} className="py-1 px-1 text-center font-mono text-gray-300">
                    مجموع الساعات: {totalStaffHours} ساعة
                  </td>
                  <td className="py-1 px-1 text-center font-mono text-yellow-300 font-black">
                    {totalStaffHours}س
                  </td>
                  <td className="py-1 px-1 font-mono text-emerald-300 font-black">
                    {formatNumber(totalDailyWages)} د.أ
                  </td>
                  <td className="py-1 px-1 font-mono text-yellow-400 font-black">
                    {formatNumber(summary.totalAdvances)} د.أ
                  </td>
                  <td colSpan={2} className="py-1 px-2 text-left text-gray-300 text-[8.5px]">
                    سلف ويوميات مستلمة
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Signatures Page 2 */}
        <div className="border-t-2 border-black pt-1.5 flex justify-between items-center text-[10px] font-bold">
          <div>توقيع الكاشير والمسؤول: <span className="underline mr-2">{report.cashierName || '___________________'}</span></div>
          <div>مصادقة المدير العام: <span className="underline mr-2">مطعم يحيى البيك</span></div>
          <div className="font-mono text-gray-500">صفحة 2 من 2 (الوجه الخلفي)</div>
        </div>
      </div>
    </div>
  );
};
