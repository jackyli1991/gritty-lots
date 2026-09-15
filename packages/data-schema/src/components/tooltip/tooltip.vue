<script setup lang="ts">
  import { Tooltip } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface TooltipProps {}

  defineProps<TooltipProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Tooltip v-bind="attrs" class="gritty-neural-tooltip">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Tooltip>
</template>

<style lang="scss" scoped></style>
