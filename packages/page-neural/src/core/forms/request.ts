import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '名称',
    fieldName: 'name',
    component: 'Input',
    class: 'col-span-3',
    componentProps: {
      placeholder: '描述请求的功能',
    },
    help: [],
    required: true,
  },

  {
    label: '类型',
    fieldName: 'type',
    component: 'Select',
    class: 'col-span-1',
    componentProps: {
      placeholder: '请选择',
      optionLabel: 'label',
      optionValue: 'value',
      options: [
        { label: 'JSON', value: 'json' },
        { label: 'HTTP', value: 'http' },
      ],
    },
    help: [],
    required: true,
  },
  // {
  //   label: '',
  //   fieldName: 'enable',
  //   component: 'ToggleButton',
  //   class: 'col-span-1',
  //   componentProps: {
  //     onLabel: '已启用',
  //     offLabel: '已禁用',
  //   },
  // },
  {
    label: '地址',
    fieldName: 'url',
    component: 'Input',
    class: 'col-span-3',
    componentProps: {
      placeholder: '请输入请求地址',
      prefix: '/api',
      // suffix: 'xxx',
    },
    help: [],
    required: true,
    tips: '必须以/开头，示例：/request/api',
  },
  {
    label: '方法',
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
    class: 'col-span-4',
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
    class: 'col-span-4',
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
    class: 'col-span-4',
    componentProps: {
      placeholder: '请求参数',
    },
    help: [],
    required: false,
  },
];

const rules = z.object({
  name: z.string('请输入请求名称').min(1),
  type: z.string('请选择请求类型').min(1),
  url: z.string('请输入请求地址').min(1),
  method: z.string('请选择请求方法').min(1),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 4,
    autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '请求配置',
    component: 'drawer',
    dismissable: false, // 点击外部区域不关闭弹窗
  },
};
