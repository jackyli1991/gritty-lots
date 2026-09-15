<script setup lang="ts">
  import { Checkbox } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface CheckboxProps {}

  defineProps<CheckboxProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Checkbox v-bind="attrs" class="gritty-neural-checkbox">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Checkbox>
</template>

<style lang="scss" scoped></style>
