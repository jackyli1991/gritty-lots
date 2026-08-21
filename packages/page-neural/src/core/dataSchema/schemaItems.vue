<script setup lang="ts">
  import { NeuralIcon, NeuralTooltip } from '../../components';
  import SchemaItem from './schemaItem.vue';
  import { type JSONSchema } from './types';

  defineOptions({
    name: 'SchemaItems',
  });

  interface Props {
    data: JSONSchema;
  }

  defineProps<Props>();
</script>

<template>
  <div class="schema-items-container">
    <span class="schema-items-flag">
      <NeuralTooltip title="数组项">
        <NeuralIcon name="List" />
      </NeuralTooltip>
    </span>
    <SchemaItem :data="data" :field="data.field" isArrayItems />
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
      top: 4px;
      left: 0;
    }
    :deep(.schema-item-container) {
      flex: 1;
    }
  }
</style>
