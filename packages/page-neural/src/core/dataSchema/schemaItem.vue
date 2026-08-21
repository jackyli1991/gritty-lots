<script setup lang="ts">
  import { ref, computed } from 'vue';

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
  import SchemaItems from './schemaItems.vue';
  import SchemaProperties from './schemaProperties.vue';
  import { type JSONSchemaObject } from './types';
  import { is } from './utils';

  defineOptions({
    name: 'SchemaItem',
  });

  interface Props {
    data: JSONSchemaObject;
    field?: string;
    required?: boolean;
    isArrayItems?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isArrayItems: false,
  });
  const emit = defineEmits(['update:field', 'update:required', 'remove:field']);
  const propertiesExpanded = ref(false);
  const groupExpanded = ref(true);

  // 是否允许Null
  const isNullIncluded = computed(() => is(props.data.type, 'null'));

  // 是否是对象
  const isObject = computed(() => is(props.data.type, 'object'));
  // 是否是数组
  const isArray = computed(() => is(props.data.type, 'array'));

  // 选中的选项
  const selectedTypeOption = computed(() => {
    let type = props.data.type;
    if (Array.isArray(type)) {
      type = type.filter((item) => item !== 'null')[0];
    }
    return SchemaTypes.find((item) => item.value === type);
  });

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
      target.value = props.field || '';
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
    switch (type) {
      case 'object':
        if (!props.data.properties) {
          props.data.properties = {};
        }
        if (!props.data.required) {
          props.data.required = [];
        }
        break;
      case 'array':
        if (!props.data.items) {
          props.data.items = {
            type: 'string',
          };
        }
        break;
    }
  }
</script>

<template>
  <div
    class="schema-item-container"
    :class="{
      'is-deprecated': data.deprecated,
      'is-property-expanded': propertiesExpanded,
    }"
  >
    <div class="schema-main">
      <div v-if="!isArrayItems" class="schema-field schema-item">
        <NeuralInput :value="field" bottomBorder placeholder="字段" @blur="updateField" />
      </div>
      <div v-if="!isArrayItems" class="schema-field schema-item">
        <NeuralInput v-model:value="data.title" bottomBorder placeholder="中文名" />
      </div>
      <div class="schema-description schema-item">
        <NeuralInput v-model:value="data.description" bottomBorder placeholder="字段描述" />
      </div>
      <div class="schema-type schema-item">
        <NeuralSelect
          class="schema-type-selector"
          v-model:value="data.type"
          :showArrow="false"
          size="small"
          :style="{
            backgroundColor: selectedTypeOption?.backgroundColor || 'transparent',
            color: selectedTypeOption?.color || 'transparent',
            borderColor: selectedTypeOption?.color || 'transparent',
          }"
          popupClassName="schema-type-selector-dropdown"
          @change="onSchemaTypeChange"
        >
          <NeuralSelectOption v-for="item in SchemaTypes" :key="item.value" :value="item.value">
            <NeuralIcon :name="item.icon" :size="14" />
            <span>{{ item.label }}</span>
          </NeuralSelectOption>
        </NeuralSelect>
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
        <NeuralCheckableTag
          v-if="!isArrayItems"
          :checked="required"
          :style="{ marginRight: 0 }"
          @update:checked="updateRequired"
        >
          {{ required ? '必填' : '可选' }}
        </NeuralCheckableTag>
        <!-- 允许null -->
        <NeuralIcon v-if="isNullIncluded" name="Null" color="red" stroke-width="0.5"></NeuralIcon>
        <NeuralTooltip title="高级设置">
          <NeuralIcon
            name="Settings2"
            :color="propertiesExpanded ? '#52c41a' : undefined"
            @click="togglePropertiesExpanded"
          />
        </NeuralTooltip>
        <NeuralIcon v-if="!isArrayItems" name="Trash2" @click="removeField" />
      </div>
    </div>
    <div v-if="propertiesExpanded">
      <SchemaProperties
        :data="data"
        :required="required"
        :isArrayItems="isArrayItems"
        @update:required="updateRequired"
      />
    </div>
  </div>
  <div class="schema-children" v-if="isObject || isArray">
    <SchemaGroup
      v-if="data.properties && isObject && groupExpanded"
      :schemaProperties="data.properties || {}"
      :requiredList="data.required || []"
    />
    <SchemaItems v-if="data.items && isArray && groupExpanded" :data="data.items || {}" />
  </div>
</template>

<style lang="scss" scoped>
  .schema-item-container {
    border: 1px solid transparent;
    .schema-main {
      display: flex;
      align-items: center;
      padding: 4px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid transparent;
      .schema-item {
        padding: 0 4px;
      }

      .schema-type-selector {
        // width: 90px !important;
        border: 1px solid transparent;
        border-radius: 12px !important;
        :deep(.ant-select-selector) {
          height: 20px;
          line-height: 20px;
          padding: 0 6px;
          border-radius: 12px !important;
          border: 0 none;
          background-color: inherit;
          color: inherit;
          .ant-select-selection-item {
            justify-content: center;
          }
        }
      }

      .schema-actions {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        opacity: 0.6;
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

    &.is-property-expanded {
      border-color: #e2e1de;
      border-radius: 8px;
    }

    // 已废弃状态下的样式
    &.is-deprecated .schema-main {
      background-color: #fff2f0;
      border-color: #ffccc7;
    }
  }

  .schema-children {
    padding-top: 4px;
  }
</style>

<style>
  .schema-type-selector-dropdown {
    width: 90px !important;
  }
</style>
