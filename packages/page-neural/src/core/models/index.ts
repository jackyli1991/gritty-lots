import type { FormItemProps } from '@neural/components/form';
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
