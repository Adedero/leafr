export const useServerSentFileEvents = (fn: () => void) => {
  const channels = [
    "file:add",
    "file:change",
    "file:unlink",
    "lib-dir:add",
    "lib-dir:unlink"
  ] as const;

  onMounted(() => {
    channels.forEach((channel) => {
      window.api.on(channel, fn);
    });
  });
  onUnmounted(() => {
    channels.forEach((channel) => {
      window.api.off(channel, fn);
    });
  });
};
