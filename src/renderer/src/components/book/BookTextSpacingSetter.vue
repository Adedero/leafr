<script setup lang="ts">
const {
  settings,
  increment,
  decrement,
  MIN_LINE_HEIGHT,
  MAX_LINE_HEIGHT,
  MIN_WORD_SPACING,
  MAX_WORD_SPACING,
  MIN_PARAGRAPH_SPACING,
  MAX_PARAGRAPH_SPACING
} = useBookSettings();

const lineHeight = computed({
  get: () => [settings.value.lineHeight],
  set: (value) => {
    settings.value.lineHeight = value[0];
  }
});

const wordSpacing = computed({
  get: () => [settings.value.wordSpacing],
  set: (value) => {
    settings.value.wordSpacing = value[0];
  }
});

const paragraphSpacing = computed({
  get: () => [settings.value.paragraphSpacing],
  set: (value) => {
    settings.value.paragraphSpacing = value[0];
  }
});
</script>

<template>
  <div class="space-y-5">
    <div>
      <div class="flex justify-between items-center">
        <p class="font-semibold">Line Height</p>
        <p>{{ settings.lineHeight }}</p>
      </div>
      <div class="flex justify-between items-center gap-2">
        <Slider
          v-model="lineHeight"
          :min="MIN_LINE_HEIGHT"
          :max="MAX_LINE_HEIGHT"
          :step="0.1"
          class="grow"
        />
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:plus"
            @click="increment('lineHeight', 0.1)"
          />
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:minus"
            @click="decrement('lineHeight', 0.1)"
          />
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center">
        <p class="font-semibold">Word Spacing</p>
        <p>{{ settings.wordSpacing }}</p>
      </div>
      <div class="flex justify-between items-center gap-2">
        <Slider
          v-model="wordSpacing"
          :min="MIN_WORD_SPACING"
          :max="MAX_WORD_SPACING"
          :step="1"
          class="grow"
        />
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:plus"
            @click="increment('wordSpacing', 1)"
          />
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:minus"
            @click="decrement('wordSpacing', 1)"
          />
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center">
        <p class="font-semibold">Paragraph Spacing</p>
        <p>{{ settings.paragraphSpacing }}</p>
      </div>
      <div class="flex justify-between items-center gap-2">
        <Slider
          v-model="paragraphSpacing"
          :min="MIN_PARAGRAPH_SPACING"
          :max="MAX_PARAGRAPH_SPACING"
          :step="1"
          class="grow"
        />
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:plus"
            @click="increment('paragraphSpacing', 1)"
          />
          <Button
            size="sm"
            variant="ghost"
            icon="lucide:minus"
            @click="decrement('paragraphSpacing', 1)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
