<script setup lang="ts">
import Char from "@renderer/utils/char";

const theme = useTheme();
const search = ref("");

const filteredSections = computed(() => {
  const q = search.value.toLowerCase();
  return (["light", "dark"] as const).map((section) => ({
    section,
    themes: theme[`${section}Themes`].filter((t) => t.displayName.toLowerCase().includes(q))
  }));
});
</script>

<template>
  <Modal title="Theme" @close="search = ''">
    <Button color="neutral" variant="outline" icon="lucide:palette" />
    <template #body>
      <div class="space-y-10">
        <div v-for="{ section, themes } in filteredSections" :key="section" class="space-y-4">
          <h2>{{ Char.toCase(section, "capitalize") }}</h2>
          <p v-if="themes.length === 0" class="text-muted-foreground text-sm">
            No {{ section }} themes found.
          </p>
          <div v-else class="items-start gap-2 grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))]">
            <button
              v-for="t in themes"
              :key="t.name"
              :class="[
                'p-2 relative flex flex-col items-center',
                t.name === theme.theme.value ? 'bg-muted/40' : 'hover:bg-muted/40'
              ]"
              @click="theme.set(t.name)"
            >
              <div
                class="flex justify-center items-center gap-2 p-4 border-2"
                :style="{ backgroundColor: t.colors.background, borderColor: t.colors.border }"
              >
                <div
                  class="rounded-full size-6 shrink-0"
                  :style="{ backgroundColor: t.colors.accent }"
                />
              </div>
              <p class="font-semibold text-sm text-center">
                {{ t.displayName }}
              </p>
            </button>
          </div>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="flex justify-between items-center gap-2">
        <InputText v-model="search" placeholder="Search themes..." icon="lucide:search" size="sm" />
        <Button color="neutral" variant="outline" @click="close"> Close </Button>
      </div>
    </template>
  </Modal>
</template>
