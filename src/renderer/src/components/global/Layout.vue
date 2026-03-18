<script setup lang="ts">
import useUIStore from "@renderer/hooks/use-ui-store";

const UIStore = useUIStore();
</script>

<template>
  <main class="flex h-screen">
    <aside
      class="grid grid-rows-12 border-r-2 border-r-border h-full overflow-hidden shrink-0"
      :style="{ width: UIStore.navbarWidth }"
    >
      <header class="flex justify-center items-center row-span-1 p-2">
        <Logo :width="40" />
      </header>

      <nav class="flex flex-col gap-2 row-span-11">
        <NavBar />
      </nav>
    </aside>

    <div class="grid grid-rows-12 h-full grow">
      <header class="flex row-span-1 border-b-2 border-b-border">
        <div class="flex items-center bg-secondary p-4 grow">
          <SearchBar />
        </div>

        <Separator orientation="vertical" />

        <div class="flex w-56 shrink-0">
          <div class="flex justify-center items-center p-4">
            <Button color="neutral" variant="outline" icon="lucide:plus"> Open </Button>
          </div>
          <Separator orientation="vertical" />
          <div class="flex justify-center items-center grow">
            <ThemeModal />
          </div>
        </div>
      </header>

      <div class="relative row-span-11 overflow-y-auto">
        <slot />
      </div>
    </div>
  </main>
</template>
