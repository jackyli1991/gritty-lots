import { NeuralForm } from '@neural/components';
import type { PageNeuralStore } from '@neural/store';
import type { ModalOptions, FormOptions } from '@neural/types';
import Panel from 'primevue/panel';
import type { Component } from 'vue';
import { computed, h } from 'vue';

interface AttrConfigOptions {
  formMaps: Record<string, { formConfig: FormOptions; modalConfig: ModalOptions }>;
  store: PageNeuralStore;
}

export function useAttrConfig(options: AttrConfigOptions) {
  const attrConfigEl = computed<Component | null>(() => {
    if (!options.store) {
      return null;
    }
    const activeNode = options.store.activeNode;
    if (!activeNode) {
      return null;
    }
    const { type } = activeNode;
    const { formConfig, modalConfig } = options.formMaps[type];
    console.log('formConfig', type, activeNode.props);

    return h(
      Panel,
      {
        class: 'h-full ml-2 ' + modalConfig.class,
        header: modalConfig.header,
      },
      [
        h(NeuralForm, {
          key: activeNode.id,
          data: activeNode.props,
          ...formConfig,
          onSubmit: (data: Record<string, any>) => {
            console.log('提交数据', data);
            Object.assign(activeNode.props, data);
          },
          onClose: () => {},
        }),
      ]
    );
  });

  return {
    attrConfigEl,
  };
}
