<script setup lang="ts">
  import { Popover } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface PopoverProps {}

  defineProps<PopoverProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Popover v-bind="attrs" class="gritty-neural-popover">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Popover>
</template>

<style lang="scss" scoped></style>
