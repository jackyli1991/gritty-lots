<template>
  <div class="mb-4">
    <label v-if="showLabel" class="block mb-0.5 text-sm items-center h-6">
      <span v-if="required" class="text-red-500 mr-1">*</span>
      <span>{{ label }}</span>
      <NeuralIcon
        v-if="help?.length"
        v-tooltip.top="help.join('\n')"
        name="CircleQuestionMark"
        class="ml-1"
        :size="13"
      />
    </label>
    <!-- FormField插槽拿到 $field: {invalid, error} -->
    <FormField v-slot="$field" :name="name" :initial-value="initialValue">
      <slot :field="$field" />
      <!-- tips 支持字符串、VNode 或渲染函数 -->
      <p v-if="typeof tips === 'string'" class="text-xs text-gray-400 font-light py-1">
        {{ tips }}
      </p>
      <div v-else-if="tips" class="text-xs text-gray-400 font-light py-1">
        <component :is="tips" />
      </div>
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
  import vTooltip from 'primevue/tooltip';
  import type { VNode } from 'vue';

  import NeuralIcon from '../icon';
  // import Label from 'primevue/label'

  interface Props {
    name: string; // 名称
    label?: string; // 标签（可选）
    showLabel?: boolean; // 标签是否显示（可选）
    required?: boolean; // 是否必填项（可选）
    initialValue?: unknown; // 初始值（可选）
    help?: string[]; // 帮助信息（可选）
    tips?: string | VNode | (() => VNode); // 提示信息，支持字符串、VNode 或渲染函数
  }
  withDefaults(defineProps<Props>(), {
    showLabel: true,
  });
</script>

<style scoped></style>
