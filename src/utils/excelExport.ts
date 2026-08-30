import ExcelJS from 'exceljs';
import { DailyReport } from '../types';
import { calculateReportSummary } from './calculations';

export const exportDailyReportToExcel = async (report: DailyReport) => {
  const summary = calculateReportSummary(report);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الإغلاق', {
    views: [{ rightToLeft: true }]
  });

  // Columns layout:
  // Col A, B: Column Group 1 (Widths: 24, 12)
  // Col C: Spacer (Width: 3)
  // Col D, E: Column Group 2 (Widths: 24, 12)
  // Col F: Spacer (Width: 3)
  // Col G, H: Column Group 3 (Widths: 24, 12)
  // Col I: Spacer (Width: 3)
  // Col J, K: Column Group 4 / Summary (Widths: 26, 14)
  worksheet.columns = [
    { key: 'A', width: 24 },
    { key: 'B', width: 12 },
    { key: 'C', width: 3 },
    { key: 'D', width: 24 },
    { key: 'E', width: 12 },
    { key: 'F', width: 3 },
    { key: 'G', width: 24 },
    { key: 'H', width: 12 },
    { key: 'I', width: 3 },
    { key: 'J', width: 26 },
    { key: 'K', width: 14 }
  ];

  const applyStyle = (cell: ExcelJS.Cell, bold = false, align: 'center' | 'left' | 'right' = 'center', bgColor?: string, border = true) => {
    cell.font = { name: 'Arial', size: 10, bold, color: bgColor === 'C8102E' ? { argb: 'FFFFFFFF' } : undefined };
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
        type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor === 'C8102E' ? 'FFC8102E' : bgColor }
      };
    }
  };

  // 1. Top Banner (Across A to K)
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'مطعم يحيى البيك - تقرير إغلاق الكاش اليومي الشامل';
  applyStyle(titleCell, true, 'center', 'C8102E', false);
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };

  worksheet.addRow([]); // Row 2

  // Date & Day Row (placed at top of Column J-K)
  worksheet.getCell('J3').value = `التاريخ: ${report.date}`;
  worksheet.getCell('K3').value = `اليوم: ${report.dayName}`;
  applyStyle(worksheet.getCell('J3'), true, 'right', 'FFF8F9FA', true);
  applyStyle(worksheet.getCell('K3'), true, 'center', 'FFF8F9FA', true);

  worksheet.addRow([]); // Row 4 spacer

  // Helper to write a mini table at specific startRow and startCol ('A', 'D', 'G', etc.)
  const writeMiniTableAt = (
    title: string,
    items: { name: string; amount: number }[],
    totalAmount: number,
    startRow: number,
    col1: string,
    col2: string
  ): number => {
    worksheet.mergeCells(`${col1}${startRow}:${col2}${startRow}`);
    const tCell = worksheet.getCell(`${col1}${startRow}`);
    tCell.value = title;
    applyStyle(tCell, true, 'center', 'C8102E');

    const subR = startRow + 1;
    worksheet.getCell(`${col1}${subR}`).value = 'البيان';
    worksheet.getCell(`${col2}${subR}`).value = 'المبلغ';
    applyStyle(worksheet.getCell(`${col1}${subR}`), true, 'center', 'FFF8F9FA');
    applyStyle(worksheet.getCell(`${col2}${subR}`), true, 'center', 'FFF8F9FA');

    let curR = subR + 1;
    if (items.length === 0) {
      worksheet.getCell(`${col1}${curR}`).value = 'لا توجد مسجلات';
      worksheet.getCell(`${col2}${curR}`).value = '-';
      applyStyle(worksheet.getCell(`${col1}${curR}`), false, 'right');
      applyStyle(worksheet.getCell(`${col2}${curR}`), false, 'center');
      curR++;
    } else {
      items.forEach(it => {
        worksheet.getCell(`${col1}${curR}`).value = it.name || '';
        worksheet.getCell(`${col2}${curR}`).value = it.amount ? it.amount : '-';
        applyStyle(worksheet.getCell(`${col1}${curR}`), false, 'right');
        applyStyle(worksheet.getCell(`${col2}${curR}`), false, 'center');
        curR++;
      });
    }

    worksheet.getCell(`${col1}${curR}`).value = 'الإجمالي';
    worksheet.getCell(`${col2}${curR}`).value = totalAmount ? totalAmount : 0;
    applyStyle(worksheet.getCell(`${col1}${curR}`), true, 'right', 'FFE2E8F0');
    applyStyle(worksheet.getCell(`${col2}${curR}`), true, 'center', 'FFE2E8F0');

    return curR + 2; // Next table start row in this column
  };

  // Prepare items
  const purchItems = report.purchases.map(p => ({ name: p.name, amount: p.amount }));
  const vAddedItems = report.vendorDebtsAdded.map(v => ({ name: v.vendorName, amount: v.amount }));
  const vPaidItems = report.vendorDebtsPaid.map(v => ({ name: v.vendorName, amount: v.amount }));
  const otherExpItems = report.otherExpenses.map(e => ({ name: e.name, amount: e.amount }));
  const aptItems = report.apartmentExpenses.map(e => ({ name: e.name, amount: e.amount }));
  const yahyaItems = report.yahyaAccount.map(e => ({ name: e.name, amount: e.amount }));
  const abuItems = report.abuAbdullahAccount.map(e => ({ name: e.name, amount: e.amount }));

  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminList = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { name, amount: found?.amount || 0 };
  });
  const otherAdmin = report.adminExpenses.filter(a => !adminPredefined.some(p => a.name.includes(p) || p.includes(a.name)));
  const allAdminItems = [...adminList, ...otherAdmin.map(a => ({ name: a.name, amount: a.amount }))];

  const spicesItems = report.spices.map(s => ({ name: s.name, amount: s.amount }));
  const maintItems = report.maintenance.map(m => ({ name: m.name, amount: m.amount }));
  const walletItems = report.walletExpenses.map(w => ({ name: w.name, amount: w.amount }));

  // Column Group 1 (Cols A-B): Purchases first, then other expenses
  let r1 = 5;
  r1 = writeMiniTableAt('مشتريات', purchItems, summary.totalPurchases, r1, 'A', 'B');
  r1 = writeMiniTableAt('مصاريف أخرى', otherExpItems, summary.totalOtherExpenses, r1, 'A', 'B');
  r1 = writeMiniTableAt('أبو عبدالله', abuItems, summary.totalAbuAbdullah, r1, 'A', 'B');
  r1 = writeMiniTableAt('معدات وصيانة', maintItems, summary.totalMaintenance, r1, 'A', 'B');

  // Column Group 2 (Cols D-E):
  let r2 = 5;
  r2 = writeMiniTableAt('إضافة ذمم تجار', vAddedItems, summary.totalVendorDebtsAdded, r2, 'D', 'E');
  r2 = writeMiniTableAt('الشقة', aptItems, summary.totalApartmentExpenses, r2, 'D', 'E');
  r2 = writeMiniTableAt('مصاريف إدارية', allAdminItems, summary.totalAdminExpenses, r2, 'D', 'E');
  r2 = writeMiniTableAt('المحفظة الإلكترونية', walletItems, summary.totalWallet, r2, 'D', 'E');

  // Column Group 3 (Cols G-H):
  let r3 = 5;
  r3 = writeMiniTableAt('سداد ذمم تجار', vPaidItems, summary.totalVendorDebtsPaid, r3, 'G', 'H');
  r3 = writeMiniTableAt('يحيى', yahyaItems, summary.totalYahya, r3, 'G', 'H');
  r3 = writeMiniTableAt('بهارات', spicesItems, summary.totalSpices, r3, 'G', 'H');

  // Column Group 4 (Cols J-K): Summary Tables (Cash & Inventory)
  const writeRightSummaryAt = () => {
    let rIdx = 5;

    // Cash Section Header
    worksheet.mergeCells(`J${rIdx}:K${rIdx}`);
    const cHead = worksheet.getCell(`J${rIdx}`);
    cHead.value = 'بيانات الكاش والمبيعات';
    applyStyle(cHead, true, 'center', 'FEF3C7'); // Soft amber gold header
    cHead.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF92400E' } };
    rIdx++;

    const cashArr = [
      { l: 'النقد الافتتاحي', v: report.openingCash },
      { l: 'اضافة ذمم', v: summary.totalVendorDebtsAdded },
      { l: 'تسديد ذمم قديمة', v: summary.totalVendorDebtsPaid },
      { l: 'مبيعات', v: report.sales },
      { l: 'مبيعات أخرى', v: report.otherSales },
      { l: 'مجموع الكاش', v: summary.totalGrossCashAvailable, h: true }
    ];

    cashArr.forEach(item => {
      worksheet.getCell(`J${rIdx}`).value = item.l;
      worksheet.getCell(`K${rIdx}`).value = item.v !== undefined && item.v !== null && item.v !== 0 ? item.v : '-';
      const bg = item.h ? 'FEF9C3' : undefined; // Lighter gold for cash total
      applyStyle(worksheet.getCell(`J${rIdx}`), item.h, 'right', bg);
      applyStyle(worksheet.getCell(`K${rIdx}`), item.h, 'center', bg);
      if (item.h) {
        worksheet.getCell(`J${rIdx}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF78350F' } };
        worksheet.getCell(`K${rIdx}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF78350F' } };
      }
      rIdx++;
    });

    rIdx++; // Spacer

    // Inventory Section Header
    worksheet.mergeCells(`J${rIdx}:K${rIdx}`);
    const iHead = worksheet.getCell(`J${rIdx}`);
    iHead.value = 'ملخص الجرد الفعلي';
    applyStyle(iHead, true, 'center', 'E0E7FF'); // Soft indigo/blue professional accent
    iHead.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF3730A3' } };
    rIdx++;

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
      { l: 'نقص الكاش', v: summary.differenceType === 'shortage' ? summary.cashDifference : 0, h: true, c: 'FFE1EEF8', textCol: 'FF990000' },
      { l: 'زيادة الكاش', v: summary.differenceType === 'surplus' ? summary.cashDifference : 0, h: true, c: 'FFE6F4EA', textCol: 'FF137333' }
    ];

    invArr.forEach(item => {
      const bg = item.c || (item.h ? 'EEF2FF' : undefined);
      worksheet.getCell(`J${rIdx}`).value = item.l;
      worksheet.getCell(`K${rIdx}`).value = item.v !== undefined && item.v !== null && item.v !== 0 ? item.v : '-';
      applyStyle(worksheet.getCell(`J${rIdx}`), item.h, 'right', bg);
      applyStyle(worksheet.getCell(`K${rIdx}`), item.h, 'center', bg);
      if (item.h) {
        worksheet.getCell(`J${rIdx}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: item.textCol || 'FF312E81' } };
        worksheet.getCell(`K${rIdx}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: item.textCol || 'FF312E81' } };
      }
      rIdx++;
    });

    return rIdx;
  };

  const summaryEndRow = writeRightSummaryAt();

  // Determine max row from all columns above
  const maxTableEndRow = Math.max(r1, r2, r3, summaryEndRow) + 2;

  // ==========================================
  // MIDDLE BOTTOM: Two Mini Tables (Kitchen Consumption & Production Inventory)
  // ==========================================
  const writeMiniExtraTablesAt = (startRow: number) => {
    let rIdx = startRow;
    
    // Kitchen Consumption Table (Cols A-E)
    worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
    const kHead = worksheet.getCell(`A${rIdx}`);
    kHead.value = 'استهلاك المطبخ';
    applyStyle(kHead, true, 'center', 'FEF3C7');
    kHead.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF92400E' } };
    rIdx++;

    const kItems = [
      { l: 'سيخ 1', v: report.kitchenConsumption?.rice1 || 0 },
      { l: 'سيخ 2', v: report.kitchenConsumption?.rice2 || 0 },
      { l: 'تزويد', v: report.kitchenConsumption?.supplyIn || 0 },
      { l: 'مرتجع', v: report.kitchenConsumption?.returns || 0 },
      { l: 'استهلاك رز', v: (Number(report.kitchenConsumption?.rice1) || 0) + (Number(report.kitchenConsumption?.rice2) || 0), h: true },
      { l: 'استهلاك لوز', v: report.kitchenConsumption?.almonds || 0 },
      { l: 'استهلاك بطاطا', v: report.kitchenConsumption?.potatoes || 0 }
    ];

    kItems.forEach(item => {
      worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
      worksheet.getCell(`A${rIdx}`).value = item.l;
      worksheet.getCell(`C${rIdx}`).value = item.v;
      const bg = item.h ? 'FEF9C3' : undefined;
      applyStyle(worksheet.getCell(`A${rIdx}`), item.h, 'right', bg);
      applyStyle(worksheet.getCell(`C${rIdx}`), item.h, 'center', bg);
      if (item.h) {
        worksheet.getCell(`A${rIdx}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF78350F' } };
        worksheet.getCell(`C${rIdx}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF78350F' } };
      }
      rIdx++;
    });

    rIdx += 2;

    // Production Inventory Table (Cols A-C)
    worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
    const pHead = worksheet.getCell(`A${rIdx}`);
    pHead.value = 'جرد الإنتاج';
    applyStyle(pHead, true, 'center', 'E0E7FF');
    pHead.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF3730A3' } };
    rIdx++;

    const pItems = report.productionItems || [
      { id: '1', name: 'بروستد', shift1: 0, shift2: 0, total: 0 },
      { id: '2', name: 'تكا', shift1: 0, shift2: 0, total: 0 },
      { id: '3', name: 'زنجر', shift1: 0, shift2: 0, total: 0 }
    ];

    pItems.forEach(p => {
      worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
      worksheet.getCell(`A${rIdx}`).value = p.name;
      worksheet.getCell(`C${rIdx}`).value = p.total;
      applyStyle(worksheet.getCell(`A${rIdx}`), false, 'right');
      applyStyle(worksheet.getCell(`C${rIdx}`), false, 'center');
      rIdx++;
    });

    return rIdx + 2;
  };

  const extraTablesEndRow = writeMiniExtraTablesAt(maxTableEndRow);

  // ==========================================
  // BOTTOM: Employee Advances Table (سجل سلف الموظفين) at the very bottom
  // ==========================================
  const writeEmployeeAdvancesAt = (startRow: number) => {
    let rIdx = startRow;
    worksheet.mergeCells(`A${rIdx}:K${rIdx}`);
    const empTitle = worksheet.getCell(`A${rIdx}`);
    empTitle.value = 'سجل سلف الموظفين اليومية';
    applyStyle(empTitle, true, 'center', 'C8102E');
    rIdx++;

    // Sub headers: A-B: م, C-E: اسم الموظف, F-H: قيمة السلفة, I-K: التوقيع / ملاحظات
    worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
    worksheet.mergeCells(`C${rIdx}:E${rIdx}`);
    worksheet.mergeCells(`F${rIdx}:H${rIdx}`);
    worksheet.mergeCells(`I${rIdx}:K${rIdx}`);

    worksheet.getCell(`A${rIdx}`).value = 'م';
    worksheet.getCell(`C${rIdx}`).value = 'اسم الموظف';
    worksheet.getCell(`F${rIdx}`).value = 'قيمة السلفة';
    worksheet.getCell(`I${rIdx}`).value = 'التوقيع / ملاحظات';

    ['A', 'C', 'F', 'I'].forEach(c => applyStyle(worksheet.getCell(`${c}${rIdx}`), true, 'center', 'FFF8F9FA'));
    // Apply borders to merged header cells
    ['B', 'D', 'E', 'G', 'H', 'J', 'K'].forEach(c => applyStyle(worksheet.getCell(`${c}${rIdx}`), true, 'center', 'FFF8F9FA'));
    rIdx++;

    report.employees.forEach((emp, i) => {
      worksheet.mergeCells(`A${rIdx}:B${rIdx}`);
      worksheet.mergeCells(`C${rIdx}:E${rIdx}`);
      worksheet.mergeCells(`F${rIdx}:H${rIdx}`);
      worksheet.mergeCells(`I${rIdx}:K${rIdx}`);

      worksheet.getCell(`A${rIdx}`).value = i + 1;
      worksheet.getCell(`C${rIdx}`).value = emp.name;
      worksheet.getCell(`F${rIdx}`).value = emp.advance > 0 ? emp.advance : '-';
      worksheet.getCell(`I${rIdx}`).value = emp.notes || '-';

      ['A', 'C', 'F', 'I'].forEach(c => applyStyle(worksheet.getCell(`${c}${rIdx}`), false, c === 'C' ? 'right' : 'center'));
      ['B', 'D', 'E', 'G', 'H', 'J', 'K'].forEach(c => applyStyle(worksheet.getCell(`${c}${rIdx}`), false, 'center'));
      rIdx++;
    });

    // Total Row
    worksheet.mergeCells(`A${rIdx}:H${rIdx}`);
    worksheet.mergeCells(`I${rIdx}:K${rIdx}`);
    worksheet.getCell(`A${rIdx}`).value = 'إجمالي السلف';
    worksheet.getCell(`I${rIdx}`).value = summary.totalAdvances;
    
    for (let col = 1; col <= 11; col++) {
      const colLetter = String.fromCharCode(64 + col);
      applyStyle(worksheet.getCell(`${colLetter}${rIdx}`), true, col <= 8 ? 'center' : 'center', 'FFE2E8F0');
    }
  };

  writeEmployeeAdvancesAt(extraTablesEndRow);

  // Download
  const fileName = `تقرير_إغلاق_يحيى_البيك_${report.date}_${report.dayName}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
