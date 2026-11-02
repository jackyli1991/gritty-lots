import type { FormItemProps } from '@neural/components/form';
import { getFormSchema, getFormModel } from '@neural/core/models';
import type { Page } from '@neural/types';
import { generateId } from '@neural/utils';
import { merge } from 'lodash-es';
import { z } from 'zod';

const fieldSetMaps: string[] = [
  'backgroundModel', // 背景模型
  'requestModel', // 请求模型
];

// 表单项
export const schema1: FormItemProps[] = getFormSchema(fieldSetMaps);

const schema: FormItemProps[] = [
  {
    label: '名称',
    fieldName: 'name',
    component: 'Input',
    class: 'col-span-1',
    componentProps: {
      placeholder: '页面名称',
    },
    help: [],
    required: true,
    tips: '',
  },
  {
    label: '描述',
    fieldName: 'description',
    component: 'Input',
    class: 'col-span-1',
    componentProps: {
      placeholder: '简要描述页面功能',
    },
    help: [],
    required: false,
    tips: '',
  },
  ...schema1,
];

const rules = z.object({
  name: z.string('页面名称不能为空').min(1),
  // description: z.string().min(1, '页面描述'),
});

export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 2,
    autoComplete: false,
    submitText: '保存',
  },
  // 弹窗配置
  modalConfig: {
    header: '页面配置',
    class: 'w-[500px]!',
    component: 'dialog',
  },
};

/**
 * 生成页面
 * @param id  容器id
 * @param name  容器名称
 * @param subType  容器子类型
 * @param parentId  容器父id
 * @param props  容器属性
 * @returns
 */
export function createPage({
  id,
  name,
  props,
}: {
  id?: string;
  name?: string;
  props?: Page['props'];
}): Page {
  return {
    id: id || generateId('p'),
    name: name || '',
    description: '',
    layoutLock: false,
    deletable: true,
    layoutId: '',
    props: merge(getFormModel(fieldSetMaps), props || {}),
  };
}
