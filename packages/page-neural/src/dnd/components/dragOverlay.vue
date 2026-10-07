<script setup lang="ts">
  import { DragOverlay, useDragOperation } from '@dnd-kit/vue';
  import { NeuralIcon } from '@neural/components';

  const operation = useDragOperation();
</script>

<template>
  <DragOverlay>
    <div
      v-if="operation.source?.data"
      class="flex items-center gap-3 p-3 rounded-lg border border-(--p-primary-color) dark:border-(--p-primary-color) bg-(--p-primary-color) text-white cursor-grab transition-colors"
    >
      <NeuralIcon :name="operation.source?.data.icon" :size="20" />
      <span class="text-xs font-medium text-white dark:text-white">{{
        operation.source?.data.name
      }}</span>
    </div>
  </DragOverlay>
</template>
