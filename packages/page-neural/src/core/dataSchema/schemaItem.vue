<script setup lang="ts">
  import { ref, computed, useTemplateRef } from 'vue';

  import {
    NeuralIcon,
    NeuralInput,
    NeuralSelect,
    NeuralSelectOption,
    NeuralSelectOptGroup,
    NeuralCheckableTag,
    NeuralTooltip,
  } from '../../components';
  import { baseTypes, combinationOptions, SchemaTypes } from './datas';
  import SchemaCombination from './schemaCombination.vue';
  import SchemaGroup from './schemaGroup.vue';
  import SchemaItems from './schemaItems.vue';
  import SchemaProperties from './schemaProperties.vue';
  import { type JSONSchemaObject } from './types';
  import { is } from './utils';

  defineOptions({
    name: 'SchemaItem',
  });

  interface Props {
    data: JSONSchemaObject; // 数据项
    field?: string; // 字段名
    required?: boolean; // 是否必填
    isArrayItems?: boolean; // 是否是数组项
    isCombinationItem?: boolean; // 是否是组合项
    highlight?: boolean; // 是否高亮显示
    readonly?: boolean; // 是否只读
  }

  const props = withDefaults(defineProps<Props>(), {
    isArrayItems: false,
    isCombinationItem: false,
  });
  const emit = defineEmits(['update:field', 'update:required', 'remove']);
  const propertiesExpanded = ref(false);
  const hoverItemField = ref('');
  const removeFieldConfirmFlag = ref(false);
  const timer = ref<number>();
  const schemaGroupRef = useTemplateRef<typeof SchemaGroup>('schemaGroupRef');
  const schemaItemsRef = useTemplateRef<typeof SchemaItems>('schemaItemsRef');
  const schemaCombinationRef = useTemplateRef<typeof SchemaCombination>('schemaCombinationRef');

  // 基础类型
  const isBaseType = computed(() =>
    baseTypes.map((item) => item.value).includes(selectedTypeOption.value?.value || '')
  );

  // 组合类型
  const isCombinationType = computed(() =>
    combinationOptions.map((item) => item.value).includes(selectedTypeOption.value?.value || '')
  );

  // 是否允许Null
  const isNullIncluded = computed(() => is(props.data.type, 'null'));

  // 是否是对象
  const isObject = computed(() => is(props.data.type, 'object'));
  // 是否是数组
  const isArray = computed(() => is(props.data.type, 'array'));

  // 是否子项高亮显示
  const isHighlighting = computed(() => hoverItemField.value === props.field);

  // 允许删除
  const isRemovable = computed(() => !props.isArrayItems && !props.readonly);

  // 选中的选项
  const selectedTypeOption = computed(() => {
    let type = props.data.type;
    if (Array.isArray(type)) {
      type = type.filter((item) => item !== 'null')[0];
    }
    let option: Record<string, any> | undefined = {};
    for (const item of SchemaTypes) {
      option = item.options.find((opt) => opt.value === type);
      if (option) {
        return option;
      }
    }
    return option;
  });

  /**
   * 切换属性编辑面板展开状态
   */
  function togglePropertiesExpanded() {
    propertiesExpanded.value = !propertiesExpanded.value;
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
    if (props.readonly) {
      return;
    }
    emit('update:required', checked);
  }

  /**
   * 删除字段
   */
  function removeField() {
    emit('remove', props.field);
    removeFieldConfirmFlag.value = false;
    clearTimeout(timer.value);
  }

  /**
   * 删除字段确认
   */
  function removeFieldConfirm() {
    removeFieldConfirmFlag.value = true;
    timer.value = setTimeout(() => {
      removeFieldConfirmFlag.value = false;
      clearTimeout(timer.value);
    }, 1800);
  }

  /**
   * 创建分组类型
   */
  function createGroupType(group: string) {
    const hasGroupType = props.data.oneOf || props.data.anyOf || props.data.allOf;
    if (hasGroupType) {
      delete props.data.oneOf;
      delete props.data.anyOf;
      delete props.data.allOf;
    }
    props.data[group] = hasGroupType || [
      {
        type: 'string',
      },
      {
        type: 'string',
      },
    ];
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
      case 'oneOf':
        createGroupType('oneOf');
        break;
      case 'anyOf':
        createGroupType('anyOf');
        break;
      case 'allOf':
        createGroupType('allOf');
        break;
    }
  }

  /**
   * 处理鼠标悬停事件
   * 高亮object 和 array 子项
   */
  function onSchemaMouseOver() {
    if (isObject.value || isArray.value || isCombinationType.value) {
      hoverItemField.value = props.field || '';
    }
  }

  /**
   * 折叠所有配置
   */
  function foldOptions() {
    propertiesExpanded.value = false;
    if (schemaGroupRef.value) {
      schemaGroupRef.value.foldOptions();
    }
    if (schemaItemsRef.value) {
      schemaItemsRef.value.foldOptions();
    }
    if (schemaCombinationRef.value) {
      schemaCombinationRef.value.foldOptions();
    }
  }

  defineExpose({
    foldOptions,
  });
</script>

