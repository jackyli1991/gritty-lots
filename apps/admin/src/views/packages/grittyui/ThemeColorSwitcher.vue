<script setup lang="ts">
  import { useThemeColor } from '@gritty-lots/ui';

  defineOptions({ name: 'ThemeColorSwitcher' });

  const { themeColor, setThemeColor, themeColors } = useThemeColor();
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-muted-foreground">Theme Color</span>
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="c in themeColors"
        :key="c.value"
        type="button"
        :title="c.label"
        :aria-label="c.label"
        :aria-pressed="themeColor === c.value"
        class="size-6 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-110"
        :class="
          themeColor === c.value ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''
        "
        :style="{ backgroundColor: c.swatch }"
        @click="setThemeColor(c.value)"
      />
    </div>
  </div>
</template>
