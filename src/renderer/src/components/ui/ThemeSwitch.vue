<script setup lang="ts">
import Modal from "./Modal.vue";
import Button from "./Button.vue";
import useTheme from "@renderer/hooks/use-theme";
import Char from "@renderer/utils/char";

const theme = useTheme();
</script>

<template>
  <Modal title="Theme">
    <Button color="neutral" variant="outline" icon="lucide:palette" />

    <template #body>
      <div class="space-y-10">
        <div v-for="section in ['light', 'dark']" :key="section" class="space-y-4">
          <h2>{{ Char.toCase(section, "capitalize") }}</h2>

          <div class="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 items-start">
            <button
              v-for="t in theme[`${section}Themes`]"
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
              <p class="text-center text-sm font-semibold">{{ t.displayName }}</p>
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end">
        <Button color="neutral" variant="outline" @click="close"> Done </Button>
      </div>
    </template>
  </Modal>
</template>
