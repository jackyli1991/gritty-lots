<script setup lang="ts">
  import { Button } from 'ant-design-vue';

  import NeuralIcon from '../icon/icon.vue';

  interface ButtonProps {
    icon?: string;
  }

  defineProps<ButtonProps>();
</script>

<template>
  <Button class="gritty-neural-button" v-bind="$attrs">
    <template v-if="icon" #icon>
      <NeuralIcon class="gritty-button-icon" :name="icon" />
    </template>
    <slot></slot>
  </Button>
</template>

<style lang="scss" scoped>
  .gritty-neural-button {
    display: flex;
    justify-content: center;
    align-items: center;
    .gritty-button-icon {
      margin-right: 2px;
    }
  }
</style>
