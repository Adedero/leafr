<script setup lang="ts">
import { ToastProvider } from "reka-ui";
import useSWRV from "swrv";

const { mutate } = useSWRV("books:all", null);

useServerSentFileEvents(() => {
  mutate();
});
</script>

<template>
  <ToastProvider>
    <Layout>
      <RouterView />
    </Layout>
    <Toast />
  </ToastProvider>
</template>
