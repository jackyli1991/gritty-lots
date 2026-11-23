/** 枚举项：label 为展示文本，value 为匹配值 */
export interface EnumOption {
  label: string;
  value: unknown;
}

/**
 * 查找匹配的枚举项
 * 数组形式按 value 严格匹配；数组项为字符串时按索引匹配 value；
 * 对象形式以 value 为键查找，返回对应的字符串或对象
 */
function findEnumEntry(data: unknown, value: unknown): EnumOption | string | undefined {
  if (Array.isArray(data)) {
    const matched = data.find(
      (item): item is EnumOption =>
        !!item && typeof item === 'object' && (item as EnumOption).value === value
    );
    if (matched) return matched;

    // 字符串数组：以数组索引作为 value 匹配
    if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
      const index = Number(value);
      if (Number.isInteger(index) && index >= 0 && index < data.length) {
        const item = data[index];
        if (typeof item === 'string') return item;
      }
    }
    return undefined;
  }
  if (data && typeof data === 'object') {
    return (data as Record<string, unknown>)[String(value)] as EnumOption | string | undefined;
  }
  return undefined;
}

/**
 * 从枚举数据中按 value 匹配提取 label
 * @param data 枚举数据（label/value 数组，或以 value 为键的对象；对象值为字符串时作为 label，为对象时取其 label 属性）
 * @param value 待匹配的值
 * @returns 匹配项的 label；未匹配时返回 undefined
 */
export function getEnumLabel(data: unknown, value: unknown): string | undefined {
  const option = findEnumEntry(data, value);
  if (typeof option === 'string') return option;
  return option?.label;
}

/**
 * 从枚举数据中按 value 匹配提取属性
 * @param data 枚举数据（label/value 数组，或以 value 为键的对象）
 * @param value 待匹配的值
 * @returns 匹配项除 label/value 外的属性（对象值为字符串时返回空对象）；未匹配时返回 undefined
 */
export function getEnumProps(data: unknown, value: unknown): Record<string, unknown> | undefined {
  const option = findEnumEntry(data, value);
  if (option == null) return undefined;
  if (typeof option === 'string') return {};
  // 排除label 和 value 属性
  const restProps = { ...option };
  delete (restProps as { label?: unknown }).label;
  delete restProps.value;
  return restProps;
}
