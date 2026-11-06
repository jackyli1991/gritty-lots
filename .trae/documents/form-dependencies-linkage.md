# 表单字段联动（dependencies）实现计划

## 概要

为 `packages/page-neural/src/components/form/Form.vue` 增加基于 `dependencies` 配置的字段联动能力，使 `core/forms/*.ts` 中的 schema 可以声明：

```ts
dependencies: {
  trigger: ['type'], // 触发字段（可多选），字段 onChange 时触发
  resolve: ({ values, schema, formContextApi }) => ({
    hidden: values.type !== 'http', // 返回当前表单项的局部配置更新
  }),
}
```

`resolve` 返回值会与原始 schema 合并，支持联动控制 `hidden`（不渲染 + 跳过校验）、`visible`（保留值仅视觉隐藏）、`disabled`、`required`（required:false 跳过该校验）以及其它任意表单项配置（如 `label`、`tips`、`componentProps`）。

## 现状分析

- [Form.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/form/Form.vue) 通过 PrimeVue `Form` + `FormField` 渲染整份 `props.schema`；目前完全没有读取 `dependencies`，也从未使用 `hidden` / `disabled` / `required` 之外的联动。
- [types.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/form/types.ts#L4-L20) 已有 `hidden`、`disabled` 字段，但 `dependencies?: Record<string, any>` 未定义结构；也没有 `visible`。
- [request.ts](file:///d:/workspace/gritty-lots/packages/page-neural/src/core/forms/request.ts#L47-L54) 已给出 `dependencies.trigger/resolve` 的期望用法，因 `resolve` 未被调用，当前无法隐藏 `url`。
- `Form.vue` 中现有一个隐患：`handleChange` 用 `field.name` 判断字段名，但 `FormField` 的插槽作用域只在 `field.props.name` 上，`field.name` 恒为 `undefined`，因此 `setField` 实际从未被调用。本次联动需要可靠拿到字段名，改为显式传入 schema 的 `fieldName`。
- 表单校验由 `zodResolver(props.rules)` 提供（[Form.vue](file:///d:/workspace/gritty-lots/packages/page-neural/src/components/form/Form.vue#L193-L195)）。PrimeVue 的 `FormField` 卸载时会 `unregister` 并从表单 states 中删除该字段，所以 `hidden`（v-if）会让字段既不出现在提交数据，也不再参与校验；但 `rules` 中的必填规则仍可能对“字段缺失”报错，需要在 resolver 层按字段过滤错误。
- 表单实例可从 `<Form ref="formRef">` 取到（PrimeVue Form 的 `setup()` 返回值包含 `states/fields/validate/reset/setFieldValue/setValues/...`），可用于 `formContextApi`。

## 设计决策（已与用户确认）

1. **hidden**：不渲染（`v-if`），字段从表单 states 中移除，提交数据不含该字段，并跳过其校验错误。
2. **visible**：新增配置；`v-show` 仅视觉隐藏，字段保持挂载，保留值并照常参与校验。
3. **required: false**：除控制必填星号外，同时跳过该字段的校验错误（从 resolver 结果中剔除该字段的错误）；`required: true` 仍依赖 `rules` 中已有的规则。
4. **触发时机**：`dependencies.resolve` 在初始化（setup 阶段同步执行，避免首屏闪现隐藏字段）、reset 时全量求值；在字段 `onChange` 时，仅重算 `trigger` 包含该字段（或 `trigger` 未配置时按“任意变更不触发”）的联动项。
5. **返回值合并**：`{ ...item, ...resolveResult }`，其中 `componentProps` 做一层合并（`{ ...item.componentProps, ...result.componentProps }`），避免联动的 `componentProps` 覆盖掉原有属性。

## 具体改动

### 1. `packages/page-neural/src/components/form/types.ts`

补充类型定义：

```ts
import type { FormInstance } from '@primevue/forms';

/** 联动 resolve 回调参数 */
export interface FormDependencyContext {
  values: Record<string, any>; // 最新表单数据
  schema: FormItemProps; // 当前表单项配置
  formContextApi: FormInstance; // 表单实例
}

/** 表单项联动配置 */
export interface FormItemDependencies {
  trigger?: string[]; // 触发联动的字段，可多选；字段 onChange 时触发
  resolve: (context: FormDependencyContext) => Partial<FormItemProps> | void;
}

export interface FormItemProps {
  // ...保留现有字段
  visible?: boolean; // 是否可见（false 时 v-show 隐藏，但保留值与校验）
  dependencies?: FormItemDependencies; // 依赖项
}
```

注意：`FormItemProps` 在 `resolve` 返回类型里自引用，接口声明顺序不影响 TS；`FormDependencyContext` 引用后定义的 `FormItemProps` 也合法。

### 2. `packages/page-neural/src/components/form/Form.vue`

核心新增逻辑（`<script setup>`）：

```ts
import type { FormFieldState, FormInstance } from '@primevue/forms';

const formRef = ref<FormInstance | null>(null);

/** 表单当前值：不依赖 autoComplete，手动同步，供联动 resolve 使用 */
const formValues = ref<Record<string, any>>({ ...dataSource.value });

/** 各表单项的联动结果，key 为 fieldName（无 fieldName 的分组用路径 key） */
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
    componentProps: override.componentProps
      ? { ...item.componentProps, ...override.componentProps }
      : item.componentProps,
  };
};

/** 递归收集所有（含分组 children）带 dependencies 的项 */
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

/** 执行联动：传 changedField 时仅重算 trigger 命中的项；不传则全量求值 */
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
        formContextApi: formContextApi,
      });
      dependencyOverrides[key] = result ?? {};
    } catch (error) {
      console.error(`[NeuralForm] 字段联动执行失败：${key}`, error);
    }
  });
};
```

`formContextApi` 用惰性委托对象（初始化时 `formRef` 尚未挂载，onChange 时已可用）：

```ts
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
  validate: (field) => formRef.value?.validate(field) ?? Promise.resolve({ errors: {} }),
  reset: () => formRef.value?.reset(),
  submit: () => formRef.value?.submit(),
  register: (field, options) => formRef.value?.register(field, options),
  unregister: (field) => formRef.value?.unregister(field),
  defineField: (field, options) => formRef.value?.defineField(field, options) ?? [],
};
```

> `validate` 的返回类型为 `Promise<{ values?, errors }>`，具体以 `FormInstance` 声明为准，必要时把委托写法调成显式 `async` 函数以满足 TS。

渲染用 computed：

```ts
const resolvedSchema = computed<FormItemProps[]>(() =>
  props.schema.map((item, index) => {
    const key = getItemKey(item, [index]);
    const resolved = mergeItem(item, key);
    return resolved.children?.length
      ? {
          ...resolved,
          children: resolved.children.map((child, childIndex) =>
            mergeItem(child, getItemKey(child, [index, childIndex]))
          ),
        }
      : resolved;
  })
);
```

校验过滤（hidden / required:false）：

```ts
/** 需要跳过校验的字段名 */
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

const isSuppressedKey = (key: string, names: Set<string>) =>
  [...names].some(
    (name) => key === name || key.startsWith(`${name}.`) || key.startsWith(`${name}[`)
  );

const resolver = computed(() => {
  const baseResolver = zodResolver(props.rules);
  return async (options: any) => {
    const result = await baseResolver(options);
    const errors = result?.errors;
    if (!errors || suppressedFields.value.size === 0) return result;
    Object.keys(errors).forEach((key) => {
      if (isSuppressedKey(key, suppressedFields.value)) delete errors[key];
    });
    return result;
  };
});
```

初始化与 reset：

```ts
// setup 末尾：首屏即求值，避免隐藏字段闪现
runDependencies();

/** 重置：同步重置表单值与联动状态 */
const onResetForm = ($form: { reset: () => void }) => {
  $form.reset();
  formValues.value = { ...dataSource.value };
  runDependencies();
};
```

字段变更：

```ts
const handleChange = (
  field: FormFieldState & { onChange?: (e: { value: unknown }) => void },
  value: unknown,
  fieldName?: string
) => {
  field.onChange?.({ value });
  if (fieldName) setField(fieldName, value);
  runDependencies(fieldName);
};
```

`setField` 需要先同步 `formValues`（无论 `autoComplete` 是否开启），保证 `autoComplete: false` 时联动也能拿到最新值：

```ts
const setField = (field: string, value: unknown) => {
  if (!field) return;
  formValues.value = { ...formValues.value, [field]: value };
  if (!props.autoComplete) return;
  // ...原有 model / data 写回逻辑
};
```

`getExtraModelValues` 的 `onUpdate` 回调在 `setField` 后补一次 `runDependencies(dataField)`，让 `trigger` 可以指向 `modelValues` 里的字段。

模板改动：

- `<Form ref="formRef" v-slot="$form" ...>` 增加 ref。
- 循环改为 `v-for="(schemaItem, index) in resolvedSchema"`。
- 外层包裹 `<template v-if="!schemaItem.hidden">`（hidden 时不渲染）。
- group 分支的 `<component>` 增加 `v-show="schemaItem.visible !== false"`；children 的 `FormItem` 增加 `v-if="!item.hidden"` 与 `v-show="item.visible !== false"`。
- 非 group 分支的 `FormItem` 同样加 `v-if="!schemaItem.hidden"`、`v-show="schemaItem.visible !== false"`。
- 两个 `<component>` 都增加 `:disabled="item.disabled"`（分别对应 `item` / `schemaItem`）。
- 重置按钮由 `@click="$form.reset"` 改为 `@click="onResetForm($form)"`。
- `handleChange` 调用处显式传入字段名：`handleChange(field, value, schemaItem.fieldName)` / `handleChange(field, value, item.fieldName)`。

> 注意 `v-if` 与 `v-for` 不能放在同一元素上（优先级问题），children 使用 `<template v-for>` 包裹后再在 `FormItem` 上加 `v-if`。
> 由于 `v-show` 作用于组件根元素（`FormItem` 根 div / `Fieldset` 根元素），grid 的 `col-span-*` 类仍保留，布局不受影响。

### 3. `packages/page-neural/src/core/forms/request.ts`

把现有 `dependencies` 调整为与类型定义一致，并去掉未使用的解构参数（`noUnusedParameters: true` 会报错）：

```ts
dependencies: {
  trigger: ['type'],
  resolve: ({ values }) => ({
    hidden: values.type !== 'http',
  }),
},
```

其余 schema 与 rules 保持不变。`url` 在 `type=json` 时隐藏，`hidden` 会同时跳过 `rules` 中 `url` 的必填校验。

## 边界与假设

- 联动只针对 `props.schema` 及其 `children`；`schema` 被视为静态配置，不支持在 `resolve` 中增删字段（返回的是局部配置覆盖）。
- `fieldName` 作为联动结果的主键；没有 `fieldName` 的分组项使用 `group-{index路径}`，同一 schema 内不应出现重复 `fieldName`。
- 外部（父组件）直接修改 `data` 时，依赖现有“按节点 id 重建表单实例”的机制（`userModal.ts` / `useAttrConfig.ts` 均给 `NeuralForm` 传了 `key`）重新求值；本次不额外监听外部数据变化。
- `resolve` 抛错时捕获并 `console.error`，不阻断表单渲染与提交。
- `required` 的联动只改变星号显示与解析结果过滤，不会动态修改 zod 规则本身。
- `hidden` 字段重新显示时，PrimeVue 会按 `initialValues` 重新初始化该字段值（隐藏期间输入的值不会保留）；`visible` 隐藏则保留输入值。

## 验证步骤

1. 在 `packages/page-neural` 下执行 `npm run build`（`vue-tsc -b` + vite build），确认类型与模板编译通过（重点检查 `FormInstance` 委托签名、`v-if`/`v-for` 组合）。
2. 启动 `npm run dev`，打开“请求配置”表单：
   - 初始 `type` 为 JSON 时 `url` 不显示；切换为 `HTTP` 后 `url` 出现，带必填星号。
   - 在 `type=JSON` 且 `url` 为空时点击提交，不应出现 `url` 必填错误，提交数据中不含 `url`。
   - 切回 `HTTP` 并保持 `url` 为空时提交，应正常提示 `url` 必填错误。
3. 临时把 `request.ts` 的联动改为 `visible: values.type !== 'http'`，确认字段只是视觉隐藏、值仍参与校验与提交（`visible` 能力）。
4. 临时加一条 `required: values.type !== 'json'` 的联动，确认星号显隐正确，且 `required: false` 时该字段的校验错误被跳过。
