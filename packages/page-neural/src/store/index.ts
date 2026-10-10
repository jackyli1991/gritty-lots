import { CONTAINER_ROOT_ID, CONTAINER_LAYOUT } from '@neural/const';
import { generateContainer, generateId } from '@neural/core/crud/utils';
import type { Container } from '@neural/types';
import { defineStore } from 'pinia';

//  `defineStore()` 的返回值的命名是自由的
// 但最好含有 store 的名字，且以 `use` 开头，以 `Store` 结尾。
// (比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。
export const usePageNeuralStore = defineStore('page-neural', {
  state: () => ({
    activeNodeId: CONTAINER_ROOT_ID, // 当前激活的节点id
    nodes: [],
    edges: [],
    containers: [
      // 页面根容器
      generateContainer({
        id: CONTAINER_ROOT_ID,
        name: '页面根容器',
        subType: CONTAINER_LAYOUT,
        props: {
          width: 100,
          height: 100,
        },
      }),
    ] as Container[],
  }),
  getters: {
    // 返回获取容器的函数
    getContainer: (state) => (id: string) => state.containers.find((item) => item.id === id),
  },
  actions: {
    // 添加容器
    addContainer(container: Container) {
      this.containers.push(container);
      // 如果有父容器，添加到父容器的子容器列表
      if (container.parentId) {
        const parent = this.containers.find((item) => item.id === container.parentId);
        if (parent) {
          parent.children.push(container.id);
        }
      }
      // 设置为当前激活的节点
      this.setActiveNodeId(container.id);
    },
    // 复制容器
    copyContainer(id: string) {
      const container = this.getContainer(id);
      if (!container) {
        return;
      }
      const newContainer = generateContainer({
        ...container,
        id: generateId(),
      });
      this.addContainer(newContainer);
    },
    // 删除容器
    deleteContainer(id: string) {
      if (id === CONTAINER_ROOT_ID) {
        return;
      }
      // 从父容器的children中删除
      const deleteContainer = this.containers.find((item) => item.id === id);
      if (deleteContainer && deleteContainer.parentId) {
        const parent = this.containers.find((item) => item.id === deleteContainer.parentId);
        if (parent) {
          parent.children = parent.children.filter((child) => child !== id);
        }
      }
      this.containers = this.containers.filter((item) => item.id !== id);
      this.setActiveNodeId('');
    },
    // 设置当前激活的节点id
    setActiveNodeId(id: string) {
      this.activeNodeId = id;
    },
  },
});
