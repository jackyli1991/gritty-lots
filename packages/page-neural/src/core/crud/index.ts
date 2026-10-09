import { CONTAINER_TYPE } from '@neural/const';
import { usePageNeuralStore } from '@neural/store';
import type { DragNodeOptions, Container } from '@neural/types';

import { generateContainer } from './utils';

export function crud() {
  const pageNeuralStore = usePageNeuralStore();

  // 创建节点总入口
  function createNode(options: DragNodeOptions) {
    const { type, ...rest } = options;
    switch (type) {
      case CONTAINER_TYPE:
        createContainer(rest);
        break;
    }
  }

  // 创建容器
  function createContainer(options: Omit<DragNodeOptions, 'type'>) {
    console.log('createContainer', options);
    const targetId: string = options.target?.id as string;
    const { type, name } = options.source?.data || {};

    const container: Container = generateContainer({
      subType: type,
      parentId: targetId,
      name,
    });

    pageNeuralStore.addContainer(container);
  }

  return {
    createNode,
  };
}
