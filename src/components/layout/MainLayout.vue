<template>
  <div class="main-layout">
    <TopNavBar />
    <main class="main-layout__content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNavBar from './TopNavBar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--gray-50);
}

.main-layout__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 767px) {
  .main-layout__content {
    padding: 16px;
  }
}
</style>
