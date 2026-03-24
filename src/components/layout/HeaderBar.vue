<template>
  <div>
    <div class="top-bar">
      <div class="top-content">
        <img src="/walmart-mexico.svg" alt="Walmart" class="top-logo" />

        <v-spacer></v-spacer>


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
import { logout as logoutService } from '@/services/auth';
import { useRouter } from 'vue-router';

defineProps<{
  showLogout?: boolean
}>()

const router = useRouter()


const handleLogout = async () => {
  try {
    await logoutService()
  } catch (error) {
    console.error("No se pudo cerrar sesión en el servidor, limpiando local...")
  } finally {

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
