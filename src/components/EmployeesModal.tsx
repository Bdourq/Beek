import React from 'react';
import { EmployeeRecord } from '../types';
import { EmployeesSection } from './EmployeesSection';
import { X } from 'lucide-react';

interface EmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeRecord[];
  onChange: (employees: EmployeeRecord[]) => void;
}

export const EmployeesModal: React.FC<EmployeesModalProps> = ({
  isOpen,
  onClose,
  employees,
  onChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-base text-slate-900">
            كشف سلف الموظفين وتوقيع الحضور
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <EmployeesSection employees={employees} onChange={onChange} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm"
          >
            حفظ وإغلاق الكشف
          </button>
        </div>
      </div>
    </div>
  );
};
