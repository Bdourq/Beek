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
    summary.totalVendorDebtsAdded + (report.oldDebtsPaidTotal || 0) + (report.sales || 0) + (report.otherSales || 0);

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

  // Columns: A, B (Left stacked tables), C (Spacer), D, E (Right summary tables)
  worksheet.columns = [
    { key: 'A', width: 28 }, // البيان (left tables)
    { key: 'B', width: 14 }, // المبلغ (left tables)
    { key: 'C', width: 4 },  // Spacer
    { key: 'D', width: 28 }, // بيانات الكاش / الجرد
    { key: 'E', width: 14 }  // القيمة
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

  // 1. Top Banner (Across A to E)
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'مطعم يحيى البيك - تقرير إغلاق الكاش اليومي الشامل';
  applyStyle(titleCell, true, 'center', '1e3a5f', false);
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };

  worksheet.addRow([]); // Row 2

  // Date & Day Row
  const dateRow = worksheet.addRow(['', '', '', `التاريخ: ${report.date}`, `اليوم: ${report.dayName}`]);
  applyStyle(worksheet.getCell(`D${dateRow.number}`), true, 'right', 'FFF8F9FA', true);
  applyStyle(worksheet.getCell(`E${dateRow.number}`), true, 'center', 'FFF8F9FA', true);

  worksheet.addRow([]); // Row 4 spacer

  // ==========================================
  // RIGHT SIDE: Section 1 & Section 2 Summary
  // ==========================================
  const writeRightSummary = () => {
    let rIdx = 5;

    // Cash Section Header
    worksheet.mergeCells(`D${rIdx}:E${rIdx}`);
    const cHead = worksheet.getCell(`D${rIdx}`);
    cHead.value = 'بيانات الكاش والمبيعات';
    applyStyle(cHead, true, 'center', 'FFF8F9FA');
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
      worksheet.getCell(`D${rIdx}`).value = item.l;
      worksheet.getCell(`E${rIdx}`).value = item.v !== undefined && item.v !== null && item.v !== 0 ? item.v : '-';
      applyStyle(worksheet.getCell(`D${rIdx}`), item.h, 'right', item.h ? 'FFE2E8F0' : undefined);
      applyStyle(worksheet.getCell(`E${rIdx}`), item.h, 'center', item.h ? 'FFE2E8F0' : undefined);
      rIdx++;
    });

    rIdx++; // Spacer

    // Inventory Section Header
    worksheet.mergeCells(`D${rIdx}:E${rIdx}`);
    const iHead = worksheet.getCell(`D${rIdx}`);
    iHead.value = 'ملخص الجرد الفعلي';
    applyStyle(iHead, true, 'center', 'FFF8F9FA');
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
      { l: 'نقص الكاش', v: summary.differenceType === 'shortage' ? summary.cashDifference : 0, h: true, c: 'FFFFF0F5' },
      { l: 'زيادة الكاش', v: summary.differenceType === 'surplus' ? summary.cashDifference : 0, h: true, c: 'FFF0FDF4' }
    ];

    invArr.forEach(item => {
      const bg = item.c || (item.h ? 'FFE2E8F0' : undefined);
      worksheet.getCell(`D${rIdx}`).value = item.l;
      worksheet.getCell(`E${rIdx}`).value = item.v !== undefined && item.v !== null && item.v !== 0 ? item.v : '-';
      applyStyle(worksheet.getCell(`D${rIdx}`), item.h, 'right', bg);
      applyStyle(worksheet.getCell(`E${rIdx}`), item.h, 'center', bg);
      rIdx++;
    });
  };

  writeRightSummary();

  // ==========================================
  // LEFT SIDE: Stacked Tables in Columns A & B
  // ==========================================
  const writeMiniTable = (
    title: string,
    items: { name: string; amount: number }[],
    totalAmount: number,
    startRow: number
  ): number => {
    worksheet.mergeCells(`A${startRow}:B${startRow}`);
    const tCell = worksheet.getCell(`A${startRow}`);
    tCell.value = title;
    applyStyle(tCell, true, 'center', '1e3a5f');

    const subR = startRow + 1;
    worksheet.getCell(`A${subR}`).value = 'البيان';
    worksheet.getCell(`B${subR}`).value = 'المبلغ';
    applyStyle(worksheet.getCell(`A${subR}`), true, 'center', 'FFF8F9FA');
    applyStyle(worksheet.getCell(`B${subR}`), true, 'center', 'FFF8F9FA');

    let curR = subR + 1;
    if (items.length === 0) {
      worksheet.getCell(`A${curR}`).value = 'لا توجد مسجلات';
      worksheet.getCell(`B${curR}`).value = '-';
      applyStyle(worksheet.getCell(`A${curR}`), false, 'right');
      applyStyle(worksheet.getCell(`B${curR}`), false, 'center');
      curR++;
    } else {
      items.forEach(it => {
        worksheet.getCell(`A${curR}`).value = it.name || '';
        worksheet.getCell(`B${curR}`).value = it.amount ? it.amount : '-';
        applyStyle(worksheet.getCell(`A${curR}`), false, 'right');
        applyStyle(worksheet.getCell(`B${curR}`), false, 'center');
        curR++;
      });
    }

    worksheet.getCell(`A${curR}`).value = 'الإجمالي';
    worksheet.getCell(`B${curR}`).value = totalAmount ? totalAmount : 0;
    applyStyle(worksheet.getCell(`A${curR}`), true, 'right', 'FFE2E8F0');
    applyStyle(worksheet.getCell(`B${curR}`), true, 'center', 'FFE2E8F0');

    return curR + 2; // Next table start row
  };

  let leftRow = 5;

  // 1. إضافة ذمم تجار
  const vAddedItems = report.vendorDebtsAdded.map(v => ({ name: v.vendorName, amount: v.amount }));
  leftRow = writeMiniTable('إضافة ذمم تجار', vAddedItems, summary.totalVendorDebtsAdded, leftRow);

  // 2. سداد ذمم تجار
  const vPaidItems = report.vendorDebtsPaid.map(v => ({ name: v.vendorName, amount: v.amount }));
  leftRow = writeMiniTable('سداد ذمم تجار', vPaidItems, summary.totalVendorDebtsPaid, leftRow);

  // 3. مصاريف أخرى
  const otherExpItems = report.otherExpenses.map(e => ({ name: e.name, amount: e.amount }));
  leftRow = writeMiniTable('مصاريف أخرى', otherExpItems, summary.totalOtherExpenses, leftRow);

  // 4. الشقة
  const aptItems = report.apartmentExpenses.map(e => ({ name: e.name, amount: e.amount }));
  leftRow = writeMiniTable('الشقة', aptItems, summary.totalApartmentExpenses, leftRow);

  // 5. يحيى
  const yahyaItems = report.yahyaAccount.map(e => ({ name: e.name, amount: e.amount }));
  leftRow = writeMiniTable('يحيى', yahyaItems, summary.totalYahya, leftRow);

  // 6. أبو عبدالله
  const abuItems = report.abuAbdullahAccount.map(e => ({ name: e.name, amount: e.amount }));
  leftRow = writeMiniTable('أبو عبدالله', abuItems, summary.totalAbuAbdullah, leftRow);

  // 7. مصاريف إدارية
  const adminPredefined = ['ضمان', 'كهرباء', 'فاتورة نت', 'فاتورة اتصال', 'ضيافة', 'دعاية', 'قرطاسية'];
  const adminList = adminPredefined.map(name => {
    const found = report.adminExpenses.find(a => a.name.includes(name) || name.includes(a.name));
    return { name, amount: found?.amount || 0 };
  });
  const otherAdmin = report.adminExpenses.filter(a => !adminPredefined.some(p => a.name.includes(p) || p.includes(a.name)));
  const allAdminItems = [...adminList, ...otherAdmin.map(a => ({ name: a.name, amount: a.amount }))];
  leftRow = writeMiniTable('مصاريف إدارية', allAdminItems, summary.totalAdminExpenses, leftRow);

  // 8. بهارات
  const spicesItems = report.spices.map(s => ({ name: s.name, amount: s.amount }));
  leftRow = writeMiniTable('بهارات', spicesItems, summary.totalSpices, leftRow);

  // 9. معدات وصيانة
  const maintItems = report.maintenance.map(m => ({ name: m.name, amount: m.amount }));
  leftRow = writeMiniTable('معدات وصيانة', maintItems, summary.totalMaintenance, leftRow);

  // 10. مشتريات
  const purchItems = report.purchases.map(p => ({ name: p.name, amount: p.amount }));
  leftRow = writeMiniTable('مشتريات', purchItems, summary.totalPurchases, leftRow);

  // 11. المحفظة الإلكترونية
  const walletItems = report.walletExpenses.map(w => ({ name: w.name, amount: w.amount }));
  leftRow = writeMiniTable('المحفظة الإلكترونية', walletItems, summary.totalWallet, leftRow);

  worksheet.addRow([]); // Spacer

  // ==========================================
  // BOTTOM: Employee Advances Table
  // ==========================================
  const empStartRow = Math.max(leftRow, 32) + 2;
  worksheet.mergeCells(`A${empStartRow}:D${empStartRow}`);
  const empTitle = worksheet.getCell(`A${empStartRow}`);
  empTitle.value = 'سجل سلف الموظفين اليومية';
  applyStyle(empTitle, true, 'center', '1e3a5f');

  const empSubR = empStartRow + 1;
  worksheet.getCell(`A${empSubR}`).value = 'م';
  worksheet.getCell(`B${empSubR}`).value = 'اسم الموظف';
  worksheet.getCell(`C${empSubR}`).value = 'قيمة السلفة';
  worksheet.mergeCells(`D${empSubR}:D${empSubR}`);
  worksheet.getCell(`D${empSubR}`).value = 'التوقيع / ملاحظات';
  ['A', 'B', 'C', 'D'].forEach(c => applyStyle(worksheet.getCell(`${c}${empSubR}`), true, 'center', 'FFF8F9FA'));

  let curEmpR = empSubR + 1;
  report.employees.forEach((emp, i) => {
    worksheet.getCell(`A${curEmpR}`).value = i + 1;
    worksheet.getCell(`B${curEmpR}`).value = emp.name;
    worksheet.getCell(`C${curEmpR}`).value = emp.advance > 0 ? emp.advance : '-';
    worksheet.getCell(`D${curEmpR}`).value = emp.notes || '-';
    applyStyle(worksheet.getCell(`A${curEmpR}`), false, 'center');
    applyStyle(worksheet.getCell(`B${curEmpR}`), false, 'right');
    applyStyle(worksheet.getCell(`C${curEmpR}`), false, 'center');
    applyStyle(worksheet.getCell(`D${curEmpR}`), false, 'center');
    curEmpR++;
  });

  // Total Advances
  worksheet.mergeCells(`A${curEmpR}:C${curEmpR}`);
  worksheet.getCell(`A${curEmpR}`).value = 'إجمالي السلف';
  worksheet.getCell(`D${curEmpR}`).value = summary.totalAdvances;
  applyStyle(worksheet.getCell(`A${curEmpR}`), true, 'center', 'FFE2E8F0');
  applyStyle(worksheet.getCell(`D${curEmpR}`), true, 'center', 'FFE2E8F0');

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cloned_output.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};
