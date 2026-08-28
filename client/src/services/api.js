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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (creds) => request('/auth/login', { method: 'POST', body: creds }),
  sendWhatsAppOtp: (data) => request('/auth/send-whatsapp-otp', { method: 'POST', body: data }),
  verifyWhatsAppOtp: (data) => request('/auth/verify-whatsapp-otp', { method: 'POST', body: data }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  getMe: () => request('/auth/me'),
  getOperators: () => request('/auth/operators'),

  // Requests
  createRequest: (formData) => request('/requests', { method: 'POST', body: formData }),
  getRequests: (params = '') => request(`/requests?${params}`),
  getRequestById: (id) => request(`/requests/${id}`),
  updateRequestStatus: (id, body) => request(`/requests/${id}/status`, { method: 'PATCH', body }),
  addRequestNote: (id, note) => request(`/requests/${id}/notes`, { method: 'POST', body: { note } }),
  uploadDeliverable: (id, formData) => request(`/requests/${id}/deliverable`, { method: 'POST', body: formData }),
  trackRequest: (identifier) => request(`/requests/track/${identifier}`),

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
