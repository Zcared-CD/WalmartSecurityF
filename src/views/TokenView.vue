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
        :disabled="cargando || !!tiempoRestante"
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

      <v-alert
  v-if="tiempoRestante"
  type="warning"
  variant="tonal"
  class="mb-3"
  density="compact"
>
  {{ tiempoRestante }}
</v-alert>

      <v-btn
        block
        size="large"
        class="login-btn"
        :loading="cargando"
        :disabled="cargando || estaBloqueado"
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
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
import { computed } from 'vue'
const tokenInput = ref('')
const error = ref('')
const cargando = ref(false)

<<<<<<< HEAD
// 
const tiempoRestante = ref('')
let intervalo: any = null

const estaBloqueado = computed(() => !!tiempoRestante.value)

// Lee el step que guardó el LoginView
const step = ref(localStorage.getItem('totp_step') || 'verify')
const qrImage = ref(localStorage.getItem('totp_qr') || '')
=======
const step = ref(sessionStorage.getItem('totp_step') || 'verify')
const qrImage = ref(sessionStorage.getItem('totp_qr') || '')
>>>>>>> fc5452bda3251b19c7ecd70a308cd0a75b855863

// 
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

    tiempoRestante.value = `⏳ Reintentar en ${minutos}:${segundos.toString().padStart(2, '0')}`
  }, 1000)
}

// 🔥 LIMPIAR INTERVALO AL SALIR
onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

const handleValidateToken = async () => {
  if (tokenInput.value.trim().length !== 6) {
    error.value = 'El código debe tener 6 dígitos'
    return
  }

  try {
    cargando.value = true
    error.value = ''
    tiempoRestante.value = ''

    await verificarTotp(tokenInput.value)

<<<<<<< HEAD
    // Limpia datos temporales
    localStorage.removeItem('totp_step')
    localStorage.removeItem('totp_qr')
=======
    // Limpia los datos temporales del sessionStorage
    sessionStorage.removeItem('totp_step')
    sessionStorage.removeItem('totp_qr')
>>>>>>> fc5452bda3251b19c7ecd70a308cd0a75b855863

    router.push('/dashboard')

  } catch (e: any) {
<<<<<<< HEAD
    const data = e.response?.data

    // 🔒 BLOQUEO OTP
    if (data?.blocked_until) {
      error.value = 'Demasiados intentos OTP'
      iniciarContador(data.blocked_until)
    }

    // ❌ CÓDIGO INCORRECTO
    else if (data?.error === "Código incorrecto") {
      error.value = `OTP incorrecto (Intento ${data.intentos})`
    }

    // ⚠️ OTROS ERRORES
    else {
      error.value = data?.error || 'Error al verificar el código'
    }
  } finally {
    cargando.value = false
=======
  const mensaje = e.response?.data?.error

  if (e.response?.status === 429) {

    error.value = 'Demasiados intentos. Espera un momento e intenta de nuevo.'
  } else if (e.response?.status === 403) {

    error.value = mensaje || 'Acceso temporalmente bloqueado. Intenta más tarde.'
  } else {

    error.value = mensaje || 'Código incorrecto o expirado'
>>>>>>> fc5452bda3251b19c7ecd70a308cd0a75b855863
  }
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
