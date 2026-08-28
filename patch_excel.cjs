const fs = require('fs');
let code = fs.readFileSync('src/utils/excelExport.ts', 'utf8');

// 1. Remove the kitchen stuff from the first sheet
const kitchenTarget = `  // 4. Section 3 (Kitchen & Production Tables) - Placed beside each other
  worksheet.addRow([]); // Spacer
  const sec3Row = worksheet.addRow(['الإنتاج واستهلاك المطبخ']);
  worksheet.mergeCells(\`A\${sec3Row.number}:F\${sec3Row.number}\`);
  applyStyle(worksheet.getCell(\`A\${sec3Row.number}\`), true, 'right', undefined, false);
  worksheet.getCell(\`A\${sec3Row.number}\`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

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
  worksheet.mergeCells(\`A\${kHeaderRow.number}:D\${kHeaderRow.number}\`);
  worksheet.mergeCells(\`E\${kHeaderRow.number}:F\${kHeaderRow.number}\`);
  applyStyle(kHeaderRow.getCell('A'), true, 'center', 'FFF8F9FA');
  applyStyle(kHeaderRow.getCell('E'), true, 'center', 'FFF8F9FA');

  const kSubHeaderRow = worksheet.addRow([
    '', '', '', '', 
    prodItems[0].n, prodItems[1].n // We'll squeeze the 3 columns into E & F by just displaying text if needed, or expand columns.
  ]);

  // Actually, let's keep it simple.
  worksheet.addRow(['سيخ 1', kArr[0].valR, 'استهلاك رز', kArr[0].valL, 'الشفت الأول', \`\${prodItems[0].n}:\${prodItems[0].item?.shift1||0} | \${prodItems[1].n}:\${prodItems[1].item?.shift1||0} | \${prodItems[2].n}:\${prodItems[2].item?.shift1||0}\`]);
  worksheet.addRow(['سيخ 2', kArr[1].valR, 'استهلاك لوز', kArr[1].valL, 'الشفت الثاني', \`\${prodItems[0].n}:\${prodItems[0].item?.shift2||0} | \${prodItems[1].n}:\${prodItems[1].item?.shift2||0} | \${prodItems[2].n}:\${prodItems[2].item?.shift2||0}\`]);
  worksheet.addRow(['تزويد', kArr[2].valR, 'استهلاك بطاطا', kArr[2].valL, 'المجموع', \`\${prodItems[0].n}:\${prodItems[0].item?.total||0} | \${prodItems[1].n}:\${prodItems[1].item?.total||0} | \${prodItems[2].n}:\${prodItems[2].item?.total||0}\`]);
  worksheet.addRow(['مرتجع', kArr[3].valR, '', '', '', '']);

  // Format these rows
  for(let i = 0; i < 4; i++) {
    const rowNum = kHeaderRow.number + 2 + i;
    ['A', 'C', 'E'].forEach(c => applyStyle(worksheet.getCell(\`\${c}\${rowNum}\`), true, 'right', 'FFF8F9FA'));
    ['B', 'D', 'F'].forEach(c => applyStyle(worksheet.getCell(\`\${c}\${rowNum}\`), false, 'center'));
  }

  worksheet.addRow([]); // Spacer`;

code = code.replace(kitchenTarget, `  // Moved Kitchen Stats to Sheet 2`);

// 2. Append Kitchen Stats to the second sheet (empSheet)
// Search for the end of the empSheet block
const empEndTarget = `  empSheet.getCell(\`A\${empFooter.number}\`).font = { bold: true };
  empSheet.getCell(\`H\${empFooter.number}\`).font = { bold: true, color: { argb: 'FF065F46' } };
  empSheet.getCell(\`I\${empFooter.number}\`).font = { bold: true, color: { argb: 'FF92400E' } };`;

