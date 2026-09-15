<script setup lang="ts">
  import { Select } from 'ant-design-vue';
  import { useAttrs, useSlots, ref } from 'vue';

  interface SelectProps {
    block?: boolean;
  }

  defineProps<SelectProps>();

  const attrs = useAttrs();
  const slots = useSlots();
  const selectRef = ref<typeof Select>();

  /** 需要时把内部 Select 的方法透出去 */
  defineExpose({
    focus: () => selectRef.value?.focus?.(),
    blur: () => selectRef.value?.blur?.(),
    /** 或直接暴露整实例 */
    getSelectRef: () => selectRef.value,
  });
</script>

<template>
  <Select
    :block="block"
    :style="{
      width: block ? '100%' : 'auto',
    }"
    ref="selectRef"
    v-bind="attrs"
    class="gritty-neural-select"
  >
    <!-- 透传全部具名/默认 slot -->
    <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </Select>
</template>

<style lang="scss" scoped>
  .gritty-neural-select.ant-select {
    :deep(.ant-select-selector) {
      .ant-select-selection-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
</style>

<style lang="scss">
  .ant-select-dropdown {
    .ant-select-item {
      padding: 6px;
      .ant-select-item-option-content {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
</style>
