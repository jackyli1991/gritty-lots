<script setup lang="ts">
  import { useColorMode } from '@gritty-lots/ui';

  defineOptions({ name: 'ColorModeSwitcher' });

  const { mode, setMode, colorModes } = useColorMode();
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-muted-foreground">Mode</span>
    <div class="inline-flex rounded-md border border-border p-0.5">
      <button
        v-for="m in colorModes"
        :key="m.value"
        type="button"
        :aria-pressed="mode === m.value"
        class="rounded px-2.5 py-1 text-xs font-medium transition"
        :class="
          mode === m.value
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="setMode(m.value)"
      >
        {{ m.label }}
      </button>
    </div>
  </div>
</template>
