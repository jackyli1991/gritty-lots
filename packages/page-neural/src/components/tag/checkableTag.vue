<script setup lang="ts">
  import { Tag } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface TagProps {}

  defineProps<TagProps>();

  const attrs = useAttrs();
  const slots = useSlots();

  const CheckableTag = Tag.CheckableTag;
</script>

<template>
  <CheckableTag v-bind="attrs" class="gritty-neural-checkable-tag">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </CheckableTag>
</template>

<style lang="scss" scoped></style>
