<script setup lang="ts">
  import { ref } from 'vue';

  import {
    NeuralIcon,
    NeuralInput,
    NeuralSelect,
    NeuralSelectOption,
    NeuralCheckableTag,
    NeuralTooltip,
  } from '../../components';
  import { SchemaTypes } from './datas';
  import SchemaGroup from './schemaGroup.vue';
  import SchemaProperties from './schemaProperties.vue';
  import { type JSONSchemaObject } from './types';

  defineOptions({
    name: 'SchemaItem',
  });

  interface Props {
    data: JSONSchemaObject;
    field: string;
    required: boolean | undefined;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:field', 'update:required', 'remove:field']);
  const propertiesExpanded = ref(false);
  const groupExpanded = ref(true);

  /**
   * 切换属性编辑面板展开状态
   */
  function togglePropertiesExpanded() {
    propertiesExpanded.value = !propertiesExpanded.value;
  }

  /**
   * 切换子项展开状态
   */
  function toggleGroupExpanded() {
    groupExpanded.value = !groupExpanded.value;
  }

  /**
   * 更新字段名
   */
  function updateField(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value === props.field) {
      return;
    }
    if (!value.trim()) {
      target.value = props.field;
      return;
    }
    emit('update:field', value);
  }

  /**
   * 更新必填状态
   */
  function updateRequired(checked: boolean) {
    emit('update:required', checked);
  }

  /**
   * 删除字段
   */
  function removeField() {
    emit('remove:field', props.field);
  }

  /**
   * 处理数据类型变化
   */
  function onSchemaTypeChange(type: string) {
    if (type === 'object') {
      if (!props.data.properties) {
        props.data.properties = {};
      }
      if (!props.data.required) {
        props.data.required = [];
      }
    }
  }
</script>

<template>
  <div class="schema-item-container">
    <div class="schema-main">
      <div class="schema-field schema-item">
        <NeuralInput :value="field" bottomBorder placeholder="字段" @blur="updateField" />
      </div>
      <div class="schema-field schema-item">
        <NeuralInput
          v-model:value="data.title"
          bottomBorder
          placeholder="中文名"
          @blur="updateField"
        />
      </div>
      <div class="schema-description schema-item">
        <NeuralInput v-model:value="data.description" bottomBorder placeholder="字段描述" />
      </div>
      <div class="schema-type schema-item">
        <NeuralSelect
          class="schema-type-selector"
          v-model:value="data.type"
          :showArrow="false"
          :bordered="false"
          @change="onSchemaTypeChange"
        >
          <NeuralSelectOption v-for="item in SchemaTypes" :key="item.value" :value="item.value">
            <NeuralIcon :name="item.icon" :size="14" />
            <span>{{ item.label }}</span>
          </NeuralSelectOption>
        </NeuralSelect>
      </div>
      <div class="schema-required schema-item">
        <NeuralCheckableTag :checked="required" @update:checked="updateRequired">{{
          required ? '必填' : '可选'
        }}</NeuralCheckableTag>
      </div>
      <div class="schema-actions schema-item">
        <NeuralTooltip title="折叠/展开">
          <NeuralIcon
            v-if="data.type === 'object'"
            :class="{
              'schema-group-expand-icon': true,
              'is-expanded': groupExpanded,
            }"
            name="ChevronRight"
            @click="toggleGroupExpanded"
          />
        </NeuralTooltip>
        <NeuralTooltip title="高级设置">
          <NeuralIcon name="Settings2" @click="togglePropertiesExpanded" />
        </NeuralTooltip>
        <NeuralIcon name="Trash2" @click="removeField" />
      </div>
    </div>
    <div v-if="propertiesExpanded">
      <SchemaProperties :data="data" :required="required" @update:required="updateRequired" />
    </div>
    <div class="schema-children">
      <SchemaGroup
        v-if="data.properties && data.type === 'object' && groupExpanded"
        :schemaProperties="data.properties || {}"
        :requiredList="data.required || []"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .schema-item-container {
    margin-bottom: 6px;
    font-size: 12px;
    .schema-main {
      display: flex;
      align-items: center;
      padding: 4px;
      background-color: #fafafa;
      border-radius: 4px;
      .schema-item {
        padding: 0 4px;
      }

      .schema-type-selector {
        width: 95px;
      }

      .schema-actions {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        opacity: 0.5;
      }

      .gritty-neural-checkable-tag {
        &.ant-tag-checkable-checked {
          background-color: #f6ffed;
          color: #52c41a;
        }
      }
      &:hover {
        .schema-actions {
          opacity: 1;
        }
      }
    }
    // 展开状态下的样式
    .schema-group-expand-icon {
      transition: transform 0.12s ease-in-out;
      &.is-expanded {
        transform: rotate(90deg);
      }
    }
  }
</style>
