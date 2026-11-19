import type { Container, LayoutSplitterNode, Page, DataSource } from '@neural/types';

// 页面
export const initialPages: Page[] = [
  {
    id: 'p-0a383c3e-c676-4f44-b785-55a0934fc34e',
    name: '首页',
    description: '',
    layoutLock: true,
    deletable: false,
    layoutId: 'l-8c86d1ce-6a49-4a20-9d44-80cf4f84af68',
    props: {
      backgroundModel: {
        backgroundColor: '#fff',
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain',
        backgroundOrigin: 'padding-box',
        backgroundClip: 'border-box',
        scale: [1, 1],
      },
      dataModel: {
        mode: 'source',
        originId: '',
        sourceId: '',
        params: {},
        responseField: '',
        customJson: '',
      },
    },
  },
];

// 容器
export const initialContainers: Container[] = [
  {
    id: 'c-a4dde768-4c34-4a2a-9e58-f28906e87ce2',
    name: '搜索表单',
    type: 'container',
    subType: 'normal',
    parentId: '',
    props: {
      boxModel: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          style: 'solid',
          color: '',
        },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        width: 100,
        height: 100,
        borderRadius: {
          topLeft: 0,
          topRight: 0,
          bottomRight: 0,
          bottomLeft: 0,
        },
        units: {
          margin: 'px',
          border: 'px',
          padding: 'px',
          width: '%',
          height: '%',
        },
      },
      backgroundModel: {
        backgroundColor: '#fff',
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain',
        backgroundOrigin: 'padding-box',
        backgroundClip: 'border-box',
        scale: [1, 1],
      },
      dataModel: {
        mode: 'source',
        originId: '',
        sourceId: '',
        params: {},
        responseField: '',
        customJson: '',
      },
      containerModel: {},
    },
    children: [],
  },
  {
    id: 'c-f11e0b36-4849-48cb-b858-347285ac2149',
    name: '列表表格',
    type: 'container',
    subType: 'table',
    parentId: '',
    props: {
      boxModel: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          style: 'solid',
          color: '',
        },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        width: 100,
        height: 100,
        borderRadius: {
          topLeft: 0,
          topRight: 0,
          bottomRight: 0,
          bottomLeft: 0,
        },
        units: {
          margin: 'px',
          border: 'px',
          padding: 'px',
          width: '%',
          height: '%',
        },
      },
      backgroundModel: {
        backgroundColor: '#fff',
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain',
        backgroundOrigin: 'padding-box',
        backgroundClip: 'border-box',
        scale: [1, 1],
      },
      dataModel: {
        mode: 'source',
        referenceId: '',
        sourceId: '',
        params: {},
        responseField: '',
        customJson: '',
      },
      containerModel: {
        size: 'large',
        showGridlines: false,
        stripedRows: false,
        emptyText: '数据为空',
        columns: [
          {
            id: 'col-1aeea003-d3d2-4c3d-bfb2-ba947c57408a',
            type: 'text',
            title: '名称',
            field: 'name',
            width: 200,
            align: 'left',
            fixed: null,
            sortable: false,
          },
          {
            id: 'col-6c34fe8b-4f66-44e6-9d8e-b3cd4de5ccbb',
            type: 'image',
            title: '头像',
            field: 'avatar',
            width: 200,
            align: 'left',
            fixed: null,
            sortable: false,
            imageSize: 30,
            imageBorderRadius: 6,
          },
        ],
      },
    },
    children: [],
  },
];

// 布局
export const initialLayouts: LayoutSplitterNode[] = [
  {
    id: 'l-8c86d1ce-6a49-4a20-9d44-80cf4f84af68',
    name: '页面root',
    type: 'splitter',
    layout: 'vertical',
    gap: 8,
    children: [
      {
        id: 'l-714becb3-62aa-4c85-a780-9b18fb022174',
        name: '搜索表单',
        type: 'splitterPanel',
        useUnit: 'px',
        sizeValue: 87,
        percentage: 13.85,
        containerType: 'normal',
        containerId: 'c-a4dde768-4c34-4a2a-9e58-f28906e87ce2',
        children: [],
      },
      {
        id: 'l-eb2600b3-bf1d-4d51-ab19-66deb8b1379c',
        name: '列表表格',
        type: 'splitterPanel',
        useUnit: '%',
        sizeValue: 83.44,
        percentage: 83.44,
        containerType: 'table',
        containerId: 'c-f11e0b36-4849-48cb-b858-347285ac2149',
        children: [],
      },
    ],
  },
];

// 数据源
export const initialDataSources: DataSource[] = [
  {
    id: 'd-ebf0f2e6-dfe9-4f5e-a726-793ee1e54167',
    name: '用户列表分页查询',
    type: 'http',
    url: 'https://fssc.gbuilderchina.com/testapi/system/user/getPageList',
    method: 'GET',
    responseField: 'result',
    json: '{}',
    headers: {
      accept: 'application/json, text/plain, */*',
      authorization:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3OTQyMTUxNzUsIm5iZiI6MTc5NDIxNTE3NSwiZXhwIjoxODI1NzUxMTc1LCJyY29kZSI6Njg5NjAzLCJ1aWQiOjI3MDR9.KN5wEkyrbR2_2xmvyFq1ALqs-d3xoETEcvk-a28gkwk',
    },
    params: {
      page: '1',
      pageSize: '20',
    },
  },
  {
    id: 'd-40708f69-3570-4ed6-807d-dd9b41dc5d98',
    name: '状态枚举数据',
    type: 'json',
    json: '[\n  { "label": "正常", "value": 1 },\n  { "label": "下线", "value": 0 },\n  { "label": "停用", "value": 2 }\n]',
  },
];
