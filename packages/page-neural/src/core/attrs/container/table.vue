<template>
  <NeuralForm :data="model" v-bind="tableConfig.formConfig" />
</template>

<script setup lang="ts">
  // import type { TableModelValue } from '@neural/types/table';
  import { NeuralForm } from '@neural/components';
  import tableConfig from '@neural/core/forms/table';
  import { createTable } from '@neural/core/forms/table';
  import { onMounted } from 'vue';

  /** v-model 绑定，带默认值 */
  const model = defineModel<Record<string, any>>({
    default: () => {
      return createTable();
    },
  });

  onMounted(() => {
    // model默认传入的是空对象，此时需要先初始化
    if (!model.value.columns) {
      model.value = createTable();
    }
  });
</script>
