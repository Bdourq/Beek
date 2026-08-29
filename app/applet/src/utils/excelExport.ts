import ExcelJS from 'exceljs';
import { DailyReport } from '@/src/types';

export const exportDailyReportToExcel = async (report: DailyReport) => {
  const summary = {
    totalPurchases: report.purchases.reduce((s, p) => s + (p.amount || 0), 0),
    totalVendorDebtsAdded: report.vendorDebtsAdded.reduce((s, p) => s + (p.amount || 0), 0),
    totalVendorDebtsPaid: report.vendorDebtsPaid.reduce((s, p) => s + (p.amount || 0), 0),
    totalAdvances: report.employees.reduce((s, e) => s + (e.advance || 0), 0),
    totalAdminExpenses: report.adminExpenses.reduce((s, e) => s + (e.amount || 0), 0),
    totalApartmentExpenses: report.apartmentExpenses.reduce((s, e) => s + (e.amount || 0), 0),
    totalOtherExpenses: report.otherExpenses.reduce((s, e) => s + (e.amount || 0), 0),
    totalYahya: report.yahyaAccount.reduce((s, e) => s + (e.amount || 0), 0),
    totalAbuAbdullah: report.abuAbdullahAccount.reduce((s, e) => s + (e.amount || 0), 0),
    totalSpices: report.spices.reduce((s, p) => s + (p.amount || 0), 0),
    totalMaintenance: report.maintenance.reduce((s, p) => s + (p.amount || 0), 0),
    totalWallet: report.walletExpenses.reduce((s, e) => s + (e.amount || 0), 0),
    totalGrossCashAvailable: 0,
    totalReconciledInventory: 0,
    cashDifference: 0,
    differenceType: 'balanced' as 'balanced' | 'shortage' | 'surplus'
  };

  summary.totalGrossCashAvailable = (report.openingCash || 0) + 
    summary.totalVendorDebtsAdded + (report.sales || 0) + (report.otherSales || 0);

  summary.totalReconciledInventory = (report.actualCashInDrawer || 0) +
    summary.totalPurchases + summary.totalAdvances + summary.totalVendorDebtsPaid +
    summary.totalWallet + summary.totalAdminExpenses + summary.totalApartmentExpenses +
    summary.totalOtherExpenses + summary.totalYahya + summary.totalAbuAbdullah +
    (report.visaPOS || 0) + (report.maestroPOS || 0) + (report.rtPOS || 0) +
    (report.priceDiff || 0) + summary.totalSpices + summary.totalMaintenance;

  const diff = summary.totalReconciledInventory - summary.totalGrossCashAvailable;
  summary.cashDifference = Math.abs(diff);
  summary.differenceType = Math.abs(diff) < 0.01 ? 'balanced' : (diff < 0 ? 'shortage' : 'surplus');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الإغلاق اليومي', {
    views: [{ rightToLeft: true }]
  });

  // Columns for Sheet 1
  worksheet.columns = [
    { key: 'A', width: 25 }, { key: 'B', width: 15 },
    { key: 'C', width: 4 },  // spacer
    { key: 'D', width: 25 }, { key: 'E', width: 15 }
  ];

  const applyStyle = (cell: ExcelJS.Cell, bold = false, align: 'center' | 'left' | 'right' = 'center', bgColor?: string, border = true) => {
    cell.font = { name: 'Arial', size: 10, bold, color: bgColor === '1e3a5f' ? { argb: 'FFFFFFFF' } : undefined };
    cell.alignment = { vertical: 'middle', horizontal: align };
    if (border) {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDEE2E6' } },
        left: { style: 'thin', color: { argb: 'FFDEE2E6' } },
        bottom: { style: 'thin', color: { argb: 'FFDEE2E6' } },
        right: { style: 'thin', color: { argb: 'FFDEE2E6' } }
      };
    }
    if (bgColor) {
      cell.fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor === '1e3a5f' ? 'FF1E3A5F' : bgColor }
      };
    }
  };

  // 1. Header Area
  const titleRow = worksheet.addRow(['مطعم يحيى البيك']);
  worksheet.mergeCells('A1:E1');
  applyStyle(worksheet.getCell('A1'), true, 'center', '1e3a5f', false);
  worksheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };

  const subTitleRow = worksheet.addRow(['تقرير إغلاق الكاش اليومي الشامل']);
  worksheet.mergeCells('A2:E2');
  applyStyle(worksheet.getCell('A2'), false, 'center', '1e3a5f', false);
  worksheet.getCell('A2').font = { size: 12, color: { argb: 'FFFFFFFF' } };

  worksheet.addRow([]); // Spacer

  const dateRow = worksheet.addRow(['اليوم:', report.dayName, '', 'التاريخ:', report.date]);
  applyStyle(worksheet.getCell(`A${dateRow.number}`), true, 'right', 'FFF8F9FA', true);
  applyStyle(worksheet.getCell(`B${dateRow.number}`), false, 'right', 'FFF8F9FA', true);
  applyStyle(worksheet.getCell(`D${dateRow.number}`), true, 'right', 'FFF8F9FA', true);
  applyStyle(worksheet.getCell(`E${dateRow.number}`), false, 'right', 'FFF8F9FA', true);

  worksheet.addRow([]); // Spacer

  // 2. Section 1: Cash & Inventory
  const sec1Row = worksheet.addRow(['1. بيانات الكاش والمبيعات وملخص الجرد']);
  worksheet.mergeCells(`A${sec1Row.number}:E${sec1Row.number}`);
  applyStyle(worksheet.getCell(`A${sec1Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec1Row.number}`).font = { size: 13, bold: true, color: { argb: 'FF1E3A5F' } };

  const sec1Headers = worksheet.addRow(['بيانات الكاش والمبيعات', '', '', 'ملخص الجرد الفعلي', '']);
  worksheet.mergeCells(`A${sec1Headers.number}:B${sec1Headers.number}`);
  worksheet.mergeCells(`D${sec1Headers.number}:E${sec1Headers.number}`);
  applyStyle(worksheet.getCell(`A${sec1Headers.number}`), true, 'center', 'FFF8F9FA');
  applyStyle(worksheet.getCell(`D${sec1Headers.number}`), true, 'center', 'FFF8F9FA');

  const cashArr = [
    { l: 'النقد الافتتاحي', v: report.openingCash },
    { l: 'اضافة ذمم', v: summary.totalVendorDebtsAdded },
    { l: 'تسديد ذمم قديمة', v: summary.totalVendorDebtsPaid },
    { l: 'مبيعات', v: report.sales },
    { l: 'مبيعات أخرى', v: report.otherSales },
    { l: 'مجموع الكاش', v: summary.totalGrossCashAvailable, h: true }
  ];

  const invArr = [
    { l: 'نقد (الكاش الفعلي)', v: report.actualCashInDrawer },
    { l: 'فيزا', v: report.visaPOS },
    { l: 'Rt', v: report.rtPOS },
    { l: 'مايسترو', v: report.maestroPOS },
    { l: 'فرق سعر', v: report.priceDiff },
    { l: 'سلف', v: summary.totalAdvances },
    { l: 'المحفظة', v: summary.totalWallet },
    { l: 'مشتريات', v: summary.totalPurchases },
    { l: 'سداد ذمم تجار', v: summary.totalVendorDebtsPaid },
    { l: 'مصاريف أخرى', v: summary.totalOtherExpenses },
    { l: 'الشقة', v: summary.totalApartmentExpenses },
    { l: 'مصاريف إدارية', v: summary.totalAdminExpenses },
    { l: 'يحيى', v: summary.totalYahya },
    { l: 'أبو عبدالله', v: summary.totalAbuAbdullah },
    { l: 'بهارات', v: summary.totalSpices },
    { l: 'معدات وصيانة', v: summary.totalMaintenance },
    { l: 'مجموع الجرد', v: summary.totalReconciledInventory, h: true },
    { l: 'نقص الكاش', v: summary.differenceType === 'shortage' ? summary.cashDifference : 0, h: true, c: 'FFFFF0F5' },
    { l: 'زيادة الكاش', v: summary.differenceType === 'surplus' ? summary.cashDifference : 0, h: true, c: 'FFF0FDF4' }
  ];

  const maxSec1 = Math.max(cashArr.length, invArr.length);
  for (let i = 0; i < maxSec1; i++) {
    const cash: any = cashArr[i] || { l: '', v: '' };
    const inv: any = invArr[i] || { l: '', v: '' };
    
    const r = worksheet.addRow([
      cash.l, cash.v !== '' && cash.v !== 0 ? cash.v : (cash.l ? '-' : ''), '',
      inv.l, inv.v !== '' && inv.v !== 0 ? inv.v : (inv.l ? '-' : '')
    ]);

    if (cash.l) {
      applyStyle(r.getCell('A'), cash.h, 'right', cash.h ? 'FFE2E8F0' : undefined);
      applyStyle(r.getCell('B'), cash.h, 'center', cash.h ? 'FFE2E8F0' : undefined);
    }
    if (inv.l) {
      const bgColor = inv.c || (inv.h ? 'FFE2E8F0' : undefined);
      applyStyle(r.getCell('D'), inv.h, 'right', bgColor);
      applyStyle(r.getCell('E'), inv.h, 'center', bgColor);
    }
  }

  worksheet.addRow([]); // Spacer

  // 3. Section 2: Detailed Expenses & Purchases with [+] indicator
  const sec2Row = worksheet.addRow(['2. المصاريف والمشتريات التفصيلية']);
  worksheet.mergeCells(`A${sec2Row.number}:E${sec2Row.number}`);
  applyStyle(worksheet.getCell(`A${sec2Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec2Row.number}`).font = { size: 13, bold: true, color: { argb: 'FF1E3A5F' } };

  worksheet.columns = [
    { key: 'A', width: 22 }, { key: 'B', width: 12 },
    { key: 'C', width: 22 }, { key: 'D', width: 12 },
    { key: 'E', width: 22 }, { key: 'F', width: 12 }
  ];

  const sec2Headers = worksheet.addRow([
    'مصاريف إدارية', 'المبلغ',
    'المحفظة الإلكترونية', 'المبلغ',
    'مشتريات (البيان)', 'المبلغ'
  ]);
  ['A','B','C','D','E','F'].forEach(col => applyStyle(sec2Headers.getCell(col), true, 'center', 'FFF8F9FA'));

  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminExpList = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { n: name, v: found?.amount || 0 };
  });

  const maxSec2 = Math.max(report.purchases.length || 1, report.walletExpenses.length || 1, adminExpList.length || 1);
  
  for (let i = 0; i < maxSec2; i++) {
    const adm = adminExpList[i] || { n: '', v: '' };
    const wal = report.walletExpenses[i] || { name: '', amount: '' };
    const pur = report.purchases[i] || { name: '', amount: '' };

    const r = worksheet.addRow([
      adm.n, adm.v !== 0 ? adm.v : '-',
      wal.name || (i === 0 ? '-' : ''), wal.amount !== '' && wal.amount !== 0 ? wal.amount : (wal.name ? '-' : ''),
      pur.name || (i === 0 ? '-' : ''), pur.amount !== '' && pur.amount !== 0 ? pur.amount : (pur.name ? '-' : '')
    ]);
    ['A','C','E'].forEach(col => applyStyle(r.getCell(col), false, 'right'));
    ['B','D','F'].forEach(col => applyStyle(r.getCell(col), false, 'center'));
  }

  // [+] Add New Item Row for Section 2 tables
  const addRowSec2 = worksheet.addRow([
    '[ + إضافة مصروف إداري ]', '',
    '[ + إضافة بند محفظة ]', '',
    '[ + إضافة مشتريات ]', ''
  ]);
  ['A','C','E'].forEach(col => {
    applyStyle(addRowSec2.getCell(col), true, 'center', 'FEF3C7');
  });
  ['B','D','F'].forEach(col => {
    applyStyle(addRowSec2.getCell(col), false, 'center', 'FEF3C7');
  });

  const sec2Footer = worksheet.addRow([
    'الإجمالي', summary.totalAdminExpenses,
    'الإجمالي', summary.totalWallet,
    'الإجمالي', summary.totalPurchases
  ]);
  ['A','C','E'].forEach(col => applyStyle(sec2Footer.getCell(col), true, 'right', 'FFE2E8F0'));
  ['B','D','F'].forEach(col => applyStyle(sec2Footer.getCell(col), true, 'center', 'FFE2E8F0'));

  worksheet.addRow([]); // Spacer

  // 4. Section 3: Kitchen Consumption & Production
  const sec3Row = worksheet.addRow(['3. الإنتاج واستهلاك المطبخ']);
  worksheet.mergeCells(`A${sec3Row.number}:F${sec3Row.number}`);
  applyStyle(worksheet.getCell(`A${sec3Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec3Row.number}`).font = { size: 13, bold: true, color: { argb: 'FF1E3A5F' } };

  const kHeaderRow = worksheet.addRow([
    'استهلاك المطبخ', '', '', '', 'الإنتاج', ''
  ]);
  worksheet.mergeCells(`A${kHeaderRow.number}:D${kHeaderRow.number}`);
  worksheet.mergeCells(`E${kHeaderRow.number}:F${kHeaderRow.number}`);
  applyStyle(kHeaderRow.getCell('A'), true, 'center', 'FFF8F9FA');
  applyStyle(kHeaderRow.getCell('E'), true, 'center', 'FFF8F9FA');

  const prodItems = [
    { n: 'بروستد', item: report.productionItems?.find(p => p.name === 'بروستد') },
    { n: 'تكا', item: report.productionItems?.find(p => p.name === 'تكا') },
    { n: 'زنجر', item: report.productionItems?.find(p => p.name === 'زنجر') }
  ];

  const r1 = worksheet.addRow(['سيخ 1', report.kitchenConsumption?.rice1 || '-', 'استهلاك رز', '-', 'الشفت الأول', `بروستد: ${prodItems[0].item?.shift1 || 0} | تكا: ${prodItems[1].item?.shift1 || 0} | زنجر: ${prodItems[2].item?.shift1 || 0}`]);
  const r2 = worksheet.addRow(['سيخ 2', report.kitchenConsumption?.rice2 || '-', 'استهلاك لوز', report.kitchenConsumption?.almonds || '-', 'الشفت الثاني', `بروستد: ${prodItems[0].item?.shift2 || 0} | تكا: ${prodItems[1].item?.shift2 || 0} | زنجر: ${prodItems[2].item?.shift2 || 0}`]);
  const r3 = worksheet.addRow(['تزويد', report.kitchenConsumption?.supplyIn || '-', 'استهلاك بطاطا', report.kitchenConsumption?.potatoes || '-', 'المجموع', `بروستد: ${prodItems[0].item?.total || 0} | تكا: ${prodItems[1].item?.total || 0} | زنجر: ${prodItems[2].item?.total || 0}`]);
  const r4 = worksheet.addRow(['مرتجع', report.kitchenConsumption?.returns || '-', '', '', '[ + إضافة بند مطبخ ]', '[ + إضافة إنتاج ]']);

  [r1, r2, r3, r4].forEach((row) => {
    ['A', 'C', 'E'].forEach(c => applyStyle(row.getCell(c), true, 'right', 'FFF8F9FA'));
    ['B', 'D', 'F'].forEach(c => applyStyle(row.getCell(c), false, 'center'));
  });

  applyStyle(r4.getCell('E'), true, 'center', 'FEF3C7');
  applyStyle(r4.getCell('F'), true, 'center', 'FEF3C7');

  worksheet.addRow([]); // Spacer

  // 5. Section 4: Custody Claims (جدول العُهد)
  const sec4Row = worksheet.addRow(['4. جدول العُهد والذمم']);
  worksheet.mergeCells(`A${sec4Row.number}:F${sec4Row.number}`);
  applyStyle(worksheet.getCell(`A${sec4Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec4Row.number}`).font = { size: 13, bold: true, color: { argb: 'FF1E3A5F' } };

  const sec4Headers = worksheet.addRow(['م', 'البيان', 'له', 'عليه', 'ملاحظات', '']);
  worksheet.mergeCells(`E${sec4Headers.number}:F${sec4Headers.number}`);
  ['A', 'B', 'C', 'D', 'E'].forEach(col => applyStyle(sec4Headers.getCell(col), true, 'center', 'FFF8F9FA'));

  const custodyList = report.custodyClaims || [
    { id: '1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
    { id: '2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
    { id: '3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' },
    { id: '4', person: 'عهدة 4', forThem: 0, onThem: 0, notes: '' }
  ];

  custodyList.forEach((c, idx) => {
    const r = worksheet.addRow([
      idx + 1,
      c.person || `عهدة ${idx + 1}`,
      c.forThem > 0 ? c.forThem : '-',
      c.onThem > 0 ? c.onThem : '-',
      c.notes || '',
      ''
    ]);
    worksheet.mergeCells(`E${r.number}:F${r.number}`);
    applyStyle(r.getCell('A'), true, 'center');
    applyStyle(r.getCell('B'), true, 'right');
    applyStyle(r.getCell('C'), true, 'center', 'FFD1FAE5');
    applyStyle(r.getCell('D'), true, 'center', 'FFFFE4E6');
    applyStyle(r.getCell('E'), false, 'right');
  });

  const addCustRow = worksheet.addRow(['+', '[ + إضافة عهدة جديدة ]', '', '', '', '']);
  worksheet.mergeCells(`B${addCustRow.number}:F${addCustRow.number}`);
  applyStyle(addCustRow.getCell('A'), true, 'center', 'FEF3C7');
  applyStyle(addCustRow.getCell('B'), true, 'right', 'FEF3C7');


  // ------------------------------------------------------------------
  // SECOND SHEET: سجل الموظفين والإحصائية (Employee Records & Statistics)
  // ------------------------------------------------------------------
  const empSheet = workbook.addWorksheet('سجل الموظفين والإحصائية', {
    views: [{ rightToLeft: true }]
  });

  empSheet.columns = [
    { key: 'A', width: 5 },   // م
    { key: 'B', width: 20 },  // اسم الموظف
    { key: 'C', width: 12 },  // الدخول
    { key: 'D', width: 12 },  // الخروج
    { key: 'E', width: 12 },  // ساعات
    { key: 'F', width: 12 },  // نوع
    { key: 'G', width: 12 },  // الأجر/ساعة
    { key: 'H', width: 15 },  // اليومية المحسوبة
    { key: 'I', width: 15 },  // السلفة
    { key: 'J', width: 25 },  // ملاحظات
    { key: 'K', width: 15 }   // التوقيع
  ];

  const empTitleRow = empSheet.addRow(['سجل حركة الموظفين ومحاسبة المياومة']);
  empSheet.mergeCells('A1:K1');
  applyStyle(empSheet.getCell('A1'), true, 'center', '1e3a5f', false);
  empSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };

  empSheet.addRow([]); // Spacer

  const empHeaders = empSheet.addRow([
    'م', 'اسم الموظف', 'دخول', 'خروج', 'ساعات', 'نوع', 'أجر/س', 'اليومية', 'السلفة', 'ملاحظات', 'التوقيع'
  ]);
  ['A','B','C','D','E','F','G','H','I','J','K'].forEach(col => applyStyle(empHeaders.getCell(col), true, 'center', 'FFF8F9FA'));

  const calculateShiftHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diff = (outH * 60 + outM) - (inH * 60 + inM);
    if (diff < 0) diff += 24 * 60;
    return Number((diff / 60).toFixed(2));
  };

  const computeHourlyWage = (hours: number, rate: number, type: 'daily' | 'monthly') => {
    if (type === 'monthly') return 0;
    return Number((hours * rate).toFixed(2));
  };

  let totalDailyWages = 0;
  let totalAdvancesSum = 0;

  report.employees.forEach((emp, i) => {
    const isDaily = (emp.employmentType || 'daily') === 'daily';
    const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
    const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, emp.hourlyRate || 1.5, 'daily')) : 0;
    
    if (isDaily) totalDailyWages += wage;
    if (emp.advance > 0) totalAdvancesSum += emp.advance;

    const r = empSheet.addRow([
      i + 1, 
      emp.name, 
      emp.shiftIn || '-', 
      emp.shiftOut || '-', 
      hours > 0 ? hours : '-', 
      isDaily ? 'مياومة' : 'شهري', 
      isDaily ? emp.hourlyRate || 1.5 : '-', 
      isDaily ? wage : 'شهري', 
      emp.advance > 0 ? emp.advance : '-', 
      emp.notes || '', 
      emp.signed ? 'موقع ✓' : ''
    ]);

    ['A','B','C','D','E','F','G','H','I','J','K'].forEach(col => applyStyle(r.getCell(col), false, 'center'));
  });

  const addEmpRow = empSheet.addRow(['+', '[ + إضافة موظف جديد ]', '', '', '', '', '', '', '', '', '']);
  empSheet.mergeCells(`B${addEmpRow.number}:K${addEmpRow.number}`);
  applyStyle(addEmpRow.getCell('A'), true, 'center', 'FEF3C7');
  applyStyle(addEmpRow.getCell('B'), true, 'right', 'FEF3C7');

  const empFooter = empSheet.addRow([
    'الإجمالي', '', '', '', '', '', '', totalDailyWages, totalAdvancesSum, '', ''
  ]);
  empSheet.mergeCells(`A${empFooter.number}:G${empFooter.number}`);
  applyStyle(empFooter.getCell('A'), true, 'center', 'FFE2E8F0');
  applyStyle(empFooter.getCell('H'), true, 'center', 'FFE2E8F0');
  applyStyle(empFooter.getCell('I'), true, 'center', 'FFE2E8F0');

  empSheet.addRow([]); // Spacer
  empSheet.addRow([]); // Spacer

  // ==========================================
  // STATISTICS TABLE (الإحصائية المجمعة للموظفين)
  // ==========================================
  const statsTitleRow = empSheet.addRow(['إحصائية الموظفين والرواتب اليومية']);
  empSheet.mergeCells(`A${statsTitleRow.number}:D${statsTitleRow.number}`);
  applyStyle(empSheet.getCell(`A${statsTitleRow.number}`), true, 'right', undefined, false);
  empSheet.getCell(`A${statsTitleRow.number}`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

  const statsHeaders = empSheet.addRow(['البند الإحصائي', 'القيمة', '', '']);
  empSheet.mergeCells(`B${statsHeaders.number}:D${statsHeaders.number}`);
  applyStyle(statsHeaders.getCell('A'), true, 'center', 'FFF8F9FA');
  applyStyle(statsHeaders.getCell('B'), true, 'center', 'FFF8F9FA');

  const dailyCount = report.employees.filter(e => (e.employmentType || 'daily') === 'daily').length;
  const monthlyCount = report.employees.filter(e => e.employmentType === 'monthly').length;

  const statRows = [
    { label: 'إجمالي عدد الموظفين المسجلين', val: report.employees.length },
    { label: 'عدد عمال المياومة', val: dailyCount },
    { label: 'عدد الموظفين براتب شهري', val: monthlyCount },
    { label: 'إجمالي اليوميات المحسوبة للمياومة', val: totalDailyWages },
    { label: 'إجمالي السلف المدفوعة للموظفين', val: totalAdvancesSum },
    { label: 'صافي مستحقات الموظفين', val: totalDailyWages - totalAdvancesSum }
  ];

  statRows.forEach(st => {
    const r = empSheet.addRow([st.label, st.val, '', '']);
    empSheet.mergeCells(`B${r.number}:D${r.number}`);
    applyStyle(r.getCell('A'), true, 'right', 'FFF8F9FA');
    applyStyle(r.getCell('B'), true, 'center');
  });

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `تقرير_يحيى_البيك_${report.date}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
