<template>
  <section>
    <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ title }}</h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'DocSection',
  });

  defineProps<{
    title: string;
  }>();
</script>
