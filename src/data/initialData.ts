import { DailyReport, ProductionItem, KitchenConsumption } from '../types';
import { generateDefaultEmployees } from './defaultEmployees';

export const QUICK_PURCHASE_PRESETS = [
  'لواحله',
  'صبيحة',
  'أكياس',
  'خبز للشيخ',
  'كينزا',
  'العلوان',
  'زفاتي',
  'ابو خليل',
  'سحلب',
  'فايت',
  'الهزايمة',
  'ماء',
  'غاز',
  'شعبان',
  'الخدران',
  'عهدة سيف',
  'خضار',
  'كبدة رعد',
  'خبز بروستد',
  'عهدة دار بالمسجد',
  'دجاج ولحوم',
  'زيوت',
  'ألبان وأجبان',
  'منظفات',
  'كرتون وتغليف'
];

export const QUICK_ADMIN_PRESETS = [
  'ضمان',
  'كهرباء',
  'فاتورة نت',
  'فاتورة اتصال',
  'ضيافة',
  'دعاية وإعلان',
  'قرطاسية',
  'كراج ومواقف',
  'بلدية وتراخيص',
  'نقل ووقود'
];

export const QUICK_SPICE_PRESETS = [
  'بهارات شاورما',
  'بهارات تكا',
  'بهارات مندي',
  'شطة زيرو',
  'مدخن مايونيز',
  'بهارات بطاطا',
  'صبغة تكا',
  'صبغة رز',
  'بيكنج باودر',
  'ثوم مطحون',
  'هيل وقرفة'
];

export const QUICK_MAINTENANCE_PRESETS = [
  'صيانة بلاط',
  'صيانة مكيفات',
  'سباكة ومواسير',
  'كهرباء وإنارة',
  'صيانة قلايات',
  'صيانة ثلاجات',
  'معدات المطبخ'
];

export const DEFAULT_PRODUCTION_ITEMS: ProductionItem[] = [
  { id: 'prod_1', name: 'بروستد', shift1: 21, shift2: 50, total: 80 },
  { id: 'prod_2', name: 'تكا', shift1: 0, shift2: 0, total: 0 },
  { id: 'prod_3', name: 'زنجر', shift1: 0, shift2: 0, total: 0 }
];

export const DEFAULT_KITCHEN_CONSUMPTION: KitchenConsumption = {
  rice1: 53,
  rice2: 68,
  almonds: 5.10,
  potatoes: 20.800,
  supplyIn: 0,
  returns: 0,
  jannat: 0,
  peel: 0
};

export function getArabicDayName(dateString: string): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const date = new Date(dateString);
  return isNaN(date.getDay()) ? 'الإثنين' : days[date.getDay()];
}

