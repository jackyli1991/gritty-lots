<script setup lang="ts">
  import { NeuralForm } from '@neural/components';
  import type { FormItemProps } from '@neural/components/form';
  import { ref } from 'vue';
  import { z } from 'zod';

  const formSchema = ref<FormItemProps[]>([
    {
      label: '请求地址',
      fieldName: 'url',
      component: 'Input',
      class: 'col-span-2',
      componentProps: {
        placeholder: '/开头，示例：/request/api',
        prefix: '/api',
        // suffix: 'xxx',
      },
      help: [],
      required: true,
    },
    {
      label: '请求方法',
      fieldName: 'method',
      component: 'Select',
      class: 'col-span-1',
      componentProps: {
        placeholder: '请选择',
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      help: [],
      required: true,
    },
    {
      label: '响应字段',
      fieldName: 'responseField',
      component: 'InputText',
      class: 'col-span-1',
      componentProps: {
        placeholder: '取response中的数据，示例：data.list',
        showClear: true,
      },
      help: [],
      // required: true,
    },
    {
      label: '请求头',
      fieldName: 'headers',
      component: 'ObjectEditor',
      class: 'col-span-2',
      componentProps: {
        placeholder: '请求头',
      },
      help: [],
      required: false,
    },
    {
      label: '请求参数',
      fieldName: 'params',
      component: 'ObjectEditor',
      class: 'col-span-2',
      componentProps: {
        placeholder: '请求参数',
      },
      help: [],
      required: false,
    },
  ]);

  const rules = z.object({
    url: z.string().min(1, '请输入请求地址'),
    method: z.string().min(1, '请输入请求方法'),
  });

  const props = defineProps<{
    data?: Record<string, any>;
  }>();
</script>

<template>
  <NeuralForm :data="props.data" :columns="2" :schema="formSchema" :rules="rules" />
</template>
