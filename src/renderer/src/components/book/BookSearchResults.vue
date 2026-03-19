<script setup lang="ts">
interface Props {
  loading?: boolean;
  search?: string;
  data: Array<{ cfi: string; excerpt: string }>;
}
defineProps<Props>();
defineEmits<{
  select: [cfi: string];
}>();
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center h-40">
      <Spinner />
    </div>
    <div v-else-if="data.length === 0">No results found</div>
    <ul v-else class="divide-y divide-border/50">
      <li
        v-for="result in data"
        :key="result.cfi"
        class="hover:bg-muted/20 px-2 py-2 cursor-context-menu"
        @click="$emit('select', result.cfi)"
      >
        <span
          v-html="
            search
              ? result.excerpt
                  .trim()
                  .replace(
                    new RegExp(search, 'gi'),
                    `<span class='bg-secondary/50'>${search}</span>`
                  )
              : result.excerpt
          "
        ></span>
      </li>
    </ul>
  </div>
</template>
