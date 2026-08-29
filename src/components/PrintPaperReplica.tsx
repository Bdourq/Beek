import React from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { formatNumber } from '../utils/calculations';

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

  // Admin Expenses list mapping
  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminList = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { name, amount: found?.amount || 0 };
  });
  const otherAdmin = report.adminExpenses.filter(a => !adminPredefined.some(p => a.name.includes(p) || p.includes(a.name)));
  const allAdminItems = [...adminList, ...otherAdmin.map(a => ({ name: a.name, amount: a.amount }))];

  const purchItems = report.purchases.map(p => ({ name: p.name, amount: p.amount }));
  const vAddedItems = report.vendorDebtsAdded.map(v => ({ name: v.vendorName, amount: v.amount }));
  const vPaidItems = report.vendorDebtsPaid.map(v => ({ name: v.vendorName, amount: v.amount }));
  const otherExpItems = report.otherExpenses.map(e => ({ name: e.name, amount: e.amount }));
  const aptItems = report.apartmentExpenses.map(e => ({ name: e.name, amount: e.amount }));
  const yahyaItems = report.yahyaAccount.map(e => ({ name: e.name, amount: e.amount }));
  const abuItems = report.abuAbdullahAccount.map(e => ({ name: e.name, amount: e.amount }));
  const spicesItems = report.spices.map(s => ({ name: s.name, amount: s.amount }));
  const maintItems = report.maintenance.map(m => ({ name: m.name, amount: m.amount }));
  const walletItems = report.walletExpenses.map(w => ({ name: w.name, amount: w.amount }));

  const renderMiniTable = (title: string, items: { name: string; amount: number }[], total: number) => (
    <div className="border border-[#dee2e6] rounded mb-3 bg-white text-xs overflow-hidden">
      <div className="bg-[#C8102E] text-white font-bold py-1 px-2 text-center">
        {title}
      </div>
      <div className="grid grid-cols-[1fr_60px] bg-[#f8f9fa] border-b border-[#dee2e6] font-bold text-[11px]">
        <div className="px-2 py-1 text-right border-l border-[#dee2e6]">البيان</div>
        <div className="px-2 py-1 text-center">المبلغ</div>
      </div>
      {items.length === 0 ? (
        <div className="grid grid-cols-[1fr_60px] border-b border-[#dee2e6]">
          <div className="px-2 py-1 text-right text-gray-400 border-l border-[#dee2e6]">لا توجد مسجلات</div>
          <div className="px-2 py-1 text-center">-</div>
        </div>
      ) : (
        items.map((item, i) => (
          <div key={i} className={`grid grid-cols-[1fr_60px] border-b border-[#dee2e6] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
            <div className="px-2 py-1 text-right truncate border-l border-[#dee2e6]">{item.name || ''}</div>
            <div className="px-2 py-1 text-center font-mono">{item.amount ? formatNumber(item.amount) : '-'}</div>
          </div>
        ))
      )}
      <div className="grid grid-cols-[1fr_60px] bg-[#e2e8f0] font-bold text-[11px]">
        <div className="px-2 py-1 text-right border-l border-[#dee2e6]">الإجمالي</div>
        <div className="px-2 py-1 text-center font-mono">{total ? formatNumber(total) : '0'}</div>
      </div>
    </div>
  );

  const renderSummaryTable = (title: string, data: { label: string; value: any; isHighlight?: boolean; highlightColor?: string }[]) => (
    <div className="border border-[#dee2e6] rounded mb-3 bg-white text-xs overflow-hidden">
      <div className="bg-[#f8f9fa] text-[#C8102E] font-bold py-1 px-2 text-center border-b border-[#dee2e6]">
        {title}
      </div>
      {data.map((item, idx) => (
        <div 
          key={idx} 
          className={`grid grid-cols-[1fr_75px] border-b border-[#dee2e6] ${
            item.isHighlight ? (item.highlightColor || 'bg-[#e2e8f0]') : (idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]')
          }`}
        >
          <div className={`px-2 py-1 text-right border-l border-[#dee2e6] ${item.isHighlight ? 'font-bold' : ''}`}>
            {item.label}
          </div>
          <div className={`px-2 py-1 text-center font-mono ${item.isHighlight ? 'font-bold' : ''}`}>
            {item.value !== undefined && item.value !== '' && item.value !== 0 ? formatNumber(Number(item.value)) : '-'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="print-only-container hidden print:block text-[#212529] bg-white font-['Cairo',sans-serif] w-full max-w-[297mm] mx-auto p-4">
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4 landscape; margin: 10mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
        }
      `}} />
      
      {/* Top Banner */}
      <div className="bg-[#C8102E] text-white rounded-t-lg text-center py-4 mb-0">
        <h1 className="text-2xl font-black mb-1 tracking-wide">مطعم يحيى البيك - تقرير إغلاق الكاش اليومي الشامل</h1>
      </div>
      <div className="flex justify-between border border-[#dee2e6] border-t-0 py-2 px-6 rounded-b-lg mb-6 bg-[#f8f9fa] text-sm shadow-sm">
        <div><span className="font-bold text-[#C8102E]">التاريخ:</span> {report.date}</div>
        <div><span className="font-bold text-[#C8102E]">اليوم:</span> {report.dayName}</div>
      </div>

      {/* 4 Column Layout matching Excel */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Column 1 */}
        <div>
          {renderMiniTable('مشتريات', purchItems, summary.totalPurchases)}
          {renderMiniTable('مصاريف أخرى', otherExpItems, summary.totalOtherExpenses)}
          {renderMiniTable('أبو عبدالله', abuItems, summary.totalAbuAbdullah)}
          {renderMiniTable('معدات وصيانة', maintItems, summary.totalMaintenance)}
        </div>

        {/* Column 2 */}
        <div>
          {renderMiniTable('إضافة ذمم تجار', vAddedItems, summary.totalVendorDebtsAdded)}
          {renderMiniTable('الشقة', aptItems, summary.totalApartmentExpenses)}
          {renderMiniTable('مصاريف إدارية', allAdminItems, summary.totalAdminExpenses)}
          {renderMiniTable('المحفظة الإلكترونية', walletItems, summary.totalWallet)}
        </div>

        {/* Column 3 */}
        <div>
          {renderMiniTable('سداد ذمم تجار', vPaidItems, summary.totalVendorDebtsPaid)}
          {renderMiniTable('يحيى', yahyaItems, summary.totalYahya)}
          {renderMiniTable('بهارات', spicesItems, summary.totalSpices)}
        </div>

        {/* Column 4: Summary Tables */}
        <div>
          {renderSummaryTable('بيانات الكاش والمبيعات', cashArr)}
          {renderSummaryTable('ملخص الجرد الفعلي', invArr)}
        </div>
      </div>

      {/* Bottom: Employee Advances Table (سجل سلف الموظفين اليومية) */}
      <div className="no-break mt-6">
        <div className="border border-[#dee2e6] rounded bg-white text-xs overflow-hidden">
          <div className="bg-[#C8102E] text-white font-bold py-1.5 px-3 text-center">
            سجل سلف الموظفين اليومية
          </div>
          <table className="w-full border-collapse border-b border-[#dee2e6] text-center text-xs">
            <thead>
              <tr className="bg-[#f8f9fa] font-bold">
                <th className="py-1 px-2 border border-[#dee2e6] w-12">م</th>
                <th className="py-1 px-3 border border-[#dee2e6] text-right">اسم الموظف</th>
                <th className="py-1 px-3 border border-[#dee2e6] w-32">قيمة السلفة</th>
                <th className="py-1 px-3 border border-[#dee2e6] text-right">التوقيع / ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {report.employees.map((emp, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'}>
                  <td className="py-1 px-2 border border-[#dee2e6] font-bold">{i + 1}</td>
                  <td className="py-1 px-3 border border-[#dee2e6] text-right">{emp.name}</td>
                  <td className="py-1 px-3 border border-[#dee2e6] font-mono">{emp.advance > 0 ? formatNumber(emp.advance) : '-'}</td>
                  <td className="py-1 px-3 border border-[#dee2e6] text-right text-gray-600">{emp.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#e2e8f0] font-bold">
                <td colSpan={2} className="py-1.5 px-3 border border-[#dee2e6] text-right">إجمالي السلف</td>
                <td className="py-1.5 px-3 border border-[#dee2e6] font-mono text-center">{formatNumber(summary.totalAdvances)}</td>
                <td className="py-1.5 px-3 border border-[#dee2e6]"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
