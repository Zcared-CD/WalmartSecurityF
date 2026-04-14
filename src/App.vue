<script setup>
import { ref, onMounted } from "vue"
import api from "@/services/api"

const showSecurityBanner = ref(false)

onMounted(() => {
  const accepted = localStorage.getItem("security_accept")
  if (!accepted) {
    showSecurityBanner.value = true
  }
})

const acceptSecurity = async () => {
  try {
    await api.post("/api/accept-security/")
    localStorage.setItem("security_accept", "true")
    showSecurityBanner.value = false
  } catch (e) {
    console.error("Error al aceptar seguridad")
  }
}
</script>

<template>
  <v-app>

    <v-banner
      v-if="showSecurityBanner"
      color="blue-darken-4"
      class="text-white"
      sticky
    >
        🔐 Este sistema utiliza cookies y monitoreo de seguridad para proteger tu cuenta.
        La actividad puede ser registrada con fines de seguridad. Buena Suerte en tu penetracion.
      </v-banner-text>

      <template #actions>
        <v-btn color="white" variant="flat" @click="acceptSecurity">
          Aceptar
        </v-btn>
      </template>
    </v-banner>

    <router-view />

  </v-app>
</template>
