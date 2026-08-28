const fs = require('fs');
let code = fs.readFileSync('src/components/UnifiedReportView.tsx', 'utf8');

const target = `              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};`;

const replacement = `              </tr>
            </tbody>
          </table>
        </div>

        {/* Kitchen Statistics & Production */}
        <div className="mt-8 border-t-2 border-sky-600 pt-4">
          <h2 className="text-base font-black text-slate-900 mb-4">
            4. إحصائية المطبخ والإنتاج
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kitchen Consumption */}
            <div className="border border-slate-300 rounded-lg overflow-hidden h-fit">
              <div className="bg-slate-100 px-4 py-2 font-black text-center text-xs border-b border-slate-300 text-slate-800">
                استهلاك المطبخ
              </div>
              <table className="w-full text-xs text-right">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50 w-1/4">سيخ 1 (رز)</td>
                    <td className="p-2 font-mono text-slate-900 w-1/4">{report.kitchenConsumption?.rice1 || '-'}</td>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50 w-1/4">استهلاك لوز</td>
                    <td className="p-2 font-mono text-slate-900 w-1/4">{report.kitchenConsumption?.almonds || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">سيخ 2 (رز)</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.rice2 || '-'}</td>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">استهلاك بطاطا</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.potatoes || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">تزويد</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.supplyIn || '-'}</td>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">قشرة</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.peel || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">مرتجع</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.returns || '-'}</td>
                    <td className="p-2 font-bold text-slate-700 bg-slate-50">جنات</td>
                    <td className="p-2 font-mono text-slate-900">{report.kitchenConsumption?.jannat || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Production Items */}
            <div className="border border-slate-300 rounded-lg overflow-hidden h-fit">
              <div className="bg-slate-100 px-4 py-2 font-black text-center text-xs border-b border-slate-300 text-slate-800">
                إنتاج الشفتات
              </div>
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-2 text-right">البيان</th>
                    <th className="p-2">بروستد</th>
                    <th className="p-2">تكا</th>
                    <th className="p-2">زنجر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-right text-slate-700 bg-slate-50">الشفت الأول</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'بروستد')?.shift1 || '-'}</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'تكا')?.shift1 || '-'}</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'زنجر')?.shift1 || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-right text-slate-700 bg-slate-50">الشفت الثاني</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'بروستد')?.shift2 || '-'}</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'تكا')?.shift2 || '-'}</td>
                    <td className="p-2 font-mono">{report.productionItems?.find(p => p.name === 'زنجر')?.shift2 || '-'}</td>
                  </tr>
                  <tr className="bg-sky-50 font-bold">
                    <td className="p-2 text-right text-sky-900">المجموع</td>
                    <td className="p-2 font-mono text-sky-900">{report.productionItems?.find(p => p.name === 'بروستد')?.total || '-'}</td>
                    <td className="p-2 font-mono text-sky-900">{report.productionItems?.find(p => p.name === 'تكا')?.total || '-'}</td>
                    <td className="p-2 font-mono text-sky-900">{report.productionItems?.find(p => p.name === 'زنجر')?.total || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/UnifiedReportView.tsx', code);
