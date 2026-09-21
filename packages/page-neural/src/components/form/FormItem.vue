<template>
  <div class="mb-4">
    <label v-if="label" class="block mb-0.5 text-sm">
      <span v-if="required" class="text-red-500">*</span>
      {{ label }}
    </label>
    <!-- FormField插槽拿到 $field: {invalid, error} -->
    <FormField v-slot="$field" :name="name" :initial-value="initialValue">
      <slot :field="$field" />
      <Message
        v-if="$field.invalid"
        severity="error"
        size="small"
        variant="simple"
        class="absolute"
      >
        {{ $field.error?.message }}
      </Message>
    </FormField>
  </div>
</template>

<script setup lang="ts">
  import { FormField } from '@primevue/forms';
  import Message from 'primevue/message';
  // import Label from 'primevue/label'

  interface Props {
    name: string;
    label?: string;
    required?: boolean;
    initialValue?: unknown;
  }
  defineProps<Props>();
</script>

<style scoped></style>
