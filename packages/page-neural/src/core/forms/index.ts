import type { FormOptions, ModalOptions } from '@neural/types';
import type { DefineComponent } from 'vue';

const forms = import.meta.glob<{ default: DefineComponent }>('./*.ts', { eager: true });

interface FormMap {
  formConfig: FormOptions;
  modalConfig: ModalOptions;
}

const formMaps = {} as Record<string, FormMap>;

for (const key of Object.keys(forms)) {
  const name = key.split('/').pop()!.split('.')[0];
  formMaps[name] = forms[key].default as unknown as FormMap;
}

export { formMaps };
