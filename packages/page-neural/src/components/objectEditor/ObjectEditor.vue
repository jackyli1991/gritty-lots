<script setup lang="ts">
  import { isEqual } from 'lodash-es';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import SelectButton from 'primevue/selectbutton';
  import ToggleSwitch from 'primevue/toggleswitch';
  import { computed, nextTick, ref, watch } from 'vue';

  import { nestedFormControl, useFormControl } from '../../composables/useForm';
  import CodeMirror from '../codeMirror';
  import NeuralIcon from '../icon';

  type EditType = 'params' | 'json';
  type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'json';

  interface ParamItem {
    id: string;
    key: string;
    value: any;
    type: ValueType;
  }

  interface Props {
    modelValue?: Record<string, any> | string | null;
    name?: string;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
    name: undefined,
    invalid: false,
    disabled: false,
    placeholder: 'Value',
  });

  const emit = defineEmits<{
    'update:modelValue': [value: Record<string, any>];
  }>();

  const {
    formValue,
    invalid: formInvalid,
    writeValue,
  } = useFormControl({
    name: () => props.name,
    modelValue: () => props.modelValue,
    invalid: () => props.invalid,
    emit,
  });

  const isInvalid = computed(() => Boolean(formInvalid.value));

  const stateOptions = [
    { label: 'Params', value: 'params' },
    { label: 'JSON', value: 'json' },
  ];

  const typeOptions = [
    { label: '文本', value: 'string' },
    { label: '数字', value: 'number' },
    { label: '布尔', value: 'boolean' },
    { label: '空', value: 'null' },
    { label: 'JSON', value: 'json' },
  ];

  const editType = ref<EditType>('params');
  const valueObj = ref<ParamItem[]>([]);
  const jsonText = ref('');
  const jsonError = ref('');
  const rootEl = ref<HTMLElement>();

  let lastEmitted: Record<string, any> = {};
  let idSeed = 0;
  const nextId = () => `p-${++idSeed}`;

  const duplicateKeys = computed(() => {
    const counts = new Map<string, number>();
    for (const item of valueObj.value) {
      const key = item.key.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
  });

  const inferType = (value: unknown): ValueType => {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number' && Number.isFinite(value)) return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  };

  const toEditorValue = (value: unknown, type: ValueType) => {
    if (type === 'json') {
      return typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
    }
    if (type === 'null') return null;
    if (type === 'boolean') return Boolean(value);
    if (type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(num) ? String(num) : '';
    }
    if (value == null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const convertValue = (value: unknown, type: ValueType) => toEditorValue(value, type);

  const coerceValue = (item: ParamItem) => {
    switch (item.type) {
      case 'number': {
        const num = typeof item.value === 'number' ? item.value : Number(item.value);
        return Number.isFinite(num) ? num : 0;
      }
      case 'boolean':
        return item.value === true || item.value === 'true';
      case 'null':
        return null;
      case 'json': {
        if (typeof item.value !== 'string' || !item.value.trim()) return {};
        try {
          return JSON.parse(item.value);
        } catch {
          return item.value;
        }
      }
      default:
        return item.value ?? '';
    }
  };

  const jsonRowError = (item: ParamItem) => {
    if (item.type !== 'json' || typeof item.value !== 'string' || !item.value.trim()) return '';
    try {
      JSON.parse(item.value);
      return '';
    } catch (e: any) {
      return e?.message || 'JSON 格式错误';
    }
  };

  const normalizeToObject = (val: unknown): Record<string, any> => {
    if (val == null) return {};
    if (typeof val === 'string') {
      if (!val.trim()) return {};
      try {
        const parsed = JSON.parse(val);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }
    if (typeof val === 'object' && !Array.isArray(val)) return val as Record<string, any>;
    return {};
  };

  const paramsToObject = (items: ParamItem[]) => {
    const obj: Record<string, any> = {};
    for (const item of items) {
      const key = item.key?.trim();
      if (!key) continue;
      obj[key] = coerceValue(item);
    }
    return obj;
  };

  const syncObjectToParams = (obj: Record<string, any>) => {
    valueObj.value = Object.entries(obj).map(([key, value]) => {
      const type = inferType(value);
      return { id: nextId(), key, type, value: toEditorValue(value, type) };
    });
  };

  const syncObjectToJson = (obj: Record<string, any>) => {
    jsonText.value = Object.keys(obj).length ? JSON.stringify(obj, null, 2) : '';
    jsonError.value = '';
  };

  const commit = (obj: Record<string, any>) => {
    if (isEqual(obj, lastEmitted)) return;
    lastEmitted = obj;
    writeValue(obj);
  };

  const emitFromParams = () => {
    commit(paramsToObject(valueObj.value));
  };

  const emitFromJson = () => {
    const text = jsonText.value.trim();
    if (!text) {
      jsonError.value = '';
      commit({});
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('必须为 JSON 对象');
      }
      jsonError.value = '';
      commit(parsed);
    } catch (e: any) {
      jsonError.value = e?.message || 'JSON 格式错误';
    }
  };

  const applyExternal = (raw: unknown) => {
    const obj = normalizeToObject(raw);
    if (isEqual(obj, lastEmitted)) return;
    lastEmitted = obj;
    syncObjectToParams(obj);
    syncObjectToJson(obj);
  };

  watch(
    () => props.modelValue,
    (val) => applyExternal(val),
    { immediate: true, deep: true }
  );

  watch(
    formValue,
    (val) => {
      if (val === undefined) return;
      applyExternal(val);
    },
    { deep: true }
  );

  watch(
    valueObj,
    () => {
      if (editType.value === 'params') emitFromParams();
    },
    { deep: true }
  );

  watch(jsonText, () => {
    if (editType.value === 'json') emitFromJson();
  });

  const isModeOptionDisabled = (option: { value: EditType }) =>
    Boolean(jsonError.value && option.value === 'params');

  watch(editType, (type, prev) => {
    if (type === prev) return;
    if (type === 'json') syncObjectToJson(lastEmitted);
    else syncObjectToParams(lastEmitted);
  });

  const addParam = async () => {
    if (props.disabled) return;
    valueObj.value.push({ id: nextId(), key: '', value: '', type: 'string' });
    await nextTick();
    const inputs = rootEl.value?.querySelectorAll<HTMLInputElement>('[data-param-key]');
    inputs?.[inputs.length - 1]?.focus();
  };

  const deleteParam = (idx: number) => {
    if (props.disabled) return;
    valueObj.value.splice(idx, 1);
  };

  const onTypeChange = (item: ParamItem, type: ValueType) => {
    item.value = convertValue(item.value, type);
    item.type = type;
  };

  const onValueEnter = (idx: number) => {
    if (idx === valueObj.value.length - 1) addParam();
  };

  const formatJson = () => {
    if (props.disabled) return;
    const text = jsonText.value.trim() || '{}';
    try {
      const parsed = JSON.parse(text);
      jsonText.value = JSON.stringify(parsed, null, 2);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        jsonError.value = '必须为 JSON 对象';
      }
    } catch (e: any) {
      jsonError.value = e?.message || 'JSON 格式错误';
    }
  };
</script>

<template>
  <div ref="rootEl" class="w-full" :class="{ 'opacity-60 pointer-events-none': disabled }">
    <div class="flex justify-between items-center gap-2 mb-1">
      <SelectButton
        v-model="editType"
        :options="stateOptions"
        optionLabel="label"
        optionValue="value"
        :optionDisabled="isModeOptionDisabled"
        size="small"
        :allowEmpty="false"
        :disabled="disabled"
        :formControl="nestedFormControl"
      />
      <div class="flex items-center gap-1">
        <Button
          v-if="editType === 'json'"
          label="格式化"
          size="small"
          text
          severity="secondary"
          :disabled="disabled"
          @click="formatJson"
        />
        <NeuralIcon
          v-if="editType === 'params'"
          name="Plus"
          label="添加字段"
          class="cursor-pointer"
          @click="addParam"
        />
      </div>
    </div>

    <div v-if="editType === 'params'">
      <div
        v-if="!valueObj.length"
        class="py-2 text-center text-xs text-gray-400 dark:text-gray-500"
      >
        暂无参数，点击右上角 + 添加
      </div>
      <div v-else class="flex flex-col gap-1.5 mb-1">
        <div v-for="(item, idx) in valueObj" :key="item.id" class="flex flex-col gap-0.5">
          <div class="flex items-center gap-1">
            <InputText
              v-model="item.key"
              data-param-key
              placeholder="Key"
              size="small"
              class="w-[6.25rem] shrink-0"
              :class="{ 'p-invalid': duplicateKeys.has(item.key.trim()) }"
              :disabled="disabled"
              :invalid="duplicateKeys.has(item.key.trim())"
              :formControl="nestedFormControl"
            />
            <Select
              :modelValue="item.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              size="small"
              class="w-[5.5rem] shrink-0"
              :disabled="disabled"
              :formControl="nestedFormControl"
              @update:modelValue="(type) => onTypeChange(item, type)"
            />
            <InputText
              v-if="item.type === 'number'"
              v-model="item.value"
              size="small"
              fluid
              inputmode="decimal"
              :disabled="disabled"
              :formControl="nestedFormControl"
              class="flex-1 min-w-0"
              @keydown.enter.prevent="onValueEnter(idx)"
            />
            <ToggleSwitch
              v-else-if="item.type === 'boolean'"
              v-model="item.value"
              :disabled="disabled"
              :formControl="nestedFormControl"
              class="flex-1"
            />
            <InputText
              v-else-if="item.type === 'null'"
              modelValue="null"
              size="small"
              fluid
              disabled
              :formControl="nestedFormControl"
              class="flex-1 min-w-0"
            />
            <InputText
              v-else
              v-model="item.value"
              :placeholder="placeholder"
              size="small"
              fluid
              :disabled="disabled"
              :invalid="Boolean(jsonRowError(item))"
              :formControl="nestedFormControl"
              class="flex-1 min-w-0 font-mono"
              @keydown.enter.prevent="onValueEnter(idx)"
            />
            <NeuralIcon
              name="X"
              label="删除字段"
              class="shrink-0 cursor-pointer hover:text-red-500"
              @click="deleteParam(idx)"
            />
          </div>
          <small v-if="jsonRowError(item)" class="block text-xs text-red-500">
            {{ jsonRowError(item) }}
          </small>
        </div>
      </div>
      <small v-if="duplicateKeys.size" class="block text-xs text-amber-600 dark:text-amber-400">
        存在重复的 Key，后者会覆盖前者
      </small>
    </div>

    <div v-else>
      <CodeMirror
        v-model="jsonText"
        :editable="!disabled"
        class="rounded-md"
        :class="{ 'ring-1 ring-red-500': Boolean(jsonError) || isInvalid }"
      />
      <small v-if="jsonError" class="block mt-1 text-xs text-red-500">
        {{ jsonError }}，修正后才能切换到 Params
      </small>
    </div>
  </div>
</template>
