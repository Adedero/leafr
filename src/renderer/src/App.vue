<script setup lang="ts">
import { ToastProvider } from "reka-ui";
import Layout from "@renderer/components/global/Layout.vue";
import Toast from "./components/ui/Toast.vue";
</script>

<template>
  <ToastProvider>
    <Layout>
      <RouterView />
    </Layout>
    <Toast />
  </ToastProvider>
</template>
