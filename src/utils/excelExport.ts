import * as XLSX from 'xlsx';
import { DailyReport } from '../types';
import { calculateReportSummary } from './calculations';

export function exportDailyReportToExcel(report: DailyReport) {
  const summary = calculateReportSummary(report);
  const wb = XLSX.utils.book_new();

  // =========================================================================
  // SHEET 1: تقرير إغلاق الكاش اليومي الشامل (Exact PDF Replica)
  // =========================================================================
  const grid: (string | number)[][] = [];

  // Title Banner
  grid.push(['مطعم يحيى البيك', '', '', '', '']);
  grid.push(['تقرير إغلاق الكاش اليومي الشامل', '', '', '', '']);
  grid.push([
    'اليوم:',
    report.dayName,
    '',
    'التاريخ:',
    report.date
  ]);
  grid.push([]);

  // Section 1 Header
  grid.push(['1. بيانات الكاش والمبيعات وملخص الجرد', '', '', '', '']);
  grid.push([
    'ملخص الجرد الفعلي',
    'المبلغ (د.أ)',
    '',
    'بيانات الكاش والمبيعات',
    'المبلغ (د.أ)'
  ]);

  // Rows for Section 1 side-by-side
  const leftCol: [string, number | string][] = [
    ['نقد (الكاش الفعلي)', report.actualCashInDrawer],
    ['فيزا', report.visaPOS || '-'],
    ['Rt', report.rtPOS || '-'],
    ['مايسترو', report.maestroPOS || '-'],
    ['فرق سعر', report.priceDiff || '-'],
    ['سلف', summary.totalAdvances || '-'],
    ['المحفظة', summary.totalWallet || '-'],
    ['مشتريات', summary.totalPurchases || '-'],
    ['سداد ذمم تجار', summary.totalVendorDebtsPaid || '-'],
    ['مصاريف أخرى', summary.totalOtherExpenses || '-'],
    ['الشقة', summary.totalApartmentExpenses || '-'],
    ['مصاريف إدارية', summary.totalAdminExpenses || '-'],
    ['يحيى', summary.totalYahya || '-'],
    ['أبو عبدالله', summary.totalAbuAbdullah || '-'],
    ['بهارات', summary.totalSpices || '-'],
    ['معدات وصيانة', summary.totalMaintenance || '-'],
    ['مجموع الجرد', summary.totalReconciledInventory],
    ['نقص الكاش', summary.differenceType === 'shortage' ? Math.abs(summary.cashDifference) : 0.0],
    ['زيادة الكاش', summary.differenceType === 'surplus' ? summary.cashDifference : 0.0]
  ];

  const rightCol: [string, number | string][] = [
    ['النقد الافتتاحي', report.openingCash || '-'],
    ['اضافة ذمم', summary.totalVendorDebtsAdded || '-'],
    ['تسديد ذمم قديمة', summary.totalVendorDebtsPaid || '-'],
    ['مبيعات', report.sales || '-'],
    ['مبيعات أخرى', report.otherSales || '-'],
    ['مجموع الكاش', summary.totalGrossCashAvailable]
  ];

  const maxSec1 = Math.max(leftCol.length, rightCol.length);
  for (let i = 0; i < maxSec1; i++) {
    const l = leftCol[i] || ['', ''];
    const r = rightCol[i] || ['', ''];
    grid.push([l[0], l[1], '', r[0], r[1]]);
  }

  grid.push([]);
  grid.push([]);

  // =========================================================================
  // Section 2: المصاريف والمشتريات التفصيلية
  // =========================================================================
  grid.push(['2. المصاريف والمشتريات التفصيلية', '', '', '', '']);
  grid.push([]);

  // Sub-table 1: المشتريات
  grid.push(['مشتريات (البيان)', 'المبلغ', '', 'مصاريف إدارية', 'المبلغ']);

  const purchasesList = report.purchases.length > 0 
    ? report.purchases.map(p => [p.name || 'مشتريات', p.amount] as [string, number])
    : [['لا توجد مسجلات', '-']] as [string, string][];

  const adminList: [string, number | string][] = [
    ['ضمان', report.adminExpenses.find(a => a.name.includes('ضمان'))?.amount || '-'],
    ['كهرباء', report.adminExpenses.find(a => a.name.includes('كهرباء'))?.amount || '-'],
    ['فاتورة نت', report.adminExpenses.find(a => a.name.includes('نت'))?.amount || '-'],
    ['فاتورة اتصال', report.adminExpenses.find(a => a.name.includes('اتصال') || a.name.includes('تلفون'))?.amount || '-'],
    ['ضيافة', report.adminExpenses.find(a => a.name.includes('ضيافة'))?.amount || '-'],
    ['دعاية', report.adminExpenses.find(a => a.name.includes('دعاية'))?.amount || '-'],
    ['قرطاسية', report.adminExpenses.find(a => a.name.includes('قرطاسية'))?.amount || '-'],
    ...report.adminExpenses
      .filter(a => !['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'].some(x => a.name.includes(x)))
      .map(a => [a.name, a.amount || '-'] as [string, number | string])
  ];

  const maxPurchAdmin = Math.max(purchasesList.length, adminList.length);
  for (let i = 0; i < maxPurchAdmin; i++) {
    const p = purchasesList[i] || ['', ''];
    const a = adminList[i] || ['', ''];
    grid.push([p[0], p[1], '', a[0], a[1]]);
  }
  grid.push(['الإجمالي', summary.totalPurchases, '', 'الإجمالي', summary.totalAdminExpenses]);

  grid.push([]);

  // Sub-table 2: المحفظة الإلكترونية
  grid.push(['المحفظة الإلكترونية', 'المبلغ', '', '', '']);
  if (report.walletExpenses && report.walletExpenses.length > 0) {
    report.walletExpenses.forEach(w => {
      grid.push([w.name || 'محفظة', w.amount || '-']);
    });
  } else {
    grid.push(['لا توجد مسجلات', '-']);
  }
  grid.push(['الإجمالي', summary.totalWallet]);

  grid.push([]);
  grid.push([]);

  // =========================================================================
  // Section 3: سجل سلف الموظفين اليومية (28 موظف)
  // =========================================================================
  grid.push(['3. سجل سلف الموظفين اليومية', '', '', '', '']);
  grid.push(['م', 'اسم الموظف', 'قيمة السلفة', 'التوقيع / ملاحظات', '']);

  report.employees.forEach((emp, index) => {
    grid.push([
      index + 1,
      emp.name,
      emp.advance > 0 ? emp.advance : '-',
      emp.signed ? (emp.notes ? `موقع (${emp.notes})` : 'موقع') : (emp.notes || '-')
    ]);
  });

  grid.push(['إجمالي السلف', '', summary.totalAdvances, '', '']);

  grid.push([]);
  grid.push(['توقيع الكاشير:', report.cashierName || 'كاشير الشفت', '', 'اعتماد الإدارة:', 'مطعم يحيى البيك']);

  const wsExact = XLSX.utils.aoa_to_sheet(grid);

  // Set column widths
  wsExact['!cols'] = [
    { wch: 28 }, // Col A
    { wch: 16 }, // Col B
    { wch: 6 },  // Col C (spacer)
    { wch: 28 }, // Col D
    { wch: 16 }  // Col E
  ];

  XLSX.utils.book_append_sheet(wb, wsExact, 'إغلاق الكاش اليومي');

  // =========================================================================
  // SHEET 2: كشف سلف ودوام الموظفين التفصيلي (Roster & Shifts)
  // =========================================================================
  const staffData: (string | number)[][] = [
    ['مطعم يحيى البيك | كشف سلف ودوام الموظفين اليومي'],
    ['التاريخ:', report.date, 'اليوم:', report.dayName, 'إجمالي السلف:', summary.totalAdvances, 'الكاشير:', report.cashierName],
    [],
    ['م', 'اسم الموظف', 'السلفة (د.أ)', 'المواصلات (د.أ)', 'وقت الدخول', 'وقت الخروج', 'التوقيع', 'ملاحظات']
  ];

  report.employees.forEach((emp, idx) => {
    staffData.push([
      idx + 1,
      emp.name,
      emp.advance,
      emp.transport,
      emp.shiftIn || '',
      emp.shiftOut || '',
      emp.signed ? 'مستلم وموقع' : 'غير موقع',
      emp.notes || ''
    ]);
  });

  staffData.push([]);
  staffData.push([
    'المجموع الكلي للسلف',
    '',
    summary.totalAdvances,
    report.employees.reduce((acc, e) => acc + (Number(e.transport) || 0), 0),
    '',
    '',
    '',
    ''
  ]);

  const wsStaff = XLSX.utils.aoa_to_sheet(staffData);
  wsStaff['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 26 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStaff, 'سلف الموظفين');

  // =========================================================================
  // SHEET 3: كشف فواتير المشتريات والذمم التفصيلي
  // =========================================================================
  const purchasesData: (string | number)[][] = [
    ['مطعم يحيى البيك | كشف المشتريات التفصيلي وحركة الذمم'],
    ['التاريخ:', report.date, 'إجمالي المشتريات:', summary.totalPurchases],
    [],
    ['=== فواتير ومشتريات اليوم ==='],
    ['م', 'بيان المادة / المورد', 'المبلغ (د.أ)', 'ملاحظات']
  ];

  report.purchases.forEach((p, idx) => {
    purchasesData.push([idx + 1, p.name, p.amount, p.notes || '']);
  });
  purchasesData.push(['المجموع الكلي للمشتريات', '', summary.totalPurchases, '']);
  purchasesData.push([]);

  purchasesData.push(['=== سداد ذمم تجار اليوم ===']);
  purchasesData.push(['م', 'اسم التاجر / المورد', 'المبلغ المسدد (د.أ)', 'ملاحظات']);
  report.vendorDebtsPaid.forEach((v, idx) => {
    purchasesData.push([idx + 1, v.vendorName, v.amount, v.notes || '']);
  });
  purchasesData.push(['مجموع سداد الذمم', '', summary.totalVendorDebtsPaid, '']);
  purchasesData.push([]);

  purchasesData.push(['=== إضافة ذمم تجار جديدة اليوم ===']);
  purchasesData.push(['م', 'اسم التاجر / المورد', 'المبلغ المضاف (د.أ)', 'ملاحظات']);
  report.vendorDebtsAdded.forEach((v, idx) => {
    purchasesData.push([idx + 1, v.vendorName, v.amount, v.notes || '']);
  });
  purchasesData.push(['مجموع الذمم الجديدة', '', summary.totalVendorDebtsAdded, '']);

  const wsPurchases = XLSX.utils.aoa_to_sheet(purchasesData);
  wsPurchases['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 18 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsPurchases, 'المشتريات والذمم');

  // Generate and download XLSX
  const filename = `تقرير_إغلاق_الكاش_مطعم_يحيى_البيك_${report.date}_${report.dayName}.xlsx`;
  XLSX.writeFile(wb, filename);
}
