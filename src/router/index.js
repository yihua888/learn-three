import { createRouter, createWebHistory } from "vue-router";
import addAsyncRouter from "./async-router";

const routes = [
  {
    name: "home",
    path: "/",
    component: () => import("@/views/home/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

addAsyncRouter(router);

export default router;
