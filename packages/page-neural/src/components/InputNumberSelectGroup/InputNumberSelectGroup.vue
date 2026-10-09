<template>
  <InputGroup>
    <InputNumber v-bind="$attrs" :size="props.size" v-model="modelValue" />
    <Select
      :options="props.selectOptions"
      :optionLabel="props.optionLabel"
      :optionValue="props.optionValue"
      :size="props.size"
      v-model="selectValue"
      :formControl="novalidateControl"
    />
  </InputGroup>
</template>

<script lang="ts" setup>
  import InputGroup from 'primevue/inputgroup';
  import InputNumber from 'primevue/inputnumber';
  import Select from 'primevue/select';

  // 关闭自动 inheritAttrs，避免外部透传的 name/invalid/modelValue 等被错误地落到 InputNumber 上
  // defineOptions({
  //   inheritAttrs: false,
  // });

  interface Props {
    size?: 'small' | 'normal' | 'large';
    selectOptions?: any[];
    optionLabel?: string;
    optionValue?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'small',
    optionLabel: 'label',
    optionValue: 'value',
  });

  // 阻止内部 InputNumber/Select 通过 inject $pcFormField 自动注册到外层 FormField。
  // 否则 Select 切换单位时，BaseEditableHolder.writeValue 会直接调用 formField.onChange，
  // 把单位值（如 "rem"）写入外层字段（如 width），绕过 Form.vue 的 handleChange，
  // 导致 InputNumber 收到字符串而非数字。
  const novalidateControl = { novalidate: true };

  // 数值输入：默认 model（对应父组件 v-model）
  const modelValue = defineModel<number>();
  // 单位选择：具名 model（对应父组件 v-model:selectValue）
  const selectValue = defineModel<string>('selectValue');
</script>
