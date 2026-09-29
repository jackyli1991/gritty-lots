<template>
  <div class="flex items-center justify-start size-7">
    <div class="flex items-center gap-2">
      <Checkbox v-bind="$attrs" binary />
      <Label for="preview-checkbox">{{ $attrs.label || '' }}</Label>
    </div>
  </div>
</template>

<script setup>
import Checkbox from 'primevue/checkbox';
import Label from 'primevue/label';
</script>