<script setup lang="ts">
  import { computed } from 'vue';

  import {
    NeuralSwitch,
    NeuralInputNumber,
    NeuralInput,
    NeuralSelect,
    NeuralRadioButton,
    NeuralRadioGroup,
    NeuralCheckbox,
    NeuralPopover,
    NeuralIcon,
  } from '../../components';
  import { formatOptions } from './datas';
  import propertyControl from './propertyControl.vue';
  import SchemaItemViewer from './schemaItemViewer.vue';
  import { type JSONSchemaObject, type JSONSchemaType } from './types';
  import { is } from './utils';

  interface Props {
    data: JSONSchemaObject;
    required: boolean | undefined;
    isArrayItems: boolean;
    isCombinationItem: boolean;
  }

  const BehaviorMode = {
    All: 'all',
    ReadOnly: 'readOnly',
    WriteOnly: 'writeOnly',
  };

  const props = defineProps<Props>();

  const emit = defineEmits(['update:required']);

  // 是否允许Null
  const isNullIncluded = computed(() => is(props.data.type, 'null'));

  // 是否允许常量
  const isConstAllowed = computed(() => props.data.const !== undefined);

  // 行为模式
  const behaviorMode = computed(() => {
    if (!props.data.readOnly && !props.data.writeOnly) {
      return BehaviorMode.All;
    }
    if (props.data.readOnly) {
      return BehaviorMode.ReadOnly;
    }
    if (props.data.writeOnly) {
      return BehaviorMode.WriteOnly;
    }
    return BehaviorMode.All;
  });

  function onChangeRequired(checked: boolean) {
    emit('update:required', checked);
  }

  // 允许Null切换
  function onChangeNullAllowed() {
    if (isNullIncluded.value) {
      const types = (props.data.type as JSONSchemaType[]).filter((item) => item !== 'null');
      props.data.type = types[0];
    } else {
      props.data.type = [props.data.type as JSONSchemaType, 'null'];
    }
  }

  // 常量切换
  function onChangeConst(checked: boolean) {
    if (!checked) {
      delete props.data.const;
    } else {
      props.data.const = props.data.default || '';
    }
  }

  // 行为模式切换
  function onChangeBehaviorMode(value: string) {
    if (value === BehaviorMode.All) {
      delete props.data.readOnly;
      delete props.data.writeOnly;
    } else if (value === BehaviorMode.ReadOnly) {
      props.data.readOnly = true;
      delete props.data.writeOnly;
    } else if (value === BehaviorMode.WriteOnly) {
      delete props.data.readOnly;
      props.data.writeOnly = true;
    }
  }
</script>

