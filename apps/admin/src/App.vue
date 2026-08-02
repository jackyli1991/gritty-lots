<script setup lang="ts">
  import ColorModeSwitcher from './components/ColorModeSwitcher.vue';
  import HelloWorld from './components/HelloWorld.vue';
  import ThemeColorSwitcher from './components/ThemeColorSwitcher.vue';
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header
      class="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border bg-background px-6 py-3"
    >
      <ColorModeSwitcher />
      <ThemeColorSwitcher />
    </header>
    <HelloWorld />
  </div>
</template>
