import React from 'react';
import { DailyReport, ExpenseItem, VendorDebt } from '../types';
import { QUICK_ADMIN_PRESETS, QUICK_SPICE_PRESETS, QUICK_MAINTENANCE_PRESETS } from '../data/initialData';
import { formatCurrency } from '../utils/calculations';
import {
  Building2,
  Home,
  Wrench,
  Flame,
  User,
  CreditCard,
  Plus,
  Trash2,
  WalletCards,
  HandCoins
} from 'lucide-react';

interface ExpensesSectionProps {
  report: DailyReport;
  onChange: (updatedReport: Partial<DailyReport>) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ report, onChange }) => {
  // Generic list handler
  const handleUpdateItem = (
    listKey: keyof DailyReport,
    id: string,
    field: keyof ExpenseItem,
    value: any
  ) => {
    const list = (report[listKey] as ExpenseItem[]) || [];
    const updated = list.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ [listKey]: updated });
  };

  const handleAddItem = (listKey: keyof DailyReport, defaultName = 'بند جديد', defaultAmount = 0) => {
    const list = (report[listKey] as ExpenseItem[]) || [];
    const newItem: ExpenseItem = {
      id: `${String(listKey)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: defaultName,
      amount: defaultAmount
    };
    onChange({ [listKey]: [...list, newItem] });
  };

  const handleDeleteItem = (listKey: keyof DailyReport, id: string) => {
    const list = (report[listKey] as ExpenseItem[]) || [];
    onChange({ [listKey]: list.filter((item) => item.id !== id) });
  };

  // Vendor debts handler
  const handleUpdateVendorDebt = (
    listKey: 'vendorDebtsPaid' | 'vendorDebtsAdded',
    id: string,
    field: keyof VendorDebt,
    value: any
  ) => {
    const list = report[listKey] || [];
    const updated = list.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ [listKey]: updated });
  };

  const handleAddVendorDebt = (listKey: 'vendorDebtsPaid' | 'vendorDebtsAdded') => {
    const list = report[listKey] || [];
    const newItem: VendorDebt = {
      id: `${listKey}_${Date.now()}`,
      vendorName: 'اسم التاجر',
      amount: 0,
      notes: ''
    };
    onChange({ [listKey]: [...list, newItem] });
  };

  const handleDeleteVendorDebt = (
    listKey: 'vendorDebtsPaid' | 'vendorDebtsAdded',
    id: string
  ) => {
    const list = report[listKey] || [];
    onChange({ [listKey]: list.filter((item) => item.id !== id) });
  };

  return (
    <div id="all-expenses-section" className="space-y-6">
      {/* 1. Admin Expenses & Apartment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">المصاريف الإدارية</h3>
                <span className="text-xs text-slate-500">ضمان، كهرباء، نت، اتصال، قرطاسية...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAddItem('adminExpenses')}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.adminExpenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white transition-colors"
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem('adminExpenses', item.id, 'name', e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-24 truncate"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number" inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={item.amount === 0 ? '' : item.amount}
                    placeholder="0"
                    onChange={(e) =>
                      handleUpdateItem(
                        'adminExpenses',
                        item.id,
                        'amount',
                        e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-16 px-1.5 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('adminExpenses', item.id)}
                    className="text-slate-300 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apartment & Other */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">مصاريف الشقة والمحفظة</h3>
                <span className="text-xs text-slate-500">أغراض السكن، محفظة إلكترونية</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleAddItem('apartmentExpenses', 'أغراض الشقة')}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>شقة</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('walletExpenses', 'محفظة')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>محفظة</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>مصاريف الشقة:</span>
              <span className="text-purple-700 font-mono">
                {formatCurrency(report.apartmentExpenses.reduce((s, a) => s + (Number(a.amount) || 0), 0))}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.apartmentExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem('apartmentExpenses', item.id, 'name', e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-24 truncate"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" inputMode="decimal"
                      step="0.05"
                      min="0"
                      value={item.amount === 0 ? '' : item.amount}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateItem(
                          'apartmentExpenses',
                          item.id,
                          'amount',
                          e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 px-1.5 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem('apartmentExpenses', item.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-700 flex items-center justify-between pt-2">
              <span>المحفظة الرقمية:</span>
              <span className="text-indigo-700 font-mono">
                {formatCurrency(report.walletExpenses.reduce((s, w) => s + (Number(w.amount) || 0), 0))}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.walletExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem('walletExpenses', item.id, 'name', e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-24 truncate"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={item.amount === 0 ? '' : item.amount}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateItem(
                          'walletExpenses',
                          item.id,
                          'amount',
                          e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 px-1.5 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem('walletExpenses', item.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Spices, Maintenance, Yahya & Abu Abdullah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">البهارات</h3>
                <span className="text-xs text-slate-500">شاورما، تكا، مندي، مايونيز...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAddItem('spices', 'بهارات جديدة')}
              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {report.spices.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-1.5 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem('spices', item.id, 'name', e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-32 truncate"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number" inputMode="decimal"
                    step="0.5"
                    min="0"
                    value={item.amount === 0 ? '' : item.amount}
                    placeholder="0"
                    onChange={(e) =>
                      handleUpdateItem(
                        'spices',
                        item.id,
                        'amount',
                        e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-16 px-1 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('spices', item.id)}
                    className="text-slate-300 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment & Maintenance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">المعدات والصيانة</h3>
                <span className="text-xs text-slate-500">بلاط، كهرباء، مكيفات، ثلاجات</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAddItem('maintenance', 'صيانة جديدة')}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {report.maintenance.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-1.5 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem('maintenance', item.id, 'name', e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-32 truncate"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number" inputMode="decimal"
                    step="1"
                    min="0"
                    value={item.amount === 0 ? '' : item.amount}
                    placeholder="0"
                    onChange={(e) =>
                      handleUpdateItem(
                        'maintenance',
                        item.id,
                        'amount',
                        e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-16 px-1 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('maintenance', item.id)}
                    className="text-slate-300 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yahya & Abu Abdullah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">حساب يحيى وأبو عبدالله</h3>
                <span className="text-xs text-slate-500">أوردرات، مسحوبات خاصة</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAddItem('yahyaAccount', 'اوردر يحيى')}
                className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold"
              >
                + يحيى
              </button>
              <button
                type="button"
                onClick={() => handleAddItem('abuAbdullahAccount', 'أبو عبدالله')}
                className="text-[11px] bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-bold"
              >
                + أبو عبدالله
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 block mb-1">يحيى:</span>
              {report.yahyaAccount.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-1 rounded border border-slate-100 bg-slate-50/50 mb-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem('yahyaAccount', item.id, 'name', e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-28 truncate"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={item.amount === 0 ? '' : item.amount}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateItem(
                          'yahyaAccount',
                          item.id,
                          'amount',
                          e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 px-1 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem('yahyaAccount', item.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <span className="text-xs font-bold text-cyan-800 block mb-1">أبو عبدالله:</span>
              {report.abuAbdullahAccount.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-1 rounded border border-slate-100 bg-slate-50/50 mb-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem('abuAbdullahAccount', item.id, 'name', e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-28 truncate"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={item.amount === 0 ? '' : item.amount}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateItem(
                          'abuAbdullahAccount',
                          item.id,
                          'amount',
                          e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 px-1 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem('abuAbdullahAccount', item.id)}
                      className="text-slate-300 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Vendor Debts (سداد ذمم تجار + إضافة ذمم تجار) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* سداد ذمم تجار */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <HandCoins className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">سداد ذمم تجار (مدفوعات)</h3>
            </div>
            <button
              type="button"
              onClick={() => handleAddVendorDebt('vendorDebtsPaid')}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-bold"
            >
              + سداد تاجر
            </button>
          </div>

          <div className="space-y-2">
            {report.vendorDebtsPaid.map((v) => (
              <div key={v.id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/60">
                <input
                  type="text"
                  placeholder="اسم التاجر / المورد (مثال: فحم، دواجن...)"
                  value={v.vendorName}
                  onChange={(e) => handleUpdateVendorDebt('vendorDebtsPaid', v.id, 'vendorName', e.target.value)}
                  className="flex-1 text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                />
                <input
                  type="number" inputMode="decimal"
                  placeholder="المبلغ"
                  value={v.amount === 0 ? '' : v.amount}
                  onChange={(e) =>
                    handleUpdateVendorDebt(
                      'vendorDebtsPaid',
                      v.id,
                      'amount',
                      e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-20 px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white text-emerald-900"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteVendorDebt('vendorDebtsPaid', v.id)}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* إضافة ذمم تجار جديدة */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                <WalletCards className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">إضافة ذمم تجار (آجل / على الحساب)</h3>
            </div>
            <button
              type="button"
              onClick={() => handleAddVendorDebt('vendorDebtsAdded')}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded font-bold"
            >
              + ذمة جديدة
            </button>
          </div>

          <div className="space-y-2">
            {report.vendorDebtsAdded.map((v) => (
              <div key={v.id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/60">
                <input
                  type="text"
                  placeholder="اسم التاجر / المورد (مثال: ابو خليل...)"
                  value={v.vendorName}
                  onChange={(e) => handleUpdateVendorDebt('vendorDebtsAdded', v.id, 'vendorName', e.target.value)}
                  className="flex-1 text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                />
                <input
                  type="number" inputMode="decimal"
                  placeholder="المبلغ"
                  value={v.amount === 0 ? '' : v.amount}
                  onChange={(e) =>
                    handleUpdateVendorDebt(
                      'vendorDebtsAdded',
                      v.id,
                      'amount',
                      e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-20 px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white text-amber-900"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteVendorDebt('vendorDebtsAdded', v.id)}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
