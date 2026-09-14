<template>
  <div class="cards w-full h-full overflow-hidden">
    <component v-for="key in components" :key="key" :is="key" />
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue';
  import { shallowRef } from 'vue';

  const cards = import.meta.glob('./*.vue', { eager: true });
  // 转成组件映射对象
  const components = shallowRef<Record<string, Component>>({});
  for (const [path, loader] of Object.entries(cards)) {
    const name: string = path.match(/\/([^/]+)\.vue$/)?.[1] || '';
    const component = (loader as { default: Component }).default as Component;
    components.value[name] = component;
  }
</script>

<style scoped lang="scss">
  .cards {
    display: flex;
    flex-wrap: wrap;
    background: url('@/assets/css-bg.jpg') no-repeat;
    background-size: cover;
    position: relative;
  }
</style>
