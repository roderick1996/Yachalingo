<script setup>
defineProps({ result: Object });
defineEmits(['next']);
</script>

<template>
  <div :class="['banner', result.correct ? 'ok' : 'bad']" role="status" aria-live="polite">
    <div class="inner">
      <div class="msg">
        <div class="title">
          <q-icon :name="result.correct ? 'check_circle' : 'cancel'" size="28px" />
          {{ result.correct ? '¡Allinmi! ¡Correcto!' : 'Respuesta correcta:' }}
        </div>
        <div v-if="!result.correct" class="answer">{{ result.answerLabel }}</div>
        <div v-if="result.translation" class="detail"><b>Significa:</b> {{ result.translation }}</div>
        <div v-if="result.explanation" class="detail">{{ result.explanation }}</div>
        <div v-if="!result.correct" class="detail small">Esta adivinanza volverá más adelante para que la practiques. 🐸</div>
      </div>
      <button :class="['btn3d', result.correct ? '' : 'red']" @click="$emit('next')">Continuar</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.banner { position: fixed; left: 0; right: 0; bottom: 0; padding: 18px 16px 22px; border-top: 2px solid transparent; z-index: 10; animation: up .25s ease-out; }
.inner { max-width: 720px; margin: 0 auto; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: space-between; }
.msg { flex: 1; min-width: 220px; }
.ok { background: var(--green-soft); color: #3b8f00; }
.bad { background: var(--red-soft); color: #d33; }
.title { font-weight: 800; font-size: 1.3rem; display: flex; align-items: center; gap: 8px; }
.answer { font-size: 1.15rem; font-weight: 700; margin-top: 2px; }
.detail { margin-top: 4px; font-size: .95rem; }
.small { opacity: .85; }
@keyframes up { from { transform: translateY(100%); } }
</style>
