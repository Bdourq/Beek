import ExcelJS from 'exceljs';
import { DailyReport } from '../types';

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
  const worksheet = workbook.addWorksheet('تقرير الإغلاق', {
    views: [{ rightToLeft: true }]
  });

  // Columns for the PDF Layout
  // A: بيانات الكاش والمبيعات | B: المبلغ || C: Spacer || D: ملخص الجرد الفعلي | E: المبلغ
  worksheet.columns = [
    { key: 'A', width: 25 }, { key: 'B', width: 15 },
    { key: 'C', width: 4 },  // spacer
    { key: 'D', width: 25 }, { key: 'E', width: 15 }
  ];

  const applyStyle = (cell: ExcelJS.Cell, bold = false, align: 'center' | 'left' | 'right' = 'center', bgColor?: string, border = true) => {
    cell.font = { name: 'Arial', size: 11, bold, color: bgColor === '1e3a5f' ? { argb: 'FFFFFFFF' } : undefined };
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

  // 2. Section 1
  const sec1Row = worksheet.addRow(['1. بيانات الكاش والمبيعات وملخص الجرد']);
  worksheet.mergeCells(`A${sec1Row.number}:E${sec1Row.number}`);
  applyStyle(worksheet.getCell(`A${sec1Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec1Row.number}`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

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

  // 3. Section 2
  const sec2Row = worksheet.addRow(['المصاريف والمشتريات التفصيلية']);
  worksheet.mergeCells(`A${sec2Row.number}:E${sec2Row.number}`);
  applyStyle(worksheet.getCell(`A${sec2Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec2Row.number}`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

  // Adjust columns for 3 sections side-by-side
  worksheet.getColumn('F').width = 15;

  const sec2Headers = worksheet.addRow([
    'مصاريف إدارية', 'المبلغ',
    'المحفظة الإلكترونية', 'المبلغ',
    'مشتريات (البيان)', 'المبلغ'
  ]);
  ['A','B','C','D','E','F'].forEach(col => applyStyle(sec2Headers.getCell(col), true, 'center', 'FFF8F9FA'));

  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminExpList = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { n: name, v: found?.amount || '' };
  });
  const otherAdmin = report.adminExpenses.filter(a => !adminPredefined.some(p => a.name.includes(p) || p.includes(a.name)));
  const allAdmin = [...adminExpList, ...otherAdmin.map(a => ({ n: a.name, v: a.amount }))];

  const maxSec2 = Math.max(report.purchases.length || 1, report.walletExpenses.length || 1, allAdmin.length || 1);
  
  for (let i = 0; i < maxSec2; i++) {
    const adm = allAdmin[i] || { n: '', v: '' };
    const wal = report.walletExpenses[i] || { name: i===0 && report.walletExpenses.length===0 ? 'لا توجد مسجلات' : '', amount: '' };
    const pur = report.purchases[i] || { name: i===0 && report.purchases.length===0 ? 'لا توجد مسجلات' : '', amount: '' };
    
    const r = worksheet.addRow([
      adm.n, adm.v, wal.name, wal.amount, pur.name, pur.amount
    ]);
    ['A','C','E'].forEach(col => applyStyle(r.getCell(col), false, 'right'));
    ['B','D','F'].forEach(col => applyStyle(r.getCell(col), false, 'center'));
  }

  const sec2Footer = worksheet.addRow([
    'الإجمالي', summary.totalAdminExpenses,
    'الإجمالي', summary.totalWallet,
    'الإجمالي', summary.totalPurchases
  ]);
  ['A','C','E'].forEach(col => applyStyle(sec2Footer.getCell(col), true, 'right', 'FFE2E8F0'));
  ['B','D','F'].forEach(col => applyStyle(sec2Footer.getCell(col), true, 'center', 'FFE2E8F0'));

  worksheet.addRow([]); // Spacer

  // 4. Section 3 (Kitchen & Production Tables) - Placed beside each other
  worksheet.addRow([]); // Spacer
  const sec3Row = worksheet.addRow(['الإنتاج واستهلاك المطبخ']);
  worksheet.mergeCells(`A${sec3Row.number}:F${sec3Row.number}`);
  applyStyle(worksheet.getCell(`A${sec3Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec3Row.number}`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

  // Kitchen Consumption Table
  const kArr = [
    { labelR: 'سيخ 1', valR: report.kitchenConsumption?.rice1 || '', labelL: 'استهلاك رز', valL: '' },
    { labelR: 'سيخ 2', valR: report.kitchenConsumption?.rice2 || '', labelL: 'استهلاك لوز', valL: report.kitchenConsumption?.almonds || '' },
    { labelR: 'تزويد', valR: report.kitchenConsumption?.supplyIn || '', labelL: 'استهلاك بطاطا', valL: report.kitchenConsumption?.potatoes || '' },
    { labelR: 'مرتجع', valR: report.kitchenConsumption?.returns || '', labelL: '', valL: '' },
  ];

  // Production Table (Tikka, Broasted, Zinger)
  const prodItems = [
    { n: 'بروستد', item: report.productionItems?.find(p => p.name === 'بروستد') },
    { n: 'تكا', item: report.productionItems?.find(p => p.name === 'تكا') },
    { n: 'زنجر', item: report.productionItems?.find(p => p.name === 'زنجر') }
  ];

  // Table Headers
  const kHeaderRow = worksheet.addRow([
    'استهلاك المطبخ', '', '', '', 'الإنتاج', ''
  ]);
  worksheet.mergeCells(`A${kHeaderRow.number}:D${kHeaderRow.number}`);
  worksheet.mergeCells(`E${kHeaderRow.number}:F${kHeaderRow.number}`);
  applyStyle(kHeaderRow.getCell('A'), true, 'center', 'FFF8F9FA');
  applyStyle(kHeaderRow.getCell('E'), true, 'center', 'FFF8F9FA');

  const kSubHeaderRow = worksheet.addRow([
    '', '', '', '', 
    prodItems[0].n, prodItems[1].n // We'll squeeze the 3 columns into E & F by just displaying text if needed, or expand columns.
  ]);
  // Wait, E and F are only 2 columns, but we have 3 production items + 1 label. We might need a slightly different layout.
  // Let's use columns A, B for Kitchen Left, C, D for Kitchen Right, E for Prod Label, F for Prod Val? No, let's just make rows.
  // Actually, let's keep it simple.

  worksheet.addRow(['سيخ 1', kArr[0].valR, 'استهلاك رز', kArr[0].valL, 'الشفت الأول', `${prodItems[0].n}:${prodItems[0].item?.shift1||0} | ${prodItems[1].n}:${prodItems[1].item?.shift1||0} | ${prodItems[2].n}:${prodItems[2].item?.shift1||0}`]);
  worksheet.addRow(['سيخ 2', kArr[1].valR, 'استهلاك لوز', kArr[1].valL, 'الشفت الثاني', `${prodItems[0].n}:${prodItems[0].item?.shift2||0} | ${prodItems[1].n}:${prodItems[1].item?.shift2||0} | ${prodItems[2].n}:${prodItems[2].item?.shift2||0}`]);
  worksheet.addRow(['تزويد', kArr[2].valR, 'استهلاك بطاطا', kArr[2].valL, 'المجموع', `${prodItems[0].n}:${prodItems[0].item?.total||0} | ${prodItems[1].n}:${prodItems[1].item?.total||0} | ${prodItems[2].n}:${prodItems[2].item?.total||0}`]);
  worksheet.addRow(['مرتجع', kArr[3].valR, '', '', '', '']);

  // Format these rows
  for(let i = 0; i < 4; i++) {
    const rowNum = kHeaderRow.number + 2 + i;
    ['A', 'C', 'E'].forEach(c => applyStyle(worksheet.getCell(`${c}${rowNum}`), true, 'right', 'FFF8F9FA'));
    ['B', 'D', 'F'].forEach(c => applyStyle(worksheet.getCell(`${c}${rowNum}`), false, 'center'));
  }

  worksheet.addRow([]); // Spacer

  // 5. Section 4 (Custody Claims)
  const sec4Row = worksheet.addRow(['جدول العُهد']);
  worksheet.mergeCells(`A${sec4Row.number}:F${sec4Row.number}`);
  applyStyle(worksheet.getCell(`A${sec4Row.number}`), true, 'right', undefined, false);
  worksheet.getCell(`A${sec4Row.number}`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

  const sec4Headers = worksheet.addRow(['م', 'البيان', 'له', 'عليه', 'ملاحظات', '']);
  worksheet.mergeCells(`E${sec4Headers.number}:F${sec4Headers.number}`);
  ['A', 'B', 'C', 'D', 'E'].forEach(col => applyStyle(sec4Headers.getCell(col), true, 'center', 'FFF8F9FA'));

  const custodyList = report.custodyClaims || [
    { id: '1', person: '', forThem: 0, onThem: 0, notes: '' },
    { id: '2', person: '', forThem: 0, onThem: 0, notes: '' },
    { id: '3', person: '', forThem: 0, onThem: 0, notes: '' },
    { id: '4', person: '', forThem: 0, onThem: 0, notes: '' }
  ];

  custodyList.slice(0, 4).forEach((c, idx) => {
    const r = worksheet.addRow([
      idx + 1,
      c.person,
      c.forThem > 0 ? c.forThem : '-',
      c.onThem > 0 ? c.onThem : '-',
      c.notes || '',
      ''
    ]);
    worksheet.mergeCells(`E${r.number}:F${r.number}`);
    applyStyle(r.getCell('A'), true, 'center');
    applyStyle(r.getCell('B'), true, 'right');
    applyStyle(r.getCell('C'), true, 'center', 'FFD1FAE5'); // emerald light
    applyStyle(r.getCell('D'), true, 'center', 'FFFFE4E6'); // rose light
    applyStyle(r.getCell('E'), false, 'right');
  });

  // ------------------------------------------------------------------
  // SECOND SHEET: سجل الموظفين (Employee Records)
  // ------------------------------------------------------------------
  const empSheet = workbook.addWorksheet('سجل الموظفين', {
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

  // Calculate shift hours (copied logic)
  const calculateShiftHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diff = (outH * 60 + outM) - (inH * 60 + inM);
    if (diff < 0) diff += 24 * 60; // crossed midnight
    return Number((diff / 60).toFixed(2));
  };
  
  const computeHourlyWage = (hours: number, rate: number, type: 'daily' | 'monthly') => {
    if (type === 'monthly') return 0;
    return Number((hours * rate).toFixed(2));
  };

  report.employees.forEach((emp, i) => {
    const isDaily = (emp.employmentType || 'daily') === 'daily';
    const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
    const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, emp.hourlyRate || 1.5, 'daily')) : 0;
    
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

  const empFooter = empSheet.addRow([
    'إجمالي السلف', '', '', '', '', '', '', '', summary.totalAdvances, '', ''
  ]);
  empSheet.mergeCells(`A${empFooter.number}:H${empFooter.number}`);
  ['A', 'I'].forEach(col => applyStyle(empFooter.getCell(col), true, 'center', 'FFE2E8F0'));

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
