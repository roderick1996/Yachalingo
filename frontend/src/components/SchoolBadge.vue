<template>
  <div class="school-badge">
    <img src="/logo.jpeg" alt="Escuela Superior de Formación de Maestros José David Berríos" />
    <span>José David Berríos</span>
  </div>
</template>

<style scoped lang="scss">
.school-badge { display: flex; align-items: center; gap: 10px; margin-top: auto; padding: 10px 8px; font-weight: 800; font-size: 14px; color: var(--ink); line-height: 1.2; }
.school-badge img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
@media (max-width: 1100px) { .school-badge span { display: none; } }
@media (max-width: 640px) { .school-badge { display: none; } }
</style>
