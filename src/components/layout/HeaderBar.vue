<template>
  <div>
    <div class="top-bar">
      <div class="top-content">
        <img src="/walmart-mexico.svg" alt="Walmart" class="top-logo" />

        <v-spacer></v-spacer>

        <!-- El botón ahora llama a handleLogout -->
        <v-btn
          v-if="showLogout"
          color="#d32f2f"
          variant="elevated"
          prepend-icon="mdi-logout"
          class="logout-btn"
          @click="handleLogout"
        >
          Cerrar Sesión
        </v-btn>
      </div>
    </div>

    <div class="sub-bar"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logout as logoutService } from '@/services/auth' 

defineProps<{
  showLogout?: boolean
}>()

const router = useRouter()

// Cambiamos la función a async para que espere al servidor
const handleLogout = async () => {
  try {
    // 1. Esto lanza el POST /api/logout/ que quieres ver en Red
    await logoutService() 
  } catch (error) {
    console.error("No se pudo cerrar sesión en el servidor, limpiando local...")
  } finally {
    // 2. Pase lo que pase, al final regresamos al login
    router.push('/')
  }
}
</script>

<style scoped>
.top-bar {
  height: 60px;
  background-color: #004c91;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.top-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.top-logo {
  height: 40px;
  width: auto;
}

.sub-bar {
  height: 30px;
  background-color: #0071ce;
}

.logout-btn {
  color: white !important;
  font-weight: bold;
  text-transform: none;
}
</style>