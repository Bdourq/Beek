import { DailyReport } from '../types';
import { calculateReportSummary, formatNumber } from './calculations';

export function formatWhatsAppReport(report: DailyReport): string {
  const summary = calculateReportSummary(report);
  const statusEmoji =
    summary.differenceType === 'balanced'
      ? '✅ (مطابقة تامة 100%)'
      : summary.differenceType === 'surplus'
      ? `🟢 (زيادة كاش +${summary.cashDifference} د.أ)`
      : `🚨 (نقص كاش ${summary.cashDifference} د.أ)`;

  const topPurchases = report.purchases
    .filter(p => p.amount > 0)
    .slice(0, 10)
    .map(p => `▫️ ${p.name}: ${formatNumber(p.amount)} د.أ`)
    .join('\n');

  const topAdvances = report.employees
    .filter(e => e.advance > 0)
    .map(e => `▫️ ${e.name}: ${formatNumber(e.advance)} د.أ`)
    .join('\n');

  return `🌯 *ملخص الجرد والمصاريف - مطعم شاورما البيك يحيى (AL-Baik)* 🍗
━━━━━━━━━━━━━━━━━━
📅 *التاريخ:* ${report.date} (${report.dayName})
👤 *الكاشير:* ${report.cashierName || 'كاشير الشفت'}
📌 *حالة المطابقة:* ${statusEmoji}

💰 *الإيرادات والنقد الافتتاحي:*
▫️ النقد الافتتاحي: ${formatNumber(report.openingCash)} د.أ
▫️ المبيعات: ${formatNumber(report.sales)} د.أ
▫️ مبيعات أخرى: ${formatNumber(report.otherSales)} د.أ
▫️ إجمالي الكاش المتوفر: ${formatNumber(summary.totalGrossCashAvailable)} د.أ

━━━━━━━━━━━━━━━━━━
📑 *ملخص المصاريف والخوارج:*
🛒 *المشتريات:* ${formatNumber(summary.totalPurchases)} د.أ
👥 *السلف:* ${formatNumber(summary.totalAdvances)} د.أ
🤝 *سداد ذمم تجار:* ${formatNumber(summary.totalVendorDebtsPaid)} د.أ
🏢 *مصاريف إدارية:* ${formatNumber(summary.totalAdminExpenses)} د.أ
🏠 *الشقة:* ${formatNumber(summary.totalApartmentExpenses)} د.أ
🔧 *المعدات والصيانة:* ${formatNumber(summary.totalMaintenance)} د.أ
🌶️ *البهارات:* ${formatNumber(summary.totalSpices)} د.أ
👤 *حساب يحيى:* ${formatNumber(summary.totalYahya)} د.أ
👤 *حساب أبو عبدالله:* ${formatNumber(summary.totalAbuAbdullah)} د.أ
📱 *المحفظة:* ${formatNumber(summary.totalWallet)} د.أ
📦 *مصاريف أخرى:* ${formatNumber(summary.totalOtherExpenses)} د.أ
💳 *فيزا (POS):* ${formatNumber(report.visaPOS)} د.أ
📶 *RT (POS):* ${formatNumber(report.rtPOS)} د.أ
💳 *مايسترو:* ${formatNumber(report.maestroPOS)} د.أ
⚖️ *فرق سعر:* ${formatNumber(report.priceDiff)} د.أ

━━━━━━━━━━━━━━━━━━
💵 *العد الفعلي والإغلاق:*
▫️ نقد فعلي بالدرج: ${formatNumber(report.actualCashInDrawer)} د.أ
▫️ مجموع الجرد الكلي: ${formatNumber(summary.totalReconciledInventory)} د.أ
▫️ إجمالي المتوقع: ${formatNumber(summary.totalGrossCashAvailable)} د.أ
${
  summary.differenceType === 'balanced'
    ? '✨ *النتيجة: الكاش مطابق تماماً 0.00 د.أ*'
    : summary.differenceType === 'surplus'
    ? `📈 *النتيجة: زيادة كاش بقيمة +${summary.cashDifference} د.أ*`
    : `📉 *النتيجة: نقص كاش بقيمة ${summary.cashDifference} د.أ*`
}

${topAdvances ? `👥 *تفاصيل سلف الموظفين:*\n${topAdvances}\n` : ''}
${topPurchases ? `🛒 *أبرز المشتريات:*\n${topPurchases}\n` : ''}
${report.generalNotes ? `📝 *ملاحظات:* ${report.generalNotes}` : ''}
━━━━━━━━━━━━━━━━━━
تم إعداد التقرير آلياً عبر نظام يحيى البيك الذكي للجرد`;
}

export const generateWhatsAppMessage = formatWhatsAppReport;

export function getWhatsAppUrl(report: DailyReport, phoneNumber?: string): string {
  const text = encodeURIComponent(formatWhatsAppReport(report));
  if (phoneNumber && phoneNumber.trim()) {
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}?text=${text}`;
  }
  return `https://api.whatsapp.com/send?text=${text}`;
}
