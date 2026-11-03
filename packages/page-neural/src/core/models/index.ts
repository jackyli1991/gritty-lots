import type { FormItemProps } from '@neural/components/form';
import { cloneDeep } from 'lodash-es';
import type { DefineComponent } from 'vue';

const models = import.meta.glob<{ default: DefineComponent }>('./*.ts', { eager: true });

interface ModelMap {
  model: Record<string, any>;
  getForm: (options: Record<string, any>) => FormItemProps;
}

const modelMaps = {} as Record<string, ModelMap>;

for (const key of Object.keys(models)) {
  const name = key.split('/').pop()!.split('.')[0];
  modelMaps[name] = models[key].default as unknown as ModelMap;
}

export { modelMaps };

/**
 * 获取表单 schema
 * @param fields 表单项名称数组
 * @returns 表单 schema 数组
 */
export function getFormSchema(fields: string[]) {
  return fields.map((item: any) => ({
    ...modelMaps[item].getForm({}),
    schemaName: item,
  }));
}

/**
 * 获取表单数据
 * @param fields 表单项名称数组
 * @returns 表单数据对象
 */
export function getFormModel(fields: string[]) {
  return fields.reduce(
    (acc, cur) => ({
      ...acc,
      // 深拷贝避免各节点共享 model 单例中的嵌套对象引用
      [cur]: cloneDeep(modelMaps[cur].model),
    }),
    {}
  );
}
