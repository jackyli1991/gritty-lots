<script setup lang="ts">
  import { storeToRefs } from 'pinia';

  import { useLayoutStore } from '@/stores/layout';

  // 主题色
  const layoutStore = useLayoutStore();
  const { themeColor } = storeToRefs(layoutStore);
</script>

<template>
  <NeuralJsonSchema :colorPrimary="themeColor" />
</template>
