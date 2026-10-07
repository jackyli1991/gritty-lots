import { CONTAINER_ROOT_ID, CONTAINER_LAYOUT } from '@neural/const';
import { generateContainer } from '@neural/core/crud/utils';
import type { Container } from '@neural/types';
import { defineStore } from 'pinia';

//  `defineStore()` 的返回值的命名是自由的
// 但最好含有 store 的名字，且以 `use` 开头，以 `Store` 结尾。
// (比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。
export const usePageNeuralStore = defineStore('page-neural', {
  state: () => ({
    nodes: [],
    edges: [],
    containers: [
      generateContainer({ subType: CONTAINER_LAYOUT, id: CONTAINER_ROOT_ID, name: '页面容器' }),
    ] as Container[],
  }),
  getters: {
    // 根容器
    rootContainer: (state) => state.containers.find((item) => item.id === CONTAINER_ROOT_ID),
  },
  actions: {
    addContainer(container: Container) {
      this.containers.push(container);
      // 如果有父容器，添加到父容器的子容器列表
      if (container.parentId) {
        const parent = this.containers.find((item) => item.id === container.parentId);
        if (parent) {
          parent.children.push(container.id);
        }
      }
    },
  },
});
