// import { createContainer } from '@neural/core/forms/container';
// import { usePageNeuralStore } from '@neural/store';
import type { DragNodeOptions } from '@neural/types';

// 创建容器
// function generateContainer(options: Omit<DragNodeOptions, 'type'>) {
//   // console.log('createContainer', options);
//   const targetId: string = options.target?.id as string;
//   const { type, name } = options.source?.data || {};

//   const container: Container = createContainer({
//     subType: type,
//     parentId: targetId,
//     name,
//   });

//   console.log('createContainer', container);

//   // pageNeuralStore.addContainer(container);
// }

export function crud() {
  // const pageNeuralStore = usePageNeuralStore();

  // 创建节点总入口
  function createNode(options: DragNodeOptions) {
    const { type, ...rest } = options;
    console.log('createNode', type, rest);
    switch (type) {
    }
  }

  return {
    createNode,
  };
}
