export type ActionTree = {
  [K: string]: ActionTree | ((...args: any[]) => any);
};

// ===== 类型部分（沿用之前）=====
export type Paths<T> = T extends (...args: any[]) => any
  ? never
  : {
      [K in keyof T & string]: T[K] extends (...args: any[]) => any
        ? `${K}` | `${K}.${Paths<T[K]>}`
        : `${K}` | `${K}.${Paths<T[K]>}`;
    }[keyof T & string];

type GetActionByPath<T, P extends string> = P extends `${infer A}.${infer B}`
  ? T extends Record<A, any>
    ? GetActionByPath<T[A], B>
    : never
  : T extends Record<P, any>
    ? T[P]
    : never;

// ===== 运行时收集路径：字符串格式 =====
export function collectActionPaths(tree: ActionTree): string[] {
  const result: string[] = [];
  function recurse(node: ActionTree, prefix: string) {
    for (const [key, val] of Object.entries(node)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      if (typeof val === 'function') {
        result.push(currentPath);
      } else {
        recurse(val, currentPath);
      }
    }
  }
  recurse(tree, '');
  return result;
}

// ===== 运行时收集路径：数组格式（推荐深层树） =====
export function collectActionPathArrays(tree: ActionTree): string[][] {
  const result: string[][] = [];
  function recurse(node: ActionTree, path: string[]) {
    for (const [key, val] of Object.entries(node)) {
      const nextPath = [...path, key];
      if (typeof val === 'function') {
        result.push(nextPath);
      } else {
        recurse(val, nextPath);
      }
    }
  }
  recurse(tree, []);
  return result;
}

// ===== invokeAction 字符串版本 =====
export function invokeAction<T extends ActionTree, P extends Paths<T>>(
  tree: T,
  path: P,
  ...args: Parameters<GetActionByPath<T, P>>
): ReturnType<GetActionByPath<T, P>> {
  const keys = path.split('.');
  let current: any = tree;
  for (const key of keys) {
    current = current[key];
    if (current === undefined) throw new Error(`Action path "${path}" not found at key: ${key}`);
  }
  if (typeof current !== 'function') throw new Error(`"${path}" is not a function`);
  return current(...args);
}

// 运行时拿到所有action路径
// const strPaths = collectActionPaths(actions);
// ["container.add", "container.setting", "container.delete.confirm", "request"]

// const arrPaths = collectActionPathArrays(actions);
// [["container","add"],["container","setting"],["container","delete","confirm"],["request"]]

// 调用示例
// invokeAction(actions, 'container.delete.confirm', '确认删除');
