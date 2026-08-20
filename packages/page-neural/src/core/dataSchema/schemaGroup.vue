<script setup lang="ts">
  import { NeuralIcon, NeuralTooltip } from '../../components';
  import SchemaItem from './schemaItem.vue';
  import { type JSONSchemaObject } from './types';
  import { createField } from './utils';

  defineOptions({
    name: 'SchemaGroup',
  });

  const props = defineProps<{
    schemaProperties: Exclude<JSONSchemaObject['properties'], undefined>;
    requiredList: string[];
  }>();

  /**
   * 添加字段
   */
  const addProperty = () => {
    const { fieldName, jsonSchema } = createField();
    props.schemaProperties[fieldName] = {
      ...jsonSchema,
    };
  };

  // 移除必填字段
  const removeRequiredField = (field: string) => {
    if (!props.requiredList?.includes(field)) {
      return;
    }
    props.requiredList.splice(props.requiredList.indexOf(field), 1);
  };

  // 添加必填字段
  const addRequiredField = (field: string) => {
    if (props.requiredList?.includes(field)) {
      return;
    }
    props.requiredList?.push(field);
  };

  /**
   * 更新字段名
   * @param oldField 旧字段名
   * @param newField 新字段名
   */
  const updateField = (oldField: string, newField: string) => {
    if (!props.schemaProperties?.[oldField]) {
      return;
    }
    if (!newField) {
      return;
    }
    // 更新老字段
    const properties = props.schemaProperties || {};
    properties[newField] = properties[oldField];
    delete properties[oldField];
    // 更新 required 数组
    if (props.requiredList?.includes(oldField)) {
      removeRequiredField(oldField);
      addRequiredField(newField);
    }
  };

  /**
   * 删除字段
   * @param field 字段名
   */
  const removeField = (field: string) => {
    if (!props.schemaProperties?.[field]) {
      return;
    }
    delete props.schemaProperties[field];
    removeRequiredField(field);
  };

  /**
   * 更新必填状态
   * @param field 字段名
   */
  const updateRequired = (field: string) => {
    if (props.requiredList?.includes(field)) {
      removeRequiredField(field);
    } else {
      addRequiredField(field);
    }
  };
</script>

<template>
  <div class="schema-group">
    <div class="schema-add-btn">
      <NeuralTooltip title="添加字段">
        <NeuralIcon name="CirclePlus" @click="addProperty" />
      </NeuralTooltip>
    </div>
    <div v-if="Object.keys(schemaProperties).length === 0" class="schema-no-fields">
      <NeuralIcon name="ArrowLeft" />
      点击添加字段
    </div>
    <div class="schema-fields">
      <SchemaItem
        v-for="(item, k) in schemaProperties"
        :key="k"
        :field="k"
        :data="item"
        :required="requiredList?.includes(k)"
        @update:field="updateField(k, $event)"
        @update:required="updateRequired(k)"
        @remove:field="removeField(k)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .schema-group {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 4px 0;
    margin: 4px 0;
    gap: 8px;
    .schema-add-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start;
    }
    .schema-no-fields {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    .schema-fields {
      flex: 1;
    }
  }
</style>
