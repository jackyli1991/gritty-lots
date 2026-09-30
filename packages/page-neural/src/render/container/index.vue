<script setup lang="ts">
  import DroppableItem from '@neural/dnd/components/droppableItem.vue';

  interface ContainerProps {
    id: string;
  }

  const props = defineProps<ContainerProps>();
</script>

<template>
  <div class="page-neural-container w-full h-full">
    <DroppableItem :id="props.id">
      <slot></slot>
    </DroppableItem>
  </div>
</template>