<template>
  <div
    class="schema-item-container"
    :class="{
      'is-deprecated': data.deprecated,
      'is-property-expanded': propertiesExpanded,
      'is-highlight': highlight,
    }"
  >
    <div
      class="schema-main"
      @mouseenter.stop="onSchemaMouseOver"
      @mouseleave.stop="hoverItemField = ''"
    >
      <div v-if="!isArrayItems && !isCombinationItem" class="schema-field schema-item">
        <NeuralInput
          :value="field"
          bottomBorder
          placeholder="字段"
          :readonly="readonly"
          @blur="updateField"
        />
      </div>
      <div v-if="!isArrayItems" class="schema-field schema-item">
        <NeuralInput
          v-model:value="data.title"
          bottomBorder
          placeholder="中文名"
          :readonly="readonly"
        />
      </div>
      <div class="schema-description schema-item">
        <NeuralInput
          v-model:value="data.description"
          bottomBorder
          placeholder="字段描述"
          :readonly="readonly"
        />
      </div>
      <div class="schema-type schema-item">
        <NeuralSelect
          class="schema-type-selector"
          v-model:value="data.type"
          :showArrow="false"
          size="small"
          :disabled="readonly"
          :style="{
            backgroundColor: selectedTypeOption?.backgroundColor || 'transparent',
            color: selectedTypeOption?.color || 'transparent',
          }"
          popupClassName="schema-type-selector-dropdown"
          @change="onSchemaTypeChange"
        >
          <!-- 类型分组 -->
          <NeuralSelectOptGroup
            v-for="(group, index) in SchemaTypes"
            :key="index"
            :label="group.label"
          >
            <NeuralSelectOption
              v-for="option in group.options"
              :key="option.value"
              :value="option.value"
            >
              <div class="schema-type-option-content">
                <div class="schema-type-option-item">
                  <NeuralIcon :name="option.icon" :size="14" />
                  <span>{{ option.label }}</span>
                </div>
                <div v-if="option.description" class="schema-type-option-description">
                  {{ option.description || '' }}
                </div>
              </div>
            </NeuralSelectOption>
          </NeuralSelectOptGroup>
        </NeuralSelect>
      </div>
      <div class="schema-actions schema-item">
        <NeuralCheckableTag
          v-if="!isArrayItems && !isCombinationItem"
          :checked="required"
          :style="{ marginRight: 0 }"
          @update:checked="updateRequired"
        >
          {{ required ? '必填' : '可选' }}
        </NeuralCheckableTag>
        <!-- 允许null -->
        <NeuralIcon v-if="isNullIncluded" name="Null" color="red" stroke-width="0.5"></NeuralIcon>
        <NeuralTooltip v-if="isBaseType" title="高级配置">
          <NeuralIcon
            name="Settings2"
            :color="propertiesExpanded ? '#0588f0' : undefined"
            @click="togglePropertiesExpanded"
          />
        </NeuralTooltip>
        <!-- 删除字段 -->
        <transition v-if="isRemovable" name="slide-up" mode="out-in">
          <NeuralIcon v-if="!removeFieldConfirmFlag" name="Trash2" @click="removeFieldConfirm" />
          <span class="delete-action-confirm" v-else>
            <NeuralTooltip title="确认删除">
              <NeuralIcon name="CircleX" color="red" stroke-width="2.5" @click="removeField" />
            </NeuralTooltip>
          </span>
        </transition>
      </div>
    </div>
    <div v-if="propertiesExpanded">
      <SchemaProperties
        :data="data"
        :required="required"
        :readonly="readonly"
        :isArrayItems="isArrayItems"
        :isCombinationItem="isCombinationItem"
        @update:required="updateRequired"
      />
    </div>
  </div>
  <div class="schema-children" v-if="isObject || isArray || isCombinationType">
    <SchemaGroup
      v-if="data.properties && isObject"
      ref="schemaGroupRef"
      :readonly="readonly"
      :schemaProperties="data.properties || {}"
      :requiredList="data.required || []"
      :highlight="isHighlighting"
    />
    <SchemaItems
      v-if="data.items && isArray"
      ref="schemaItemsRef"
      :readonly="readonly"
      :data="data.items || {}"
      :highlight="isHighlighting"
    />
    <SchemaCombination
      v-if="isCombinationType"
      ref="schemaCombinationRef"
      :readonly="readonly"
      :data="data"
      :combinationType="selectedTypeOption?.value || ''"
      :highlight="isHighlighting"
    />
  </div>
</template>

<style lang="scss" scoped>
  .schema-item-container {
    border: 1px solid transparent;
    border-radius: 8px;
    .schema-main {
      display: flex;
      align-items: center;
      padding: 4px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: background-color 0.1s ease-in-out;
      .schema-item {
        padding: 0 4px;
      }

      .schema-type-selector {
        border-radius: 12px !important;
        :deep(.ant-select-selector) {
          height: 20px;
          line-height: 20px;
          border-radius: 12px !important;
          border: 0 none;
          background-color: inherit;
          color: inherit;
          .ant-select-selection-item {
            .schema-type-option-item {
              display: flex;
              justify-content: center;
              gap: 4px;
            }
            .schema-type-option-description {
              display: none;
            }
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
        .delete-action-confirm {
          display: flex;
          align-items: center;
        }
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

    &.is-property-expanded {
      border-color: #e2e1de;
      border-radius: 8px;
    }

    // 已废弃状态下的样式
    &.is-deprecated .schema-main {
      background-color: #fff2f0;
      border-color: #ffccc7;
    }

    &.is-highlight {
      .schema-main {
        background-color: #e6f4fe;
      }
    }
    &:not(.is-deprecated):hover {
      border-color: #5eb1ef;
    }
  }

  // .schema-children {
  //   padding-top: 4px;
  // }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.1s ease-out;
  }

  .slide-up-enter-from {
    opacity: 0;
  }

  .slide-up-leave-to {
    opacity: 0;
  }
</style>

<style lang="scss">
  .schema-type-selector-dropdown {
    width: 180px !important;
    .ant-select-item-group {
      font-weight: 700;
      color: #333;
      font-size: 14px;
    }
    .schema-type-option-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .schema-type-option-item {
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1;
      }
      .schema-type-option-description {
        font-size: 12px;
        color: #666;
        font-weight: 300;
      }
    }
  }
</style>
