<template>
  <v-app>
    <HeaderBar />

    <AuthCard title="Login de trabajadores">
      <v-text-field
        v-model="username"
        label="Usuario"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-2"
        :disabled="cargando"
      />

      <v-text-field
        v-model="password"
        label="Contraseña"
        type="password"
        prepend-inner-icon="mdi-lock"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-3"
        :disabled="cargando"
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

      <v-btn
        block
        size="large"
        class="login-btn"
        :loading="cargando"
        @click="goToToken"
      >
        INICIAR SESIÓN
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

const goToToken = async () => {
  if (!username.value || !password.value) {
    error.value = 'Por favor ingresa usuario y contraseña'
    return
  }

  try {
    cargando.value = true
    error.value = ''

    const response = await login(username.value, password.value)

    // Guarda el step que mandó el backend (setup o verify)
    localStorage.setItem('totp_step', response.step)

    router.push('/token')

  } catch (e) {
    error.value = 'Usuario o contraseña incorrectos'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-btn {
  background-color: #0071ce;
  color: white;
  font-weight: bold;
}

.login-btn:hover {
  background-color: #004c91;
}
</style>
