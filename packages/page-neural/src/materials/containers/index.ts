import type { MaterialModule } from '@neural/types/materials';

export const CONTAINER_TYPE = 'container'; // 容器类型
export const CONTAINER_ROOT_ID = 'root'; // 根容器 ID
export const CONTAINER_LAYOUT = 'layout'; // 布局容器
export const CONTAINER_FORM = 'form'; // 表单容器
export const CONTAINER_POPUP = 'popup'; // 弹窗容器

export default {
  type: CONTAINER_TYPE,
  icon: 'Container',
  name: '容器',
  description: '容器类，用于组织页面的元素结构。',
  list: [
    {
      name: '布局容器',
      type: CONTAINER_LAYOUT,
      icon: 'PanelsTopLeft',
      description: '布局容器，用于组织页面的整体布局结构。',
      children: [
        {
          name: '表单容器',
          type: CONTAINER_FORM,
          icon: 'PanelsTopLeft',
          component: null,
          description: '表单容器，用于组织表单元素。',
        },
        {
          name: '弹窗容器',
          type: CONTAINER_POPUP,
          icon: 'PanelsTopLeft',
          component: null,
          description: '弹窗容器，用于组织弹窗元素。',
        },
      ],
    },
  ],
} satisfies MaterialModule;
