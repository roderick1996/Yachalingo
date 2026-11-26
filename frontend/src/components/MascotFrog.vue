<script setup>
// mood: idle | thinking | happy | sad
defineProps({ mood: { type: String, default: 'idle' }, size: { type: Number, default: 110 } });
</script>

<template>
  <svg :class="['frog', mood]" :width="size" :height="size" viewBox="0 0 120 120" role="img" aria-label="Jamp'atu, el sapito">
    <g class="body-g">
      <ellipse class="shadow" cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".12" />
      <!-- patas -->
      <ellipse cx="30" cy="100" rx="16" ry="9" fill="#46a302" />
      <ellipse cx="90" cy="100" rx="16" ry="9" fill="#46a302" />
      <!-- cuerpo -->
      <ellipse cx="60" cy="72" rx="40" ry="34" fill="#58cc02" />
      <ellipse cx="60" cy="84" rx="26" ry="20" fill="#d7ffb8" />
      <!-- ojos -->
      <circle cx="38" cy="38" r="17" fill="#58cc02" />
      <circle cx="82" cy="38" r="17" fill="#58cc02" />
      <circle cx="38" cy="38" r="13" fill="#fff" />
      <circle cx="82" cy="38" r="13" fill="#fff" />
      <g class="pupils" :transform="mood === 'thinking' ? 'translate(4,-3)' : ''">
        <circle class="pupil" cx="38" cy="39" r="6" fill="#222" />
        <circle class="pupil" cx="82" cy="39" r="6" fill="#222" />
        <circle cx="40" cy="36" r="2" fill="#fff" /><circle cx="84" cy="36" r="2" fill="#fff" />
      </g>
      <!-- párpados (parpadeo) -->
      <rect class="lid" x="25" y="25" width="26" height="26" rx="13" fill="#58cc02" />
      <rect class="lid" x="69" y="25" width="26" height="26" rx="13" fill="#58cc02" />
      <!-- mejillas -->
      <circle cx="26" cy="68" r="6" fill="#ff9aa2" opacity=".6" />
      <circle cx="94" cy="68" r="6" fill="#ff9aa2" opacity=".6" />
      <!-- boca -->
      <path v-if="mood === 'happy'" d="M38 62 Q60 92 82 62 Z" fill="#8b2a2a" stroke="#2f6b00" stroke-width="3" stroke-linejoin="round" />
      <path v-else-if="mood === 'sad'" d="M44 76 Q60 62 76 76" fill="none" stroke="#2f6b00" stroke-width="4" stroke-linecap="round" />
      <path v-else-if="mood === 'thinking'" d="M48 72 L72 70" fill="none" stroke="#2f6b00" stroke-width="4" stroke-linecap="round" />
      <path v-else d="M42 68 Q60 82 78 68" fill="none" stroke="#2f6b00" stroke-width="4" stroke-linecap="round" />
      <!-- lágrima -->
      <path v-if="mood === 'sad'" class="tear" d="M30 56 q-5 9 0 12 q5 -3 0 -12z" fill="#1cb0f6" />
    </g>
    <!-- signo de pregunta -->
    <text v-if="mood === 'thinking'" class="think" x="96" y="22" font-size="22" font-weight="800" fill="#1cb0f6">?</text>
    <!-- estrellitas -->
    <g v-if="mood === 'happy'" class="sparks" fill="#ffc800">
      <path d="M10 20 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" /><path d="M105 12 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.frog { overflow: visible; }
.body-g { transform-origin: 60px 110px; transform-box: fill-box; animation: breathe 3s ease-in-out infinite; }
.lid { transform: scaleY(0); transform-origin: center; transform-box: fill-box; animation: blink 4.5s infinite; }
.happy .body-g { animation: jump .7s ease-in-out 3; }
.sad .body-g { animation: sag 1.6s ease-in-out infinite; }
.sad .lid { animation: none; transform: scaleY(.35); transform-origin: top; }
.thinking .body-g { animation: tilt 1.8s ease-in-out infinite; }
.think { animation: pop 1.2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
.sparks { animation: twinkle .6s ease-in-out infinite alternate; transform-origin: center; transform-box: fill-box; }
.tear { animation: drip 1.4s ease-in infinite; }
@keyframes breathe { 50% { transform: scaleY(1.03); } }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(0); } 95% { transform: scaleY(1); } }
@keyframes jump { 0%, 100% { transform: translateY(0) scale(1, 1); } 25% { transform: scale(1.08, .88); } 55% { transform: translateY(-34px) scale(.94, 1.1); } 80% { transform: translateY(0) scale(1.08, .9); } }
@keyframes sag { 50% { transform: translateY(3px) scale(1.02, .96); } }
@keyframes tilt { 50% { transform: rotate(-5deg); } }
@keyframes pop { 50% { transform: scale(1.3) rotate(8deg); } }
@keyframes twinkle { to { transform: scale(1.35) rotate(20deg); opacity: .6; } }
@keyframes drip { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(18px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
