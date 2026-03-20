<script setup lang="ts">
const uiStore = useUiStore();
const { openFileDialog, getFilePath, saveOpenedFiles } = useApi();
const { openAndNavigate } = useBookUtils();

const pageRef = useTemplateRef("pageRef");

const { isOverDropZone } = useDropZone(pageRef, {
  onDrop,
  dataTypes: ["epub"],
  multiple: true,
  preventDefaultForUnhandled: false
});

async function handleFiles(files: string[]) {
  const fileIds = await saveOpenedFiles(files);
  const fileToOpen = fileIds[0];
  if (fileToOpen) {
    openAndNavigate(fileToOpen);
  }
}

async function onDrop(files: File[] | null) {
  if (!files) {
    return;
  }
  const validatedFiles = files.filter(
    (file) => file.name.endsWith("epub") || file.type.includes("epub")
  );
  if (!validatedFiles.length) {
    return;
  }
  const paths = await Promise.all(
    validatedFiles.map((f) => getFilePath(f)) || []
  );
  if (!paths.length) {
    return;
  }
  handleFiles(paths);
}

async function open() {
  const result = await openFileDialog({
    filters: [{ name: "EPUB Books", extensions: ["epub"] }]
  });
  if (!result || !result.length) {
    return;
  }
  handleFiles(result);
}
</script>

<template>
  <main class="flex h-screen">
    <aside
      class="grid grid-rows-12 border-r-2 border-r-border h-full overflow-hidden shrink-0"
      :style="{ width: uiStore.navbarWidth }"
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
            <Button
              color="neutral"
              variant="outline"
              icon="lucide:plus"
              @click="open()"
            >
              Open
            </Button>
          </div>
          <Separator orientation="vertical" />
          <div class="flex justify-center items-center grow">
            <ThemeModal />
          </div>
        </div>
      </header>

      <div ref="pageRef" class="relative row-span-11 overflow-y-auto">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isOverDropZone"
            class="z-100 fixed inset-0 bg-primary/20 backdrop-blur-sm"
          />
        </Transition>
        <slot />
      </div>
    </div>
  </main>
</template>
