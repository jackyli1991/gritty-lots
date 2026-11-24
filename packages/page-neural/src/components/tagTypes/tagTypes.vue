<script setup lang="ts">
  import { SEVERITY_OPTIONS } from '@neural/data/options';
  import Tag from 'primevue/tag';

  import NeuralIcon from '../icon';

  const modelValue = defineModel<string>('modelValue', {
    default: 'primary',
  });
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Tag
      v-for="type in SEVERITY_OPTIONS"
      :key="type.value"
      :severity="type.value"
      class="cursor-pointer"
      @click="modelValue = type.value"
    >
      <NeuralIcon v-if="modelValue === type.value" name="Check" />
      {{ type.label }}
    </Tag>
  </div>
</template>
