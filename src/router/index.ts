import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import TokenView from '../views/TokenView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/token',
      name: 'token',
      component: TokenView,
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
  ],
})

import { checkSession } from '@/services/auth'

router.beforeEach(async (to, from) => {
  const isAuth = await checkSession()

  // 🔒 si requiere auth y NO está logueado
  if (to.meta.requiresAuth && !isAuth) {
    return '/login'
  }

  // 🚫 si está logueado y quiere ir a login
  if (!to.meta.requiresAuth && isAuth && to.path !== '/dashboard') {
    return '/dashboard'
  }

  // ✅ permitir navegación
  return true
})

export default router
