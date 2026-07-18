'use client';

// Student award assignment store using localStorage for client-side persistence
// Tracks which students received which awards and the corresponding bounty amounts

export interface StudentAwardAssignment {
  id: string;
  student_id: string;
  student_no: string;
  student_name: string;
  student_class: string;
  award_id: string;
  award_name: string;
  award_type: string;
  academic_year: string;
  semester: string;
  bounty_amount: number; // 獎金金額 (HKD)
  currency: 'HKD';
  payment_status: 'pending' | 'paid' | 'cancelled';
  issue_date: string; // 頒發日期
  payment_date?: string; // 發放日期
  remark?: string;
  created_at: string;
}

const STORAGE_KEY = 'apple_student_awards';

// Initial mock data - 香港培英中學的獎金分配示例
const initialAssignments: StudentAwardAssignment[] = [
  {
    id: '1',
    student_id: '1',
    student_no: '2025001',
    student_name: '陳小明',
    student_class: '1A',
    award_id: '1',
    award_name: '學業優異獎',
    award_type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    bounty_amount: 1000,
    currency: 'HKD',
    payment_status: 'paid',
    issue_date: '2025-10-15',
    payment_date: '2025-10-20',
    remark: '全年級第一名',
    created_at: '2025-10-15',
  },
  {
    id: '2',
    student_id: '2',
    student_no: '2025002',
    student_name: '李美美',
    student_class: '1A',
    award_id: '1',
    award_name: '學業優異獎',
    award_type: 'academic',
    academic_year: '2025-2026',
    semester: '上學期',
    bounty_amount: 800,
    currency: 'HKD',
    payment_status: 'paid',
    issue_date: '2025-10-15',
    payment_date: '2025-10-20',
    remark: '全年級第二名',
    created_at: '2025-10-15',
  },
  {
    id: '3',
    student_id: '5',
    student_no: '2024001',
    student_name: '劉志偉',
    student_class: '2A',
    award_id: '2',
    award_name: '品行優良獎',
    award_type: 'conduct',
    academic_year: '2025-2026',
    semester: '上學期',
    bounty_amount: 500,
    currency: 'HKD',
    payment_status: 'pending',
    issue_date: '2025-11-01',
    remark: '待核實家長簽收',
    created_at: '2025-11-01',
  },
  {
    id: '4',
    student_id: '8',
    student_no: '2023001',
    student_name: '吳依琳',
    student_class: '3A',
    award_id: '3',
    award_name: '服務精神獎',
    award_type: 'service',
    academic_year: '2024-2025',
    semester: '下學期',
    bounty_amount: 600,
    currency: 'HKD',
    payment_status: 'paid',
    issue_date: '2025-06-30',
    payment_date: '2025-07-05',
    remark: '傑出學生領袖',
    created_at: '2025-06-30',
  },
  {
    id: '5',
    student_id: '10',
    student_no: '2023003',
    student_name: '鄭宇翔',
    student_class: '3B',
    award_id: '1',
    award_name: '學業優異獎',
    award_type: 'academic',
    academic_year: '2024-2025',
    semester: '下學期',
    bounty_amount: 1200,
    currency: 'HKD',
    payment_status: 'paid',
    issue_date: '2025-06-30',
    payment_date: '2025-07-05',
    remark: '校內獎學金',
    created_at: '2025-06-30',
  },
  {
    id: '6',
    student_id: '6',
    student_no: '2024002',
    student_name: '黃淑芬',
    student_class: '2A',
    award_id: '3',
    award_name: '服務精神獎',
    award_type: 'service',
    academic_year: '2025-2026',
    semester: '上學期',
    bounty_amount: 400,
    currency: 'HKD',
    payment_status: 'pending',
    issue_date: '2025-11-10',
    remark: '',
    created_at: '2025-11-10',
  },
];

export function getAllAssignments(): StudentAwardAssignment[] {
  if (typeof window === 'undefined') {
    return initialAssignments;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssignments));
      return initialAssignments;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load assignments:', error);
    return initialAssignments;
  }
}

export function getAssignmentsByStudent(studentId: string): StudentAwardAssignment[] {
  return getAllAssignments().filter((a) => a.student_id === studentId);
}

export function getAssignmentsByAward(awardId: string): StudentAwardAssignment[] {
  return getAllAssignments().filter((a) => a.award_id === awardId);
}

export function getAssignmentById(id: string): StudentAwardAssignment | null {
  return getAllAssignments().find((a) => a.id === id) || null;
}

export function addAssignment(assignment: Omit<StudentAwardAssignment, 'id' | 'created_at'>): StudentAwardAssignment {
  const all = getAllAssignments();
  const maxId = all.reduce((max, a) => {
    const id = parseInt(a.id, 10);
    return isNaN(id) ? max : Math.max(max, id);
  }, 0);

  const newAssignment: StudentAwardAssignment = {
    ...assignment,
    id: String(maxId + 1),
    created_at: new Date().toISOString().split('T')[0],
  };

  const updated = [...all, newAssignment];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(updated),
    }));
  }

  return newAssignment;
}

export function updateAssignment(id: string, updates: Partial<StudentAwardAssignment>): StudentAwardAssignment | null {
  const all = getAllAssignments();
  const index = all.findIndex((a) => a.id === id);
  if (index === -1) return null;

  all[index] = { ...all[index], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(all),
    }));
  }

  return all[index];
}

export function deleteAssignment(id: string): boolean {
  const all = getAllAssignments();
  const updated = all.filter((a) => a.id !== id);
  if (updated.length === all.length) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(updated),
    }));
  }

  return true;
}

export function getTotalBountyByAward(awardId: string): number {
  return getAllAssignments()
    .filter((a) => a.award_id === awardId)
    .reduce((sum, a) => sum + a.bounty_amount, 0);
}

export function getTotalBountyByStudent(studentId: string): number {
  return getAllAssignments()
    .filter((a) => a.student_id === studentId)
    .reduce((sum, a) => sum + a.bounty_amount, 0);
}
