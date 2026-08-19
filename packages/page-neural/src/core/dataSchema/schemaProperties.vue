<script setup lang="ts">
  import { computed } from 'vue';

  import {
    NeuralSwitch,
    NeuralInputNumber,
    NeuralInput,
    NeuralSelect,
    NeuralRadioButton,
    NeuralRadioGroup,
  } from '../../components';
  import { type JSONSchemaObject, type JSONSchemaType } from './types';

  interface Props {
    data: JSONSchemaObject;
    required: boolean | undefined;
  }

  const BehaviorMode = {
    All: 'all',
    ReadOnly: 'readOnly',
    WriteOnly: 'writeOnly',
  };

  const props = defineProps<Props>();

  const emit = defineEmits(['update:required']);

  // 是否允许Null
  const isNullIncluded = computed(
    () => Array.isArray(props.data.type) && props.data.type.includes('null')
  );

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
        <NeuralSwitch :checked="required" size="small" @change="onChangeRequired" />
      </div>
      <div class="properties-item">
        <span class="properties-label">允许NULL</span>
        <NeuralSwitch :checked="isNullIncluded" size="small" @change="onChangeNullAllowed" />
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
    </div>
    <div class="properties-row properties-values">
      <div class="properties-item">
        <span class="properties-label">默认值</span>
        <div class="properties-value">
          <NeuralInput v-model:value="data.default" size="small" />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">枚举值(enum)</span>
        <div class="properties-value">
          <NeuralSelect v-model:value="data.enum" size="small" mode="tags" block />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">示例值</span>
        <div class="properties-value">
          <NeuralSelect v-model:value="data.examples" size="small" mode="tags" block />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">
          常量
          <NeuralSwitch :checked="isConstAllowed" size="small" @change="onChangeConst" />
        </span>
        <div class="properties-value">
          <NeuralInput v-if="isConstAllowed" v-model:value="data.const" size="small" />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">最小长度</span>
        <div class="properties-value">
          <NeuralInputNumber v-model:value="data.minLength" size="small" min="0" />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">最大长度</span>
        <div class="properties-value">
          <NeuralInputNumber v-model:value="data.maxLength" size="small" min="0" />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">format</span>
        <div class="properties-value">
          <NeuralSelect style="width: 100%" v-model:value="data.format" size="small" />
        </div>
      </div>
      <div class="properties-item">
        <span class="properties-label">pattern</span>
        <div class="properties-value">
          <NeuralInput v-model:value="data.pattern" size="small" />
        </div>
      </div>
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
