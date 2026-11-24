import type { TableColumnAlign, TableColumnFixed, TableColumnType } from '@neural/types/table';
import type { Component } from 'vue';

import { ALIGN_OPTIONS, FIXED_OPTIONS } from './options';

export type { TableColumnAlign, TableColumnFixed };
export { ALIGN_OPTIONS, FIXED_OPTIONS };

/** 列类型元数据：title 显示名称 / type 类型键 / single 是否单例 / icon 图标 / isData 是否数据列 / mutex 互斥组 */
export interface TableColumnMeta {
  /** 列类型键 */
  type: TableColumnType;
  /** 显示名称 */
  title: string;
  /** 是否单例（整个表格最多存在一个） */
  single: boolean;
  /** 图标名称 */
  icon: string;
  /** 是否数据列（需要 field/width/align 等字段） */
  isData: boolean;
  /**
   * 互斥组标识：同一互斥组内的所有类型不能同时出现在一张表格中。
   * 例如单选列与多选列同属 "select" 组，只能二选一。
   */
  mutex?: string;
  /** 列渲染组件 */
  component?: Component;
}

/** 所有列类型的统一元数据源（内置结构型列 + 注册追加） */
export const TABLE_COLUMN_META: TableColumnMeta[] = [
  {
    type: 'selection',
    title: '单选列',
    single: true,
    icon: 'CircleDot',
    isData: false,
    mutex: 'select',
  },
  {
    type: 'multiSelection',
    title: '多选列',
    single: true,
    icon: 'SquareCheck',
    isData: false,
    mutex: 'select',
  },
  { type: 'index', title: '序号列', single: true, icon: 'Hash', isData: false },
  // { type: 'action', title: '操作', single: true, icon: 'MousePointerClick', isData: false },
];

/** 类型键 → 元数据的快速映射 */
const META_BY_TYPE = new Map<TableColumnType, TableColumnMeta>(
  TABLE_COLUMN_META.map((meta) => [meta.type, meta])
);

/** 所有列类型数组，保持 TABLE_COLUMN_META 的顺序 */
export const ALL_TYPE_VALUES: TableColumnType[] = TABLE_COLUMN_META.map((m) => m.type);

/** 列类型显示名称，供配置面板的下拉选项使用 */
export const TABLE_COLUMN_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TABLE_COLUMN_META.map((m) => [m.type, m.title])
) as Record<string, string>;

/** 列类型图标 */
export const TYPE_ICON: Record<string, string> = Object.fromEntries(
  TABLE_COLUMN_META.map((m) => [m.type, m.icon])
) as Record<string, string>;

/** 单例列类型：表格中最多存在一个 */
export const SINGLETON_COLUMN_TYPES: Set<TableColumnType> = new Set(
  TABLE_COLUMN_META.filter((m) => m.single).map((m) => m.type)
);

/** 数据列类型集合：需要 field/width/align 等字段的类型 */
export const DATA_COLUMN_TYPES: Set<TableColumnType> = new Set(
  TABLE_COLUMN_META.filter((m) => m.isData).map((m) => m.type)
);

/** 判断列类型是否已注册 */
export function hasColumnType(type: TableColumnType): boolean {
  return META_BY_TYPE.has(type);
}

/**
 * 追加列元数据，并同步所有派生索引。
 * 重复检测由调用方（registerTableColumn）负责。
 */
export function addColumnMeta(meta: TableColumnMeta): void {
  TABLE_COLUMN_META.push(meta);
  META_BY_TYPE.set(meta.type, meta);
  ALL_TYPE_VALUES.push(meta.type);
  TABLE_COLUMN_TYPE_LABEL[meta.type] = meta.title;
  TYPE_ICON[meta.type] = meta.icon;
  if (meta.single) SINGLETON_COLUMN_TYPES.add(meta.type);
  if (meta.isData) DATA_COLUMN_TYPES.add(meta.type);
}

/** 是否为数据列（需要绑定字段的列类型） */
export function isDataColumn(type: TableColumnType): boolean {
  return META_BY_TYPE.get(type)?.isData ?? false;
}

/** 是否为操作列（需要绑定按钮的列类型） */
export function isOperationColumn(type: TableColumnType): boolean {
  return META_BY_TYPE.get(type)?.type === 'action';
}

/** 是否为单例列（整个表格最多存在一个） */
export function isSingletonColumn(type: TableColumnType): boolean {
  return META_BY_TYPE.get(type)?.single ?? false;
}

/** 是否属于互斥组（同组内类型不能同时存在） */
export function isMutexColumn(type: TableColumnType): boolean {
  return !!META_BY_TYPE.get(type)?.mutex;
}

/**
 * 根据现有列类型，返回当前被阻塞的列类型集合（无法再添加）。
 * 覆盖两类规则：
 *   1. 单例规则：single === true 的类型，若已存在则无法再次添加
 *   2. 互斥规则：同一 mutex 组内若任意类型已存在，则组内所有类型均被阻塞
 */
export function getBlockedColumnTypes(
  existing: readonly TableColumnType[]
): ReadonlySet<TableColumnType> {
  const occupied = new Set(existing);
  const blocked = new Set<TableColumnType>();

  for (const meta of TABLE_COLUMN_META) {
    // 规则 1：单例已被占用
    if (meta.single && occupied.has(meta.type)) {
      blocked.add(meta.type);
    }
    // 规则 2：互斥组内任意成员已占用 → 组内全部类型阻塞
    if (meta.mutex) {
      const groupOccupied = TABLE_COLUMN_META.some(
        (m) => m.mutex === meta.mutex && occupied.has(m.type)
      );
      if (groupOccupied) {
        for (const m of TABLE_COLUMN_META) {
          if (m.mutex === meta.mutex) blocked.add(m.type);
        }
      }
    }
  }

  return blocked;
}

/** 基于 blocked 集合，判断某类型是否可用（用于按钮禁用 / Select optionDisabled） */
export function isColumnTypeBlocked(
  type: TableColumnType,
  existing: readonly TableColumnType[]
): boolean {
  return getBlockedColumnTypes(existing).has(type);
}

/** 根据类型键获取完整元数据 */
export function getColumnMeta(type: TableColumnType): TableColumnMeta | undefined {
  return META_BY_TYPE.get(type);
}

// ---------- 以下为与列类型无关的其他配置（已迁移至 options.ts） ----------
