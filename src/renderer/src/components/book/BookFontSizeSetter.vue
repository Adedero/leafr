<script setup lang="ts">
const { settings, increment, decrement, MIN_FONT_SIZE, MAX_FONT_SIZE } =
  useBookSettings();

const fontSize = computed({
  get: () => [settings.value.fontSize],
  set: (value) => {
    settings.value.fontSize = value[0];
  }
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <p class="font-semibold">Font size</p>
      <p>{{ settings.fontSize }}</p>
    </div>
    <div class="flex justify-between items-center gap-2">
      <Slider
        v-model="fontSize"
        :min="MIN_FONT_SIZE"
        :max="MAX_FONT_SIZE"
        class="grow"
      />
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          icon="lucide:plus"
          @click="increment('fontSize', 1)"
        />
        <Button
          size="sm"
          variant="ghost"
          icon="lucide:minus"
          @click="decrement('fontSize', 1)"
        />
      </div>
    </div>
  </div>
</template>
