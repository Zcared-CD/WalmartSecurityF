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
      />

      <v-btn block size="large" class="login-btn" @click="goToToken"> INICIAR SESIÓN </v-btn>
    </AuthCard>

    <FooterBar />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import AuthCard from '@/components/auth/AuthContainer.vue'

const router = useRouter()

const username = ref('')
const password = ref('')

const goToToken = () => {
  if (!username.value || !password.value) {
    return
  }

  router.push('/token')
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
