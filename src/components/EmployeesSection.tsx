import React, { useState, useMemo } from 'react';
import { EmployeeRecord } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import {
  Users,
  Search,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Calculator,
  Coins,
  CalendarCheck,
  CheckCircle2,
  TrendingDown,
  ArrowRightLeft,
  UserCheck,
  UserX
} from 'lucide-react';

interface EmployeesSectionProps {
  employees: EmployeeRecord[];
  onChange: (employees: EmployeeRecord[]) => void;
}

// Utility to calculate hours between two times (HH:mm)
export function calculateShiftHours(shiftIn: string, shiftOut: string): number {
  if (!shiftIn || !shiftOut || !shiftIn.includes(':') || !shiftOut.includes(':')) return 0;
  const [h1, m1] = shiftIn.split(':').map(Number);
  const [h2, m2] = shiftOut.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;

  let mins1 = h1 * 60 + m1;
  let mins2 = h2 * 60 + m2;

  // Handle overnight shift (e.g. 16:00 to 02:00)
  if (mins2 < mins1) {
    mins2 += 24 * 60;
  }

  const diffMins = mins2 - mins1;
  return parseFloat((diffMins / 60).toFixed(2));
}

// Calculate wage: only for daily (مياومة) based on hours * hourlyRate
export function computeHourlyWage(
  hours: number,
  hourlyRate: number = 0,
  employmentType: 'daily' | 'monthly' = 'daily'
): number {
  if (employmentType === 'monthly') return 0; // الموظف الشهري بدون أي حسابات
  if (hours <= 0 || hourlyRate <= 0) return 0;
  return parseFloat((hours * hourlyRate).toFixed(2));
}

