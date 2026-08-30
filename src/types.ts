export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  notes?: string;
  category?: string;
}

export interface VendorDebt {
  id: string;
  vendorName: string;
  amount: number;
  notes?: string;
  date?: string;
}

export interface EmployeeRecord {
  id: string;
  number: number;
  name: string;
  advance: number;       // سلفة
  transport: number;     // مواصلات
  signed: boolean;       // توقيع
  notes: string;         // ملاحظات
  shiftIn: string;       // دخول (HH:mm)
  shiftOut: string;      // خروج (HH:mm)
  employmentType?: 'daily' | 'monthly'; // نوع التوظيف: مياومة أو شهري
  hourlyRate?: number;   // كم يتقاضى بالساعة للمياومة (د.أ/ساعة)
  wageType?: 'daily' | 'hourly'; // للتوافق القديم
  wageRate?: number;     // للتوافق القديم
  hoursWorked?: number;  // عدد ساعات العمل المحسوبة
  calculatedWage?: number; // اليومية المحسوبة تلقائياً (فقط للمياومة، 0 للشهري)
}

export interface CustodyClaim {
  id: string;
  person: string;
  forThem: number;  // له (هو يريد من الكاش)
  onThem: number;   // عليه (الكاش يريد منه)
  notes?: string;   // ملاحظات
}

export interface ProductionItem {
  id: string;
  name: string;          // بروستد، تكا، زنجر
  shift1: number;
  shift2: number;
  total: number;
}

export interface KitchenConsumption {
  rice1: number;         // سيخ 1 استهلاك رز
  rice2: number;         // سيخ 2 استهلاك رز
  almonds: number;       // استهلاك لوز
  potatoes: number;      // استهلاك بطاطا
  supplyIn: number;      // تزويد
  returns: number;       // مرتجع
  jannat: number;        // جنات
  peel: number;          // قشرة
}

export interface DailyReport {
  id: string;
  date: string;               // YYYY-MM-DD
  dayName: string;            // الإثنين، الثلاثاء...
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'closed' | 'audited';
  cashierName: string;
  branch: string;             // مطعم يحيى البيك

  // 1. Header financial totals
  openingCash: number;        // النقد الافتتاحي
  sales: number;              // مبيعات
  otherSales: number;         // مبيعات أخرى
  newDebtsTotal: number;      // إضافة ذمم جديدة
  oldDebtsPaidTotal: number;  // سداد ذمم قديمة

  // 2. Sections / Tables (Without the word "جدول")
  purchases: ExpenseItem[];          // المشتريات
  vendorDebtsPaid: VendorDebt[];     // سداد ذمم تجار
  vendorDebtsAdded: VendorDebt[];    // إضافة ذمم تجار
  adminExpenses: ExpenseItem[];      // المصاريف الإدارية (ضمان، كهرباء، نت، اتصال، ضيافة، دعاية، قرطاسية، كراج...)
  apartmentExpenses: ExpenseItem[];  // الشقة
  maintenance: ExpenseItem[];        // المعدات والصيانة
  spices: ExpenseItem[];             // البهارات (بهارات شاورما، تكا، مندي، شطة زيرو، مدخن مايونيز، بهارات بطاطا، صبغة تكا، صبغة رز، بيكنج باودر...)
  yahyaAccount: ExpenseItem[];       // حساب يحيى (اوردر، سحوبات)
  abuAbdullahAccount: ExpenseItem[]; // حساب أبو عبدالله
  walletExpenses: ExpenseItem[];     // المحفظة (Zain Cash, CliQ, etc.)
  custodyClaims?: CustodyClaim[];    // جدول العُهد (له وعليه - 3 أسطر)
  otherExpenses: ExpenseItem[];      // المصاريف الأخرى

  // 3. Staff & Advances
  employees: EmployeeRecord[];       // الموظفين والسلف

  // 4. Electronic & Manual POS entries for Reconciled Cash
  actualCashInDrawer: number;        // نقد (عد الكاش الفعلي في الدرج)
  visaPOS: number;                   // فيزا
  rtPOS: number;                     // RT
  maestroPOS: number;                // مايسترو
  priceDiff: number;                 // فرق سعر

  // 5. Kitchen & Production
  kitchenConsumption: KitchenConsumption;
  productionItems: ProductionItem[]; // بروستد، تكا، زنجر

  // Notes
  generalNotes: string;
  hasAttachments?: boolean;
}

export interface SummaryCalculations {
  totalPurchases: number;
  totalAdvances: number;
  totalVendorDebtsPaid: number;
  totalVendorDebtsAdded: number;
  totalAdminExpenses: number;
  totalApartmentExpenses: number;
  totalMaintenance: number;
  totalSpices: number;
  totalYahya: number;
  totalAbuAbdullah: number;
  totalWallet: number;
  totalOtherExpenses: number;
  totalCustodyForThem: number;
  totalCustodyOnThem: number;
  totalAllExpensesAndOutflows: number; // جميع المصاريف والمشتريات والسلف والسدادات

  // Total Expected Cash inflow
  totalExpectedRevenue: number;       // المبيعات + المبيعات الأخرى
  totalGrossCashAvailable: number;    // النقد الافتتاحي + المبيعات + مبيعات أخرى

  // Total inventory / closing balance (مجموع الجرد)
  // Reconciled Total = Cash + Visa + RT + Maestro + PriceDiff + All Outflows (Purchases, Advances, Debts, Expenses, Yahya, Abu Abdullah, Spices, Maintenance...)
  totalReconciledInventory: number;

  // Expected vs Counted Comparison
  expectedCashInDrawer: number;       // الكاش المفترض وجوده في الدرج بعد طرح المصاريف المسددة نقداً
  cashDifference: number;             // الفرق = Actual Cash - Expected Cash (أو مجموع الجرد - مجموع المبيعات المتوقع)
  hasDifference: boolean;
  differenceType: 'balanced' | 'surplus' | 'shortage'; // متطابق / زيادة كاش / نقص كاش
}
