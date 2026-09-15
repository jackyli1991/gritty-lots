<script setup lang="ts">
  import { RadioGroup } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface RadioGroupProps {}

  defineProps<RadioGroupProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <RadioGroup v-bind="attrs" class="gritty-neural-radio-group">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </RadioGroup>
</template>

<style lang="scss" scoped></style>
