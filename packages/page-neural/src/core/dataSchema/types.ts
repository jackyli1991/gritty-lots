// json-schema.d.ts

/**
 * JSON Schema 类型定义 (兼容 draft-07 至 2020-12)
 * 使用方式: import { JSONSchema } from './json-schema'
 */
export type JSONSchema = JSONSchemaObject;

export interface JSONSchemaObject {
  // ===== 核心元数据 =====
  /** Schema 唯一标识符 */
  $id?: string;
  /** Schema 所遵循的 JSON Schema 版本 */
  $schema?: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 默认值 */
  default?: any;
  /** 是否已废弃 */
  deprecated?: boolean;
  /** 示例值（数组） */
  examples?: any[];
  /** 注释（仅供工具使用） */
  $comment?: string;

  // ===== 类型与基础校验 =====
  /** 允许的类型（单个或数组） */
  type?: JSONSchemaType | JSONSchemaType[];
  /** 枚举值列表 */
  enum?: any[];
  /** 常量值（仅允许精确匹配） */
  const?: any;

  // ===== 组合逻辑 =====
  /** 必须同时满足所有子 Schema */
  allOf?: JSONSchema[];
  /** 至少满足其中一个子 Schema */
  anyOf?: JSONSchema[];
  /** 有且仅有一个子 Schema 满足 */
  oneOf?: JSONSchema[];
  /** 必须不满足该子 Schema */
  not?: JSONSchema;

  // ===== 条件构造 =====
  /** 条件判断的 Schema */
  if?: JSONSchema;
  /** 满足 if 时的 Schema */
  then?: JSONSchema;
  /** 不满足 if 时的 Schema */
  else?: JSONSchema;

  // ===== 对象（Object）校验 =====
  /** 属性名到 Schema 的映射 */
  properties?: Record<string, JSONSchema>;
  /** 正则匹配的属性名到 Schema */
  patternProperties?: Record<string, JSONSchema>;
  /** 额外的属性，可为 Schema 或布尔值（false 禁止额外属性） */
  additionalProperties?: JSONSchema;
  /** 必须存在的属性名列表 */
  required?: string[];
  /** 属性名的 Schema 校验 */
  propertyNames?: JSONSchema;
  /** 最少属性数 */
  minProperties?: number;
  /** 最多属性数 */
  maxProperties?: number;
  /**
   * 依赖关系（旧版，建议使用 dependentRequired / dependentSchemas）
   * @deprecated
   */
  dependencies?: Record<string, JSONSchema | string[]>;
  /** 若存在某属性，则必须同时存在指定的其他属性 */
  dependentRequired?: Record<string, string[]>;
  /** 若存在某属性，则必须满足指定的 Schema */
  dependentSchemas?: Record<string, JSONSchema>;

  // ===== 数组（Array）校验 =====
  /** 元素 Schema（可为单个或元组数组） */
  items?: JSONSchema | JSONSchema[];
  /**
   * 额外的元素 Schema（用于元组，已弃用）
   * @deprecated
   */
  additionalItems?: JSONSchema;
  /** 最少元素数 */
  minItems?: number;
  /** 最多元素数 */
  maxItems?: number;
  /** 是否要求元素唯一 */
  uniqueItems?: boolean;
  /** 数组中必须至少有一个元素满足该 Schema */
  contains?: JSONSchema;
  /** 最少满足 contains 的元素个数 */
  minContains?: number;
  /** 最多满足 contains 的元素个数 */
  maxContains?: number;

  // ===== 字符串（String）校验 =====
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 正则匹配 */
  pattern?: string;
  /** 格式（如 email, uri, date-time 等） */
  format?: string;

  // ===== 数值（Number / Integer）校验 =====
  /** 最小值（包含） */
  minimum?: number;
  /** 最大值（包含） */
  maximum?: number;
  /** 最小值（不包含，或布尔值表示是否包含） */
  exclusiveMinimum?: number | boolean;
  /** 最大值（不包含，或布尔值表示是否包含） */
  exclusiveMaximum?: number | boolean;
  /** 必须是指定数字的倍数 */
  multipleOf?: number;

  // ===== 递归与引用 =====
  /** 引用其他 Schema（$id） */
  $ref?: string;
  /** 定义本地可复用的 Schema */
  $defs?: Record<string, JSONSchema>;
  /** 旧版定义（已弃用，建议使用 $defs） */
  definitions?: Record<string, JSONSchema>;
  /** 锚点（供 $ref 使用） */
  $anchor?: string;
  /** 动态引用（用于动态解析） */
  $dynamicRef?: string;
  /** 动态锚点 */
  $dynamicAnchor?: string;

  // ===== 只读/写入（用于数据交换） =====
  /** 只读（通常用于 API 响应） */
  readOnly?: boolean;
  /** 只写（通常用于 API 请求） */
  writeOnly?: boolean;

  // ===== 扩展：JSON Schema 标准还支持以下可选字段 =====
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: JSONSchema;

  // ===== 允许未知扩展 =====
  [key: string]: any;
}

export type JSONSchemaType =
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'
  | 'number'
  | 'integer'
  | 'string';
