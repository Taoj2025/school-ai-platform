// Shared types for School AI Platform
// API response types used across frontend and backend

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  timestamp?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Common audit fields
export interface AuditFields {
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============ Awards Module Types ============

export type AwardType = 'academic' | 'conduct' | 'service' | 'sports' | 'art' | 'other';
export type AwardStatus = 'draft' | 'pending' | 'approved' | 'published' | 'cancelled';
export type ScholarshipStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface AwardRecipient {
  student_id: string;
  student_no: string;
  student_name_zh: string;
  student_name_en?: string;
  class_name: string;
  grade: number;
}

export interface Award {
  id: string;
  title: string;
  title_en?: string;
  award_type: AwardType;
  academic_year: string;
  semester: 1 | 2;
  status: AwardStatus;
  description?: string;
  criteria?: string;
  total_recipients?: number;
  recipients?: AwardRecipient[];
  ceremony_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  award_id: string;
  student_id: string;
  amount: number;
  currency: string;
  status: ScholarshipStatus;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AwardCertificate {
  id: string;
  award_id: string;
  student_id: string;
  certificate_no: string;
  issued_at: string;
  download_url?: string;
}

// ============ Finance Module Types ============

export type IncomeCategory = 'tuition' | 'donation' | 'event' | 'other';
export type ExpenseCategory = 'salary' | 'equipment' | 'maintenance' | 'event' | 'other';
export type QuotationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface IncomeRecord {
  id: string;
  category: IncomeCategory;
  amount: number;
  currency: string;
  date: string;
  payer?: string;
  description?: string;
  receipt_no?: string;
  ocr_raw_text?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  vendor?: string;
  description?: string;
  payment_status: PaymentStatus;
  quotation_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  is_lowest: boolean;
  is_single_bid: boolean;
  anomalies?: string[];
  status: QuotationStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceStats {
  total_income: number;
  total_expense: number;
  net_balance: number;
  monthly_income: Record<string, number>;
  monthly_expense: Record<string, number>;
  currency: string;
}

// ============ Assets Module Types ============

export type AssetCategory = 'furniture' | 'electronics' | 'equipment' | 'vehicle' | 'other';
export type AssetStatus = 'in_use' | 'storage' | 'maintenance' | 'written_off';
export type MovementType = 'in' | 'out' | 'transfer' | 'maintenance';

export interface Asset {
  id: string;
  name: string;
  asset_no: string;
  category: AssetCategory;
  location?: string;
  purchase_date?: string;
  purchase_price?: number;
  currency?: string;
  status: AssetStatus;
  serial_no?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetMovement {
  id: string;
  asset_id: string;
  movement_type: MovementType;
  from_location?: string;
  to_location: string;
  reason?: string;
  moved_by?: string;
  moved_at: string;
  created_at: string;
}

export interface StocktakeTask {
  id: string;
  task_no: string;
  location: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to?: string;
  scheduled_date: string;
  completed_date?: string;
  findings?: StocktakeFinding[];
  created_at: string;
  updated_at: string;
}

export interface StocktakeFinding {
  asset_id: string;
  found: boolean;
  location_match: boolean;
  remarks?: string;
}

export interface AssetStats {
  total_assets: number;
  by_category: Record<AssetCategory, number>;
  by_status: Record<AssetStatus, number>;
  total_value: number;
  currency: string;
}

// ============ Students Module Types ============

export type Gender = 'M' | 'F';
export type StudentStatus = 'active' | 'graduated' | 'transferred' | 'suspended';

export interface Student {
  id: string;
  student_no: string;
  name_zh: string;
  name_en?: string;
  gender: Gender;
  class_name: string;
  grade: number;
  enrollment_date: string;
  graduation_date?: string;
  status: StudentStatus;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCertificate {
  id: string;
  student_id: string;
  certificate_type: 'enrollment' | 'attendance' | 'graduation' | 'other';
  issued_at: string;
  valid_until?: string;
  download_url?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
  recorded_by?: string;
  created_at: string;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}