// Helper to get current time in HH:mm
function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const EmployeesSection: React.FC<EmployeesSectionProps> = ({ employees, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpType, setNewEmpType] = useState<'daily' | 'monthly'>('daily');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState<number>(1.5);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'monthly'>('all');

  // Stats calculation
  const dailyEmployees = useMemo(
    () => employees.filter((e) => (e.employmentType || 'daily') === 'daily'),
    [employees]
  );
  const monthlyEmployees = useMemo(
    () => employees.filter((e) => (e.employmentType || 'daily') === 'monthly'),
    [employees]
  );

  const totalAdvances = useMemo(() => {
    return employees.reduce((sum, e) => sum + (Number(e.advance) || 0), 0);
  }, [employees]);

  const totalDailyWages = useMemo(() => {
    return dailyEmployees.reduce((sum, e) => sum + (Number(e.calculatedWage) || 0), 0);
  }, [dailyEmployees]);

  const totalDailyHours = useMemo(() => {
    return dailyEmployees.reduce((sum, e) => {
      const hours = e.hoursWorked ?? calculateShiftHours(e.shiftIn, e.shiftOut);
      return sum + hours;
    }, 0);
  }, [dailyEmployees]);

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (filterType === 'daily') {
      result = result.filter((e) => (e.employmentType || 'daily') === 'daily');
    } else if (filterType === 'monthly') {
      result = result.filter((e) => (e.employmentType || 'daily') === 'monthly');
    }
    if (searchTerm.trim()) {
      result = result.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }
    return result;
  }, [employees, filterType, searchTerm]);

  // Handle single field update with automatic wage calculation on checkout
  const handleUpdate = (id: string, field: keyof EmployeeRecord, value: any) => {
    const updated = employees.map((emp) => {
      if (emp.id === id) {
        const newEmp = { ...emp, [field]: value };

        const empType = (field === 'employmentType' ? value : (newEmp.employmentType || 'daily')) as 'daily' | 'monthly';
        const shiftIn = field === 'shiftIn' ? value : newEmp.shiftIn;
        const shiftOut = field === 'shiftOut' ? value : newEmp.shiftOut;
        const rate = (field === 'hourlyRate' ? Number(value) : (Number(newEmp.hourlyRate) || defaultHourlyRate)) || 0;

        const hours = calculateShiftHours(shiftIn, shiftOut);
        newEmp.hoursWorked = hours;

        if (empType === 'monthly') {
          // الموظف الشهري يترك بدون أي حسابات للأجر اليومي
          newEmp.calculatedWage = 0;
          newEmp.hourlyRate = 0;
        } else {
          // الموظف المياومة: احتساب أوتوماتيكي للأجرة = الساعات * أجر الساعة
          newEmp.hourlyRate = rate > 0 ? rate : defaultHourlyRate;
          newEmp.calculatedWage = computeHourlyWage(hours, newEmp.hourlyRate, 'daily');
        }

        return newEmp;
      }
      return emp;
    });
    onChange(updated);
  };

  // Switch employment type toggle
  const handleToggleEmploymentType = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const currentType = emp.employmentType || 'daily';
    const nextType: 'daily' | 'monthly' = currentType === 'daily' ? 'monthly' : 'daily';
    handleUpdate(id, 'employmentType', nextType);
  };

  // Quick checkout action for an employee (تسجيل خروج الآن وحساب الأجرة فوراً)
  const handleRecordCheckoutNow = (id: string) => {
    const nowTime = getCurrentTimeString();
    handleUpdate(id, 'shiftOut', nowTime);
  };

  // Apply default hourly rate to all daily workers
  const handleApplyHourlyRateToAllDaily = () => {
    const updated = employees.map((emp) => {
      const isDaily = (emp.employmentType || 'daily') === 'daily';
      if (isDaily) {
        const hours = calculateShiftHours(emp.shiftIn, emp.shiftOut);
        const wage = computeHourlyWage(hours, defaultHourlyRate, 'daily');
        return {
          ...emp,
          hourlyRate: defaultHourlyRate,
          hoursWorked: hours,
          calculatedWage: wage
        };
      }
      return emp;
    });
    onChange(updated);
  };

  // Apply shift times to all employees
  const handleApplyShiftPresetToAll = (inTime: string, outTime: string) => {
    const updated = employees.map((emp) => {
      const isDaily = (emp.employmentType || 'daily') === 'daily';
      const hours = calculateShiftHours(inTime, outTime);
      const rate = emp.hourlyRate || defaultHourlyRate;
      const wage = isDaily ? computeHourlyWage(hours, rate, 'daily') : 0;
      return {
        ...emp,
        shiftIn: inTime,
        shiftOut: outTime,
        hoursWorked: hours,
        calculatedWage: wage
      };
    });
    onChange(updated);
  };

  const handleAddEmployee = () => {
    if (!newEmpName.trim()) return;
    const hours = 12;
    const isDaily = newEmpType === 'daily';
    const newEmp: EmployeeRecord = {
      id: `emp_${Date.now()}`,
      number: employees.length + 1,
      name: newEmpName.trim(),
      advance: 0,
      transport: 0,
      signed: false,
      notes: '',
      shiftIn: '10:00',
      shiftOut: '22:00',
      employmentType: newEmpType,
      hourlyRate: isDaily ? defaultHourlyRate : 0,
      hoursWorked: hours,
      calculatedWage: isDaily ? parseFloat((hours * defaultHourlyRate).toFixed(2)) : 0
    };
    onChange([...employees, newEmp]);
    setNewEmpName('');
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees
      .filter((e) => e.id !== id)
      .map((e, idx) => ({ ...e, number: idx + 1 }));
    onChange(updated);
  };

  const handleQuickAdvance = (id: string, addAmount: number) => {
    const updated = employees.map((emp) => {
      if (emp.id === id) {
        const current = Number(emp.advance) || 0;
        return { ...emp, advance: parseFloat((current + addAmount).toFixed(2)) };
      }
      return emp;
    });
    onChange(updated);
  };

  return (
    <div id="employees-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header & Distinction Summary Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>كشف كادر الموظفين والدوام والسلف</span>
              <span className="text-xs bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                {employees.length} موظفاً
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              تحديد <strong className="text-amber-800">عمال المياومة</strong> لاحتساب الأجر بالساعة أوتوماتيكياً عند تسجيل الخروج، و<strong className="text-indigo-800">الموظف الشهري</strong> يترك بدون أي حسابات.
            </p>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Daily workers count */}
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800">عمال المياومة</span>
              <Coins className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-lg font-black text-amber-950 font-mono">
              {dailyEmployees.length} <span className="text-xs font-bold text-amber-700">عامل</span>
            </span>
          </div>

          {/* Monthly staff count */}
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800">موظفو الراتب الشهري</span>
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-lg font-black text-indigo-950 font-mono">
              {monthlyEmployees.length} <span className="text-xs font-bold text-indigo-700">موظف</span>
            </span>
          </div>

          {/* Total Calculated Wages (Daily only) */}
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800">أجور المياومة المحسوبة</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 rounded font-bold">{totalDailyHours.toFixed(1)} س</span>
            </div>
            <span className="text-lg font-black text-emerald-950 font-mono">
              {formatCurrency(totalDailyWages)}
            </span>
          </div>

          {/* Total Advances */}
          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800">إجمالي سلف الكاش</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-lg font-black text-rose-950 font-mono">
              {formatCurrency(totalAdvances)}
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Wage Control & Quick Actions Bar */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800">أجر الساعة الافتراضي للمياومة:</span>
            <input
              type="number" inputMode="decimal"
              step="0.25"
              min="0.5"
              value={defaultHourlyRate}
              onChange={(e) => setDefaultHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-16 px-1.5 py-0.5 text-center font-black text-xs bg-amber-50 border border-amber-300 rounded font-mono text-amber-950"
            />
            <span className="text-xs font-bold text-slate-700">د.أ / ساعة</span>
          </div>

          <button
            type="button"
            onClick={handleApplyHourlyRateToAllDaily}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="تطبيق أجر الساعة على جميع الموظفين المحددين كمياومة"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تطبيق أجر ({defaultHourlyRate} د.أ) على عمال المياومة</span>
          </button>
        </div>

        {/* Quick Shift Presets */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 text-[11px] font-bold">شفتات نموذجية:</span>
          <button
            type="button"
            onClick={() => handleApplyShiftPresetToAll('08:00', '18:00')}
            className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-semibold text-[11px]"
          >
            صباحي (10 ساعات)
          </button>
          <button
            type="button"
            onClick={() => handleApplyShiftPresetToAll('10:00', '22:00')}
            className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-semibold text-[11px]"
          >
            كامل (12 ساعة)
          </button>
          <button
            type="button"
            onClick={() => handleApplyShiftPresetToAll('14:00', '02:00')}
            className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded font-semibold text-[11px]"
          >
            مسائي (12 ساعة)
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search & Add Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({employees.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              filterType === 'daily'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-900 hover:bg-amber-50'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>عمال المياومة ({dailyEmployees.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              filterType === 'monthly'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>موظفون شهرياً ({monthlyEmployees.length})</span>
          </button>
        </div>

        {/* Search & Add New Employee */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="اسم الموظف الجديد..."
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs w-36"
            />
            <select
              value={newEmpType}
              onChange={(e) => setNewEmpType(e.target.value as 'daily' | 'monthly')}
              className="px-2 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="daily">مياومة</option>
              <option value="monthly">شهري</option>
            </select>
            <button
              type="button"
              onClick={handleAddEmployee}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Master Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-slate-300 shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900 text-white font-black border-b border-slate-800 select-none">
            <tr>
              <th className="py-2.5 px-2 w-10 text-center">م</th>
              <th className="py-2.5 px-3 min-w-[130px]">اسم الموظف</th>
              <th className="py-2.5 px-2 w-28 text-center bg-slate-800">
                نوع التوظيف
              </th>
              <th className="py-2.5 px-2 w-28 text-center bg-amber-900/60 text-amber-200">
                أجر الساعة (د.أ/س)
              </th>
              <th className="py-2.5 px-2 w-24 text-center">دخول</th>
              <th className="py-2.5 px-2 w-32 text-center">تسجيل الخروج</th>
              <th className="py-2.5 px-2 w-16 text-center text-sky-300">الساعات</th>
              <th className="py-2.5 px-2 w-36 text-center bg-emerald-950 text-emerald-200">
                الأجرة المحسوبة (مياومة)
              </th>
              <th className="py-2.5 px-2 w-28 text-center bg-rose-950 text-rose-200">
                السلفة (د.أ)
              </th>
              <th className="py-2.5 px-2 w-14 text-center">توقيع</th>
              <th className="py-2.5 px-2 min-w-[100px]">ملاحظات</th>
              <th className="py-2.5 px-2 w-8 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-400 text-sm">
                  لا توجد سجلات موظفين مطابقة للبحث أو الفلتر
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const isDaily = (emp.employmentType || 'daily') === 'daily';
                const hasAdvance = Number(emp.advance) > 0;
                const hours = emp.hoursWorked ?? calculateShiftHours(emp.shiftIn, emp.shiftOut);
                const rate = emp.hourlyRate !== undefined ? emp.hourlyRate : (isDaily ? defaultHourlyRate : 0);
                const wage = isDaily ? (emp.calculatedWage ?? computeHourlyWage(hours, rate, 'daily')) : 0;

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !isDaily ? 'bg-indigo-50/20' : ''
                    } ${hasAdvance ? 'bg-amber-50/40' : ''}`}
                  >
                    {/* Index */}
                    <td className="py-2 px-2 text-center text-slate-500 font-mono font-bold">
                      {emp.number}
                    </td>

                    {/* Employee Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm block">{emp.name}</span>
                        {!isDaily && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                            شهري
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Employment Type Switch (مياومة / شهري) */}
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleEmploymentType(emp.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                          isDaily
                            ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                            : 'bg-indigo-100 text-indigo-950 border-indigo-300 hover:bg-indigo-200'
                        }`}
                        title="انقر للتبديل بين مياومة وشهري"
                      >
                        {isDaily ? (
                          <>
                            <Coins className="w-3 h-3 text-amber-700" />
                            <span>مياومة</span>
                          </>
                        ) : (
                          <>
                            <CalendarCheck className="w-3 h-3 text-indigo-700" />
                            <span>شهري</span>
                          </>
                        )}
                        <ArrowRightLeft className="w-2.5 h-2.5 opacity-50 ml-0.5" />
                      </button>
                    </td>

                    {/* Hourly Rate (only for daily, disabled for monthly) */}
                    <td className="py-2 px-1 text-center bg-amber-50/30">
                      {isDaily ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number" inputMode="decimal"
                            step="0.1"
                            min="0"
                            value={emp.hourlyRate !== undefined ? emp.hourlyRate : defaultHourlyRate}
                            placeholder={defaultHourlyRate.toString()}
                            onChange={(e) =>
                              handleUpdate(
                                emp.id,
                                'hourlyRate',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-14 px-1 py-1 text-center rounded border border-amber-300 font-mono font-black text-xs bg-white text-amber-950 focus:ring-1 focus:ring-amber-500"
                            title="أجر الساعة بالدينار الأردني"
                          />
                          <span className="text-[10px] text-amber-900 font-bold">د.أ/س</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                          راتب شهري
                        </span>
                      )}
                    </td>

                    {/* Shift In (دخول) */}
                    <td className="py-2 px-1 text-center">
                      <input
                        type="text"
                        value={emp.shiftIn || ''}
                        placeholder="10:00"
                        onChange={(e) => handleUpdate(emp.id, 'shiftIn', e.target.value)}
                        className="w-16 px-1 py-1 text-center text-xs rounded border border-slate-300 font-mono font-semibold bg-white focus:border-slate-800"
                      />
                    </td>

                    {/* Shift Out (خروج) + Automatic Wage Trigger / Now button */}
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="text"
                          value={emp.shiftOut || ''}
                          placeholder="22:00"
                          onChange={(e) => handleUpdate(emp.id, 'shiftOut', e.target.value)}
                          className="w-16 px-1 py-1 text-center text-xs rounded border border-slate-300 font-mono font-semibold bg-white focus:border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRecordCheckoutNow(emp.id)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-[10px] font-bold flex items-center"
                          title="تسجيل خروج الآن (الوقت الحالي)"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Hours Worked */}
                    <td className="py-2 px-1 text-center">
                      <span className="font-mono font-black text-xs bg-sky-100 text-sky-950 px-1.5 py-0.5 rounded border border-sky-200">
                        {hours > 0 ? `${hours} س` : '-'}
                      </span>
                    </td>

                    {/* Calculated Wage (Automatic for daily, 0 / locked for monthly) */}
                    <td className="py-2 px-2 text-center bg-emerald-50/40">
                      {isDaily ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-mono font-black text-xs text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 min-w-[60px]">
                            {wage > 0 ? `${formatNumber(wage)} د.أ` : '0.00 د.أ'}
                          </span>
                          {hours > 0 && rate > 0 && (
                            <span className="text-[9px] text-emerald-800 font-mono mt-0.5">
                              ({hours}س × {rate}د)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            بدون حساب يومية
                          </span>
                          <span className="text-[8px] text-slate-400">راتب شهري ثابت</span>
                        </div>
                      )}
                    </td>

                    {/* Advance (السلفة) */}
                    <td className="py-2 px-1 text-center bg-rose-50/30">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number" inputMode="decimal"
                          step="0.5"
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
                          className={`w-16 px-1 py-1 text-center rounded border font-mono font-bold text-xs ${
                            hasAdvance
                              ? 'border-rose-400 bg-rose-100/80 text-rose-950 ring-1 ring-rose-400'
                              : 'border-slate-300 text-slate-800 bg-white'
                          }`}
                        />
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdvance(emp.id, 5)}
                            title="+5 د.أ"
                            className="px-1 py-0.2 text-[9px] bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded font-bold"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdvance(emp.id, 10)}
                            title="+10 د.أ"
                            className="px-1 py-0.2 text-[9px] bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded font-bold"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Signature */}
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleUpdate(emp.id, 'signed', !emp.signed)}
                        className="inline-flex items-center justify-center cursor-pointer"
                        title={emp.signed ? 'تم التوقيع' : 'غير موقع'}
                      >
                        {emp.signed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                    </td>

                    {/* Notes */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={emp.notes || ''}
                        placeholder="ملاحظات..."
                        onChange={(e) => handleUpdate(emp.id, 'notes', e.target.value)}
                        className="w-full px-1.5 py-1 rounded border border-slate-200 text-[11px] text-slate-700 bg-white focus:outline-none focus:border-slate-800"
                      />
                    </td>

                    {/* Delete */}
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="حذف الموظف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Footer Totals Row */}
          <tfoot className="bg-slate-900 text-white font-black border-t-2 border-slate-800 text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-center text-sm">
                المجموع العام لكادر الموظفين ({employees.length} موظفاً)
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-amber-300">
                {dailyEmployees.length} مياومة
              </td>
              <td colSpan={2} className="py-2.5 px-2 text-center text-slate-300 text-[11px]">
                مجموع ساعات المياومة: <span className="font-mono text-white font-bold">{totalDailyHours.toFixed(1)} س</span>
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-sky-300">
                {totalDailyHours.toFixed(1)} س
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-emerald-300 text-sm">
                {formatNumber(totalDailyWages)} د.أ
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-rose-300 text-sm">
                {formatNumber(totalAdvances)} د.أ
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
