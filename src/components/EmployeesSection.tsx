import React, { useState, useMemo } from 'react';
import { EmployeeRecord } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { Users, Search, Plus, Trash2, CheckSquare, Square, Clock, Sparkles } from 'lucide-react';

interface EmployeesSectionProps {
  employees: EmployeeRecord[];
  onChange: (employees: EmployeeRecord[]) => void;
}

export const EmployeesSection: React.FC<EmployeesSectionProps> = ({ employees, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmpName, setNewEmpName] = useState('');

  const totalAdvances = useMemo(() => {
    return employees.reduce((sum, e) => sum + (Number(e.advance) || 0), 0);
  }, [employees]);

  const totalTransport = useMemo(() => {
    return employees.reduce((sum, e) => sum + (Number(e.transport) || 0), 0);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    return employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  }, [employees, searchTerm]);

  const handleUpdate = (id: string, field: keyof EmployeeRecord, value: any) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onChange(updated);
  };

  const handleAddEmployee = () => {
    if (!newEmpName.trim()) return;
    const newEmp: EmployeeRecord = {
      id: `emp_${Date.now()}`,
      number: employees.length + 1,
      name: newEmpName.trim(),
      advance: 0,
      transport: 0,
      signed: false,
      notes: '',
      shiftIn: '10:00',
      shiftOut: '22:00'
    };
    onChange([...employees, newEmp]);
    setNewEmpName('');
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id).map((e, idx) => ({ ...e, number: idx + 1 }));
    onChange(updated);
  };

  const handleQuickAdvance = (id: string, addAmount: number) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        const current = Number(emp.advance) || 0;
        return { ...emp, advance: parseFloat((current + addAmount).toFixed(2)) };
      }
      return emp;
    });
    onChange(updated);
  };

  return (
    <div id="employees-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header & Totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">الموظفين والسلف والمواصلات</h2>
            <p className="text-xs text-slate-500">كشف سلف الموظفين ومطابقة بند السلف في ملخص الجرد اليومي</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200/70">
          <div>
            <span className="text-xs text-teal-800 font-medium block">مجموع السلف اليومي</span>
            <span className="text-lg font-black text-teal-900">{formatCurrency(totalAdvances)}</span>
          </div>
          <div className="w-px h-8 bg-teal-200 mx-1"></div>
          <div>
            <span className="text-xs text-teal-800 font-medium block">إجمالي المواصلات</span>
            <span className="text-sm font-bold text-teal-900">{formatCurrency(totalTransport)}</span>
          </div>
        </div>
      </div>

      {/* Action bar: Search + Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث عن اسم موظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="إضافة موظف جديد..."
            value={newEmpName}
            onChange={(e) => setNewEmpName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-44"
          />
          <button
            type="button"
            onClick={handleAddEmployee}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-12 text-center">الرقم</th>
              <th className="py-3 px-3">اسم الموظف</th>
              <th className="py-3 px-3 w-36">السلفة (د.أ)</th>
              <th className="py-3 px-3 w-28">مواصلات</th>
              <th className="py-3 px-3 w-24 text-center">دخول</th>
              <th className="py-3 px-3 w-24 text-center">خروج</th>
              <th className="py-3 px-3 w-20 text-center">توقيع</th>
              <th className="py-3 px-3">ملاحظات</th>
              <th className="py-3 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredEmployees.map((emp) => {
              const hasAdvance = Number(emp.advance) > 0;
              return (
                <tr
                  key={emp.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    hasAdvance ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-xs">
                    {emp.number}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{emp.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={emp.advance === 0 ? '' : emp.advance}
                        placeholder="0.00"
                        onChange={(e) =>
                          handleUpdate(
                            emp.id,
                            'advance',
                            e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-20 px-2 py-1 text-center rounded-lg border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                          hasAdvance
                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                            : 'border-slate-200 text-slate-800'
                        }`}
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(emp.id, 10)}
                          title="+10 د.أ"
                          className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-teal-100 text-slate-600 rounded font-semibold"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(emp.id, 25)}
                          title="+25 د.أ"
                          className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-teal-100 text-slate-600 rounded font-semibold"
                        >
                          +25
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={emp.transport === 0 ? '' : emp.transport}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleUpdate(
                          emp.id,
                          'transport',
                          e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="text"
                      value={emp.shiftIn || ''}
                      placeholder="10:00"
                      onChange={(e) => handleUpdate(emp.id, 'shiftIn', e.target.value)}
                      className="w-16 px-1.5 py-1 text-center text-xs rounded-lg border border-slate-200 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="text"
                      value={emp.shiftOut || ''}
                      placeholder="22:00"
                      onChange={(e) => handleUpdate(emp.id, 'shiftOut', e.target.value)}
                      className="w-16 px-1.5 py-1 text-center text-xs rounded-lg border border-slate-200 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleUpdate(emp.id, 'signed', !emp.signed)}
                      className="inline-flex items-center justify-center text-teal-600 hover:text-teal-700"
                    >
                      {emp.signed ? (
                        <CheckSquare className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={emp.notes || ''}
                      placeholder="ملاحظات..."
                      onChange={(e) => handleUpdate(emp.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-700"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteEmployee(emp.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                      title="حذف الموظف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
