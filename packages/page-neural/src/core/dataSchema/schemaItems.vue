<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { NeuralIcon, NeuralTooltip } from '../../components';
  import SchemaItem from './schemaItem.vue';
  import { type JSONSchema } from './types';

  defineOptions({
    name: 'SchemaItems',
  });

  interface Props {
    data: JSONSchema;
    highlight?: boolean;
  }

  defineProps<Props>();

  const schemaItemRef = useTemplateRef<typeof SchemaItem>('schemaItemRef');

  /**
   * 折叠所有配置
   */
  function foldOptions() {
    if (schemaItemRef.value) {
      schemaItemRef.value.foldOptions();
    }
  }

  defineExpose({
    foldOptions,
  });
</script>

<template>
  <div class="schema-items-container">
    <span class="schema-items-flag">
      <NeuralTooltip title="数组项">
        <NeuralIcon name="List" />
      </NeuralTooltip>
    </span>
    <SchemaItem
      ref="schemaItemRef"
      :data="data"
      :highlight="highlight"
      field="fieldArray"
      isArrayItems
    />
  </div>
</template>

<style lang="scss" scoped>
  .schema-items-container {
    padding-left: 28px;
    position: relative;
    .schema-items-flag {
      height: 40px;
      line-height: 40px;
      padding: 4px;
      position: absolute;
      top: 0;
      left: 0;
    }
    :deep(.schema-item-container) {
      flex: 1;
    }
  }
</style>
