import type { MaterialModule } from '@neural/types/materials';

// 统一收集 materials 目录下所有素材模块，新增目录无需改动此文件
const materialModules = import.meta.glob<{ default: MaterialModule }>('./*/index.ts', {
  eager: true,
});

// 素材大类：每个模块即一个大类，供素材面板与工具栏共用
export const materialTabs = Object.values(materialModules).map((mod) => {
  const module = mod.default;
  return {
    value: module.type,
    name: module.name,
    icon: module.icon,
    groups: module.list,
  };
});
