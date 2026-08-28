import React from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { formatNumber } from '../utils/calculations';
import { calculateShiftHours, computeHourlyWage } from './EmployeesSection';

interface PrintPaperReplicaProps {
  report: DailyReport;
  summary: SummaryCalculations;
}

export const PrintPaperReplica: React.FC<PrintPaperReplicaProps> = ({ report, summary }) => {
  // Cash Side
  const cashArr = [
    { label: 'النقد الافتتاحي', value: report.openingCash },
    { label: 'اضافة ذمم', value: summary.totalVendorDebtsAdded },
    { label: 'تسديد ذمم قديمة', value: summary.totalVendorDebtsPaid },
    { label: 'مبيعات', value: report.sales },
    { label: 'مبيعات أخرى', value: report.otherSales },
    { label: 'مجموع الكاش', value: summary.totalGrossCashAvailable, isHighlight: true }
  ];

  // Inventory Side
  const invArr = [
    { label: 'نقد (الكاش الفعلي)', value: report.actualCashInDrawer },
    { label: 'فيزا', value: report.visaPOS },
    { label: 'Rt', value: report.rtPOS },
    { label: 'مايسترو', value: report.maestroPOS },
    { label: 'فرق سعر', value: report.priceDiff },
    { label: 'سلف', value: summary.totalAdvances },
    { label: 'المحفظة', value: summary.totalWallet },
    { label: 'مشتريات', value: summary.totalPurchases },
    { label: 'سداد ذمم تجار', value: summary.totalVendorDebtsPaid },
    { label: 'مصاريف أخرى', value: summary.totalOtherExpenses },
    { label: 'الشقة', value: summary.totalApartmentExpenses },
    { label: 'مصاريف إدارية', value: summary.totalAdminExpenses },
    { label: 'يحيى', value: summary.totalYahya },
    { label: 'أبو عبدالله', value: summary.totalAbuAbdullah },
    { label: 'بهارات', value: summary.totalSpices },
    { label: 'معدات وصيانة', value: summary.totalMaintenance },
    { label: 'مجموع الجرد', value: summary.totalReconciledInventory, isHighlight: true },
    { label: 'نقص الكاش', value: summary.differenceType === 'shortage' ? summary.cashDifference : 0, isHighlight: true, highlightColor: 'bg-red-50 text-red-900' },
    { label: 'زيادة الكاش', value: summary.differenceType === 'surplus' ? summary.cashDifference : 0, isHighlight: true, highlightColor: 'bg-emerald-50 text-emerald-900' }
  ];

  // Section 2 Data
  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminExp = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { name, amount: found?.amount };
  });
  const otherAdmin = report.adminExpenses.filter(a => !adminPredefined.some(p => a.name.includes(p) || p.includes(a.name)));
  const allAdmin = [...adminExp, ...otherAdmin];

  const maxSec2 = Math.max(report.purchases.length || 1, report.walletExpenses.length || 1, allAdmin.length || 1);
  const sec2Rows = Array.from({ length: maxSec2 }).map((_, i) => ({
    purch: report.purchases[i],
    wallet: report.walletExpenses[i],
    admin: allAdmin[i]
  }));

  return (
    <div className="print-only-container hidden print:block text-[#212529] bg-white font-['Cairo',sans-serif] w-full max-w-4xl mx-auto pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4 portrait; margin: 15mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
        }
      `}} />
      
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white rounded-t-lg text-center py-6 mb-0">
        <h1 className="text-4xl font-black mb-2 tracking-wide">مطعم يحيى البيك</h1>
        <h2 className="text-xl opacity-90">تقرير إغلاق الكاش اليومي الشامل</h2>
      </div>
      <div className="flex justify-between border border-[#dee2e6] border-t-0 py-3 px-6 rounded-b-lg mb-8 bg-[#f8f9fa] text-base shadow-sm">
        <div><span className="font-bold text-[#1e3a5f]">اليوم:</span> {report.dayName}</div>
        <div><span className="font-bold text-[#1e3a5f]">التاريخ:</span> {report.date}</div>
      </div>

      {/* Section 1: Cash & Inventory */}
      <div className="mb-10 no-break">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-2 mb-4">1. بيانات الكاش والمبيعات وملخص الجرد</h3>
        
        <div className="flex gap-6">
          {/* Inventory Table (Left side visually, but in RTL it is right? Actually PDF shows Inventory on the left of the page, Cash on the right) */}
          <div className="flex-1">
            <table className="w-full text-sm border-collapse border border-[#dee2e6]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th colSpan={2} className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold text-center">ملخص الجرد الفعلي</th>
                </tr>
              </thead>
              <tbody>
                {invArr.map((item, idx) => (
                  <tr key={idx} className={item.isHighlight ? (item.highlightColor || 'bg-[#e2e8f0]') : (idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]')}>
                    <td className={`py-2 px-4 border border-[#dee2e6] text-right ${item.isHighlight ? 'font-bold' : ''}`}>
                      {item.label}
                    </td>
                    <td className={`py-2 px-4 border border-[#dee2e6] text-center font-mono w-28 ${item.isHighlight ? 'font-bold' : ''}`}>
                      {item.value !== undefined && item.value !== '' && item.value !== 0 ? formatNumber(Number(item.value)) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash Table */}
          <div className="flex-1">
            <table className="w-full text-sm border-collapse border border-[#dee2e6]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th colSpan={2} className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold text-center">بيانات الكاش والمبيعات</th>
                </tr>
              </thead>
              <tbody>
                {cashArr.map((item, idx) => (
                  <tr key={idx} className={item.isHighlight ? 'bg-[#e2e8f0]' : (idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]')}>
                    <td className={`py-2 px-4 border border-[#dee2e6] text-right ${item.isHighlight ? 'font-bold' : ''}`}>
                      {item.label}
                    </td>
                    <td className={`py-2 px-4 border border-[#dee2e6] text-center font-mono w-28 ${item.isHighlight ? 'font-bold' : ''}`}>
                      {item.value !== undefined && item.value !== '' && item.value !== 0 ? formatNumber(Number(item.value)) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Expenses & Purchases */}
      <div className="mb-10 no-break">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-2 mb-4">المصاريف والمشتريات التفصيلية</h3>
        
        <table className="w-full text-sm border-collapse border border-[#dee2e6] text-center">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold text-right">مصاريف إدارية</th>
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold w-20">المبلغ</th>
              
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold text-right">المحفظة الإلكترونية</th>
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold w-20">المبلغ</th>
              
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold text-right">مشتريات (البيان)</th>
              <th className="py-2.5 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold w-20">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {sec2Rows.length > 0 ? sec2Rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'}>
                <td className="py-1.5 px-2 border border-[#dee2e6] text-right">{row.admin?.name || ''}</td>
                <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{row.admin?.amount ? formatNumber(row.admin.amount) : '-'}</td>
                
                <td className="py-1.5 px-2 border border-[#dee2e6] text-right">{row.wallet?.name || (idx === 0 && !row.wallet ? <span className="text-gray-400">لا توجد مسجلات</span> : '')}</td>
                <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{row.wallet?.amount ? formatNumber(row.wallet.amount) : '-'}</td>
                
                <td className="py-1.5 px-2 border border-[#dee2e6] text-right">{row.purch?.name || (idx === 0 && !row.purch ? <span className="text-gray-400">لا توجد مسجلات</span> : '')}</td>
                <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{row.purch?.amount ? formatNumber(row.purch.amount) : '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="py-4 text-gray-500">لا توجد بيانات</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#e2e8f0] font-bold">
              <td className="py-2 px-2 border border-[#dee2e6] text-right">الإجمالي</td>
              <td className="py-2 px-2 border border-[#dee2e6] font-mono">{formatNumber(summary.totalAdminExpenses)}</td>
              <td className="py-2 px-2 border border-[#dee2e6] text-right">الإجمالي</td>
              <td className="py-2 px-2 border border-[#dee2e6] font-mono">{formatNumber(summary.totalWallet)}</td>
              <td className="py-2 px-2 border border-[#dee2e6] text-right">الإجمالي</td>
              <td className="py-2 px-2 border border-[#dee2e6] font-mono">{formatNumber(summary.totalPurchases)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Section 3: Kitchen & Production */}
      <div className="mb-10 no-break">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-2 mb-4">الإنتاج واستهلاك المطبخ</h3>
        
        <div className="flex gap-6">
          <div className="flex-1">
            <table className="w-full text-sm border-collapse border border-[#dee2e6] text-center">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th colSpan={4} className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold">استهلاك المطبخ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">استهلاك رز:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.rice1 || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">سيخ 1:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.rice1 || '-'}</td>
                </tr>
                <tr className="bg-[#fcfcfc]">
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">استهلاك لوز:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.almonds || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">سيخ 2:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.rice2 || '-'}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">استهلاك بطاطا:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.potatoes || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">تزويد:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.supplyIn || '-'}</td>
                </tr>
                <tr className="bg-[#fcfcfc]">
                  <td className="py-2 px-2 border border-[#dee2e6] text-right"></td>
                  <td className="py-2 px-2 border border-[#dee2e6]"></td>
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">مرتجع:</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.kitchenConsumption?.returns || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex-1">
            <table className="w-full text-sm border-collapse border border-[#dee2e6] text-center">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th colSpan={4} className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold">الإنتاج</th>
                </tr>
                <tr className="bg-[#f8f9fa] text-xs">
                  <th className="py-1 px-2 border border-[#dee2e6]"></th>
                  <th className="py-1 px-2 border border-[#dee2e6]">بروستد</th>
                  <th className="py-1 px-2 border border-[#dee2e6]">تكا</th>
                  <th className="py-1 px-2 border border-[#dee2e6]">زنجر</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="py-2 px-2 border border-[#dee2e6] font-bold text-right">الشفت الأول</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'بروستد')?.shift1 || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'تكا')?.shift1 || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'زنجر')?.shift1 || '-'}</td>
                </tr>
                <tr className="bg-[#fcfcfc]">
                  <td className="py-2 px-2 border border-[#dee2e6] font-bold text-right">الشفت الثاني</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'بروستد')?.shift2 || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'تكا')?.shift2 || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'زنجر')?.shift2 || '-'}</td>
                </tr>
                <tr className="bg-white font-bold bg-[#e2e8f0]">
                  <td className="py-2 px-2 border border-[#dee2e6] text-right">المجموع</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'بروستد')?.total || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'تكا')?.total || '-'}</td>
                  <td className="py-2 px-2 border border-[#dee2e6] font-mono">{report.productionItems?.find(p => p.name === 'زنجر')?.total || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 4: Custody Claims */}
      <div className="mb-10 no-break">
        <h3 className="text-xl font-bold text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-2 mb-4">جدول العُهد</h3>
        
        <table className="w-full text-sm border-collapse border border-[#dee2e6] text-center">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold w-12">م</th>
              <th className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold text-right">البيان (صاحب العهدة)</th>
              <th className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold w-32">له</th>
              <th className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold w-32">عليه</th>
              <th className="py-2.5 px-4 border border-[#dee2e6] text-[#1e3a5f] font-bold">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {(report.custodyClaims || [
              { id: '1', person: '', forThem: 0, onThem: 0, notes: '' },
              { id: '2', person: '', forThem: 0, onThem: 0, notes: '' },
              { id: '3', person: '', forThem: 0, onThem: 0, notes: '' },
              { id: '4', person: '', forThem: 0, onThem: 0, notes: '' }
            ]).slice(0, 4).map((c, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}>
                <td className="py-2 px-2 border border-[#dee2e6] font-bold">{idx + 1}</td>
                <td className="py-2 px-4 border border-[#dee2e6] text-right font-bold">{c.person}</td>
                <td className="py-2 px-4 border border-[#dee2e6] font-mono text-emerald-700 bg-emerald-50/30">{c.forThem > 0 ? formatNumber(c.forThem) : '-'}</td>
                <td className="py-2 px-4 border border-[#dee2e6] font-mono text-rose-700 bg-rose-50/30">{c.onThem > 0 ? formatNumber(c.onThem) : '-'}</td>
                <td className="py-2 px-4 border border-[#dee2e6] text-gray-500 text-xs">{c.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGE 2: Staff Records */}
      <div className="page-break w-full pt-8">
        <div className="bg-[#1e3a5f] text-white rounded-t-lg text-center py-4 mb-6 mt-4">
          <h1 className="text-2xl font-black mb-1">سجل حركة الموظفين ومحاسبة المياومة</h1>
        </div>
        
        <table className="w-full text-[11px] border-collapse border border-[#dee2e6] text-center">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="py-2 px-1 border border-[#dee2e6] text-[#1e3a5f] font-bold">م</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold text-right w-24">اسم الموظف</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">دخول</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">خروج</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">ساعات</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">النوع</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">أجر/س</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">اليومية</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">السلفة</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold w-24">ملاحظات</th>
              <th className="py-2 px-2 border border-[#dee2e6] text-[#1e3a5f] font-bold">التوقيع</th>
            </tr>
          </thead>
          <tbody>
            {report.employees.map((emp, idx) => {
              const isDaily = (emp.employmentType || 'daily') === 'daily';
              const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
              const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, emp.hourlyRate || 1.5, 'daily')) : 0;
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}>
                  <td className="py-1.5 px-1 border border-[#dee2e6] font-bold">{idx + 1}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] text-right font-bold">{emp.name}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{emp.shiftIn || '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{emp.shiftOut || '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-bold font-mono">{hours > 0 ? hours : '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] text-[10px]">{isDaily ? 'مياومة' : 'شهري'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-mono">{isDaily ? emp.hourlyRate || 1.5 : '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-bold font-mono bg-[#f0fdf4]">{isDaily ? formatNumber(wage) : 'شهري'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] font-mono font-bold">{emp.advance > 0 ? formatNumber(emp.advance) : '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6] text-gray-500 text-[10px] text-right">{emp.notes || '-'}</td>
                  <td className="py-1.5 px-2 border border-[#dee2e6]">{emp.signed ? 'موقع ✓' : ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#e2e8f0] font-bold">
              <td colSpan={8} className="py-2 px-2 border border-[#dee2e6] text-right">إجمالي السلف</td>
              <td className="py-2 px-2 border border-[#dee2e6] font-mono">{formatNumber(summary.totalAdvances)}</td>
              <td colSpan={2} className="py-2 px-2 border border-[#dee2e6]"></td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mt-8 flex justify-between font-bold text-sm px-8">
          <div>توقيع الكاشير: ____________________</div>
          <div>اعتماد الإدارة: ____________________</div>
        </div>
      </div>
      
    </div>
  );
};
