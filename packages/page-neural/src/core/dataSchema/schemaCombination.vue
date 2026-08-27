<script setup lang="ts">
  import { computed, useTemplateRef, ref } from 'vue';

  import SchemaItem from './schemaItem.vue';
  import SchemaItemTool from './schemaItemTool.vue';
  import { type JSONSchemaObject } from './types';
  // import { combinationOptions } from './datas';

  interface Props {
    data: JSONSchemaObject;
    combinationType?: string;
    highlight?: boolean;
  }

  const optionsExpanded = ref(true);
  const props = defineProps<Props>();

  const schemaItemRef = useTemplateRef<typeof SchemaItem>('schemaItemRef');

  /**
   * 折叠所有配置
   */
  function foldOptions() {
    schemaItemRef.value?.forEach((item: typeof SchemaItem) => {
      item.foldOptions();
    });
  }

  /**
   * 是否有选项
   */
  const hasOptions = computed(() => props.data[props.combinationType || '']?.length > 0);

  /**
   * 添加字段
   */
  function addOptions() {
    props.data[props.combinationType || '']?.push({
      type: 'string',
    });
  }

  /**
   * 删除选项
   */
  function removeOption(index: number) {
    props.data[props.combinationType || '']?.splice(index, 1);
  }

  defineExpose({
    foldOptions,
  });
</script>

<template>
  <div class="schema-combination">
    <SchemaItemTool
      v-model="optionsExpanded"
      addBtnTooltip="添加选项"
      :isEmpty="!hasOptions"
      :num="data[combinationType || '']?.length"
      emptyText="点击添加选项"
      foldingTooltip="点击展开查看全部选项"
      @add="addOptions"
    />
    <div class="schema-combination-content" v-show="optionsExpanded">
      <SchemaItem
        v-for="(item, index) in data[combinationType || ''] || []"
        ref="schemaItemRef"
        :key="index"
        :data="item"
        :highlight="highlight"
        field="fieldCombination"
        isCombinationItem
        @remove="removeOption(index as number)"
      ></SchemaItem>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .schema-combination {
    padding-left: 12px;
    display: flex;
    gap: 4px;
    .schema-combination-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
