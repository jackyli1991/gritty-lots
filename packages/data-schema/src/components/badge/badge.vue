<script setup lang="ts">
  import { Badge } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface BadgeProps {}

  defineProps<BadgeProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Badge v-bind="attrs" class="gritty-neural-badge">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Badge>
</template>

<style lang="scss" scoped></style>
