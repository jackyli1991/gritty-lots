<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import type { OpenModal } from '@neural/composables/userModal';
  import { useNeuralToast } from '@neural/composables/useToast';
  import { useNeuralConfirm } from '@neural/core/confirmDialog.vue';
  import { createPage } from '@neural/core/forms/page';
  import { usePageNeuralStore } from '@neural/store';
  // import { useLayoutStore } from '@neural/store/layout';
  import type { Page } from '@neural/types';
  import { merge } from 'lodash-es';
  import { storeToRefs } from 'pinia';
  import Button from 'primevue/button';
  import Select from 'primevue/select';
  import SpeedDial from 'primevue/speeddial';
  import { computed, h, inject } from 'vue';

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  const { neuralToastSuccess } = useNeuralToast();
  const { neuralConfirm } = useNeuralConfirm();
  // 页面切换：下拉选择当前页面，加号按钮新增页面
  const pageNeuralStore = usePageNeuralStore();
  const { pages, activePageId, activePage } = storeToRefs(pageNeuralStore);

  const options = computed(() => pages.value.map((page) => ({ label: page.name, value: page.id })));

  // 工具栏配置
  const toolbarData = computed(() => [
    {
      label: '新增页面',
      icon: h(NeuralIcon, { name: 'Plus' }),
      severity: 'primary',
      command: handleAddPage,
    },
    {
      label: '编辑页面',
      icon: h(NeuralIcon, { name: 'Edit' }),
      command: handleEditPage,
    },
    {
      label: '删除页面',
      icon: h(NeuralIcon, { name: 'Trash2', color: 'red' }),
      severity: 'danger',
      visible: !activePage.value || activePage.value?.deletable,
      command: handleDeletePage,
    },
    {
      label: '锁定页面',
      icon: h(NeuralIcon, { name: 'Lock' }),
      command: handleLockPage,
    },
    // {
    //   label: '确认布局',
    //   icon: h(NeuralIcon, { name: 'Check' }),
    //   severity: 'primary',
    //   visible: !activePage.value?.layoutLock,
    //   command: handleLockLayout,
    // },
    {
      label: '编辑布局',
      icon: h(NeuralIcon, { name: 'Layout' }),
      visible: activePage.value?.layoutLock,
      command: handleUnlockLayout,
    },
    {
      label: '数据源',
      icon: h(NeuralIcon, { name: 'Database' }),
      command: handleAddDataSource,
    },
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

  // 删除页面
  function handleDeletePage() {
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
  }

  // 锁定页面
  function handleLockPage() {
    // pageNeuralStore.setPageLock(true);
    neuralToastSuccess('to do');
  }

  // 锁定布局
  function handleLockLayout() {
    pageNeuralStore.setLayoutLock(true);
    neuralToastSuccess('已锁定');
    pageNeuralStore.ensureLayoutContainers();
  }

  // 解锁布局
  function handleUnlockLayout() {
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
  }

  // 新增数据源
  function handleAddDataSource() {
    if (!activePage.value) {
      return;
    }
    openModal?.({
      key: 'database',
      props: {},
      nodeData: {},
    });
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
  <div class="flex flex-col gap-1 text-gray-500">
    <div class="text-xs">页面</div>
    <div class="flex items-center gap-2">
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
      <span class="relative w-7 h-7">
        <SpeedDial
          :model="toolbarData"
          direction="down"
          :buttonProps="{ size: 'small', rounded: true, iconOnly: true }"
          :tooltipOptions="{ position: 'right', event: 'hover' }"
          :style="{ position: 'absolute', top: '0', right: '0' }"
        >
        </SpeedDial>
      </span>
      <Button v-if="!activePage?.layoutLock" size="small" variant="text" @click="handleLockLayout">
        <NeuralIcon :size="14" name="Check" />
        锁定布局
      </Button>
    </div>
  </div>
</template>
