<script setup lang="ts">
import Modal from "./Modal.vue";
import Button from "./Button.vue";
import InputText from "./InputText.vue";

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
          <p v-if="themes.length === 0" class="text-sm text-muted-foreground">
            No {{ section }} themes found.
          </p>
          <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 items-start">
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
                class="border-2 p-4 flex items-center justify-center gap-2"
                :style="{ backgroundColor: t.colors.background, borderColor: t.colors.border }"
              >
                <div
                  class="size-6 rounded-full shrink-0"
                  :style="{ backgroundColor: t.colors.accent }"
                />
              </div>
              <p class="text-center text-sm font-semibold">
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
