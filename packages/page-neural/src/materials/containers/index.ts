import { CONTAINER_TYPE, CONTAINER_LAYOUT, CONTAINER_FORM, CONTAINER_POPUP } from '@neural/const';

export default {
  type: CONTAINER_TYPE,
  icon: 'Container',
  name: '容器类',
  description: '容器类，用于组织页面的元素结构。',
  children: [
    {
      name: '布局容器',
      type: CONTAINER_LAYOUT,
      icon: 'PanelsTopLeft',
      description: '布局容器，用于组织页面的整体布局结构。',
    },
    {
      name: '表单容器',
      type: CONTAINER_FORM,
      icon: 'PanelsTopLeft',
      description: '表单容器，用于组织表单元素。',
    },
    {
      name: '弹窗容器',
      type: CONTAINER_POPUP,
      icon: 'PanelsTopLeft',
      description: '弹窗容器，用于组织弹窗元素。',
    },
  ],
};
