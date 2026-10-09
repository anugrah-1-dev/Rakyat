import api from './axiosClient';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data)
};

export const regionApi = {
  provinces: () => api.get('/regions/provinces').then((res) => res.data.data),
  regencies: (provinceId) => api.get('/regions/regencies', { params: { provinceId } }).then((res) => res.data.data),
  districts: (regencyId) => api.get('/regions/districts', { params: { regencyId } }).then((res) => res.data.data),
  villages: (districtId) => api.get('/regions/villages', { params: { districtId } }).then((res) => res.data.data)
};

export const aspirationApi = {
  categories: () => api.get('/categories').then((res) => res.data.data),
  list: (params) => api.get('/aspirations', { params }).then((res) => res.data),
  detail: (id) => api.get(`/aspirations/${id}`).then((res) => res.data.data),
  verifyWhatsapp: (phone) => api.post('/whatsapp/verify', { phone }).then((res) => res.data),
  captcha: () => api.get('/captcha').then((res) => res.data),
  submit: (payload) => api.post('/aspirations', payload).then((res) => res.data),
  adminList: (params) => api.get('/admin/aspirations', { params }).then((res) => res.data),
  updateStatus: (id, payload) => api.patch(`/admin/aspirations/${id}/status`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/admin/aspirations/${id}`)
};

export const analyticsApi = {
  summary: () => api.get('/analytics/summary').then((res) => res.data.data),
  categories: () => api.get('/analytics/categories').then((res) => res.data.data),
  statuses: () => api.get('/analytics/statuses').then((res) => res.data.data),
  monthly: () => api.get('/analytics/monthly').then((res) => res.data.data),
  priorities: () => api.get('/analytics/priority-regions').then((res) => res.data.data)
};
