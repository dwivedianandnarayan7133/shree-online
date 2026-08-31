import { API_BASE, SERVER_BASE, getFullUrl } from './config';
export { API_BASE, SERVER_BASE, getFullUrl };

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cybercafe_token');
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.warn(`Network fetch notice for ${endpoint}:`, netErr.message);
    throw new Error(netErr.message || 'Unable to connect to server. Please check your internet connection.');
  }

  let data = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    const rawText = await response.text();
    data = { message: rawText || `Server responded with status ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (creds) => request('/auth/login', { method: 'POST', body: creds }),
  sendRegisterOtp: (data) => request('/auth/register-otp', { method: 'POST', body: data }),
  verifyRegisterOtp: (data) => request('/auth/verify-register-otp', { method: 'POST', body: data }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: data }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  getMe: () => request('/auth/me'),
  getOperators: () => request('/auth/operators'),

  // Requests
  createRequest: (formData) => request('/requests', { method: 'POST', body: formData }),
  getRequests: (params = '') => request(`/requests?${params}`),
  getRequestById: (id) => request(`/requests/${id}`),
  getFileUrl: (requestId, fileId) => `${API_URL}/requests/${requestId}/file/${fileId}`,
  updateRequestStatus: (id, body) => request(`/requests/${id}/status`, { method: 'PATCH', body }),
  addRequestNote: (id, note) => request(`/requests/${id}/notes`, { method: 'POST', body: { note } }),
  addProcessedFile: (id, formData) => request(`/requests/${id}/process-file`, { method: 'POST', body: formData }),
  trackRequest: (identifier) => request(`/requests/track/${identifier}`),

  // Job Postings & Recruitment Alerts
  getJobs: (params = '') => request(`/jobs?${params}`),
  getJobById: (id) => request(`/jobs/${id}`),
  createJob: (body) => request('/jobs', { method: 'POST', body }),
  updateJob: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // Document Tools
  imagesToPdf: (formData) => request('/documents/images-to-pdf', { method: 'POST', body: formData }),
  mergePdfs: (formData) => request('/documents/merge-pdf', { method: 'POST', body: formData }),
  splitPdf: (formData) => request('/documents/split-pdf', { method: 'POST', body: formData }),
  rotatePdf: (formData) => request('/documents/rotate-pdf', { method: 'POST', body: formData }),
  compressPdf: (formData) => request('/documents/compress-pdf', { method: 'POST', body: formData }),

  // Image Tools
  generatePassportPhoto: (formData) => request('/images/passport-photo', { method: 'POST', body: formData }),
  generatePassportSheet: (formData) => request('/images/passport-sheet', { method: 'POST', body: formData }),
  restoreDocument: (formData) => request('/images/restore-document', { method: 'POST', body: formData }),
  processSignature: (formData) => request('/images/process-signature', { method: 'POST', body: formData }),
  transformImage: (formData) => request('/images/transform', { method: 'POST', body: formData }),

  // Conversions & OCR
  extractOcr: (formData) => request('/conversions/ocr', { method: 'POST', body: formData }),
  clearBrowserCache: () => request('/proxy/clear-cache', { method: 'POST' }),
  exportToWord: (body) => request('/conversions/to-word', { method: 'POST', body }),
  exportToExcel: (body) => request('/conversions/to-excel', { method: 'POST', body }),

  // Files
  compressFiles: (formData) => request('/files/compress', { method: 'POST', body: formData }),
  createZip: (formData) => request('/files/zip', { method: 'POST', body: formData }),
  extractZip: (formData) => request('/files/unzip', { method: 'POST', body: formData }),

  // Billing & Print
  createInvoice: (body) => request('/billing/invoices', { method: 'POST', body }),
  getInvoices: (params = '') => request(`/billing/invoices?${params}`),
  getPricing: () => request('/billing/pricing'),
  updatePrice: (id, body) => request(`/billing/pricing/${id}`, { method: 'PATCH', body }),

  createPrintJob: (formData) => request('/print', { method: 'POST', body: formData }),
  getPrintJobs: (params = '') => request(`/print?${params}`),
  updatePrintStatus: (id, body) => request(`/print/${id}/status`, { method: 'PATCH', body }),

  // Shortcuts & Websites
  getShortcuts: (params = '') => request(`/websites?${params}`),
  createShortcut: (body) => request('/websites', { method: 'POST', body }),
  deleteShortcut: (id) => request(`/websites/${id}`, { method: 'DELETE' }),

  // Admin & Managing Director Controller
  getDashboardStats: () => request('/admin/stats'),
  getAuditLogs: (params = '') => request(`/admin/logs?${params}`),
  getSystemConfig: () => request('/admin/config'),
  updateSystemConfig: (body) => request('/admin/config', { method: 'PUT', body }),
  uploadProfilePhoto: (formData) => request('/admin/profile-photo', { method: 'POST', body: formData }),
  triggerCleanup: (body) => request('/admin/cleanup', { method: 'POST', body }),
  getUsers: () => request('/admin/users'),

  // Operator & Service Management
  createOperator: (body) => request('/admin/operators', { method: 'POST', body }),
  updateOperator: (id, body) => request(`/admin/operators/${id}`, { method: 'PUT', body }),
  deleteOperator: (id) => request(`/admin/operators/${id}`, { method: 'DELETE' }),
  createServiceItem: (body) => request('/admin/services', { method: 'POST', body }),
  deleteServiceItem: (id) => request(`/admin/services/${id}`, { method: 'DELETE' })
};
