<script setup lang="ts">
  import { Select } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';
  defineOptions({
    name: 'MySelectOption',
    inheritAttrs: false,
  });
  /** 只声明自己扩展的 props；Option 原生属性走 $attrs */
  interface Props {}

  withDefaults(defineProps<Props>(), {});

  const attrs = useAttrs();
  const slots = useSlots();
  const SelectOption = Select.Option;
</script>

<template>
  <SelectOption v-bind="attrs">
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </SelectOption>
</template>
