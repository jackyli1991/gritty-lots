<script setup lang="ts">
  import { NeuralToolbar, NeuralIcon } from '@neural/components';
  import type { ToolbarItem } from '@neural/components/toolbar';
  import type { OpenModal } from '@neural/composables/userModal';
  import { useNeuralToast } from '@neural/composables/useToast';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { createPage } from '@neural/core/forms/page';
  import { usePageNeuralStore } from '@neural/store';
  import { useLayoutStore } from '@neural/store/layout';
  import type { Page } from '@neural/types';
  import { invokeAction, type ActionTree, type Paths } from '@neural/utils';
  import { merge } from 'lodash-es';
  import { storeToRefs } from 'pinia';
  import Select from 'primevue/select';
  import { computed, h, inject } from 'vue';

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const { neuralToastSuccess } = useNeuralToast();
  const { neuralConfirm } = useNeuralConfirm();
  // 页面切换：下拉选择当前页面，加号按钮新增页面
  const pageNeuralStore = usePageNeuralStore();
  const layoutStore = useLayoutStore();
  const { pages, activePageId, activePage } = storeToRefs(pageNeuralStore);

  const options = computed(() => pages.value.map((page) => ({ label: page.name, value: page.id })));

  // 工具栏配置
  const toolbarData = computed<ToolbarItem[][]>(() => [
    [
      {
        label: '编辑页面',
        icon: 'Edit',
        key: 'editPage',
      },
      {
        label: '删除页面',
        icon: 'Trash2',
        key: 'deletePage',
        severity: 'danger',
        hidden: !activePage.value || !activePage.value?.deletable,
      },
      {
        label: '锁定页面',
        icon: 'Lock',
        key: 'lockPage',
      },
      {
        label: '新增页面',
        icon: 'Plus',
        key: 'addPage',
        severity: 'primary',
      },
    ],
    [
      {
        label: '确认布局',
        icon: 'Check',
        key: 'lockLayout',
        showLabel: true,
        severity: 'primary',
        hidden: layoutStore.locked,
      },
      {
        label: '编辑布局',
        icon: 'Layout',
        key: 'unlockLayout',
        hidden: !layoutStore.locked,
      },
    ],
  ]);

  // 新增页面
  function handleAddPage() {
    const newPage = createPage({});
    openModal?.({
      key: 'page',
      props: newPage.props,
      nodeData: newPage,
      formConfig: {
        submitText: '新增',
        onSubmit: async (key, data) => {
          console.log('提交数据', key, data);
          const { name, description, ...props } = data;
          newPage.name = name;
          newPage.description = description;
          newPage.props = { ...newPage.props, ...props };
          // 新增页面逻辑
          pageNeuralStore.addPage(newPage);
        },
      },
    });
  }

  // 编辑页面
  function handleEditPage() {
    if (!activePage.value) {
      return;
    }
    const editProps = {
      name: activePage.value.name,
      description: activePage.value.description,
      ...activePage.value.props,
    };
    openModal?.({
      key: 'page',
      props: editProps,
      nodeData: activePage.value,
      formConfig: {
        submitText: '保存',
        onSubmit: async (key, data) => {
          console.log('提交数据', key, data);
          const { name, description, ...props } = data;
          // 以新对象为 merge 目标，避免 lodash merge 原地修改页面已有的嵌套对象引用
          const editPage = merge({}, activePage.value, { name, description, props });
          // 编辑页面逻辑
          pageNeuralStore.updatePage(editPage as Page);
        },
      },
    });
  }

  const actions = {
    // 锁定布局
    lockLayout: () => {
      pageNeuralStore.setLayoutLock(true);
      neuralToastSuccess('已锁定');
      pageNeuralStore.ensureLayoutContainers();
    },
    // 解锁布局
    unlockLayout: () => {
      neuralConfirm({
        message: '是否重新编辑页面布局？',
        header: '页面布局',
        type: 'alert',
        confirm: () => {
          pageNeuralStore.setLayoutLock(false);
          neuralToastSuccess('已解锁', '可以重新编辑布局');
        },
        reject: () => {},
      });
    },
    // 新增页面
    addPage: handleAddPage,
    // 编辑页面
    editPage: handleEditPage,
    // 锁定页面
    lockPage: () => {
      // pageNeuralStore.setPageLock(true);
      // neuralToastSuccess('已锁定');
    },
    // 删除页面
    deletePage: () => {
      if (!activePage.value) {
        return;
      }
      neuralConfirm({
        message: '删除后页面关联的所有组件也将被删除，是否继续？',
        header: '删除页面',
        type: 'delete',
        confirm: () => {
          // pageNeuralStore.deletePage(activePage.value.id);
          neuralToastSuccess('to do');
        },
        reject: () => {},
      });
    },
  } satisfies ActionTree;

  function handleClick(key: string) {
    invokeAction(actions, key as Paths<typeof actions>);
  }

  // select 自定义选项
  function getOption(id: string) {
    let page = pageNeuralStore.getPage(id);
    const info: { layoutLock?: boolean; useHttp?: boolean } = {};
    if (!page) {
      return null;
    }
    info.layoutLock = page.layoutLock;
    info.useHttp = page.props?.requestModel?.enable || false;
    return h('div', { class: 'flex items-center gap-1' }, [
      h('span', {}, page.name),
      info.layoutLock && h(NeuralIcon, { name: 'Layout', size: 12 }),
      info.useHttp && h(NeuralIcon, { name: 'Database', size: 12 }),
    ]);
  }
</script>

<template>
  <NeuralToolbar :data="toolbarData" title="页面" @click="handleClick">
    <template #prefix>
      <Select
        v-model="activePageId"
        class="w-40"
        size="small"
        :options="options"
        option-label="label"
        option-value="value"
      >
        <template #value="slotProps">
          <component :is="getOption(slotProps.value)" />
        </template>
        <template #option="slotProps">
          <component :is="getOption(slotProps.option.value)" />
        </template>
      </Select>
    </template>
  </NeuralToolbar>
</template>
