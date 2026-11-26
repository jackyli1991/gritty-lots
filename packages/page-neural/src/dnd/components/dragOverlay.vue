<script setup lang="ts">
  import { DragOverlay, useDragOperation } from '@dnd-kit/vue';
  import { NeuralIcon } from '@neural/components';

  const operation = useDragOperation();
</script>

<template>
  <DragOverlay>
    <div
      v-if="operation.source?.data"
      class="flex items-center gap-1 p-1 rounded-lg bg-(--p-primary-color) text-white cursor-grab transition-colors text-nowrap"
    >
      <NeuralIcon :name="operation.source?.data.icon || 'MousePointer'" :size="14" />
      <span class="text-xs font-medium text-white dark:text-white">{{
        operation.source?.data.name
      }}</span>
    </div>
  </DragOverlay>
</template>
