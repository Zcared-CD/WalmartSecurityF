<template>
  <v-main class="auth-bg d-flex flex-column">
    <v-container class="flex-grow-1 d-flex align-center justify-center">
      <v-card width="350" elevation="8" class="pa-6 rounded-xl auth-card">
        <div class="text-center mb-3">
          <p class="auth-title">{{ title }}</p>
        </div>

        <div class="text-center mb-2">
          <img src="/walmart-logo.svg" alt="Walmart" width="110" />
        </div>

        <div class="text-center mb-4">
          <h3 class="walmart-mx">Walmart México</h3>
        </div>

        <!-- Aquí se inyecta el contenido dinámico -->
        <slot />
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.auth-bg {
  background-color: #ffffff;
  min-height: calc(100vh - 90px);
}

.auth-card {
  transition: 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-3px);
}

.auth-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.walmart-mx {
  color: #0071ce;
  font-weight: bold;
}
</style>
