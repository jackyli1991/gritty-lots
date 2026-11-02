<script setup lang="ts">
  import { NeuralToolbar } from '@neural/components';
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
  import { computed, inject } from 'vue';

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const { neuralToastSuccess } = useNeuralToast();
  const { neuralConfirm } = useNeuralConfirm();
  // 页面切换：下拉选择当前页面，加号按钮新增页面
  const pageNeuralStore = usePageNeuralStore();
  const layoutStore = useLayoutStore();
  const { pages, activePageId, activePage } = storeToRefs(pageNeuralStore);

  const options = computed(() => pages.value.map((page) => ({ label: page.name, value: page.id })));

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
      },
      {
        label: '新增页面',
        icon: 'Plus',
        key: 'addPage',
      },
    ],
    [
      {
        label: '锁定布局',
        icon: 'Lock',
        key: 'lockLayout',
        hidden: layoutStore.locked,
      },
      {
        label: '编辑布局',
        icon: 'Unlock',
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
          const editPage = merge(
            { ...activePage.value },
            { name, description, props: { ...props } }
          );
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
        message: '解锁后可重新编辑布局，是否继续？',
        header: '编辑布局',
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
  } satisfies ActionTree;

  function handleClick(key: string) {
    invokeAction(actions, key as Paths<typeof actions>);
  }
</script>

<template>
  <div class="flex items-center gap-2">
    <Select
      v-model="activePageId"
      class="w-40"
      size="small"
      :options="options"
      option-label="label"
      option-value="value"
    />
    <NeuralToolbar :data="toolbarData" @click="handleClick" />
  </div>
</template>