<template>
  <div class="schema-properties">
    <div class="properties-row">
      <div class="properties-item">
        <span class="properties-label">必填</span>
        <NeuralSwitch
          :checked="required"
          size="small"
          :disabled="isArrayItems || isCombinationItem"
          @change="onChangeRequired"
        />
      </div>
      <div class="properties-item">
        <span class="properties-label">允许NULL</span>
        <NeuralSwitch
          :disabled="data.type === 'null'"
          :checked="isNullIncluded"
          size="small"
          @change="onChangeNullAllowed"
        />
      </div>
      <div class="properties-item">
        <span class="properties-label">废弃</span>
        <NeuralSwitch v-model:checked="data.deprecated" size="small" />
      </div>
      <div class="properties-item">
        <span class="properties-label">行为</span>
        <NeuralRadioGroup
          :value="behaviorMode"
          size="small"
          button-style="solid"
          @update:value="onChangeBehaviorMode"
        >
          <NeuralRadioButton :value="BehaviorMode.All">读/写</NeuralRadioButton>
          <NeuralRadioButton :value="BehaviorMode.ReadOnly">只读</NeuralRadioButton>
          <NeuralRadioButton :value="BehaviorMode.WriteOnly">只写</NeuralRadioButton>
        </NeuralRadioGroup>
      </div>
      <propertyControl :type="data.type" fieldName="uniqueItems">
        <div class="properties-item">
          <span class="properties-label">所有元素唯一</span>
          <NeuralSwitch v-model:checked="data.uniqueItems" size="small" />
        </div>
      </propertyControl>
      <div class="properties-schema-view">
        <NeuralPopover placement="bottom" trigger="click">
          <template #content>
            <SchemaItemViewer :json-data="data" />
          </template>
          <NeuralIcon class="properties-item" name="FileBraces" />
        </NeuralPopover>
      </div>
    </div>
    <div class="properties-row properties-values">
      <propertyControl :type="data.type" fieldName="default">
        <div class="properties-item">
          <span class="properties-label">默认值</span>
          <div v-if="is(data.type, 'boolean')" class="properties-value">
            <NeuralSelect
              v-model:value="data.default"
              size="small"
              placeholder="默认值"
              block
              allowClear
              :options="[
                { label: 'true', value: true },
                { label: 'false', value: false },
              ]"
            />
          </div>
          <div v-else class="properties-value">
            <NeuralInput v-model:value="data.default" size="small" placeholder="默认值" />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="const_enum_examples">
        <div class="properties-item">
          <span class="properties-label">
            常量
            <NeuralSwitch :checked="isConstAllowed" size="small" @change="onChangeConst" />
          </span>
          <div class="properties-value">
            <NeuralInput
              v-if="isConstAllowed"
              v-model:value="data.const"
              size="small"
              placeholder="常量"
            />
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">枚举值</span>
          <div class="properties-value">
            <NeuralSelect
              v-model:value="data.enum"
              size="small"
              mode="tags"
              block
              placeholder="手动输入，可多个"
            />
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">示例值</span>
          <div class="properties-value">
            <NeuralSelect
              v-model:value="data.examples"
              size="small"
              mode="tags"
              block
              placeholder="手动输入，可多个"
            />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="minLength_maxLength">
        <div class="properties-item">
          <span class="properties-label">最小长度</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.minLength"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">最大长度</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.maxLength"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="minItems_maxItems">
        <div class="properties-item">
          <span class="properties-label">最小元素个数</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.minItems"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">最大元素个数</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.maxItems"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="minProperties_maxProperties">
        <div class="properties-item">
          <span class="properties-label">最小属性个数</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.minProperties"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">最大属性个数</span>
          <div class="properties-value">
            <NeuralInputNumber
              v-model:value="data.maxProperties"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="minimum_maximum">
        <div class="properties-item">
          <span class="properties-label">最小值</span>
          <div class="properties-value properties-value-number">
            <NeuralInputNumber
              v-model:value="data.minimum"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
            <NeuralCheckbox v-model:checked="data.exclusiveMinimum" size="small"
              >不能等于最小值</NeuralCheckbox
            >
          </div>
        </div>
        <div class="properties-item">
          <span class="properties-label">最大值</span>
          <div class="properties-value properties-value-number">
            <NeuralInputNumber
              v-model:value="data.maximum"
              size="small"
              min="0"
              block
              placeholder="大于等于0"
            />
            <NeuralCheckbox v-model:checked="data.exclusiveMaximum" size="small"
              >不能等于最大值</NeuralCheckbox
            >
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="format">
        <div class="properties-item">
          <span class="properties-label">format</span>
          <div class="properties-value">
            <NeuralSelect
              style="width: 100%"
              v-model:value="data.format"
              size="small"
              :options="formatOptions"
            />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="pattern">
        <div class="properties-item">
          <span class="properties-label">pattern</span>
          <div class="properties-value">
            <NeuralInput v-model:value="data.pattern" size="small" placeholder="^[a-zA-Z]+$" />
          </div>
        </div>
      </propertyControl>
      <propertyControl :type="data.type" fieldName="multipleOf">
        <div class="properties-item">
          <span class="properties-label">倍数</span>
          <div class="properties-value properties-value-number">
            <NeuralInputNumber
              v-model:value="data.multipleOf"
              size="small"
              min="0"
              block
              placeholder="倍数"
            />
          </div>
        </div>
      </propertyControl>
    </div>
    <!-- <div class="properties-empty">暂无属性</div> -->
  </div>
</template>

<style lang="scss" scoped>
  .schema-properties {
    color: #666;
    .properties-row {
      line-height: 30px;
      display: flex;
      align-items: center;
    }
    .properties-schema-view {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .properties-item {
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .properties-label {
      font-weight: bold;
      white-space: nowrap;
    }
    .properties-value {
      flex: 1;
      &.properties-value-number {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .properties-values {
      flex-wrap: wrap;
      .properties-item {
        width: 50%;
      }
      .properties-label {
        width: 80px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .properties-empty {
      text-align: center;
      padding: 6px 0;
      color: #999;
    }
  }
</style>
