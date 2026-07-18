import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'HKD'): string {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export const awardTypeLabels: Record<string, string> = {
  academic: '學業獎',
  conduct: '品行獎',
  service: '服務獎',
  sports: '體育獎',
  art: '藝術獎',
  other: '其他獎項',
};

export const awardStatusLabels: Record<string, string> = {
  draft: '草稿',
  pending: '待審批',
  approved: '已審批',
  published: '已發布',
  cancelled: '已取消',
};

export const assetStatusLabels: Record<string, string> = {
  in_use: '使用中',
  storage: '庫存',
  maintenance: '維修中',
  written_off: '已報廢',
};

export const assetCategoryLabels: Record<string, string> = {
  furniture: '家具',
  electronics: '電子設備',
  equipment: '設備',
  vehicle: '車輛',
  other: '其他',
};

export const studentStatusLabels: Record<string, string> = {
  active: '在學',
  graduated: '畢業',
  transferred: '轉校',
  suspended: '休學',
};

export const incomeCategoryLabels: Record<string, string> = {
  tuition: '學費',
  donation: '捐贈',
  event: '活動',
  other: '其他',
};

export const expenseCategoryLabels: Record<string, string> = {
  salary: '薪資',
  equipment: '設備',
  maintenance: '維修',
  event: '活動',
  other: '其他',
};

export const announcementTypeLabels: Record<string, string> = {
  exam: '考試',
  holiday: '假期',
  payment: '繳費',
  weather: '天氣',
  activity: '活動',
  other: '其他',
};

export const announcementStatusLabels: Record<string, string> = {
  draft: '草稿',
  pending_approval: '待審批',
  approved: '已審批',
  sent: '已發送',
  rejected: '已退回',
};

export const announcementAudienceLabels: Record<string, string> = {
  whole_school: '全校',
  grade_X: '年級',
  class_X: '班級',
};

export function awardTypeLabel(type: string): string {
  return awardTypeLabels[type] || type || '未分類';
}

export function awardStatusLabel(status: string): string {
  return awardStatusLabels[status] || status || '未知';
}
