<script setup lang="ts">
  import { ConfigProvider } from 'ant-design-vue';
  import { useAttrs, useSlots } from 'vue';

  interface ConfigProviderProps {}

  defineProps<ConfigProviderProps>();

  const attrs = useAttrs();
  const slots = useSlots();
</script>

<template>
  <ConfigProvider v-bind="attrs" class="gritty-neural-config-provider">
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
