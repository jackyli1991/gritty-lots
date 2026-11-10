import type { FormItemProps } from '@neural/components/form';
import { getFormSchema, getFormModel } from '@neural/core/models';
import type { Container } from '@neural/types';
import { generateId } from '@neural/utils';
import { merge } from 'lodash-es';
import { z } from 'zod';

const fieldSetMaps: string[] = [
  'boxModel', // 盒模型
  // 'layoutModel', // 布局模型
  'backgroundModel', // 背景模型
  'dataModel', // 数据模型
  'containerModel', // 容器自定义模型
];

// 表单项
export const schema: FormItemProps[] = getFormSchema(fieldSetMaps);

// 表单验证规则
const rules = z.object({});

// useModal 配置
export default {
  // 表单配置
  formConfig: {
    schema,
    rules,
    columns: 1,
    // autoComplete: false,
  },
  // 弹窗配置
  modalConfig: {
    header: '容器配置',
    component: 'drawer',
    class: 'w-[450px]!',
    showCloseIcon: false, // 是否显示关闭弹窗图标
    collapse: {
      enable: true, // 是否启用手风琴模式
      defaultCollapsed: true, // 默认是否折叠
    },
    delete: {
      enable: false, // 是否启用删除按钮
      label: '删除容器', // 删除按钮文本
      message: '确认删除容器【{{name}}】吗？', // 删除确认消息
    },
  },
};

/**
 * 生成容器
 * @param id  容器id
 * @param name  容器名称
 * @param subType  容器子类型
 * @param parentId  容器父id
 * @param props  容器属性
 * @returns
 */
export function createContainer({
  id,
  name,
  subType,
  parentId = '',
  props,
}: {
  id?: string;
  name?: string;
  subType: string;
  parentId?: string;
  props?: Container['props'];
}): Container {
  return {
    id: id || generateId('c'),
    name: name || '容器',
    type: 'container',
    subType,
    parentId,
    props: merge(getFormModel(fieldSetMaps), props || {}),
    children: [],
  };
}