export function createEmptyDailyReport(dateStr?: string): DailyReport {
  const todayStr = dateStr || new Date().toISOString().split('T')[0];
  return {
    id: `report_${todayStr}_${Date.now()}`,
    date: todayStr,
    dayName: getArabicDayName(todayStr),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'open',
    cashierName: 'كاشير الشفت',
    branch: 'مطعم يحيى البيك',

    openingCash: 0,
    sales: 0,
    otherSales: 0,
    newDebtsTotal: 0,
    oldDebtsPaidTotal: 0,

    purchases: [],
    vendorDebtsPaid: [],
    vendorDebtsAdded: [],
    adminExpenses: [
      { id: 'adm_1', name: 'ضمان', amount: 0 },
      { id: 'adm_2', name: 'كهرباء', amount: 0 },
      { id: 'adm_3', name: 'فاتورة نت', amount: 0 },
      { id: 'adm_4', name: 'فاتورة اتصال', amount: 0 },
      { id: 'adm_5', name: 'ضيافة', amount: 0 },
      { id: 'adm_6', name: 'دعاية', amount: 0 },
      { id: 'adm_7', name: 'قرطاسية', amount: 0 },
      { id: 'adm_8', name: 'كراج', amount: 0 }
    ],
    apartmentExpenses: [
      { id: 'apt_1', name: 'أغراض', amount: 0 }
    ],
    maintenance: [
      { id: 'maint_1', name: 'صيانة بلاط', amount: 0 }
    ],
    spices: [
      { id: 'spc_1', name: 'بهارات شاورما', amount: 0 },
      { id: 'spc_2', name: 'بهارات تكا', amount: 0 },
      { id: 'spc_3', name: 'بهارات مندي', amount: 0 },
      { id: 'spc_4', name: 'شطة زيرو', amount: 0 },
      { id: 'spc_5', name: 'مدخن مايونيز', amount: 0 },
      { id: 'spc_6', name: 'بهارات بطاطا', amount: 0 },
      { id: 'spc_7', name: 'صبغة تكا', amount: 0 },
      { id: 'spc_8', name: 'صبغة رز', amount: 0 },
      { id: 'spc_9', name: 'بيكنج باودر', amount: 0 }
    ],
    yahyaAccount: [
      { id: 'yah_1', name: 'اوردر', amount: 0 }
    ],
    abuAbdullahAccount: [],
    walletExpenses: [
      { id: 'wal_1', name: 'محفظة', amount: 0 }
    ],
    custodyClaims: [
      { id: 'cust_1', person: 'عهدة 1', forThem: 0, onThem: 0, notes: '' },
      { id: 'cust_2', person: 'عهدة 2', forThem: 0, onThem: 0, notes: '' },
      { id: 'cust_3', person: 'عهدة 3', forThem: 0, onThem: 0, notes: '' }
    ],
    otherExpenses: [],

    employees: generateDefaultEmployees(),

    actualCashInDrawer: 0,
    visaPOS: 0,
    rtPOS: 0,
    maestroPOS: 0,
    priceDiff: 0,

    kitchenConsumption: {
      rice1: 0,
      rice2: 0,
      almonds: 0,
      potatoes: 0,
      supplyIn: 0,
      returns: 0,
      jannat: 0,
      peel: 0
    },
    productionItems: [
      { id: 'prod_1', name: 'بروستد', shift1: 0, shift2: 0, total: 0 },
      { id: 'prod_2', name: 'تكا', shift1: 0, shift2: 0, total: 0 },
      { id: 'prod_3', name: 'زنجر', shift1: 0, shift2: 0, total: 0 }
    ],
    generalNotes: ''
  };
}

