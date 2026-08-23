<script setup lang="ts">
  import { Select } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  defineOptions({
    name: 'SelectOptGroup',
  });

  /** 只声明自己扩展的 props 原生属性走 $attrs */
  interface Props {}

  withDefaults(defineProps<Props>(), {});

  const attrs = useAttrs();
  const slots = useSlots();
  const SelectOptGroup = Select.OptGroup;
</script>

<template>
  <SelectOptGroup v-bind="attrs">
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </SelectOptGroup>
</template>
