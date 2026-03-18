<script setup lang="ts">
import { ToastProvider } from "reka-ui";
</script>

<template>
  <ToastProvider>
    <Layout>
      <RouterView />
    </Layout>
    <Toast />
  </ToastProvider>
</template>
