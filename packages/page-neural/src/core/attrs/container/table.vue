<template>
  <div>
    {{ model }}
  </div>
</template>

<script setup lang="ts">
  import type { TableModelValue } from '@neural/types/table';
  import { onMounted } from 'vue';

  /** v-model 绑定，带默认值 */
  const model = defineModel<TableModelValue>({
    default: () => ({
      columns: [],
    }),
  });

  onMounted(() => {
    if (!model.value.columns?.length) {
      model.value = {
        ...model.value,
        columns: [],
      };
    }
  });
</script>
