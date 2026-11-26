<script setup>
// state: '' | selected | correct | wrong
defineProps({ option: Object, state: { type: String, default: '' }, disabled: Boolean, index: Number });
defineEmits(['pick']);
</script>

<template>
  <button :class="['opt', state]" :disabled="disabled" @click="$emit('pick', option.id)">
    <img :src="option.url" :alt="option.label" draggable="false" />
    <span class="lbl">{{ option.label }}</span>
    <span class="key">{{ index }}</span>
  </button>
</template>

<style scoped lang="scss">
.opt {
  position: relative; background: #fff; border: 2px solid var(--line); border-bottom-width: 5px;
  border-radius: 18px; padding: 10px; cursor: pointer; text-align: center; font: inherit;
  transition: transform .1s, border-color .15s, background .15s;
  &:hover:not(:disabled) { background: #f4faff; }
  &:active:not(:disabled) { transform: translateY(3px); border-bottom-width: 2px; margin-bottom: 3px; }
  &:disabled { cursor: default; }
}
img { width: 100%; aspect-ratio: 1; object-fit: contain; border-radius: 12px; background: #fafafa; }
.lbl { display: block; margin-top: 8px; font-weight: 800; font-size: 1.05rem; }
.key { position: absolute; top: 8px; left: 8px; font-size: 12px; font-weight: 800; color: var(--muted);
  border: 2px solid var(--line); border-radius: 8px; width: 24px; height: 24px; line-height: 20px; background: #fff; }
.selected { border-color: var(--blue); background: #ddf4ff; .key { color: var(--blue); border-color: var(--blue); } }
.correct { border-color: var(--green); background: var(--green-soft); animation: bump .4s; }
.wrong { border-color: var(--red); background: var(--red-soft); animation: shake .4s; }
@keyframes bump { 50% { transform: scale(1.05); } }
@keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
</style>
