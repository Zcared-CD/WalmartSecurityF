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

      <!-- Contraseña con Ojo para ver -->
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

      <!-- Mensaje de error -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-3"
        density="compact"
      >
        {{ error }}
      </v-alert>

      <!-- Botón con Spinner (loading) -->
      <v-btn
        block
        size="large"
        class="login-btn"
        :loading="cargando"
        :disabled="cargando"
        @click="goToToken"
      >
        INICIAR SESIÓN
        <!-- Personalización del spinner si deseas -->
        <template v-slot:loader>
          <v-progress-circular
            indeterminate
            color="white"
            size="22"
            width="2"
          ></v-progress-circular>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)

const goToToken = async () => {
  if (!username.value || !password.value) {
    error.value = 'Por favor ingresa usuario y contraseña'
    return
  }

  try {
    cargando.value = true
    error.value = ''

    const response = await login(username.value, password.value)

    localStorage.setItem('totp_step', response.step)

    router.push('/token')

  } catch (e: any) {

    const data = e.response?.data

    // 🔥 INTENTOS RESTANTES
    if (data?.remaining_attempts !== undefined) {
      error.value = `Te quedan ${data.remaining_attempts} intentos`
    }

    // 🔒 IP BLOQUEADA
    else if (data?.blocked_until) {
      const tiempo = new Date(data.blocked_until).toLocaleString()
      error.value = `IP bloqueada hasta ${tiempo}`
    }

    // ❌ ERROR NORMAL
    else {
      error.value = data?.error || 'Usuario o contraseña incorrectos'
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

/* Estilo para cuando el botón está deshabilitado o cargando */
.v-btn--disabled {
  opacity: 0.8 !important;
}
</style>
