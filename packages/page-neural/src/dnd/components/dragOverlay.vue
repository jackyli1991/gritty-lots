<script setup lang="ts">
  import { DragOverlay, useDragOperation } from '@dnd-kit/vue';

  const operation = useDragOperation();
</script>

<template>
  <DragOverlay>{{ operation.source?.id }} {{ operation.source?.data }}</DragOverlay>
</template>
