import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomePage.vue'),
      meta: { title: '首页 - 学知岛' },
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/SearchPage.vue'),
      meta: { title: '搜索 - 学知岛' },
    },
    {
      path: '/create',
      name: 'Create',
      component: () => import('../views/CreatePage.vue'),
      meta: { title: '创作发布 - 学知岛', requiresAuth: true },
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: () => import('../views/PostDetailPage.vue'),
      meta: { title: '知文详情 - 学知岛' },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginPage.vue'),
      meta: { title: '登录 - 学知岛' },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterPage.vue'),
      meta: { title: '注册 - 学知岛' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/* 页面标题 */
router.beforeEach((to) => {
  document.title = (to.meta.title as string) || '学知岛'

  if (to.meta.requiresAuth && !localStorage.getItem('xuezhidao_access_token')) {
    return `/login?redirect=${encodeURIComponent(to.fullPath)}`
  }

  return true
})

export default router
