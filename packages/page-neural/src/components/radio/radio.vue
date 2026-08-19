<script setup lang="ts">
  import { Radio } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface RadioProps {}

  defineProps<RadioProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Radio v-bind="attrs" class="gritty-neural-radio">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Radio>
</template>

<style lang="scss" scoped></style>
