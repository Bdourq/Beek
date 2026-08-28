import React, { useState } from 'react';
import { DailyReport, SummaryCalculations } from '../types';
import { PurchasesSection } from './PurchasesSection';
import { EmployeesSection } from './EmployeesSection';
import { ExpensesSection } from './ExpensesSection';
import { KitchenShiftsSection } from './KitchenShiftsSection';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Banknote,
  ShoppingBag,
  Users,
  Receipt,
  UtensilsCrossed,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CashierEntryViewProps {
  report: DailyReport;
  summary: SummaryCalculations;
  onUpdateReport: (updated: Partial<DailyReport>) => void;
}

export const CashierEntryView: React.FC<CashierEntryViewProps> = ({
  report,
  summary,
  onUpdateReport
}) => {
  const [activeTab, setActiveTab] = useState<'cash' | 'purchases' | 'staff' | 'expenses' | 'kitchen'>('cash');

  return (
    <div id="cashier-entry-view-container" className="space-y-6 max-w-7xl mx-auto">
      {/* Tab Navigation Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('cash')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'cash'
              ? 'bg-red-600 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>الكاش والمبيعات والفيزا</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'bg-red-600 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>المشتريات ({report.purchases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-red-600 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سلف الموظفين والحضور ({formatCurrency(summary.totalAdvances)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-red-600 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>المصاريف والذمم والبهارات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kitchen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
            activeTab === 'kitchen'
              ? 'bg-red-600 text-white shadow-sm ring-2 ring-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>استهلاك المطبخ والإنتاج</span>
        </button>
      </div>

      {/* Tab 1: Cash, Sales, POS */}
      {activeTab === 'cash' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales & Inflows */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">المبيعات والنقد الافتتاحي</h3>
                <p className="text-xs text-slate-500">إدخال مبيعات اليوم وصندوق الصباح</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  إجمالي مبيعات اليوم (من شاشة الكاشير / POS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={report.sales === 0 ? '' : report.sales}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ sales: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-xl font-black rounded-xl border-2 border-amber-400 bg-amber-50/50 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-800">
                    د.أ
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    النقد الافتتاحي (افتتاحية الصندوق)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={report.openingCash === 0 ? '' : report.openingCash}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ openingCash: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مبيعات أخرى (إن وجدت)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={report.otherSales === 0 ? '' : report.otherSales}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ otherSales: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">إجمالي الكاش المتوفر:</span>
                <span className="text-lg font-black text-indigo-900 font-mono">
                  {formatCurrency(summary.totalGrossCashAvailable)}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Count & Electronic Cards */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">العد الفعلي والمدفوعات الإلكترونية</h3>
                <p className="text-xs text-slate-500">جرد النقد بالدرج وفيزا وRT ومايسترو وفروقات السعر</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  نقد فعلي في الدرج (العد اليدوي عند الإغلاق)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={report.actualCashInDrawer === 0 ? '' : report.actualCashInDrawer}
                    placeholder="0.00"
                    onChange={(e) =>
                      onUpdateReport({ actualCashInDrawer: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 text-xl font-black rounded-xl border-2 border-indigo-400 bg-indigo-50/50 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-800">
                    د.أ
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مدفوعات فيزا (Visa)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={report.visaPOS === 0 ? '' : report.visaPOS}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ visaPOS: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RT (أوردرات ملغاة / Return)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={report.rtPOS === 0 ? '' : report.rtPOS}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ rtPOS: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مدفوعات مايسترو
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={report.maestroPOS === 0 ? '' : report.maestroPOS}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ maestroPOS: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فرق سعر / تسويات
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={report.priceDiff === 0 ? '' : report.priceDiff}
                    placeholder="0.00"
                    onChange={(e) => onUpdateReport({ priceDiff: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Purchases */}
      {activeTab === 'purchases' && (
        <PurchasesSection
          purchases={report.purchases}
          onChange={(purchases) => onUpdateReport({ purchases })}
        />
      )}

      {/* Tab 3: Staff */}
      {activeTab === 'staff' && (
        <EmployeesSection
          employees={report.employees}
          onChange={(employees) => onUpdateReport({ employees })}
        />
      )}

      {/* Tab 4: Expenses & Debts */}
      {activeTab === 'expenses' && (
        <ExpensesSection report={report} onChange={onUpdateReport} />
      )}

      {/* Tab 5: Kitchen & Production */}
      {activeTab === 'kitchen' && (
        <KitchenShiftsSection
          kitchenConsumption={report.kitchenConsumption}
          productionItems={report.productionItems}
          onChangeKitchen={(kitchenConsumption) => onUpdateReport({ kitchenConsumption })}
          onChangeProduction={(productionItems) => onUpdateReport({ productionItems })}
        />
      )}
    </div>
  );
};
