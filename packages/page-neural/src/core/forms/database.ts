import Database from '@neural/core/attrs/database.vue';

export default {
  // 表单配置
  formConfig: {
    // schema,
    // rules,
    connectedComponent: Database,
    columns: 2,
    autoComplete: false,
    submitText: '保存',
  },
  // 弹窗配置
  modalConfig: {
    header: '数据源列表',
    // 左列表 + 右预览的分栏布局，需要更宽的弹窗；flex 纵向布局保证内容区可撑满并内部滚动
    class: 'w-[80vw]! h-[80vh]! flex flex-col',
    component: 'dialog',
    pt: {
      header: {
        class: 'py-2! shrink-0',
      },
      title: {
        class: 'text-sm!',
      },
      // 内容区交给面板自行滚动，避免弹窗整体出现滚动条
      content: {
        class: 'min-h-0 overflow-hidden!',
      },
    },
  },
};
