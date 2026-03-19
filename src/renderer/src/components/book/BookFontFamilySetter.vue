<script setup lang="ts">
const { settings } = useBookSettings();
const { defaultFonts, systemFonts } = useFont();

const { state, isLoading } = useAsyncState(systemFonts, []);

const fonts = computed(() => {
  return [
    { label: "Default", items: ["Default", ...defaultFonts] },
    { label: "System", items: state.value }
  ];
});
</script>

<template>
  <div>
    <p class="font-semibold">Font Type</p>
    <Select
      v-model="settings.fontFamily"
      :items="fonts"
      :loading="isLoading"
      placeholder="Select font"
      class="w-full"
    />
  </div>
</template>
