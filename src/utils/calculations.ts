import { DailyReport, SummaryCalculations } from '../types';

export function calculateReportSummary(report: DailyReport): SummaryCalculations {
  const sumItems = (items: { amount?: number; advance?: number }[]) =>
    items.reduce((acc, item) => acc + (Number(item.amount || item.advance || 0) || 0), 0);

  const totalPurchases = sumItems(report.purchases || []);
  const totalAdvances = sumItems(report.employees || []);
  const totalVendorDebtsPaid = sumItems(report.vendorDebtsPaid || []);
  const totalVendorDebtsAdded = sumItems(report.vendorDebtsAdded || []);
  const totalAdminExpenses = sumItems(report.adminExpenses || []);
  const totalApartmentExpenses = sumItems(report.apartmentExpenses || []);
  const totalMaintenance = sumItems(report.maintenance || []);
  const totalSpices = sumItems(report.spices || []);
  const totalYahya = sumItems(report.yahyaAccount || []);
  const totalAbuAbdullah = sumItems(report.abuAbdullahAccount || []);
  const totalWallet = sumItems(report.walletExpenses || []);
  const totalOtherExpenses = sumItems(report.otherExpenses || []);

  const totalAllExpensesAndOutflows =
    totalPurchases +
    totalAdvances +
    totalVendorDebtsPaid +
    totalAdminExpenses +
    totalApartmentExpenses +
    totalMaintenance +
    totalSpices +
    totalYahya +
    totalAbuAbdullah +
    totalWallet +
    totalOtherExpenses;

  const actualCashInDrawer = Number(report.actualCashInDrawer) || 0;
  const visaPOS = Number(report.visaPOS) || 0;
  const rtPOS = Number(report.rtPOS) || 0;
  const maestroPOS = Number(report.maestroPOS) || 0;
  const priceDiff = Number(report.priceDiff) || 0;

  const sales = Number(report.sales) || 0;
  const otherSales = Number(report.otherSales) || 0;
  const openingCash = Number(report.openingCash) || 0;
  const newDebtsTotal = Number(report.newDebtsTotal) || totalVendorDebtsAdded || 0;
  const oldDebtsPaidTotal = Number(report.oldDebtsPaidTotal) || 0;

  const totalExpectedRevenue = sales + otherSales;
  // مجموع الكاش = النقد الافتتاحي + إضافة ذمم جديدة + تسديد ذمم قديمة + المبيعات + مبيعات أخرى
  const totalGrossCashAvailable = openingCash + newDebtsTotal + oldDebtsPaidTotal + sales + otherSales;

  // Reconciled Total as computed in paper sheet:
  // نقد + مشتريات + سلف + سداد تجار + مصاريف أخرى + الشقة + إدارية + محفظة + يحيى + أبو عبدالله + فيزا + RT + مايسترو + فرق سعر + صيانة + بهارات
  const totalReconciledInventory =
    actualCashInDrawer +
    totalPurchases +
    totalAdvances +
    totalVendorDebtsPaid +
    totalOtherExpenses +
    totalApartmentExpenses +
    totalAdminExpenses +
    totalWallet +
    totalYahya +
    totalAbuAbdullah +
    visaPOS +
    rtPOS +
    maestroPOS +
    priceDiff +
    totalMaintenance +
    totalSpices;

  // Expected cash in drawer = (Opening cash + Sales + Other sales) - All paid expenses - Electronic POS payments + Price diff
  const totalElectronic = visaPOS + rtPOS + maestroPOS;
  const expectedCashInDrawer = openingCash + sales + otherSales - totalAllExpensesAndOutflows - totalElectronic + priceDiff;

  // Reconciled Difference:
  // In paper sheet: مجموع الجرد vs (المبيعات) or (مجموع الكاش)
  // Let's compute difference = totalReconciledInventory - (openingCash + sales + otherSales)
  const cashDifference = parseFloat((totalReconciledInventory - totalGrossCashAvailable).toFixed(2));

  let differenceType: 'balanced' | 'surplus' | 'shortage' = 'balanced';
  if (cashDifference > 0.05) {
    differenceType = 'surplus';
  } else if (cashDifference < -0.05) {
    differenceType = 'shortage';
  }

  const totalCustodyForThem = report.custodyClaims?.reduce((sum, c) => sum + (Number(c.forThem) || 0), 0) || 0;
  const totalCustodyOnThem = report.custodyClaims?.reduce((sum, c) => sum + (Number(c.onThem) || 0), 0) || 0;

  return {
    totalPurchases: parseFloat(totalPurchases.toFixed(2)),
    totalAdvances: parseFloat(totalAdvances.toFixed(2)),
    totalVendorDebtsPaid: parseFloat(totalVendorDebtsPaid.toFixed(2)),
    totalVendorDebtsAdded: parseFloat(totalVendorDebtsAdded.toFixed(2)),
    totalAdminExpenses: parseFloat(totalAdminExpenses.toFixed(2)),
    totalApartmentExpenses: parseFloat(totalApartmentExpenses.toFixed(2)),
    totalMaintenance: parseFloat(totalMaintenance.toFixed(2)),
    totalSpices: parseFloat(totalSpices.toFixed(2)),
    totalYahya: parseFloat(totalYahya.toFixed(2)),
    totalAbuAbdullah: parseFloat(totalAbuAbdullah.toFixed(2)),
    totalWallet: parseFloat(totalWallet.toFixed(2)),
    totalOtherExpenses: parseFloat(totalOtherExpenses.toFixed(2)),
    totalCustodyForThem: parseFloat(totalCustodyForThem.toFixed(2)),
    totalCustodyOnThem: parseFloat(totalCustodyOnThem.toFixed(2)),
    totalAllExpensesAndOutflows: parseFloat(totalAllExpensesAndOutflows.toFixed(2)),
    totalExpectedRevenue: parseFloat(totalExpectedRevenue.toFixed(2)),
    totalGrossCashAvailable: parseFloat(totalGrossCashAvailable.toFixed(2)),
    totalReconciledInventory: parseFloat(totalReconciledInventory.toFixed(2)),
    expectedCashInDrawer: parseFloat(expectedCashInDrawer.toFixed(2)),
    cashDifference,
    hasDifference: Math.abs(cashDifference) > 0.05,
    differenceType
  };
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || isNaN(amount)) return '0.00 د.أ';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.أ`;
}

export function formatNumber(amount: number | undefined): string {
  if (amount === undefined || isNaN(amount)) return '0.00';
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const calculateDailySummary = calculateReportSummary;
