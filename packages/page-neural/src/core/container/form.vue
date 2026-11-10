<!--
表单容器
基于 @primevue/forms 的基座，字段与内部元素渲染后续实现
@props id?: string
-->
<script setup lang="ts">
  import { usePageNeuralStore } from '@neural/store';
  import { Form } from '@primevue/forms';
  import { computed } from 'vue';

  defineOptions({
    name: 'PageFormContainer',
  });

  interface ContainerProps {
    id?: string;
  }

  const pageNeuralStore = usePageNeuralStore();

  const props = defineProps<ContainerProps>();

  const container = computed(() => pageNeuralStore.getContainer(props.id || ''));
</script>

<template>
  <Form
    v-if="container"
    class="page-form-container flex h-full w-full flex-col"
    :initial-values="{}"
  >
    <div class="flex flex-1 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
      表单容器
    </div>
  </Form>
</template>
