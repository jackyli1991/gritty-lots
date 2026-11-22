import { registerTableColumn } from '@neural/core/tools/registerTableColumn';
import { SEVERITY_OPTIONS } from '@neural/data/options';

import ImageColumn from './cells/image.vue';
import LinkColumn from './cells/link.vue';
import MultiTagColumn from './cells/multiTag.vue';
import ProgressColumn from './cells/progress.vue';
import TagColumn from './cells/tag.vue';
import TextColumn from './cells/text.vue';

// 内置数据列通过统一注册入口落地，保证元数据顺序与配置面板一致
registerTableColumn(
  { type: 'text', title: '文本', single: false, icon: 'Type', isData: true, component: TextColumn },
  [
    {
      fieldName: 'rows',
      label: '最多显示行数',
      component: 'InputNumber',
      componentProps: { fluid: true, min: 1 },
      tips: '最多显示的行数，超出时省略号显示',
    },
  ]
);

registerTableColumn(
  { type: 'tag', title: '标签', single: false, icon: 'Tag', isData: true, component: TagColumn },
  [
    {
      fieldName: 'tagOptions',
      label: '枚举数据',
      component: 'DataSourcePicker',
      class: 'col-span-full',
      componentProps: {},
    },
    {
      fieldName: 'severity',
      label: '标签默认类型',
      component: 'Select',
      class: 'col-span-full',
      componentProps: {
        options: SEVERITY_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
      },
      tips: '在枚举数据中没有指定标签类型时，使用此类型',
    },
  ]
);

registerTableColumn(
  {
    type: 'multiTag',
    title: '多标签',
    single: false,
    icon: 'Tags',
    isData: true,
    component: MultiTagColumn,
  },
  [
    {
      fieldName: 'tagOptions',
      label: '枚举数据',
      component: 'DataSourcePicker',
      class: 'col-span-full',
      componentProps: {},
    },
    {
      fieldName: 'severity',
      label: '标签默认类型',
      component: 'Select',
      class: 'col-span-2',
      componentProps: {
        options: SEVERITY_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
      },
      tips: '在枚举数据中没有指定标签类型时，使用此类型',
    },
    {
      fieldName: 'maxTags',
      label: '最大显示数量',
      component: 'InputNumber',
      class: 'col-span-1',
      componentProps: { min: 1, fluid: true },
      tips: '最多显示的标签数量，超出时+n显示',
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
  [
    {
      fieldName: 'linkText',
      label: '链接文本',
      component: 'Input',
      componentProps: { placeholder: '自定义链接文本', maxLength: 20 },
    },
  ]
);

registerTableColumn(
  {
    type: 'progress',
    title: '进度条',
    single: false,
    icon: 'Percent',
    isData: true,
    component: ProgressColumn,
  },
  [
    {
      fieldName: 'showValue',
      label: '显示百分比',
      component: 'ToggleSwitch',
      componentProps: {},
      tips: '开启后在进度条上显示百分比文本',
    },
    {
      fieldName: 'barHeight',
      label: '进度条高度(px)',
      component: 'InputNumber',
      componentProps: { fluid: true, min: 6, max: 20 },
    },
  ]
);
