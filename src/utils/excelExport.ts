import * as XLSX from 'xlsx';
import { DailyReport } from '../types';
import { calculateReportSummary } from './calculations';

export function exportDailyReportToExcel(report: DailyReport) {
  const summary = calculateReportSummary(report);
  const wb = XLSX.utils.book_new();

  // =========================================================================
  // SHEET 1: تقرير إغلاق الكاش اليومي الشامل (Exact PDF & Sheet Replica)
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

  // =========================================================================
  // جدول العُهد (3 أسطر: له وعليه)
  // =========================================================================
  grid.push(['جدول العُهد (له وعليه - 3 أسطر)', '', '', '', '']);
  grid.push(['م', 'البيان / صاحب العهدة', 'له (يريد من الكاش)', 'عليه (الكاش يريد منه)', 'ملاحظات']);

  const custodyList = report.custodyClaims || [
    { id: 'cust_1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
    { id: 'cust_3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' }
  ];

  custodyList.slice(0, 3).forEach((c, idx) => {
    grid.push([
      idx + 1,
      c.person || `عهدة ${idx + 1}`,
      c.forThem > 0 ? c.forThem : '-',
      c.onThem > 0 ? c.onThem : '-',
      c.notes || ''
    ]);
  });
  grid.push([
    'المجموع',
    '',
    custodyList.reduce((s, c) => s + (Number(c.forThem) || 0), 0),
    custodyList.reduce((s, c) => s + (Number(c.onThem) || 0), 0),
    ''
  ]);

  grid.push([]);
  grid.push([]);

  // =========================================================================
  // Section 2: المشتريات أولاً ثم المصاريف والمحفظة
  // =========================================================================
  grid.push(['2. المشتريات والمصاريف التفصيلية (المشتريات أولاً)', '', '', '', '']);
  grid.push([]);

  // Sub-table 1: المشتريات أولاً
  grid.push(['جدول المشتريات (البيان)', 'المبلغ (د.أ)', '', 'المحفظة والمصاريف الإدارية', 'المبلغ (د.أ)']);

  const purchasesList = report.purchases.length > 0 
    ? report.purchases.map(p => [p.name || 'مشتريات', p.amount] as [string, number])
    : [['لا توجد مسجلات', '-']] as [string, string][];

  const adminAndWalletList: [string, number | string][] = [
    ['المحفظة الإلكترونية', summary.totalWallet || '-'],
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

  const maxPurchAdmin = Math.max(purchasesList.length, adminAndWalletList.length);
  for (let i = 0; i < maxPurchAdmin; i++) {
    const p = purchasesList[i] || ['', ''];
    const a = adminAndWalletList[i] || ['', ''];
    grid.push([p[0], p[1], '', a[0], a[1]]);
  }
  grid.push(['إجمالي المشتريات', summary.totalPurchases, '', 'إجمالي الإدارية والمحفظة', summary.totalAdminExpenses + summary.totalWallet]);

  grid.push([]);
  grid.push([]);

  // =========================================================================
  // Section 3: سجل سلف الموظفين واليوميات المحسوبة (28 موظف)
  // =========================================================================
  grid.push(['3. سجل كادر الموظفين والدوام والسلف واليوميات', '', '', '', '']);
  grid.push(['م', 'اسم الموظف', 'نوع التوظيف', 'السلفة (د.أ)', 'دخول', 'خروج', 'الساعات', 'أجر الساعة', 'اليومية المحسوبة', 'التوقيع']);

  report.employees.forEach((emp, index) => {
    const isDaily = (emp.employmentType || 'daily') === 'daily';
    grid.push([
      index + 1,
      emp.name,
      isDaily ? 'مياومة' : 'شهري',
      emp.advance > 0 ? emp.advance : '-',
      emp.shiftIn || '-',
      emp.shiftOut || '-',
      emp.hoursWorked ? `${emp.hoursWorked} س` : '-',
      isDaily && emp.hourlyRate ? emp.hourlyRate : '-',
      isDaily && emp.calculatedWage && emp.calculatedWage > 0 ? emp.calculatedWage : (isDaily ? 0 : 'راتب شهري'),
      emp.signed ? (emp.notes ? `موقع (${emp.notes})` : 'موقع ✓') : (emp.notes || '-')
    ]);
  });

  grid.push([
    'المجموع',
    '',
    '',
    summary.totalAdvances,
    '',
    '',
    '',
    '',
    report.employees.reduce((s, e) => {
      const isDaily = (e.employmentType || 'daily') === 'daily';
      return s + (isDaily ? (Number(e.calculatedWage) || 0) : 0);
    }, 0),
    ''
  ]);

  grid.push([]);
  grid.push(['توقيع الكاشير:', report.cashierName || 'كاشير الشفت', '', 'اعتماد الإدارة:', 'مطعم يحيى البيك']);

  const wsExact = XLSX.utils.aoa_to_sheet(grid);

  // Set column widths
  wsExact['!cols'] = [
    { wch: 6 },  // Col A: م
    { wch: 22 }, // Col B: اسم الموظف
    { wch: 14 }, // Col C: نوع التوظيف
    { wch: 14 }, // Col D: السلفة
    { wch: 10 }, // Col E: دخول
    { wch: 10 }, // Col F: خروج
    { wch: 12 }, // Col G: الساعات
    { wch: 14 }, // Col H: أجر الساعة
    { wch: 18 }, // Col I: اليومية المحسوبة
    { wch: 20 }  // Col J: التوقيع
  ];

  XLSX.utils.book_append_sheet(wb, wsExact, 'إغلاق الكاش اليومي');

  // =========================================================================
  // SHEET 2: كشف سلف ودوام الموظفين واليوميات التفصيلي
  // =========================================================================
  const staffData: (string | number)[][] = [
    ['مطعم يحيى البيك | كشف سلف ودوام الموظفين وحساب اليوميات'],
    ['التاريخ:', report.date, 'اليوم:', report.dayName, 'إجمالي السلف:', summary.totalAdvances, 'الكاشير:', report.cashierName],
    [],
    ['م', 'اسم الموظف', 'نوع التوظيف', 'السلفة (د.أ)', 'المواصلات (د.أ)', 'وقت الدخول', 'وقت الخروج', 'ساعات العمل', 'أجر الساعة (د.أ)', 'اليومية المحسوبة', 'الصافي المستحق', 'التوقيع', 'ملاحظات']
  ];

  report.employees.forEach((emp, idx) => {
    const isDaily = (emp.employmentType || 'daily') === 'daily';
    const hours = emp.hoursWorked || 0;
    const wage = isDaily ? (emp.calculatedWage || 0) : 0;
    const net = wage + (emp.transport || 0) - (emp.advance || 0);
    staffData.push([
      idx + 1,
      emp.name,
      isDaily ? 'مياومة' : 'شهري',
      emp.advance || 0,
      emp.transport || 0,
      emp.shiftIn || '',
      emp.shiftOut || '',
      hours > 0 ? `${hours} س` : '',
      isDaily ? (emp.hourlyRate || 1.5) : '-',
      isDaily ? wage : 'راتب شهري',
      isDaily ? net : -(emp.advance || 0),
      emp.signed ? 'مستلم وموقع ✓' : 'غير موقع',
      emp.notes || ''
    ]);
  });

  staffData.push([]);
  staffData.push([
    'المجموع الكلي',
    '',
    '',
    summary.totalAdvances,
    report.employees.reduce((acc, e) => acc + (Number(e.transport) || 0), 0),
    '',
    '',
    '',
    '',
    report.employees.reduce((acc, e) => (e.employmentType || 'daily') === 'daily' ? acc + (Number(e.calculatedWage) || 0) : acc, 0),
    report.employees.reduce((acc, e) => {
      const isDaily = (e.employmentType || 'daily') === 'daily';
      const wage = isDaily ? (e.calculatedWage || 0) : 0;
      return acc + (wage + (e.transport || 0) - (e.advance || 0));
    }, 0),
    '',
    ''
  ]);

  const wsStaff = XLSX.utils.aoa_to_sheet(staffData);
  wsStaff['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, wsStaff, 'سلف ودخول وخروج الموظفين');

  // =========================================================================
  // SHEET 3: كشف فواتير المشتريات والذمم والعُهد
  // =========================================================================
  const purchasesData: (string | number)[][] = [
    ['مطعم يحيى البيك | كشف المشتريات التفصيلي والذمم والعُهد'],
    ['التاريخ:', report.date, 'إجمالي المشتريات:', summary.totalPurchases],
    [],
    ['=== 1. فواتير ومشتريات اليوم (أول جدول) ==='],
    ['م', 'بيان المادة / المورد', 'المبلغ (د.أ)', 'ملاحظات']
  ];

  report.purchases.forEach((p, idx) => {
    purchasesData.push([idx + 1, p.name, p.amount, p.notes || '']);
  });
  purchasesData.push(['المجموع الكلي للمشتريات', '', summary.totalPurchases, '']);
  purchasesData.push([]);

  purchasesData.push(['=== 2. جدول العُهد (له وعليه - 3 أسطر) ===']);
  purchasesData.push(['م', 'البيان / صاحب العهدة', 'له (يريد من الكاش)', 'عليه (الكاش يريد منه)', 'ملاحظات']);
  custodyList.slice(0, 3).forEach((c, idx) => {
    purchasesData.push([idx + 1, c.person || `عهدة ${idx + 1}`, c.forThem || 0, c.onThem || 0, c.notes || '']);
  });
  purchasesData.push(['مجموع العُهد', '', custodyList.reduce((s, c) => s + (Number(c.forThem) || 0), 0), custodyList.reduce((s, c) => s + (Number(c.onThem) || 0), 0), '']);
  purchasesData.push([]);

  purchasesData.push(['=== 3. سداد ذمم تجار اليوم ===']);
  purchasesData.push(['م', 'اسم التاجر / المورد', 'المبلغ المسدد (د.أ)', 'ملاحظات']);
  report.vendorDebtsPaid.forEach((v, idx) => {
    purchasesData.push([idx + 1, v.vendorName, v.amount, v.notes || '']);
  });
  purchasesData.push(['مجموع سداد الذمم', '', summary.totalVendorDebtsPaid, '']);
  purchasesData.push([]);

  purchasesData.push(['=== 4. إضافة ذمم تجار جديدة اليوم ===']);
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
  XLSX.utils.book_append_sheet(wb, wsPurchases, 'المشتريات والذمم والعُهد');

  // Generate and download XLSX
  const filename = `تقرير_إغلاق_الكاش_مطعم_يحيى_البيك_${report.date}_${report.dayName}.xlsx`;
  XLSX.writeFile(wb, filename);
}
