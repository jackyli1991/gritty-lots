<script setup lang="ts">
  import { NeuralForm } from '@neural/components';
  import type { FormItemProps } from '@neural/components/form';
  import { ref } from 'vue';
  import { z } from 'zod';

  const formSchema = ref<FormItemProps[]>([
    {
      label: '请求地址',
      fieldName: 'url',
      component: 'InputText',
      componentProps: {
        placeholder: '请求地址',
      },
      defaultValue: '/r/url',
      help: [],
      required: true,
    },
    {
      label: '请求方法',
      fieldName: 'method',
      component: 'Select',
      componentProps: {
        placeholder: '请输入请求方法',
        showClear: true,
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      defaultValue: 'GET',
      help: [],
      required: true,
    },
    {
      label: '请求头',
      fieldName: 'headers',
      component: 'ObjectEditor',
      componentProps: {
        placeholder: '请求头',
      },
      defaultValue: {},
      help: [],
      required: false,
    },
    {
      label: '请求参数',
      fieldName: 'params',
      component: 'ObjectEditor',
      componentProps: {
        placeholder: '请求参数',
      },
      defaultValue: {},
      help: [],
      required: false,
    },
  ]);

  const rules = z.object({
    url: z.string().min(1, '请输入请求地址'),
    method: z.string().min(1, '请输入请求方法'),
  });
</script>

<template>
  <NeuralForm :columns="1" :schema="formSchema" :rules="rules" />
</template>
