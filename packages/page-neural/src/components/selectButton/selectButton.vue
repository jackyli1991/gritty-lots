<script setup lang="ts">
  import { nestedFormControl } from '@neural/composables/useForm';
  import SelectButton from 'primevue/selectbutton';
  import { provide } from 'vue';

  // SelectButton 内部的 ToggleButton 会继承外层 FormField 的表单上下文，以相同字段名注册到 Form，
  // 并通过 $formValue 监听把字段值（如多选数组）写回自身 d_value，导致选中态被覆盖。
  // 这里屏蔽内部控件的表单上下文，值由 Form.vue 统一通过 modelValue / field.onChange 同步。
  provide('$pcFormField', { formControl: nestedFormControl });
</script>

<template>
  <SelectButton />
</template>
