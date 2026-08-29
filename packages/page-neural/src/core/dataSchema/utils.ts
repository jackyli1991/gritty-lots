import { useNeuralI18n } from '../../i18n';
import { type JSONSchemaObject, type JSONSchemaType } from './types';

const { t } = useNeuralI18n();

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

// 导出 JSON 数据
export function exportJSON(data: JSONSchemaObject, filename = 'json-schema.json') {
  // 1. 将数据转为 JSON 字符串（可格式化）
  const jsonStr = JSON.stringify(data, null, 2); // 缩进2空格

  // 2. 创建 Blob 对象
  const blob = new Blob([jsonStr], { type: 'application/json' });

  // 3. 创建临时下载链接
  const url = URL.createObjectURL(blob);

  // 4. 创建 <a> 标签并触发下载
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // 5. 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导入 JSON 数据
export function importJSON(file: File | undefined) {
  if (!file) {
    return Promise.reject(new Error(t('neural.jsonSchema.fileEmpty')));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target?.result as string));
      } catch {
        reject(new Error(t('neural.jsonSchema.jsonParseError')));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}
