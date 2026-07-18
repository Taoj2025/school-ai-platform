// API client for School AI Platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<{ data: T; meta: any }> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============ AI Assistant API ============
  async generateAI(prompt: string, jobType: string = 'chat') {
    return this.fetch<{ id: string; status: string; result: string | null; model: string }>(
      '/api/v1/ai/generate',
      {
        method: 'POST',
        body: JSON.stringify({ job_type: jobType, prompt, model: 'kimi-k2.5' }),
      }
    );
  }

  // ============ Awards API ============
  async getAwards(params?: { page?: number; page_size?: number; academic_year?: string; semester?: number }) {
    return this.fetch<{ items: any[]; total: number; page: number; page_size: number }>(
      '/api/v1/apple/awards',
      { params }
    );
  }

  async getAward(id: string) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}`);
  }

  async createAward(data: any) {
    return this.fetch<any>('/api/v1/apple/awards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAward(id: string, data: any) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAward(id: string) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}`, {
      method: 'DELETE',
    });
  }

  async calculateScholarships(id: string) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}/calculate`, {
      method: 'POST',
    });
  }

  async getAwardScript(id: string) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}/script`);
  }

  async getAwardRecipients(id: string) {
    return this.fetch<{ items: any[]; total: number }>(
      `/api/v1/apple/awards/${id}/recipients`
    );
  }

  async createAwardRecipient(awardId: string, data: any) {
    return this.fetch<any>(`/api/v1/apple/awards/${awardId}/recipients`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCertificates(
    id: string,
    recipientIds: string[],
    signatory = 'Principal',
    ceremonyDate?: string
  ) {
    return this.fetch<any>(`/api/v1/apple/awards/${id}/certificates`, {
      method: 'POST',
      body: JSON.stringify({
        recipient_ids: recipientIds,
        template_id: 'default',
        signatory,
        ceremony_date: ceremonyDate,
      }),
    });
  }

  // ============ Finance API ============
  async getIncomeRecords(params?: { page?: number; page_size?: number; category?: string }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/apple/finance/income',
      { params }
    );
  }

  async createIncome(data: any) {
    return this.fetch<any>('/api/v1/apple/finance/income', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExpenseRecords(params?: { page?: number; page_size?: number; category?: string }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/apple/finance/expense',
      { params }
    );
  }

  async createExpense(data: any) {
    return this.fetch<any>('/api/v1/apple/finance/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFinanceRecord(id: string) {
    return this.fetch<any>(`/api/v1/apple/finance/${id}`, {
      method: 'DELETE',
    });
  }

  async getQuotations(params?: { page?: number; page_size?: number }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/apple/finance/quotations',
      { params }
    );
  }

  async analyzeQuotation(id: string) {
    return this.fetch<any>(`/api/v1/apple/finance/quotations/${id}/analyze`, {
      method: 'POST',
    });
  }

  async getFinanceStats() {
    return this.fetch<any>('/api/v1/apple/finance/stats');
  }

  // ============ Assets API ============
  async getAssets(params?: { page?: number; page_size?: number; category?: string; status?: string }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/apple/assets',
      { params }
    );
  }

  async getAsset(id: string) {
    return this.fetch<any>(`/api/v1/apple/assets/${id}`);
  }

  async createAsset(data: any) {
    return this.fetch<any>('/api/v1/apple/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: any) {
    return this.fetch<any>(`/api/v1/apple/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.fetch<any>(`/api/v1/apple/assets/${id}`, {
      method: 'DELETE',
    });
  }

  async recordMovement(assetId: string, data: any) {
    return this.fetch<any>(`/api/v1/apple/assets/${assetId}/movements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMovements(assetId: string) {
    return this.fetch<any[]>(`/api/v1/apple/assets/${assetId}/movements`);
  }

  async writeOffAsset(id: string, data: { reason: string }) {
    return this.fetch<any>(`/api/v1/apple/assets/${id}/writeoff`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createStocktake(data: any) {
    return this.fetch<any>('/api/v1/apple/assets/stocktake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssetStats() {
    return this.fetch<any>('/api/v1/apple/assets/stats');
  }

  // ============ Students API ============
  async getStudents(params?: { page?: number; page_size?: number; grade?: number; class_name?: string }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/apple/students',
      { params }
    );
  }

  async getStudent(id: string) {
    return this.fetch<any>(`/api/v1/apple/students/${id}`);
  }

  async createStudent(data: any) {
    return this.fetch<any>('/api/v1/apple/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: string, data: any) {
    return this.fetch<any>(`/api/v1/apple/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string) {
    return this.fetch<any>(`/api/v1/apple/students/${id}`, {
      method: 'DELETE',
    });
  }

  async importStudents(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/v1/apple/students/import`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }

  async getStudentCertificates(studentId: string) {
    return this.fetch<any[]>(`/api/v1/apple/students/${studentId}/certificates`);
  }

  async getCertificatePdf(studentId: string, certificateId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/apple/students/${studentId}/certificates/${certificateId}/pdf`,
      { method: 'GET' }
    );
    return response.blob();
  }

  // ============ Grade (成績管理) API ============
  async getExamSessions(params?: {
    page?: number;
    page_size?: number;
    semester?: string;
    subject?: string;
    grade?: string;
    status?: string;
  }) {
    return this.fetch<{ items: any[]; total: number; page: number; page_size: number }>(
      '/api/v1/grade/exam-sessions',
      { params }
    );
  }

  async getExamSession(id: string) {
    return this.fetch<any>(`/api/v1/grade/exam-sessions/${id}`);
  }

  async createExamSession(data: any) {
    return this.fetch<any>('/api/v1/grade/exam-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExamSession(id: string, data: any) {
    return this.fetch<any>(`/api/v1/grade/exam-sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getExamStatistics(id: string) {
    return this.fetch<any>(`/api/v1/grade/exam-sessions/${id}/statistics`);
  }

  async getExamScores(id: string) {
    return this.fetch<any[]>(`/api/v1/grade/exam-sessions/${id}/scores`);
  }

  async createScore(data: any) {
    return this.fetch<any>('/api/v1/grade/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScore(id: string, data: any) {
    return this.fetch<any>(`/api/v1/grade/scores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async generateComment(scoreId: string) {
    return this.fetch<any>(`/api/v1/grade/scores/${scoreId}/generate-comment`, {
      method: 'POST',
    });
  }

  async generateCommentsBatch(sessionId: string) {
    return this.fetch<any>(
      `/api/v1/grade/exam-sessions/${sessionId}/generate-comments`,
      { method: 'POST' }
    );
  }

  async getComments(params?: {
    exam_session_id?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) {
    return this.fetch<{ items: any[]; total: number }>('/api/v1/grade/comments', {
      params,
    });
  }

  async updateComment(id: string, data: any) {
    return this.fetch<any>(`/api/v1/grade/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async submitCommentFeedback(id: string, data: any) {
    return this.fetch<any>(`/api/v1/grade/comments/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async detectRegressions(sessionId: string) {
    return this.fetch<any>(
      `/api/v1/grade/exam-sessions/${sessionId}/detect-regressions`,
      { method: 'POST' }
    );
  }

  async getAlerts(params?: {
    exam_session_id?: string;
    student_id?: string;
    notified?: boolean;
  }) {
    return this.fetch<any[]>('/api/v1/grade/alerts', {
      params,
    });
  }

  async getExamReport(sessionId: string, classIds?: number[]) {
    return this.fetch<any>(
      `/api/v1/grade/exam-sessions/${sessionId}/report`,
      { params: classIds ? { class_ids: classIds.join(',') } : undefined }
    );
  }

  // ============ Announcements (公告管理) API ============
  async getAnnouncements(params?: {
    page?: number;
    page_size?: number;
    academic_year?: string;
    semester?: string;
    announcement_type?: string;
    status?: string;
  }) {
    return this.fetch<{ items: any[]; total: number; page: number; page_size: number }>(
      '/api/v1/announcements',
      { params }
    );
  }

  async getAnnouncement(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}`);
  }

  async generateAnnouncement(data: any) {
    return this.fetch<any>('/api/v1/announcements/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAnnouncement(data: any) {
    return this.fetch<any>('/api/v1/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncement(id: string, data: any) {
    return this.fetch<any>(`/api/v1/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async submitAnnouncement(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}/submit`, {
      method: 'POST',
    });
  }

  async approveAnnouncement(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}/approve`, {
      method: 'POST',
    });
  }

  async sendAnnouncement(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}/send`, {
      method: 'POST',
    });
  }

  async getAnnouncementReadStatus(id: string) {
    return this.fetch<any>(`/api/v1/announcements/${id}/read-status`);
  }

  async getTemplates(params?: { category?: string; is_active?: boolean }) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/announcements/templates',
      { params }
    );
  }

  async createTemplate(data: any) {
    return this.fetch<any>('/api/v1/announcements/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recommendTemplates(announcementType?: string) {
    return this.fetch<{ items: any[]; total: number }>(
      '/api/v1/announcements/templates/recommend',
      { params: announcementType ? { announcement_type: announcementType } : undefined }
    );
  }
}

export const api = new ApiClient();
export default api;
