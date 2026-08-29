<script setup lang="ts">
  import { NeuralConfigProvider } from '../../components';
  import DataSchema from './dataSchema.vue';
  import type { DataSchemaProps } from './types';

  const props = withDefaults(defineProps<DataSchemaProps>(), {
    readonly: false,
    colorPrimary: '#12A594',
  });
</script>

<template>
  <NeuralConfigProvider
    :theme="{
      token: {
        colorPrimary,
      },
    }"
  >
    <DataSchema v-bind="$attrs" :readonly="readonly" :colorPrimary="colorPrimary" />
  </NeuralConfigProvider>
</template>
