import { EmployeeRecord } from '../types';

export const INITIAL_STAFF_NAMES: string[] = [
  'ابو حبيش',
  'معتصم',
  'ابو لطفي',
  'مجاهد',
  'سامر',
  'ابو الوفا',
  'سعيد',
  'هياجنة',
  'بدور',
  'قتيبة',
  'امجد شحادات',
  'عبيدة',
  'سيف',
  'خالد ابو عرة',
  'قصي',
  'خالد',
  'عز الدين',
  'الحمصي',
  'قاسم',
  'حسن',
  'محمود الاشقر صالة',
  'محمد حريري',
  'ابو مصعب',
  'عبد الله نوفل',
  'علي نوفل',
  'محمود نابلسي',
  'عبد الله الحريري',
  'محمد طه'
];

export function generateDefaultEmployees(): EmployeeRecord[] {
  return INITIAL_STAFF_NAMES.map((name, index) => ({
    id: `emp_${index + 1}`,
    number: index + 1,
    name,
    advance: 0,
    transport: 0,
    signed: false,
    notes: '',
    shiftIn: '10:00',
    shiftOut: '22:00'
  }));
}
