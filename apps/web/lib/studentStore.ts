'use client';

// Student store using localStorage for client-side persistence
// In production, this would be replaced with API calls

export interface Student {
  id: string;
  name: string;
  student_no: string;
  class: string;
  gender: string;
  enrollment_date: string;
  status: string;
  date_of_birth?: string;
  id_number?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
}

const STORAGE_KEY = 'apple_students';

// Initial mock data
const initialStudents: Student[] = [
  { id: '1', name: '陳小明', student_no: '2025001', class: '1A', gender: 'M', enrollment_date: '2025-09-01', status: 'active' },
  { id: '2', name: '李美美', student_no: '2025002', class: '1A', gender: 'F', enrollment_date: '2025-09-01', status: 'active' },
  { id: '3', name: '張大文', student_no: '2025003', class: '1B', gender: 'M', enrollment_date: '2025-09-01', status: 'active' },
  { id: '4', name: '王小红', student_no: '2025004', class: '1B', gender: 'F', enrollment_date: '2025-09-01', status: 'active' },
  { id: '5', name: '劉志偉', student_no: '2024001', class: '2A', gender: 'M', enrollment_date: '2024-09-01', status: 'active' },
  { id: '6', name: '黃淑芬', student_no: '2024002', class: '2A', gender: 'F', enrollment_date: '2024-09-01', status: 'active' },
  { id: '7', name: '周杰倫', student_no: '2024003', class: '2B', gender: 'M', enrollment_date: '2024-09-01', status: 'inactive' },
  { id: '8', name: '吳依琳', student_no: '2023001', class: '3A', gender: 'F', enrollment_date: '2023-09-01', status: 'active' },
  { id: '9', name: '孫雅琪', student_no: '2023002', class: '3A', gender: 'F', enrollment_date: '2023-09-01', status: 'active' },
  { id: '10', name: '鄭宇翔', student_no: '2023003', class: '3B', gender: 'M', enrollment_date: '2023-09-01', status: 'active' },
];

export function getStudents(): Student[] {
  if (typeof window === 'undefined') {
    return initialStudents;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with default data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
      return initialStudents;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load students:', error);
    return initialStudents;
  }
}

export function addStudent(student: Omit<Student, 'id'>): Student {
  const students = getStudents();

  // Generate new ID
  const maxId = students.reduce((max, s) => {
    const id = parseInt(s.id, 10);
    return isNaN(id) ? max : Math.max(max, id);
  }, 0);
  const newStudent: Student = {
    ...student,
    id: String(maxId + 1),
  };

  const updated = [...students, newStudent];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(updated),
    }));
  }

  return newStudent;
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) return null;

  students[index] = { ...students[index], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(students),
    }));
  }

  return students[index];
}

export function deleteStudent(id: string): boolean {
  const students = getStudents();
  const updated = students.filter((s) => s.id !== id);

  if (updated.length === students.length) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(updated),
    }));
  }

  return true;
}

export function getStudentById(id: string): Student | null {
  const students = getStudents();
  return students.find((s) => s.id === id) || null;
}