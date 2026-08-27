export const baseTypes = [
  {
    label: 'null',
    value: 'null',
    icon: 'Ban',
    backgroundColor: '#FFF8F7',
    color: '#D13415',
    description: '空值',
  },
  {
    label: 'string',
    value: 'string',
    icon: 'CaseSensitive',
    backgroundColor: '#FBF7FE',
    color: '#8145B5',
    description: '字符串类型',
  },
  {
    label: 'number',
    value: 'number',
    icon: 'Pi',
    backgroundColor: '#F4FAFF',
    color: '#0D74CE',
    description: '数字类型',
  },
  {
    label: 'boolean',
    value: 'boolean',
    icon: 'ToggleRight',
    backgroundColor: '#FFF7ED',
    color: '#CC4E00',
    description: '布尔类型',
  },
  {
    label: 'array',
    value: 'array',
    icon: 'Brackets',
    backgroundColor: '#FEF7FB',
    color: '#CF3897',
    description: '数组类型',
  },
  {
    label: 'object',
    value: 'object',
    icon: 'Braces',
    backgroundColor: '#F4FBF6',
    color: '#3E9B4F',
    children: true,
    description: '对象类型',
  },
];

export const combinationOptions = [
  {
    label: 'allOf', // 与
    value: 'allOf',
    icon: 'Ampersand',
    color: '#26997B',
    backgroundColor: '#E6F7ED',
    description: '所有选项都必须符合要求',
  },
  {
    label: 'anyOf', // 或
    value: 'anyOf',
    icon: 'Tally1',
    color: '#FFBA18',
    backgroundColor: '#FFF7C2',
    description: '至少有一个选项符合要求',
  },
  {
    label: 'oneOf', // 异或
    value: 'oneOf',
    icon: 'ChevronUp',
    color: '#8C7A5E',
    backgroundColor: '#F2F0E7',
    description: '只能有一个选项符合要求',
  },
];

export const SchemaTypes = [
  {
    label: '基础类型',
    options: baseTypes,
  },
  {
    label: '组合类型',
    options: combinationOptions,
  },
];

// json schema format options
export const formatOptions = [
  { value: 'date-time', label: 'date-time', description: 'RFC 3339 date-time' },
  { value: 'date', label: 'date', description: 'RFC 3339 full-date' },
  { value: 'time', label: 'time', description: 'RFC 3339 partial-time' },
  { value: 'duration', label: 'duration', description: 'ISO 8601 duration' },
  { value: 'email', label: 'email', description: '电子邮件地址' },
  { value: 'idn-email', label: 'idn-email', description: '国际化电子邮件地址' },
  { value: 'hostname', label: 'hostname', description: '主机名' },
  { value: 'idn-hostname', label: 'idn-hostname', description: '国际化主机名' },
  { value: 'ipv4', label: 'ipv4', description: 'IPv4地址' },
  { value: 'ipv6', label: 'ipv6', description: 'IPv6地址' },
  { value: 'uri', label: 'uri', description: '统一资源标识符' },
  { value: 'uri-reference', label: 'uri-reference', description: 'URI引用' },
  { value: 'uri-template', label: 'uri-template', description: 'URI模板' },
  { value: 'uuid', label: 'uuid', description: '通用唯一标识符' },
  { value: 'password', label: 'password', description: '密码字段' },
  { value: 'regex', label: 'regex', description: '正则表达式' },
  { value: 'json-pointer', label: 'json-pointer', description: 'JSON指针' },
  { value: 'relative-json-pointer', label: 'relative-json-pointer', description: '相对JSON指针' },
  { value: 'byte', label: 'byte', description: 'Base64编编码' },
  { value: 'binary', label: 'binary', description: '二进制数据' },
  { value: 'decimal', label: 'decimal', description: '十进制数' },
  { value: 'half', label: 'half', description: '半精度浮点数' },
  { value: 'float', label: 'float', description: '单精度浮点数' },
  { value: 'double', label: 'double', description: '双精度浮点数' },
];
