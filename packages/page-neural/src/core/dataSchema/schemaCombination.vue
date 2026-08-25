<script setup lang="ts">
  import SchemaItem from './schemaItem.vue';
  import { type JSONSchemaObject } from './types';
  // import { combinationOptions } from './datas';

  interface Props {
    data: JSONSchemaObject;
    combinationType?: string;
    highlight?: boolean;
  }

  defineProps<Props>();
</script>

<template>
  <div class="schema-combination">
    <div class="schema-combination-content">
      <SchemaItem
        v-for="(item, index) in data[combinationType || ''] || []"
        :key="index"
        :data="item"
        :highlight="highlight"
        field="fieldCombination"
        isCombinationItem
      ></SchemaItem>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .schema-combination {
    padding-left: 12px;
    .schema-combination-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
