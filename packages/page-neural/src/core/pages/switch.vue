<script setup lang="ts">
  import { NeuralIcon } from '@neural/components';
  import type { OpenModal } from '@neural/composables/userModal';
  import { createPage } from '@neural/core/forms/page';
  import { usePageNeuralStore } from '@neural/store';
  import { storeToRefs } from 'pinia';
  import Button from 'primeVue/button';
  import Select from 'primeVue/select';
  import { computed, inject } from 'vue';

  // 由最外层 core/index.vue 注入，此处不再创建独立弹窗实例
  const openModal = inject<OpenModal | null>('neural-modal', null);

  // 页面切换：下拉选择当前页面，加号按钮新增页面
  const pageNeuralStore = usePageNeuralStore();
  const { pages, activePageId } = storeToRefs(pageNeuralStore);

  const options = computed(() => pages.value.map((page) => ({ label: page.name, value: page.id })));

  function handleAddPage() {
    const newPage = createPage({});
    openModal?.({
      key: 'page',
      props: newPage.props,
      nodeData: newPage,
      formConfig: {
        submitText: '新增页面',
        onSubmit: async (key, data) => {
          console.log('提交数据', key, data);
          newPage.name = data.name;
          newPage.description = data.description;
          newPage.props.requestModel = data.requestModel;
          // 新增页面逻辑
          pageNeuralStore.addPage(newPage);
        },
      },
    });
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
    <Button iconOnly size="small" @click="handleAddPage">
      <NeuralIcon name="Plus" />
    </Button>
  </div>
</template>
