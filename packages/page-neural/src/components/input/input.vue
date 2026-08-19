<script setup lang="ts">
  import { Input } from 'ant-design-vue';

  interface InputProps {
    bottomBorder?: boolean;
  }

  defineProps<InputProps>();
</script>

<template>
  <Input class="gritty-neural-input" :class="{ 'bottom-border': bottomBorder }" v-bind="$attrs">
    <slot></slot>
  </Input>
</template>

<style lang="scss" scoped>
  .gritty-neural-input {
    &.bottom-border {
      border-left: none;
      border-right: none;
      border-top: none;
      &:focus {
        box-shadow: none;
      }
    }
  }
</style>
