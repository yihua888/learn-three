import { createRouter, createWebHistory } from 'vue-router'
import addAsyncRouter from  './async-router'

const routes = []

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

addAsyncRouter(router)

export default router
