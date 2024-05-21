import { createRouter, createWebHistory } from 'vue-router/auto'

import cusRoutes from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes:
    (routes) => ([].concat(routes, cusRoutes)),
})

export default router


