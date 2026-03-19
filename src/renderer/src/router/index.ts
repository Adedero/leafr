import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@renderer/pages/Home.vue")
    },
    {
      path: "/library",
      name: "library",
      component: () => import("@renderer/pages/Library.vue")
    },
    {
      path: "/books/:bookId",
      name: "book",
      component: () => import("@renderer/pages/Book.vue")
    },
    {
      path: "/resources",
      name: "resources",
      component: () => import("@renderer/pages/Resources.vue")
    }
  ]
});
