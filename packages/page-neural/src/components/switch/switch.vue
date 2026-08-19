<script setup lang="ts">
  import { Switch } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface SwitchProps {}

  defineProps<SwitchProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <Switch v-bind="attrs" class="gritty-neural-switch">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Switch>
</template>

<style lang="scss" scoped></style>
