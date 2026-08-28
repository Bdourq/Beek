import React, { useState } from 'react';
import { ExpenseItem } from '../types';
import { QUICK_PURCHASE_PRESETS } from '../data/initialData';
import { formatCurrency } from '../utils/calculations';
import { ShoppingBag, Plus, Trash2, Zap } from 'lucide-react';

interface PurchasesSectionProps {
  purchases: ExpenseItem[];
  onChange: (purchases: ExpenseItem[]) => void;
}

export const PurchasesSection: React.FC<PurchasesSectionProps> = ({ purchases, onChange }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<string>('');

  const totalPurchases = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleAddItem = (presetName?: string) => {
    const name = presetName || newItemName.trim();
    if (!name) return;

    const amount = presetName ? 0 : parseFloat(newItemAmount) || 0;
    const newItem: ExpenseItem = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      amount
    };

    onChange([...purchases, newItem]);
    if (!presetName) {
      setNewItemName('');
      setNewItemAmount('');
    }
  };

  const handleUpdate = (id: string, field: keyof ExpenseItem, value: any) => {
    const updated = purchases.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    onChange(purchases.filter(p => p.id !== id));
  };

  return (
    <div id="purchases-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header & Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">المشتريات</h2>
            <p className="text-xs text-slate-500">تسجيل فواتير ومشتريات اليوم والموردين مع الحساب التلقائي</p>
          </div>
        </div>

        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-200/70 text-left sm:text-right">
          <span className="text-xs text-orange-800 font-medium block">مجموع المشتريات اليومي</span>
          <span className="text-xl font-black text-orange-950">{formatCurrency(totalPurchases)}</span>
        </div>
      </div>

      {/* Quick Presets Chips */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>أصناف وموردين متكررين (انقر للإضافة السريعة):</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
          {QUICK_PURCHASE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddItem(preset)}
              className="px-2.5 py-1 text-xs bg-white hover:bg-orange-500 hover:text-white text-slate-700 rounded-lg border border-slate-200 transition-all font-medium shadow-2xs"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Custom Row */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
        <input
          type="text"
          placeholder="بيان المادة / اسم المورد (مثال: دجاج، خضار، غاز...)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        />
        <input
          type="number"
          step="0.01"
          placeholder="المبلغ (د.أ)"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-center font-bold"
        />
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة للمشتريات</span>
        </button>
      </div>

      {/* Purchases Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {purchases.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 transition-colors shadow-2xs gap-2"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-mono shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                className="font-bold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none w-full truncate"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.amount === 0 ? '' : item.amount}
                placeholder="0.00"
                onChange={(e) =>
                  handleUpdate(
                    item.id,
                    'amount',
                    e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                  )
                }
                className="w-20 px-2 py-1 text-center font-black text-sm rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none bg-orange-50/50 text-orange-950"
              />
              <span className="text-xs text-slate-400 font-medium">د.أ</span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {purchases.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
            لا توجد مشتريات مسجلة بعد. استخدم الأصناف المتكررة أو أضف مواد وموردين جدد.
          </div>
        )}
      </div>
    </div>
  );
};
