<template>
  <!-- $form 是表单实例，包含 states、handleSubmit、reset、validate -->
  <Form
    ref="formRef"
    v-slot="$form"
    :resolver="resolver"
    :initialValues="dataSource"
    @submit="onSubmit"
  >
    <div :class="`grid grid-cols-${props.columns} gap-x-2 gap-y-1`">
      <template v-for="(schemaItem, index) in resolvedSchema" :key="schemaItem.fieldName || index">
        <template v-if="!schemaItem.hidden">
          <template v-if="schemaItem.formGroup && schemaItem.children?.length">
            <component
              class="w-full col-span-full"
              :is="components[schemaItem.component || 'Fieldset']"
              v-show="schemaItem.visible !== false"
              v-bind="{
                ...schemaItem.componentProps,
                legend: schemaItem.label,
                header: schemaItem.label,
                toggleable: true,
                dt: {
                  background: '#fafafa',
                },
              }"
              :collapsed="
                props.fieldSetCollapsable ? activeFieldset !== index : collapsedFieldsets.has(index)
              "
              @update:collapsed="(val: boolean) => onToggleFieldset(index, val)"
            >
              <div :class="`grid grid-cols-${props.columns} gap-x-2 gap-y-1`">
                <template
                  v-for="(item, childIndex) in schemaItem.children"
                  :key="item.fieldName || childIndex"
                >
                  <FormItem
                    v-if="!item.hidden"
                    v-show="item.visible !== false"
                    :class="item.class"
                    :label="item.label"
                    :showLabel="item.showLabel"
                    :name="item.fieldName as string"
                    :required="item.required"
                    :help="item.help"
                    :tips="item.tips"
                  >
                    <template #default="{ field }">
                      <!-- renderComponent 优先：传入的绑定会经 cloneVNode 合并进自定义 VNode -->
                      <component
                        :is="item.renderComponent || components[item.component || 'InputText']"
                        :name="item.fieldName"
                        :invalid="field.invalid"
                        :modelValue="field.value"
                        v-bind="getComponentAttrs(item)"
                        class="w-full"
                        size="small"
                        @update:modelValue="
                          (value: unknown) => handleChange(field, value, item.fieldName)
                        "
                      >
                      </component>
                    </template>
                  </FormItem>
                </template>
              </div>
            </component>
          </template>
          <template v-else>
            <FormItem
              v-show="schemaItem.visible !== false"
              :class="schemaItem.class"
              :label="schemaItem.label"
              :showLabel="schemaItem.showLabel"
              :name="schemaItem.fieldName as string"
              :required="schemaItem.required"
              :help="schemaItem.help"
              :tips="schemaItem.tips"
            >
              <template #default="{ field }">
                <!-- renderComponent 优先：传入的绑定会经 cloneVNode 合并进自定义 VNode -->
                <component
                  :is="
                    schemaItem.renderComponent || components[schemaItem.component || 'InputText']
                  "
                  :name="schemaItem.fieldName"
                  :invalid="field.invalid"
                  :modelValue="field.value"
                  v-bind="getComponentAttrs(schemaItem)"
                  class="w-full"
                  size="small"
                  @update:modelValue="
                    (value: unknown) => handleChange(field, value, schemaItem.fieldName)
                  "
                />
              </template>
            </FormItem>
          </template>
        </template>
      </template>
    </div>
    <div v-if="!props.autoComplete" class="flex w-full justify-end gap-2 mt-4">
      <Button type="button" :label="props.resetText" variant="text" @click="onResetForm($form)" />
      <div class="flex-1 flex justify-end gap-2">
        <Button type="button" :label="props.closeText" severity="secondary" @click="onClose" />
        <Button type="submit" :label="props.submitText" :loading="loading" />
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
  import type { FormFieldState, FormInstance } from '@primevue/forms';
  import { Form } from '@primevue/forms';
  import { zodResolver } from '@primevue/forms/resolvers/zod'; // 重点！resolver单独路径
  import Button from 'primevue/button';
  import { computed, reactive, ref } from 'vue';

  import FormItem from './FormItem.vue';
  import * as components from './register';
  import type { FormItemProps } from './types';

  // 直接从 zodResolver 签名推导 schema 入参类型，避免直接引用 zod 的 Schema
  type ResolverSchema = Parameters<typeof zodResolver>[0];

  interface Props {
    data?: Record<string, any>;
    columns: number; // 表单列数，默认 1
    schema: FormItemProps[];
    rules: ResolverSchema;
    autoComplete?: boolean; // 是否自动更新数据，默认 true
    submitText?: string; // 提交按钮文本，默认 '提交'
    resetText?: string; // 重置按钮文本，默认 '重置'
    closeText?: string; // 关闭按钮文本，默认 '关闭'
    fieldSetCollapsable?: boolean; // 手风琴模式，默认 false
  }

  const loading = ref(false);

  /** 当前展开的 Fieldset 索引（手风琴模式：同时只展开一个） */
  const activeFieldset = ref<number | null>(0);

  /** 非手风琴模式下，记录所有已折叠的 Fieldset 索引（空 = 全部展开） */
  const collapsedFieldsets = ref<Set<number>>(new Set());

  /**
   * 切换 Fieldset 展开状态
   * @param index 当前 Fieldset 索引
   * @param collapsed collapsed=true 表示折叠，false 表示展开
   */
  const onToggleFieldset = (index: number, collapsed: boolean) => {
    if (props.fieldSetCollapsable) {
      // 手风琴：折叠当前展开的，或展开新的 index
      activeFieldset.value = collapsed ? null : index;
    } else {
      // 全部可独立展开/折叠；空 Set 表示全部展开
      if (collapsed) {
        collapsedFieldsets.value.add(index);
      } else {
        collapsedFieldsets.value.delete(index);
      }
      // Set mutation 不触发响应式，重新赋值
      collapsedFieldsets.value = new Set(collapsedFieldsets.value);
    }
  };

  const props = withDefaults(defineProps<Props>(), {
    autoComplete: true,
    fieldSetCollapsable: true,
    submitText: '提交',
    resetText: '重置',
    closeText: '关闭',
  });

  const emit = defineEmits(['submit', 'close']);

  /** v-model 绑定值，优先使用；未传时回退到 data prop */
  const model = defineModel<Record<string, any>>();

  /** 数据源：优先使用 v-model（modelValue），其次使用 data prop */
  const dataSource = computed<Record<string, any>>(() => model.value ?? props.data ?? {});

  /** 表单实例引用，供联动 formContextApi 使用 */
  const formRef = ref<FormInstance | null>(null);

  /** 表单当前值。不依赖 autoComplete，字段变更时手动同步，供联动 resolve 使用 */
  const formValues = ref<Record<string, any>>({ ...dataSource.value });

  /** 各表单项的联动结果，key 为 fieldName（无 fieldName 的分组使用路径 key） */
  const dependencyOverrides = reactive<Record<string, Partial<FormItemProps>>>({});

  /** 生成稳定的表单项 key */
  const getItemKey = (item: FormItemProps, path: number[]) =>
    item.fieldName || `group-${path.join('-')}`;

  /** 合并联动结果与原始配置 */
  const mergeItem = (item: FormItemProps, key: string): FormItemProps => {
    const override = dependencyOverrides[key];
    if (!override) return item;
    return {
      ...item,
      ...override,
      // componentProps 做一层合并，避免联动只更新部分属性时丢失原有配置
      componentProps: override.componentProps
        ? { ...item.componentProps, ...override.componentProps }
        : item.componentProps,
    };
  };

  /** 递归收集所有表单项（含分组 children）及其稳定 key */
  const collectDependencyItems = (
    items: FormItemProps[],
    basePath: number[] = []
  ): { item: FormItemProps; key: string }[] =>
    items.flatMap((item, index) => {
      const path = [...basePath, index];
      return [
        { item, key: getItemKey(item, path) },
        ...(item.children?.length ? collectDependencyItems(item.children, path) : []),
      ];
    });

  /**
   * 执行字段联动
   * @param changedField 变更字段名；传入时仅重算 trigger 命中的联动项，不传则全量求值
   */
  const runDependencies = (changedField?: string) => {
    collectDependencyItems(props.schema).forEach(({ item, key }) => {
      const dependency = item.dependencies;
      if (!dependency?.resolve) return;
      const triggers = dependency.trigger ?? [];
      if (changedField && !triggers.includes(changedField)) return;
      try {
        const result = dependency.resolve({
          values: formValues.value,
          schema: item,
          formContextApi,
        });
        dependencyOverrides[key] = result ?? {};
      } catch (error) {
        console.error(`[NeuralForm] 字段联动执行失败：${key}`, error);
      }
    });
  };

  /** 惰性委托的表单实例（初始化阶段 formRef 尚未挂载） */
  const formContextApi: FormInstance = {
    get states() {
      return formRef.value?.states ?? {};
    },
    get fields() {
      return formRef.value?.fields ?? {};
    },
    get valid() {
      return formRef.value?.valid ?? true;
    },
    setFieldValue: (field, value) => formRef.value?.setFieldValue(field, value),
    getFieldState: (field) => formRef.value?.getFieldState(field),
    setValues: (values) => formRef.value?.setValues(values),
    validate: async (field) => formRef.value?.validate(field) ?? { errors: {} },
    reset: () => formRef.value?.reset(),
    submit: () => formRef.value?.submit(),
    register: (field, options) => formRef.value?.register(field, options),
    unregister: (field) => formRef.value?.unregister(field),
    defineField: (field, options) => formRef.value?.defineField(field, options) ?? [],
  };

  /** 应用联动结果后的 schema（含 children） */
  const resolvedSchema = computed<FormItemProps[]>(() =>
    props.schema.map((item, index) => {
      const key = getItemKey(item, [index]);
      const resolved = mergeItem(item, key);
      if (!resolved.children?.length) {
        return resolved;
      }
      return {
        ...resolved,
        children: resolved.children.map((child, childIndex) =>
          mergeItem(child, getItemKey(child, [index, childIndex]))
        ),
      };
    })
  );

  /** 需要跳过校验的字段：hidden 或联动结果为 required: false */
  const suppressedFields = computed(() => {
    const names = new Set<string>();
    collectDependencyItems(props.schema).forEach(({ item, key }) => {
      const override = dependencyOverrides[key];
      if (!item.fieldName || !override) return;
      if (override.hidden === true || override.required === false) {
        names.add(item.fieldName);
      }
    });
    return names;
  });

  /** 判断校验错误 key 是否属于被跳过的字段（兼容 data.list / data[0] 形式的路径） */
  const isSuppressedErrorKey = (key: string, names: Set<string>) =>
    [...names].some(
      (name) => key === name || key.startsWith(`${name}.`) || key.startsWith(`${name}[`)
    );

  // 验证规则：在 zodResolver 结果上剔除 hidden / required:false 字段的校验错误
  const resolver = computed(() => {
    const baseResolver = zodResolver(props.rules);
    console.log('baseResolver', props.rules);
    return async (options: any) => {
      const result = await baseResolver(options);
      const errors = result?.errors;
      if (!errors || suppressedFields.value.size === 0) {
        return result;
      }
      Object.keys(errors).forEach((key) => {
        if (isSuppressedErrorKey(key, suppressedFields.value)) {
          delete errors[key];
        }
      });
      return result;
    };
  });

  /** 更新数据源字段值，并同步联动使用的表单值 */
  const setField = (field: string, value: unknown) => {
    if (!field) return;
    // autoComplete 关闭时也要保证联动能拿到最新值
    formValues.value = { ...formValues.value, [field]: value };
    if (!props.autoComplete) return;
    if (model.value !== undefined) {
      model.value = { ...model.value, [field]: value };
    } else if (props.data) {
      props.data[field] = value;
    }
  };

  // 提取额外的 modelValues：key 是组件 prop 名（如 selectValue），value 是数据字段名（如 widthUnit）
  // 生成符合 Vue 3 v-model:xxx 规范的绑定对：prop + onUpdate:prop 事件监听器
  const getExtraModelValues = (item: FormItemProps) => {
    const modelValues = item.modelValues;
    if (!modelValues) {
      return {};
    }
    const obj: Record<string, any> = {};
    Object.entries(modelValues).forEach(([propName, dataField]) => {
      obj[propName] = dataSource.value[dataField];
      obj[`onUpdate:${propName}`] = (value: unknown) => {
        setField(dataField, value);
        runDependencies(dataField);
      };
    });
    return obj;
  };

  /** 组件绑定属性：合并 componentProps、额外双向绑定与顶层 disabled */
  const getComponentAttrs = (item: FormItemProps) => ({
    ...item.componentProps,
    ...getExtraModelValues(item),
    ...(item.disabled !== undefined ? { disabled: item.disabled } : {}),
  });

  // 处理字段值变化。事件参数才是新值，field.value 此时仍是更新前的值。
  const handleChange = (
    field: FormFieldState & { onChange?: (event: { value: unknown }) => void },
    value: unknown,
    fieldName?: string
  ) => {
    field.onChange?.({ value });
    if (fieldName) {
      setField(fieldName, value);
      runDependencies(fieldName);
    }
  };

  /** 重置：重置表单实例，并同步重置联动使用的表单值与联动状态 */
  const onResetForm = ($form: { reset: () => void }) => {
    $form.reset();
    formValues.value = { ...dataSource.value };
    runDependencies();
  };

  // 表单提交
  const onSubmit = async (values: any) => {
    try {
      loading.value = true;
      // 验证表单数据
      if (!values.valid) {
        return;
      }
      // console.log('表单数据', values, props.data);
      const formData: Record<string, any> = {};
      Object.keys(values.states).forEach((key) => {
        formData[key] = values.states[key].value;
      });
      emit('submit', formData);
    } finally {
      loading.value = false;
    }
  };

  // 关闭表单
  const onClose = () => {
    emit('close');
  };

  // 初始化联动，避免首屏闪现应隐藏的字段
  runDependencies();
</script>
