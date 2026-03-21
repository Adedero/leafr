<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { ToastProvider } from "reka-ui";
import useSWRV from "swrv";

const { mutate } = useSWRV("books:all", null);
const { saveOpenedFiles, openAndNavigate } = useBookUtils();

useServerSentFileEvents(() => {
  mutate();
});

let removeOpenFileListener: (() => void) | null = null;

onMounted(async () => {
  const pending = await window.electron.ipcRenderer.invoke("get-pending-file");

  if (pending) {
    const [id] = await saveOpenedFiles([pending]);
    if (id) await openAndNavigate(id);
  }

  removeOpenFileListener = window.electron.ipcRenderer.on(
    "open-file",
    async (_event, path: string) => {
      const [id] = await saveOpenedFiles([path]);
      if (id) await openAndNavigate(id);
    }
  );
});

onUnmounted(() => {
  removeOpenFileListener?.();
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
