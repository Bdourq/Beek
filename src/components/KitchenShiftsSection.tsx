import React from 'react';
import { KitchenConsumption, ProductionItem } from '../types';
import { UtensilsCrossed, Layers, PackageCheck } from 'lucide-react';

interface KitchenShiftsSectionProps {
  kitchenConsumption: KitchenConsumption;
  productionItems: ProductionItem[];
  onChangeKitchen: (kitchen: KitchenConsumption) => void;
  onChangeProduction: (production: ProductionItem[]) => void;
}

export const KitchenShiftsSection: React.FC<KitchenShiftsSectionProps> = ({
  kitchenConsumption,
  productionItems,
  onChangeKitchen,
  onChangeProduction
}) => {
  const handleUpdateKitchenField = (field: keyof KitchenConsumption, value: number) => {
    onChangeKitchen({
      ...kitchenConsumption,
      [field]: isNaN(value) ? 0 : value
    });
  };

  const handleUpdateProductionItem = (
    id: string,
    field: 'shift1' | 'shift2',
    value: number
  ) => {
    const updated = productionItems.map((item) => {
      if (item.id === id) {
        const val = isNaN(value) ? 0 : value;
        const s1 = field === 'shift1' ? val : Number(item.shift1) || 0;
        const s2 = field === 'shift2' ? val : Number(item.shift2) || 0;
        return {
          ...item,
          [field]: val,
          total: s1 + s2
        };
      }
      return item;
    });
    onChangeProduction(updated);
  };

  return (
    <div id="kitchen-shifts-section" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">استهلاك المطبخ وحركة الإنتاج اليومي</h2>
          <p className="text-xs text-slate-500">حركة شفتات البروستد والتكا والزنجر واستهلاك الرز والبطاطا واللوز</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Production Shifts Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>حركة إنتاج الشفتات (بروستد / تكا / زنجر)</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">الصنف</th>
                  <th className="py-2.5 px-3 text-center">الشفت الأول</th>
                  <th className="py-2.5 px-3 text-center">الشفت الثاني</th>
                  <th className="py-2.5 px-3 text-center">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {productionItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number" inputMode="decimal"
                        min="0"
                        value={item.shift1 === 0 ? '' : item.shift1}
                        placeholder="0"
                        onChange={(e) =>
                          handleUpdateProductionItem(
                            item.id,
                            'shift1',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number" inputMode="decimal"
                        min="0"
                        value={item.shift2 === 0 ? '' : item.shift2}
                        placeholder="0"
                        onChange={(e) =>
                          handleUpdateProductionItem(
                            item.id,
                            'shift2',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-black text-amber-700 font-mono text-sm">
                        {(Number(item.shift1) || 0) + (Number(item.shift2) || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Kitchen Consumables Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>استهلاك المواد والمخزون</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                سيخ 1 (استهلاك رز)
              </label>
              <input
                type="number" inputMode="decimal"
                step="0.1"
                value={kitchenConsumption.rice1 === 0 ? '' : kitchenConsumption.rice1}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('rice1', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                سيخ 2 (استهلاك رز)
              </label>
              <input
                type="number" inputMode="decimal"
                step="0.1"
                value={kitchenConsumption.rice2 === 0 ? '' : kitchenConsumption.rice2}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('rice2', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                استهلاك لوز
              </label>
              <input
                type="number" inputMode="decimal"
                step="0.05"
                value={kitchenConsumption.almonds === 0 ? '' : kitchenConsumption.almonds}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('almonds', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                استهلاك بطاطا
              </label>
              <input
                type="number" inputMode="decimal"
                step="0.1"
                value={kitchenConsumption.potatoes === 0 ? '' : kitchenConsumption.potatoes}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('potatoes', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                تزويد
              </label>
              <input
                type="number" inputMode="decimal"
                step="1"
                value={kitchenConsumption.supplyIn === 0 ? '' : kitchenConsumption.supplyIn}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('supplyIn', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                مرتجع
              </label>
              <input
                type="number" inputMode="decimal"
                step="1"
                value={kitchenConsumption.returns === 0 ? '' : kitchenConsumption.returns}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('returns', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                جنات
              </label>
              <input
                type="number" inputMode="decimal"
                step="1"
                value={kitchenConsumption.jannat === 0 ? '' : kitchenConsumption.jannat}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('jannat', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                قشرة
              </label>
              <input
                type="number" inputMode="decimal"
                step="1"
                value={kitchenConsumption.peel === 0 ? '' : kitchenConsumption.peel}
                placeholder="0"
                onChange={(e) =>
                  handleUpdateKitchenField('peel', parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-center font-bold text-xs rounded border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
