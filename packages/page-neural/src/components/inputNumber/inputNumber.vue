<script setup lang="ts">
  import { InputNumber } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface InputNumberProps {}

  defineProps<InputNumberProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <InputNumber v-bind="attrs" class="gritty-neural-input-number">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </InputNumber>
</template>

<style lang="scss" scoped></style>
