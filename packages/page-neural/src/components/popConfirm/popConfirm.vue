<script setup lang="ts">
  import { Popconfirm } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface PopConfirmProps {}

  defineProps<PopConfirmProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Popconfirm v-bind="attrs" class="gritty-neural-popconfirm">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Popconfirm>
</template>

<style lang="scss" scoped></style>
