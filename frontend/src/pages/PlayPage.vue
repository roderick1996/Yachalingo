<script setup>
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProgressStore } from 'stores/progressStore';
import { useGameStore } from 'stores/gameStore';
import MascotFrog from 'components/MascotFrog.vue';
import SchoolBadge from 'components/SchoolBadge.vue';
import RiddleCardOption from 'components/RiddleCardOption.vue';
import FeedbackBanner from 'components/FeedbackBanner.vue';
import { ref } from 'vue';

const g = useGameStore();
const route = useRoute();
const router = useRouter();
const progress = useProgressStore();
const ids = String(route.query.ids || '').split(',').map(Number).filter(Boolean);
const nodeKey = String(route.query.key || 'practice');
watch(() => g.status, (st) => { if (st === 'won') progress.complete(nodeKey, g.xp); });
const showHint = ref(false);

const mood = computed(() => {
  if (g.result) return g.result.correct ? 'happy' : 'sad';
  if (g.status === 'won') return 'happy';
  if (g.status === 'lost') return 'sad';
  return g.selected ? 'thinking' : 'idle';
});

function stateOf(o) {
  if (g.result) {
    if (o.id === g.result.correctImage?.id) return 'correct';
    if (o.id === g.selected) return 'wrong';
    return '';
  }
  return o.id === g.selected ? 'selected' : '';
}
function next() { showHint.value = false; g.next(); }

function onKey(e) {
  if (g.status !== 'playing') return;
  if (e.key === 'Enter') { g.result ? next() : g.check(); return; }
  const n = Number(e.key);
  if (n >= 1 && n <= g.current?.options.length) g.select(g.current.options[n - 1].id);
}
onMounted(() => { g.start({ ids }); window.addEventListener('keydown', onKey); });
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="play-wrap">
    <div class="top-bar">
      <router-link to="/" class="text-grey-6" title="Salir de la lección"><q-icon name="close" size="30px" /></router-link>
      <q-linear-progress :value="g.progress" color="green-6" size="16px" rounded track-color="grey-3" />
      <span class="stat" style="color: #ffb100"><q-icon name="bolt" />{{ g.xp }}</span>
      <span class="stat" style="color: var(--red)"><q-icon name="favorite" />{{ g.hearts }}</span>
    </div>

    <div v-if="g.status === 'loading'" class="text-center q-pa-xl"><q-spinner color="positive" size="48px" /></div>

    <div v-else-if="g.status === 'empty'" class="text-center q-pa-lg">
      <MascotFrog mood="sad" :size="140" />
      <h2>Aún no hay adivinanzas listas</h2>
      <p>{{ g.error || 'Entra al panel de administración, sube imágenes e importa o crea adivinanzas (se necesitan imágenes asignadas).' }}</p>
      <router-link to="/admin"><button class="btn3d">Ir al panel</button></router-link>
    </div>

    <div v-else-if="g.status === 'won' || g.status === 'lost'" class="text-center q-pa-lg">
      <MascotFrog :mood="g.status === 'won' ? 'happy' : 'sad'" :size="160" />
      <h2>{{ g.status === 'won' ? '¡Sulpayki! ¡Terminaste la lección!' : '¡Te quedaste sin corazones!' }}</h2>
      <p class="text-h6">⚡ {{ g.xp }} XP</p>
      <div class="row justify-center q-gutter-md">
        <button v-if="g.status === 'won'" class="btn3d" @click="router.push('/')">Continuar</button>
        <button :class="['btn3d', g.status === 'won' ? 'ghost' : '']" @click="g.start({ ids })">{{ g.status === 'won' ? 'Repetir' : 'Intentar de nuevo' }}</button>
      </div>
    </div>

    <template v-else-if="g.current">
      <h3 class="q-mb-md">¿Imataq kay? · ¿Qué es?</h3>
      <div class="riddle-row">
        <MascotFrog :mood="mood" :size="110" />
        <div class="bubble">
          <div class="quechua-text">{{ g.current.quechua }}</div>
          <q-btn v-if="g.current.hint && !showHint" flat dense no-caps color="primary" icon="lightbulb" label="Ver pista" class="q-mt-sm" @click="showHint = true" />
          <div v-if="showHint" class="q-mt-sm text-grey-8">💡 {{ g.current.hint }}</div>
        </div>
      </div>

      <div class="options-grid">
        <RiddleCardOption v-for="(o, i) in g.current.options" :key="o.id" :option="o" :index="i + 1"
          :state="stateOf(o)" :disabled="g.checked" @pick="g.select" />
      </div>

      <div v-if="!g.checked" class="fixed-bottom q-pa-md" style="border-top: 2px solid var(--line); background: #fff">
        <div style="max-width: 720px; margin: 0 auto; text-align: right">
          <button class="btn3d" style="width: 100%; max-width: 240px" :disabled="!g.selected" @click="g.check()">Comprobar</button>
        </div>
      </div>
      <FeedbackBanner v-else :result="g.result" @next="next" />
    </template>
  </div>
</template>
