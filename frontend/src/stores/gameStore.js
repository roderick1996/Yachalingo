import { defineStore } from 'pinia';
import axios from 'axios';

const MAX_HEARTS = 5;

export const useGameStore = defineStore('game', {
  state: () => ({
    queue: [], index: 0, total: 0, mastered: [],
    hearts: MAX_HEARTS, xp: 0, streak: 0,
    selected: null, result: null, // result: respuesta del servidor
    status: 'idle', // idle | loading | playing | won | lost | empty
    error: '',
  }),
  getters: {
    current: (s) => s.queue[s.index],
    progress: (s) => (s.total ? s.mastered.length / s.total : 0),
    checked: (s) => !!s.result,
  },
  actions: {
    async start({ ids = [], count = 8 } = {}) {
      this.status = 'loading'; this.error = '';
      Object.assign(this, { hearts: MAX_HEARTS, xp: 0, streak: 0, index: 0, mastered: [], selected: null, result: null });
      try {
        const { data } = await axios.get('/api/game/session', { params: ids.length ? { ids: ids.join(',') } : { count } });
        this.queue = data.items; this.total = data.items.length;
        this.status = this.total ? 'playing' : 'empty';
      } catch { this.error = 'No se pudo cargar el juego'; this.status = 'empty'; }
    },
    select(id) { if (!this.result) this.selected = id; },
    async check() {
      if (!this.selected || this.result) return;
      const { data } = await axios.post('/api/game/answer', { riddleId: this.current.id, imageId: this.selected });
      this.result = data;
      if (data.correct) {
        this.xp += 10; this.streak++;
        if (!this.mastered.includes(this.current.id)) this.mastered.push(this.current.id);
      } else {
        this.hearts--; this.streak = 0;
        // Reprograma la misma adivinanza 3 turnos después (refuerzo)
        const at = Math.min(this.index + 4, this.queue.length);
        this.queue.splice(at, 0, { ...this.current, options: [...this.current.options].sort(() => Math.random() - 0.5) });
      }
    },
    next() {
      this.selected = null; this.result = null;
      if (this.hearts <= 0) { this.status = 'lost'; return; }
      this.index++;
      if (this.index >= this.queue.length) this.status = 'won';
    },
  },
});
