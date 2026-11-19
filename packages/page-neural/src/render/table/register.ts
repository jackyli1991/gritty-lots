import { registerTableColumn } from '@neural/core/tools/registerTableColumn';

import ImageColumn from './cells/image.vue';
import LinkColumn from './cells/link.vue';
import TagColumn from './cells/tag.vue';
import TextColumn from './cells/text.vue';

// 内置数据列通过统一注册入口落地，保证元数据顺序与配置面板一致
registerTableColumn(
  { type: 'text', title: '文本', single: false, icon: 'Type', isData: true, component: TextColumn },
  []
);

registerTableColumn(
  { type: 'tag', title: '标签', single: false, icon: 'Tag', isData: true, component: TagColumn },
  [
    {
      fieldName: 'tagOptions',
      label: '枚举数据',
      component: 'DataSourcePicker',
      componentProps: {},
    },
  ]
);

registerTableColumn(
  {
    type: 'image',
    title: '图片',
    single: false,
    icon: 'Image',
    isData: true,
    component: ImageColumn,
  },
  [
    {
      fieldName: 'imageSize',
      label: '图片大小',
      component: 'InputNumber',
      componentProps: { fluid: true, suffix: 'px', min: 10 },
    },
    {
      fieldName: 'imageBorderRadius',
      label: '圆角半径',
      component: 'InputNumber',
      componentProps: { fluid: true, suffix: 'px', min: 0 },
    },
  ]
);

registerTableColumn(
  {
    type: 'link',
    title: '链接',
    single: false,
    icon: 'Link2',
    isData: true,
    component: LinkColumn,
  },
  []
);