const empEndReplacement = `  empSheet.getCell(\`A\${empFooter.number}\`).font = { bold: true };
  empSheet.getCell(\`H\${empFooter.number}\`).font = { bold: true, color: { argb: 'FF065F46' } };
  empSheet.getCell(\`I\${empFooter.number}\`).font = { bold: true, color: { argb: 'FF92400E' } };

  empSheet.addRow([]); // Spacer
  empSheet.addRow([]); // Spacer

  // ------------------------------------------------------------------
  // إحصائية المطبخ والإنتاج (Kitchen & Production Statistics)
  // ------------------------------------------------------------------
  const statTitleRow = empSheet.addRow(['إحصائية المطبخ والإنتاج']);
  empSheet.mergeCells(\`A\${statTitleRow.number}:K\${statTitleRow.number}\`);
  applyStyle(empSheet.getCell(\`A\${statTitleRow.number}\`), true, 'center', 'FFE2E8F0', false);
  empSheet.getCell(\`A\${statTitleRow.number}\`).font = { size: 14, bold: true, color: { argb: 'FF1E3A5F' } };

  empSheet.addRow([]); // Spacer

  // We'll create two tables side by side or one below another. Let's do one below another to keep columns clean.
  // Table 1: استهلاك المطبخ
  const kTitleRow = empSheet.addRow(['استهلاك المطبخ', '', '', '']);
  empSheet.mergeCells(\`A\${kTitleRow.number}:D\${kTitleRow.number}\`);
  applyStyle(empSheet.getCell(\`A\${kTitleRow.number}\`), true, 'center', 'FFF8F9FA');
  
  const kArr = [
    { label1: 'سيخ 1 (رز)', val1: report.kitchenConsumption?.rice1 || '', label2: 'استهلاك لوز', val2: report.kitchenConsumption?.almonds || '' },
    { label1: 'سيخ 2 (رز)', val1: report.kitchenConsumption?.rice2 || '', label2: 'استهلاك بطاطا', val2: report.kitchenConsumption?.potatoes || '' },
    { label1: 'تزويد', val1: report.kitchenConsumption?.supplyIn || '', label2: 'قشرة', val2: report.kitchenConsumption?.peel || '' },
    { label1: 'مرتجع', val1: report.kitchenConsumption?.returns || '', label2: 'جنات', val2: report.kitchenConsumption?.jannat || '' },
  ];

  kArr.forEach(k => {
    const r = empSheet.addRow([k.label1, k.val1, k.label2, k.val2]);
    applyStyle(r.getCell('A'), true, 'right', 'FFF1F5F9');
    applyStyle(r.getCell('B'), true, 'center');
    applyStyle(r.getCell('C'), true, 'right', 'FFF1F5F9');
    applyStyle(r.getCell('D'), true, 'center');
  });

  empSheet.addRow([]); // Spacer

  // Table 2: إنتاج الشفتات
  const pTitleRow = empSheet.addRow(['إنتاج الشفتات', '', '', '']);
  empSheet.mergeCells(\`A\${pTitleRow.number}:D\${pTitleRow.number}\`);
  applyStyle(empSheet.getCell(\`A\${pTitleRow.number}\`), true, 'center', 'FFF8F9FA');

  const pHeaderRow = empSheet.addRow(['البيان', 'بروستد', 'تكا', 'زنجر']);
  ['A', 'B', 'C', 'D'].forEach(c => applyStyle(pHeaderRow.getCell(c), true, 'center', 'FFF1F5F9'));

  const prodItems = [
    { n: 'بروستد', item: report.productionItems?.find(p => p.name === 'بروستد') },
    { n: 'تكا', item: report.productionItems?.find(p => p.name === 'تكا') },
    { n: 'زنجر', item: report.productionItems?.find(p => p.name === 'زنجر') }
  ];

  const shifts = [
    { label: 'الشفت الأول', key: 'shift1' },
    { label: 'الشفت الثاني', key: 'shift2' },
    { label: 'المجموع', key: 'total', bg: 'FFE0F2FE', fontColor: 'FF0369A1' }
  ];

  shifts.forEach(s => {
    const r = empSheet.addRow([
      s.label,
      prodItems[0].item?.[s.key] || '-',
      prodItems[1].item?.[s.key] || '-',
      prodItems[2].item?.[s.key] || '-'
    ]);
    
    applyStyle(r.getCell('A'), true, 'right', s.bg || 'FFF8F9FA');
    ['B', 'C', 'D'].forEach(c => {
      applyStyle(r.getCell(c), true, 'center', s.bg);
      if (s.fontColor) {
        r.getCell(c).font = { bold: true, color: { argb: s.fontColor } };
      }
    });
  });
`;

code = code.replace(empEndTarget, empEndReplacement);
fs.writeFileSync('src/utils/excelExport.ts', code);
