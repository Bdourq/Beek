import React, { useState } from 'react';
import { X, Coins, Check, RotateCcw, Calculator, ArrowLeft } from 'lucide-react';
import { formatNumber } from '../utils/calculations';

interface CashCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  onApplyCash: (totalCash: number) => void;
}

interface Denomination {
  id: string;
  label: string;
  value: number;
  type: 'note' | 'coin';
  color: string;
}

const DENOMINATIONS: Denomination[] = [
  { id: 'd50', label: '50 دينار (فئة الخمسين)', value: 50, type: 'note', color: 'bg-emerald-700 text-white' },
  { id: 'd20', label: '20 دينار (فئة العشرين)', value: 20, type: 'note', color: 'bg-teal-700 text-white' },
  { id: 'd10', label: '10 دنانير (فئة العشرة)', value: 10, type: 'note', color: 'bg-blue-700 text-white' },
  { id: 'd5', label: '5 دنانير (فئة الخمسة)', value: 5, type: 'note', color: 'bg-amber-700 text-white' },
  { id: 'd1', label: '1 دينار (فئة الدينار)', value: 1, type: 'note', color: 'bg-lime-700 text-white' },
  { id: 'c050', label: 'نصف دينار (0.50 د.أ)', value: 0.5, type: 'coin', color: 'bg-yellow-600 text-white' },
  { id: 'c025', label: 'ربع دينار (0.25 د.أ)', value: 0.25, type: 'coin', color: 'bg-amber-600 text-white' },
  { id: 'c010', label: '10 قروش (بريزة - 0.10)', value: 0.1, type: 'coin', color: 'bg-orange-600 text-white' },
  { id: 'c005', label: '5 قروش (شلن - 0.05)', value: 0.05, type: 'coin', color: 'bg-rose-600 text-white' }
];

export const CashCounterModal: React.FC<CashCounterModalProps> = ({
  isOpen,
  onClose,
  currentAmount,
  onApplyCash
}) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    d50: 0,
    d20: 0,
    d10: 0,
    d5: 0,
    d1: 0,
    c050: 0,
    c025: 0,
    c010: 0,
    c005: 0
  });

  if (!isOpen) return null;

  const totalCalculated = DENOMINATIONS.reduce((sum, denom) => {
    const qty = counts[denom.id] || 0;
    return sum + qty * denom.value;
  }, 0);

  const handleCountChange = (id: string, val: string) => {
    const num = parseInt(val, 10) || 0;
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, num) }));
  };

  const increment = (id: string, amount = 1) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + amount }));
  };

  const handleReset = () => {
    setCounts({
      d50: 0,
      d20: 0,
      d10: 0,
      d5: 0,
      d1: 0,
      c050: 0,
      c025: 0,
      c010: 0,
      c005: 0
    });
  };

  const handleApply = () => {
    onApplyCash(totalCalculated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['IBM_Plex_Sans_Arabic','Cairo',sans-serif]">
      <div className="bg-zinc-950 border-2 border-yellow-400/90 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-zinc-950 font-black">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm sm:text-base">
                حاسبة عد النقد في الدرج (الفئات النقدية الأردنية)
              </h3>
              <p className="text-zinc-400 text-xs">
                أدخل عدد الأوراق والقطع النقدية لحساب مجموع كاش الدرج بدقة وسرعة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Total Display Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-zinc-400 font-bold block">مجموع النقد المعدود حالياً:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                {formatNumber(totalCalculated)}
              </span>
              <span className="text-sm font-bold text-zinc-300">دينار أردني</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير العداد</span>
            </button>
          </div>
        </div>

        {/* Denominations Grid */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-zinc-800/60">
          {/* Banknotes */}
          <div>
            <h4 className="text-xs font-black text-yellow-400 mb-2 flex items-center gap-1.5">
              <span>الأوراق النقدية (Banknotes):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DENOMINATIONS.filter((d) => d.type === 'note').map((denom) => {
                const count = counts[denom.id] || 0;
                const subtotal = count * denom.value;
                return (
                  <div
                    key={denom.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-black font-mono text-sm ${denom.color}`}
                      >
                        {denom.value}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{denom.label}</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          المجموع: {formatNumber(subtotal)} د.أ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => increment(denom.id, 1)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black flex items-center justify-center"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => increment(denom.id, 5)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black flex items-center justify-center"
                      >
                        +5
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={count === 0 ? '' : count}
                        placeholder="0"
                        onChange={(e) => handleCountChange(denom.id, e.target.value)}
                        className="w-14 text-center font-mono font-black text-sm bg-zinc-950 border border-zinc-700 focus:border-yellow-400 rounded py-1 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coins */}
          <div className="pt-3">
            <h4 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
              <span>الفئات المعدنية والكسور (Coins):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DENOMINATIONS.filter((d) => d.type === 'coin').map((denom) => {
                const count = counts[denom.id] || 0;
                const subtotal = count * denom.value;
                return (
                  <div
                    key={denom.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black font-mono text-xs ${denom.color}`}
                      >
                        {denom.value}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{denom.label}</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          المجموع: {formatNumber(subtotal)} د.أ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => increment(denom.id, 1)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black flex items-center justify-center"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => increment(denom.id, 5)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black flex items-center justify-center"
                      >
                        +5
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={count === 0 ? '' : count}
                        placeholder="0"
                        onChange={(e) => handleCountChange(denom.id, e.target.value)}
                        className="w-14 text-center font-mono font-black text-sm bg-zinc-950 border border-zinc-700 focus:border-yellow-400 rounded py-1 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>اعتماد المبلغ ({formatNumber(totalCalculated)} د.أ) في خانة نقد الدرج</span>
          </button>
        </div>
      </div>
    </div>
  );
};
