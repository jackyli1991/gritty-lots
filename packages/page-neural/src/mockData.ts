import type { Container, LayoutSplitterNode, Page, DataSource } from '@neural/types';

// 页面
export const initialPages: Page[] = [
  {
    id: 'p-5f4aef60-f943-46b4-bd52-9bbd24cd47d4',
    name: '首页',
    description: '',
    layoutLock: true,
    deletable: false,
    layoutId: 'l-47443b08-dde8-4ee4-a624-ebf36d93112e',
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
      dataModel: { enable: false, sourceId: '', params: {} },
    },
  },
];

// 容器
export const initialContainers: Container[] = [
  {
    id: 'c-2e058023-aba2-43df-a90f-ae3adfdb0b9a',
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
      dataModel: { enable: false, sourceId: '', params: {} },
      containerModel: {},
    },
    children: [],
  },
  {
    id: 'c-bb080e6e-5e60-4f29-bfe5-6ca693494ee0',
    name: '表格',
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
        enable: true,
        sourceId: 'd-ebf0f2e6-dfe9-4f5e-a726-793ee1e54167',
        params: {},
        responseField: 'items',
      },
      containerModel: {
        size: 'medium',
        showGridlines: false,
        stripedRows: false,
        emptyText: '暂无数据',
        columns: [
          {
            id: 'col-e979ea2c-dd43-497e-82b1-fca07127241d',
            type: 'text',
            title: '用户名',
            field: 'name',
            width: 200,
            align: 'left',
            fixed: null,
            sortable: false,
          },
          {
            id: 'col-2f073618-596e-4562-aabc-2769e439a7d5',
            type: 'text',
            title: '账号',
            field: 'username',
            width: 200,
            align: 'left',
            fixed: null,
            sortable: false,
          },
          {
            id: 'col-f5f8a7f1-dd7e-4e46-9496-c8264c79aff3',
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
          {
            id: 'col-efdb6710-8c7b-4c76-83e7-2d45addbd031',
            type: 'tag',
            title: '状态',
            field: 'systemstatus',
            width: 200,
            align: 'left',
            fixed: null,
            sortable: false,
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
    id: 'l-47443b08-dde8-4ee4-a624-ebf36d93112e',
    name: '垂直分隔器',
    type: 'splitter',
    layout: 'vertical',
    gap: 6,
    children: [
      {
        id: 'l-766e54b6-1c14-46b4-a16c-452c7d467e04',
        name: '搜索表单',
        type: 'splitterPanel',
        useUnit: 'px',
        sizeValue: 100,
        percentage: 13.97,
        containerType: 'normal',
        containerId: 'c-2e058023-aba2-43df-a90f-ae3adfdb0b9a',
        children: [],
      },
      {
        id: 'l-d28c5159-d3dc-43ce-b0a2-5548adfd04bb',
        name: '表格',
        type: 'splitterPanel',
        useUnit: '%',
        sizeValue: 85.89,
        percentage: 85.89,
        containerType: 'table',
        containerId: 'c-bb080e6e-5e60-4f29-bfe5-6ca693494ee0',
        children: [],
      },
    ],
  },
];

// 数据源
export const initialDataSources: DataSource[] = [
  {
    id: 'd-ebf0f2e6-dfe9-4f5e-a726-793ee1e54167',
    name: '表格数据查询',
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
