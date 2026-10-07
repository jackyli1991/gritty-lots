<script setup lang="ts">
  import DroppableItem from '@neural/dnd/components/droppableItem.vue';
  import type { Container } from '@neural/types';

  interface ContainerProps {
    data?: Container;
  }

  const props = defineProps<ContainerProps>();
</script>

<template>
  <div class="page-neural-container w-full h-full">
    <DroppableItem :id="props.data?.id || ''">
      <slot></slot>
      {{ props.data?.children || '' }}
    </DroppableItem>
  </div>
</template>
