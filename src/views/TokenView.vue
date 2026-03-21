<template>
  <v-app>
    <HeaderBar />

    <AuthCard title="Verificación de acceso">


      <div v-if="step === 'setup'" class="text-center mb-3">
        <p class="token-message mb-3">
          Escanea este código QR con <strong>Un authenticator</strong> para configurar tu acceso.
        </p>


        <v-img
          v-if="qrImage"
          :src="`data:image/png;base64,${qrImage}`"
          width="200"
          class="mx-auto mb-3 rounded"
        />

        <p class="token-message">
          Una vez escaneado, ingresa el código que te genera la app:
        </p>
      </div>

      <div v-else class="text-center mb-3">
        <p class="token-message">
          Ingresa el código de <strong>Autenticacion</strong>.
        </p>
      </div>

      <v-text-field
        v-model="tokenInput"
        label="Código"
        prepend-inner-icon="mdi-shield-key"
        variant="outlined"
        density="comfortable"
        color="blue-darken-2"
        class="mb-3"
        maxlength="6"
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
        @click="handleValidateToken"
      >
        VALIDAR TOKEN
      </v-btn>

    </AuthCard>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import AuthCard from '@/components/auth/AuthContainer.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import { verificarTotp } from '@/services/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tokenInput = ref('')
const error = ref('')
const cargando = ref(false)

// Lee el step que guardó el LoginView
const step = ref(localStorage.getItem('totp_step') || 'verify')
const qrImage = ref(localStorage.getItem('totp_qr') || '')

const handleValidateToken = async () => {
  if (tokenInput.value.trim().length !== 6) {
    error.value = 'El código debe tener 6 dígitos'
    return
  }

  try {
    cargando.value = true
    error.value = ''

    await verificarTotp(tokenInput.value)

    // Limpia los datos temporales del localStorage
    localStorage.removeItem('totp_step')
    localStorage.removeItem('totp_qr')

    router.push('/dashboard')

  } catch (e) {
    error.value = 'Código incorrecto o expirado, intenta de nuevo'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.token-message {
  font-size: 13px;
  color: #555;
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
