<script setup lang="ts">
  import { Circle } from '@lucide/vue';

  defineOptions({
    name: 'NullIcon',
  });
</script>

<template>
  <Circle stroke-width="0.5">
    <text x="7.5" y="16" font-size="12" :stroke-width="1"> N </text>
  </Circle>
</template>
