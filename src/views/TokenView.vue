<template>
  <v-app>
    <HeaderBar />

    <AuthCard title="Verificación de acceso">
      <div class="text-center mb-3">
        <p class="token-message">Escribe el token que se envió a tu correo antes de que caduque.</p>
      </div>

      <v-text-field
        v-model="tokenInput"
        label="Token"
        prepend-inner-icon="mdi-shield-key"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-3"
      />

      <div class="text-center mb-3">
        <span class="timer"> Tiempo restante: {{ minutes }}:{{ seconds }} </span>
      </div>

      <v-btn block size="large" class="login-btn" @click="handleValidateToken">
        VALIDAR TOKEN
      </v-btn>
    </AuthCard>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' // 3. Importamos el router
import HeaderBar from '@/components/layout/HeaderBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import AuthCard from '@/components/auth/AuthContainer.vue'

const router = useRouter() // Inicializamos el router
const tokenInput = ref('') // Variable para el token
const totalSeconds = ref(180)

const minutes = computed(() => String(Math.floor(totalSeconds.value / 60)).padStart(2, '0'))
const seconds = computed(() => String(totalSeconds.value % 60).padStart(2, '0'))

// 4. Función para validar y navegar
const handleValidateToken = () => {
  // Como es solo front, validamos que no esté vacío
  if (tokenInput.value.trim().length > 0) {
    // Te manda a la ruta '/dashboard' que definimos en el router
    router.push('/dashboard')
  } else {
    alert('Por favor, ingresa el token recibido.')
  }
}

onMounted(() => {
  const interval = setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      clearInterval(interval)
    }
  }, 1000)
})
</script>

<style scoped>
/* Tu estilo se mantiene igual... */
.token-message {
  font-size: 13px;
  color: #555;
}
.timer {
  font-weight: bold;
  color: #d32f2f;
}
.login-btn {
  background-color: #0071ce;
  color: white;
  font-weight: bold;
}
.login-btn:hover {
  background-color: #004c91;
}
</style>
