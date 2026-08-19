import { type JSONSchemaObject } from './types';

export function createField(fieldName?: string): {
  fieldName: string;
  jsonSchema: JSONSchemaObject;
} {
  return {
    fieldName: fieldName || `field${Date.now()}`,
    jsonSchema: {
      type: 'string',
      title: '',
      description: '',
    },
  };
}
