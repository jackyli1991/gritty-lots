import type { FormItemProps } from '@neural/components/form';
import type { ToolbarItem } from '@neural/components/toolbar';
import { CONTAINER_TYPE } from '@neural/const';
import { modelMaps } from '@neural/core/models';
import type { Container } from '@neural/types';
import { generateId } from '@neural/utils';
import { merge } from 'lodash-es';
import { z } from 'zod';

const fieldSetMaps: string[] = [
  'boxModel', // 盒模型
  'layoutModel', // 布局模型
  'backgroundModel', // 背景模型
  'requestModel', // 请求模型
];

const deleteConfig = {
  enable: true, // 是否启用删除按钮
  label: '删除容器', // 删除按钮文本
  message: '确认删除容器【{{name}}】吗？', // 删除确认消息
};

// 表单项
export const schema: FormItemProps[] = fieldSetMaps.map((item: any) => ({
  ...modelMaps[item].getForm({}),
  schemaName: item,
}));

// 工具栏配置
const toolbarData: ToolbarItem[][] = [
  schema.map((item: any) => ({
    label: item.label,
    icon: item.icon,
    key: item.schemaName,
  })),
];

// 工具栏删除按钮
if (deleteConfig.enable) {
  toolbarData[0].push({
    label: deleteConfig.label,
    icon: 'Trash2',
    key: 'delete',
    color: 'red',
    deleteConfig,
  });
}

// 表单验证规则
const rules = z.object({});

export { toolbarData };

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
    delete: deleteConfig,
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
    type: CONTAINER_TYPE,
    subType,
    parentId,
    props: merge(
      fieldSetMaps.reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: { ...modelMaps[cur].model },
        }),
        {}
      ),
      props || {}
    ),
    children: [],
  };
}
