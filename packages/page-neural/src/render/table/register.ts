import TableActionAttrs from '@neural/core/attrs/container/table-action.vue';
import { registerTableColumn } from '@neural/core/tools/registerTableColumn';
import type { TableColumn } from '@neural/types/table';

import ActionColumn from './cells/action.vue';
import ColorColumn from './cells/color.vue';
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
      componentProps: { min: 1 },
      tips: '最多显示的行数，超出时省略号显示',
    },
  ],
  {
    rows: 1,
  }
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
      component: 'TagTypes',
      class: 'col-span-full',
      componentProps: {},
      tips: '在枚举数据中没有指定标签类型时，使用此类型',
    },
  ],
  {
    severity: 'info',
    tagOptions: {
      mode: 'source',
      params: undefined,
      responseField: '',
      sourceId: '',
    },
  }
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
      component: 'TagTypes',
      class: 'col-span-2',
      componentProps: {},
      tips: '在枚举数据中没有指定标签类型时，使用此类型',
    },
    {
      fieldName: 'maxTags',
      label: '最大显示数量',
      component: 'InputNumber',
      class: 'col-span-1',
      componentProps: { min: 1 },
      tips: '最多显示的标签数量，超出时+n显示',
    },
  ],
  {
    maxTags: 2,
    severity: 'info',
    tagOptions: {
      mode: 'source',
      params: undefined,
      responseField: '',
      sourceId: '',
    },
  }
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
      componentProps: { suffix: 'px', min: 10 },
    },
    {
      fieldName: 'imageBorderRadius',
      label: '圆角半径',
      component: 'InputNumber',
      componentProps: { suffix: 'px', min: 0 },
    },
  ],
  {
    imageSize: 28,
    imageBorderRadius: 6,
  }
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
  ],
  {
    linkText: '点击查看',
  }
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
      componentProps: { min: 6, max: 28 },
    },
    {
      fieldName: 'processColors',
      label: '进度条颜色配置',
      component: 'EditorTable',
      class: 'col-span-full',
      componentProps: {
        columns: [
          {
            field: 'value',
            title: '阈值(小于等于时显示对应颜色)',
            type: 'text',
            align: 'center',
            width: 100,
            editConfig: {
              enable: true,
              component: 'InputNumber',
              fluid: true,
              min: 0,
              max: 100,
              showButtons: true,
              placeholder: '请输入阈值，范围0-100',
            },
          },
          {
            field: 'color',
            title: '颜色',
            type: 'color',
            align: 'center',
            width: 100,
            editConfig: {
              enable: true,
              component: 'ColorPicker',
            },
          },
        ] as Omit<TableColumn, 'id'>[],
      },
      tips: '配置进度条的颜色，小于等于阈值显示对应的颜色，以第一个匹配的阈值为准',
    },
  ],
  {
    showValue: true,
    barHeight: 16,
    processColors: [],
  }
);

registerTableColumn(
  {
    type: 'color',
    title: '颜色',
    single: false,
    icon: 'Palette',
    isData: true,
    component: ColorColumn,
  },
  [
    {
      fieldName: 'showColorValue',
      label: '显示颜色值',
      component: 'ToggleSwitch',
      componentProps: {},
      tips: '关闭后仅显示颜色块，不显示颜色文本',
    },
  ],
  {
    showColorValue: true,
  }
);

registerTableColumn(
  {
    type: 'action',
    title: '操作',
    single: true,
    icon: 'MousePointerClick',
    isData: false,
    component: ActionColumn,
  },
  [
    {
      fieldName: 'actionBtns',
      label: '按钮配置',
      renderComponent: TableActionAttrs,
      class: 'col-span-full',
      componentProps: {},
    },
    {
      fieldName: 'showBtnCount',
      label: '显示按钮数量',
      component: 'InputNumber',
      componentProps: { min: 1 },
      tips: '最多显示的按钮数量，超出时「更多」下拉显示',
    },
    {
      fieldName: 'moreBtnText',
      label: '更多按钮文本',
      component: 'InputText',
      componentProps: { placeholder: '请输入', maxLength: 10 },
    },
  ],
  {
    showBtnCount: 2,
    moreBtnText: '更多',
    actionBtns: [],
  }
);
