<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';
import { useProgressStore } from 'stores/progressStore';
import MascotFrog from 'components/MascotFrog.vue';
import SchoolBadge from 'components/SchoolBadge.vue';
import AppFooter from 'components/AppFooter.vue';

const router = useRouter();
const progress = useProgressStore();
const units = ref([]);
const loading = ref(true);
const open = ref(null); // nodo con burbuja abierta

const OFFSETS = [0, 46, 78, 46, 0, -46, -78, -46];
const CHUNK = 3;
const shade = (hex) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.round(v * 0.78)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

// Cada unidad: lecciones de 3 adivinanzas + un repaso final (🏆) con toda la temática
const stages = computed(() => {
  let flat = 0;
  const out = units.value.map((u, ui) => {
    const nodes = [];
    for (let i = 0; i < u.riddleIds.length; i += CHUNK) nodes.push({ type: 'lesson', ids: u.riddleIds.slice(i, i + CHUNK) });
    if (u.riddleIds.length > CHUNK) nodes.push({ type: 'review', ids: u.riddleIds });
    nodes.forEach((n, ni) => { n.key = `u${u.id}-n${ni}`; n.flat = flat++; n.offset = OFFSETS[ni % OFFSETS.length]; n.unit = u; });
    return { ...u, number: ui + 1, nodes, c: u.color, cd: shade(u.color) };
  });
  return out;
});
const flatNodes = computed(() => stages.value.flatMap((s) => s.nodes));
const currentFlat = computed(() => { const n = flatNodes.value.find((x) => !progress.done[x.key]); return n ? n.flat : flatNodes.value.length; });
const status = (n) => (progress.done[n.key] ? 'done' : n.flat === currentFlat.value ? 'current' : n.flat < currentFlat.value ? 'done' : 'locked');
const totalDone = computed(() => flatNodes.value.filter((n) => progress.done[n.key]).length);
const currentStage = computed(() => stages.value.find((s) => s.nodes.some((n) => n.flat === currentFlat.value)) || stages.value.at(-1));

function tap(n) { if (status(n) !== 'locked') open.value = open.value === n.key ? null : n.key; }
function go(n) { router.push({ path: '/play', query: { ids: n.ids.join(','), key: n.key } }); }
function practice() { router.push({ path: '/play', query: { key: 'practice' } }); }

onMounted(async () => {
  try { units.value = (await api.get('/learn/units')).data; } finally { loading.value = false; }
});
</script>

<template>
  <div class="learn-shell">
    <!-- Barra lateral -->
    <nav class="sidebar">
      <div class="brand"><span>🐸</span><span>imasmari</span></div>
      <a class="nav-item active"><span class="em">🏠</span><span class="t">Aprender</span></a>
      <a class="nav-item" @click="practice"><span class="em">🎯</span><span class="t">Practicar</span></a>
      <router-link class="nav-item" to="/admin"><span class="em">🛠️</span><span class="t">Panel</span></router-link>
      <SchoolBadge />
    </nav>

    <!-- Ruta -->
    <main class="path-col" @click.self="open = null">
      <div v-if="loading" class="text-center q-pa-xl"><q-spinner color="positive" size="48px" /></div>

      <div v-else-if="!stages.length" class="text-center q-pa-xl">
        <MascotFrog mood="sad" :size="140" />
        <h2>Aún no hay etapas</h2>
        <p>Importa o crea adivinanzas con imagen desde el panel.</p>
        <router-link to="/admin"><button class="btn3d">Ir al panel</button></router-link>
      </div>

      <section v-for="s in stages" :key="s.id" :style="{ '--c': s.c, '--cd': s.cd }">
        <div class="unit-banner" :style="{ background: s.c }">
          <div class="back">Etapa {{ s.number }} · {{ s.icon }}</div>
          <h2>{{ s.title }} <span style="font-weight: 600; opacity: .9">— {{ s.subtitle }}</span></h2>
        </div>

        <div class="path">
          <div v-for="n in s.nodes" :key="n.key" class="node-wrap" :style="{ transform: `translateX(${n.offset}px)` }">
            <div v-if="open === n.key" class="start-bubble">
              <span style="cursor: pointer" @click="go(n)">{{ status(n) === 'done' ? 'Practicar' : 'Empezar' }}</span>
            </div>
            <div v-if="n.flat === currentFlat" class="mascot-side"><MascotFrog :mood="open === n.key ? 'thinking' : 'idle'" :size="84" /></div>
            <button :class="['node', status(n)]" :aria-label="n.type === 'review' ? 'Repaso' : 'Lección'" @click.stop="tap(n)">
              <template v-if="status(n) === 'done'">✔</template>
              <template v-else>{{ n.type === 'review' ? '🏆' : '⭐' }}</template>
            </button>
          </div>
        </div>
      </section>
      <AppFooter />
    </main>

    <!-- Columna derecha -->
    <aside class="right-col">
      <div class="stats-row">
        <span :style="{ color: progress.streak ? '#ff9600' : '#bbb' }">🔥 {{ progress.streak }}</span>
        <span style="color: var(--blue)">⚡ {{ progress.xp }}</span>
        <span style="color: var(--red)">❤️ 5</span>
      </div>

      <div class="card">
        <div class="row items-center no-wrap q-gutter-md">
          <MascotFrog mood="happy" :size="86" />
          <div>
            <h4>Jamp’atu te dice</h4>
            <p style="margin: 0">«Imasmari imasmari… ¿imachus kanman?» Mira la imagen y adivina. ¡Si fallas, vuelve a intentarlo!</p>
          </div>
        </div>
      </div>

      <div v-if="stages.length" class="card">
        <h4>Tu avance</h4>
        <p>{{ totalDone }} de {{ flatNodes.length }} lecciones · Etapa actual: {{ currentStage?.icon }} {{ currentStage?.subtitle }}</p>
        <q-linear-progress :value="flatNodes.length ? totalDone / flatNodes.length : 0" color="green-6" size="14px" rounded track-color="grey-3" />
      </div>

      <div class="card">
        <h4>Práctica libre</h4>
        <p>Mezcla adivinanzas de todas las etapas.</p>
        <button class="btn3d ghost" style="width: 100%" @click="practice">Practicar</button>
      </div>
    </aside>
  </div>
</template>
