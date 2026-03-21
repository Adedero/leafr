import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(),
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
      path: "/bookmarks",
      name: "bookmarks",
      component: () => import("@renderer/pages/Bookmarks.vue")
    },
    {
      path: "/analytics",
      name: "analytics",
      component: () => import("@renderer/pages/Analytics.vue")
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@renderer/pages/Settings.vue")
    },
    {
      path: "/resources",
      name: "resources",
      component: () => import("@renderer/pages/Resources.vue")
    }
  ]
});
