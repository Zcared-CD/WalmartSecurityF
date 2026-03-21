<template>
  <v-app>
    <HeaderBar />

    <AuthCard title="Login de trabajadores">
      <!-- Usuario -->
      <v-text-field
        v-model="username"
        label="Usuario"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-2"
        :disabled="cargando"
        hide-details="auto"
      />

     
      <v-text-field
        v-model="password"
        label="Contraseña"
        :type="mostrarPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-3"
        :disabled="cargando"
        @click:append-inner="mostrarPassword = !mostrarPassword"
        @keyup.enter="goToToken"
        hide-details="auto"
      />

      <!-- Error -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        {{ error }}
      </v-alert>

      
      <v-alert
        v-if="tiempoRestante"
        type="warning"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        {{ tiempoRestante }}
      </v-alert>

      <!-- Botón -->
      <v-btn
        block
        size="large"
        class="login-btn"
        :loading="cargando"
        :disabled="cargando || estaBloqueado"
        @click="goToToken"
      >
        INICIAR SESIÓN

        <template v-slot:loader>
          <v-progress-circular
            indeterminate
            color="white"
            size="22"
            width="2"
          />
        </template>
      </v-btn>
    </AuthCard>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import AuthCard from '@/components/auth/AuthContainer.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import { login } from '@/services/auth'
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)


const tiempoRestante = ref('')
let intervalo: any = null

const estaBloqueado = computed(() => !!tiempoRestante.value)


const iniciarContador = (fecha: string) => {
  if (intervalo) clearInterval(intervalo)

  const fin = new Date(fecha).getTime()

  intervalo = setInterval(() => {
    const ahora = new Date().getTime()
    const diff = fin - ahora

    if (diff <= 0) {
      clearInterval(intervalo)
      tiempoRestante.value = ''
      return
    }

    const minutos = Math.floor(diff / 60000)
    const segundos = Math.floor((diff % 60000) / 1000)

    tiempoRestante.value = `Reintentar en ${minutos}:${segundos
      .toString()
      .padStart(2, '0')}`
  }, 1000)
}

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

const goToToken = async () => {
  if (!username.value || !password.value) {
    error.value = 'Por favor ingresa usuario y contraseña'
    return
  }

  try {
    cargando.value = true
    error.value = ''

    const response = await login(username.value, password.value)
    void response

    router.push('/token')

  } catch (e: any) {
    const status = e.response?.status
    const data = e.response?.data

    if (status === 400) {
      error.value = data?.error || 'Credenciales incorrectas'

      if (data?.remaining_attempts !== undefined) {
        error.value += ` (Te quedan ${data.remaining_attempts} intentos)`
      }
    }

    else if (status === 403) {
      error.value = 'Acceso temporalmente restringido'

      if (data?.blocked_until) {
        iniciarContador(data.blocked_until)
      }
    }

    else if (status === 429) {
      error.value = 'Demasiados intentos. Intenta más tarde'
    }

    else {
      error.value = 'Error inesperado'
    }

    console.error("Error de autenticación:", e)

  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-btn {
  background-color: #0071ce !important;
  color: white !important;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #004c91 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.v-btn--disabled {
  opacity: 0.8 !important;
}
</style>