export function createSampleDailyReport(): DailyReport {
  const employees = generateDefaultEmployees();

  // Exact shifts, hours, advances, and signatures transcribed from Image 2 (Back page of yesterday's sheet)
  const staffUpdates: Record<
    string,
    { advance?: number; shiftIn?: string; shiftOut?: string; signed?: boolean; notes?: string }
  > = {
    'أبو جيش': { advance: 25.0, shiftIn: '09:00', shiftOut: '18:00', signed: true, notes: 'أيمن' },
    'معتصم': { advance: 0, shiftIn: '10:00', shiftOut: '16:45', signed: false },
    'أبو لطفي': { advance: 0, shiftIn: '10:00', shiftOut: '19:00', signed: false },
    'محاميد': { advance: 0, shiftIn: '10:00', shiftOut: '19:00', signed: false },
    'سامر': { advance: 2.5, shiftIn: '08:00', shiftOut: '19:00', signed: true },
    'أبو الوفا': { advance: 0, shiftIn: '08:00', shiftOut: '19:00', signed: false },
    'سعد': { advance: 0, shiftIn: '', shiftOut: '', signed: false },
    'هباجنة': { advance: 10.0, shiftIn: '10:00', shiftOut: '22:00', signed: true, notes: '2 كولا' },
    'قيس': { advance: 0, shiftIn: '09:30', shiftOut: '19:00', signed: false },
    'بدور': { advance: 0, shiftIn: '14:30', shiftOut: '22:00', signed: false },
    'امجد شحادات': { advance: 2.5, shiftIn: '08:30', shiftOut: '19:30', signed: true },
    'عبيدة': { advance: 0, shiftIn: '08:00', shiftOut: '19:00', signed: false },
    'سيف': { advance: 1.0, shiftIn: '10:00', shiftOut: '19:00', signed: true },
    'خالد أبو عره': { advance: 0, shiftIn: '10:00', shiftOut: '19:30', signed: false },
    'قصي': { advance: 2.5, shiftIn: '16:30', shiftOut: '16:30', signed: true },
    'خالد': { advance: 0, shiftIn: '', shiftOut: '', signed: false },
    'عز الدين': { advance: 0, shiftIn: '08:00', shiftOut: '19:30', signed: false },
    'الحموي': { advance: 0, shiftIn: '', shiftOut: '', signed: false },
    'قاسم': { advance: 2.5, shiftIn: '08:30', shiftOut: '19:30', signed: true },
    'حسن': { advance: 5.0, shiftIn: '10:00', shiftOut: '16:45', signed: true },
    'محمود الاشقر صالة': { advance: 0, shiftIn: '08:30', shiftOut: '19:30', signed: false },
    'محمد حريري': { advance: 2.5, shiftIn: '09:00', shiftOut: '19:00', signed: true, notes: 'شفت 2 (سلفة)' },
    'ابو مصعب': { advance: 2.5, shiftIn: '10:00', shiftOut: '19:30', signed: true },
    'علي نوفل': { advance: 0, shiftIn: '10:00', shiftOut: '19:00', signed: false },
    'عبد الله نوفل': { advance: 2.5, shiftIn: '11:00', shiftOut: '19:30', signed: true },
    'محمود نابلسي': { advance: 2.5, shiftIn: '10:00', shiftOut: '19:30', signed: true },
    'عبد الله الحريري': { advance: 0, shiftIn: '10:00', shiftOut: '20:00', signed: false },
    'محمد طه': { advance: 0, shiftIn: '10:00', shiftOut: '19:00', signed: true, notes: 'مهند طه' },
    'مهيب': { advance: 0, shiftIn: '', shiftOut: '', signed: false }
  };

  employees.forEach((emp) => {
    const update = staffUpdates[emp.name];
    if (update) {
      if (update.advance !== undefined) emp.advance = update.advance;
      if (update.shiftIn !== undefined) emp.shiftIn = update.shiftIn;
      if (update.shiftOut !== undefined) emp.shiftOut = update.shiftOut;
      if (update.signed !== undefined) emp.signed = update.signed;
      if (update.notes !== undefined) emp.notes = update.notes;
    }
  });

  return {
    id: 'report_yesterday_real_closing',
    date: '2024-08-27',
    dayName: 'الخميس',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'closed',
    cashierName: 'عاصم (قصي)',
    branch: 'مطعم شاورما البيك - يحيى (AL-Baik)',

    // Header values from Image 1 & 2 (275.50 + 206.00 + 1344.25 = 1825.75 د.أ مجموع الكاش)
    openingCash: 275.5,
    sales: 1344.25,
    otherSales: 0.0,
    newDebtsTotal: 206.0,
    oldDebtsPaidTotal: 50.0,

    // Purchases from Image 1 (Total = 313.48)
    purchases: [
      { id: 'p_1', name: 'خضار', amount: 43.5 },
      { id: 'p_2', name: 'بيض', amount: 132.5 },
      { id: 'p_3', name: 'خلطات ومخللات', amount: 16.5 },
      { id: 'p_4', name: 'غاز', amount: 9.0 },
      { id: 'p_5', name: 'رول كاش', amount: 2.0 },
      { id: 'p_6', name: 'منظفات', amount: 7.75 },
      { id: 'p_7', name: 'كولا 2', amount: 17.5 },
      { id: 'p_8', name: 'قهوة وسكر', amount: 25.8 },
      { id: 'p_9', name: 'ديانا', amount: 5.0 },
      { id: 'p_10', name: 'كهرباء الزعبي', amount: 10.0 },
      { id: 'p_11', name: 'جري هيبه', amount: 2.8 },
      { id: 'p_12', name: 'مكمكم خضار', amount: 25.25 },
      { id: 'p_13', name: 'خبز الشيخ أبو احمد', amount: 22.0 },
      { id: 'p_14', name: 'الرفاعي', amount: 2.25 },
      { id: 'p_15', name: 'خبز دير ابي سعيد', amount: 1.25 },
      { id: 'p_16', name: 'كمبرا', amount: 2.0 },
      { id: 'p_17', name: 'تسوية مشتريات أبو خليل', amount: -11.42 }
    ],

    // Vendor Debts Paid & Added from Image 1
    vendorDebtsPaid: [
      { id: 'vdp_1', vendorName: 'سداد لحم', amount: 50.0, notes: 'سداد تجار لحم' }
    ],
    vendorDebtsAdded: [
      { id: 'vda_1', vendorName: 'مخلل / دجاج', amount: 75.8, notes: 'ذمم موردين' },
      { id: 'vda_2', vendorName: 'الدجاجاتي', amount: 130.0, notes: 'دجاجاتي' }
    ],

    // Admin Expenses (5.25 JOD)
    adminExpenses: [
      { id: 'adm_1', name: 'دعاية', amount: 5.0 },
      { id: 'adm_2', name: 'قرطاسية', amount: 0.25 },
      { id: 'adm_3', name: 'ضمان', amount: 0 },
      { id: 'adm_4', name: 'كهرباء', amount: 0 },
      { id: 'adm_5', name: 'فاتورة نت', amount: 0 },
      { id: 'adm_6', name: 'فاتورة اتصال', amount: 0 },
      { id: 'adm_7', name: 'ضيافة', amount: 0 },
      { id: 'adm_8', name: 'كراج', amount: 0 }
    ],

    // Apartment Expenses (6.00 JOD)
    apartmentExpenses: [
      { id: 'apt_1', name: 'أوردر شقة', amount: 6.0 }
    ],

    // Maintenance
    maintenance: [
      { id: 'maint_1', name: 'م. يحيى (صيانة)', amount: 0.0 }
    ],

    // Spices (3.52 JOD)
    spices: [
      { id: 'spc_1', name: 'بهارات تكا', amount: 3.52 },
      { id: 'spc_2', name: 'بهارات شاورما', amount: 0 },
      { id: 'spc_3', name: 'بهارات مندي', amount: 0 },
      { id: 'spc_4', name: 'شطة زيرو', amount: 0 },
      { id: 'spc_5', name: 'مدخن مايونيز', amount: 0 },
      { id: 'spc_6', name: 'بهارات بطاطا', amount: 0 },
      { id: 'spc_7', name: 'صبغة تكا', amount: 0.5 }
    ],

    // Yahya Account (20.00 JOD)
    yahyaAccount: [
      { id: 'yah_1', name: 'جمعه', amount: 20.0 }
    ],

    abuAbdullahAccount: [],

    // Digital Wallet (56.42 JOD)
    walletExpenses: [
      { id: 'wal_1', name: 'المحفظة', amount: 56.42 }
    ],

    // Custody & Claims (3 lines: له / عليه)
    custodyClaims: [
      { id: 'cust_1', person: 'أبو عمر (عهدة شاورما)', forThem: 25.0, onThem: 0, notes: 'مطلوب له' },
      { id: 'cust_2', person: 'كاشير الشفت الصباحي', forThem: 0, onThem: 15.0, notes: 'متبقي عليه' },
      { id: 'cust_3', person: 'عهدة مشتريات طارئة', forThem: 0, onThem: 0, notes: '' }
    ],

    // Other Expenses (10.00 JOD)
    otherExpenses: [
      { id: 'oth_1', name: 'بادي دعني / حالد', amount: 10.0 }
    ],

    employees,

    // Reconciliation Box
    actualCashInDrawer: 259.0,
    visaPOS: 75.87,
    rtPOS: 0.0,
    maestroPOS: 4.0,
    priceDiff: 15.85,

    // Kitchen & Shifts Production from Image 1 & 2
    kitchenConsumption: {
      rice1: 68,
      rice2: 75,
      almonds: 47.5,
      potatoes: 20.0,
      supplyIn: 0,
      returns: 0,
      jannat: 0,
      peel: 0
    },
    productionItems: [
      { id: 'prod_1', name: 'بروستد', shift1: 21, shift2: 50, total: 71 },
      { id: 'prod_2', name: 'تكا', shift1: 0, shift2: 0, total: 0 },
      { id: 'prod_3', name: 'زنجر', shift1: 0, shift2: 0, total: 0 }
    ],
    generalNotes: 'إغلاق كاش يوم أمس - مطعم شاورما البيك يحيى - كاشير عاصم / قصي - زيادة كاش 15.85 د.أ المستودع'
  };
}
