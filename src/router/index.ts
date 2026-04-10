import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import TokenView from '../views/TokenView.vue'
import DashboardView from '../views/DashboardView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import { checkSession } from '@/services/auth'

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
      meta: { requiresAuth: false, requiresLoginStep: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: SuppliersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: ReviewsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, _from) => {
  const totpPending = sessionStorage.getItem('totp_step')

  let isAuth: boolean = false

  try {
    if (to.meta.requiresAuth) {
      isAuth = (await checkSession()) ?? false
    }
  } catch {
    isAuth = false
  }

  if (to.meta.requiresAuth && !isAuth) {
    return '/login'
  }

  if (to.meta.requiresLoginStep && !totpPending) {
    return '/login'
  }

  if (to.path === '/token' && isAuth) {
    return '/dashboard'
  }

  if (!to.meta.requiresAuth && isAuth && to.path === '/login') {
    return '/dashboard'
  }

  return true
})

export default router
