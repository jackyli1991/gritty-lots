import { type JSONSchemaObject, type JSONSchemaType } from './types';

export function createField(fieldName?: string): {
  fieldName: string;
  jsonSchema: JSONSchemaObject;
} {
  return {
    fieldName: fieldName || `field${Date.now().toString().slice(-4)}`,
    jsonSchema: {
      type: 'string',
      title: '',
      description: '',
    },
  };
}

// 类型判断
export function is(str: JSONSchemaObject['type'], type: JSONSchemaType) {
  return str === type || (Array.isArray(str) && str.includes(type));
}
