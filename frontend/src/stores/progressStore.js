import { defineStore } from 'pinia';

const KEY = 'imasmari_progress';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const day = (d = new Date()) => d.toISOString().slice(0, 10);

export const useProgressStore = defineStore('progress', {
  state: () => ({ done: {}, xp: 0, streak: 0, lastDay: '', ...load() }),
  actions: {
    _save() { try { localStorage.setItem(KEY, JSON.stringify({ done: this.done, xp: this.xp, streak: this.streak, lastDay: this.lastDay })); } catch { /* sin storage */ } },
    complete(nodeKey, xp) {
      this.done[nodeKey] = (this.done[nodeKey] || 0) + 1;
      this.xp += xp;
      const today = day(), yest = day(new Date(Date.now() - 864e5));
      if (this.lastDay !== today) { this.streak = this.lastDay === yest ? this.streak + 1 : 1; this.lastDay = today; }
      this._save();
    },
    reset() { Object.assign(this, { done: {}, xp: 0, streak: 0, lastDay: '' }); this._save(); },
  },
});
