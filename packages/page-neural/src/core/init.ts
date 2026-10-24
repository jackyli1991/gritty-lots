// import { generateSplitterNode } from '@neural/core/layout/utils';
import type { PageNeuralStore } from '@neural/store';
// import type { Page } from '@neural/types';
// import { generateId } from '@neural/utils/uuid';

/**
 * 初始化 page-neural 数据：生成默认根布局与默认页面并关联，激活该页面。
 * 幂等：若已存在页面则直接返回，避免重复初始化。
 * @param store page-neural store 实例
 */
export function initPageNeural(store: PageNeuralStore) {
  if (store.pages.length) return;

  store.addPage();
}
