<script setup lang="ts">
  import { Radio } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface RadioProps {}

  defineProps<RadioProps>();

  const attrs = useAttrs();
  const slots = useSlots();

  const RadioButton = Radio.Button;
</script>

<template>
  <RadioButton v-bind="attrs" class="gritty-neural-radio-button">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </RadioButton>
</template>

<style lang="scss" scoped></style>
