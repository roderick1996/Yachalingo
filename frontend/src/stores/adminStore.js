import { defineStore } from 'pinia';
import api from '../utils/api';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: sessionStorage.getItem('imasmari_token') || '',
    riddles: [], images: [], units: [], loading: false,
  }),
  getters: { loggedIn: (s) => !!s.token },
  actions: {
    _auth() { api.defaults.headers.common.Authorization = `Bearer ${this.token}`; },
    async login(username, password) {
      const { data } = await api.post('/auth/login', { username, password });
      this.token = data.token;
      sessionStorage.setItem('imasmari_token', data.token);
      await this.loadAll();
    },
    logout() {
      this.token = '';
      delete api.defaults.headers.common.Authorization;
      sessionStorage.removeItem('imasmari_token');
    },
    async _guard(fn) {
      this._auth();
      try { return await fn(); }
      catch (e) { if (e.response?.status === 401) this.logout(); throw e; }
    },
    async loadAll() { await Promise.all([this.loadRiddles(), this.loadImages(), this.loadUnits()]); },
    async loadUnits() { this.units = (await api.get('/learn/units')).data; },
    loadRiddles() { return this._guard(async () => { this.riddles = (await api.get('/riddles')).data; }); },
    loadImages() { return this._guard(async () => { this.images = (await api.get('/images')).data; }); },
    async saveRiddle(r) {
      await this._guard(() => (r.id ? api.put(`/riddles/${r.id}`, r) : api.post('/riddles', r)));
      await this.loadRiddles();
    },
    async deleteRiddle(id) { await this._guard(() => api.delete(`/riddles/${id}`)); await this.loadRiddles(); },
    async uploadImage(file, label) {
      const fd = new FormData(); fd.append('image', file); fd.append('label', label);
      const { data } = await this._guard(() => api.post('/images', fd));
      await this.loadAll(); return data;
    },
    async renameImage(id, label) { await this._guard(() => api.patch(`/images/${id}`, { label })); await this.loadImages(); },
    async deleteImage(id) { const { data } = await this._guard(() => api.delete(`/images/${id}`)); await this.loadAll(); return data; },
    async previewDocx(file) {
      const fd = new FormData(); fd.append('file', file);
      return (await this._guard(() => api.post('/import/docx', fd))).data.items;
    },
    async commitDocx(items) {
      const { data } = await this._guard(() => api.post('/import/docx/commit', { items }));
      await this.loadRiddles(); return data;
    },
  },
});
