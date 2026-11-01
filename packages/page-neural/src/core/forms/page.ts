import type { FormItemProps } from '@neural/components/form';
import { z } from 'zod';

const schema: FormItemProps[] = [
  {
    label: '名称',
    fieldName: 'name',
    component: 'Input',
    class: 'col-span-full',
    componentProps: {
      placeholder: '请输入页面名称',
    },
    help: [],
    required: true,
    tips: '',
  },
  {
    label: '描述',
    fieldName: 'description',
    component: 'Input',
    class: 'col-span-full',
    componentProps: {
      placeholder: '请输入页面描述',
    },
    help: [],
    required: true,
    tips: '',
  },
];

const rules = z.object({});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 2,
    autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '页面配置',
    class: 'w-[300px]!',
    component: 'dialog',
  },
};
