<script setup lang="ts">
import { ref, onMounted } from "vue"

const timeLeft = ref("")
const progress = ref(100)

function updateTimer() {
  const blockedUntil = sessionStorage.getItem("blocked_until")
  if (!blockedUntil) return

  const end = new Date(blockedUntil).getTime()
  const total = end - new Date().getTime()

  const interval = setInterval(() => {
    const now = new Date().getTime()
    const diff = end - now  

    if (diff <= 0) {
      clearInterval(interval)
      sessionStorage.removeItem("blocked")
      sessionStorage.removeItem("blocked_until")
      window.location.replace("/login")
      return
    }

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    timeLeft.value = `${minutes}:${seconds.toString().padStart(2, "0")}`

 
    progress.value = (diff / total) * 100
  }, 1000)
}

onMounted(() => {
  updateTimer()
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center bg-dark">
    <v-card class="pa-8 text-center elevation-10 rounded-xl" max-width="420">


      <v-icon size="60" color="red">mdi-shield-lock</v-icon>


      <h2 class="mt-4 font-weight-bold">
        Acceso bloqueado
      </h2>


      <p class="mt-2 text-medium-emphasis">
        Detectamos actividad sospechosa desde tu conexión.
        Tu acceso ha sido restringido temporalmente.
      </p>


      <div class="mt-6">
        <p class="text-caption">Tiempo restante</p>
        <h1 class="countdown">{{ timeLeft }}</h1>
      </div>


      <v-progress-linear
        :model-value="progress"
        height="6"
        color="red"
        rounded
        class="mt-4"
      />


      <p class="mt-4 text-caption text-grey">
        Este bloqueo es automático por seguridad.
        Intenta nuevamente cuando el tiempo termine.
      </p>

    </v-card>
  </v-container>
</template>

<style scoped>
.bg-dark {
  background: radial-gradient(circle at top, #0f172a, #020617);
}

.countdown {
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
</style>