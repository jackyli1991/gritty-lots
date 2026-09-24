<template>
  <!-- $form 是表单实例，包含 states、handleSubmit、reset、validate -->
  <Form v-slot="$form" :resolver="resolver" :initialValues="props.data" @submit="onSubmit">
    <div :class="`grid grid-cols-${props.columns} gap-x-2 gap-y-1`">
      <FormItem
        v-for="item in props.schema"
        :key="item.fieldName"
        :class="item.class"
        :label="item.label"
        :name="item.fieldName"
        :required="item.required"
        :help="item.help"
        :tips="item.tips"
      >
        <template #default="{ field }">
          <component
            :is="components[item.component]"
            :name="item.fieldName"
            :invalid="field.invalid"
            :modelValue="field.value"
            class="w-full"
            v-bind="item.componentProps"
            size="small"
            @update:modelValue="(value: unknown) => handleChange(field, value)"
          />
        </template>
      </FormItem>
    </div>
    <div v-if="!props.autoComplete" class="flex w-full justify-end gap-2 mt-4">
      <Button type="button" :label="props.resetText" variant="text" @click="$form.reset" />
      <div class="flex-1 flex justify-end gap-2">
        <Button type="submit" :label="props.submitText" :loading="loading" />
        <Button type="button" :label="props.closeText" severity="secondary" @click="onClose" />
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
  import type { FormFieldState } from '@primevue/forms';
  import { Form } from '@primevue/forms';
  // import { useForm } from '@primevue/forms/useform';
  import { zodResolver } from '@primevue/forms/resolvers/zod'; // 重点！resolver单独路径
  import Button from 'primevue/button';
  import { ref, computed } from 'vue';

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
  }

  const loading = ref(false);

  const props = withDefaults(defineProps<Props>(), {
    autoComplete: true,
    submitText: '提交',
    resetText: '重置',
    closeText: '关闭',
  });

  const emit = defineEmits(['submit', 'close']);

  // 验证规则
  const resolver = computed(() => zodResolver(props.rules));

  // 处理字段值变化。事件参数才是新值，field.value 此时仍是更新前的值。
  const handleChange = (
    field: FormFieldState & { name?: string; onChange?: (event: { value: unknown }) => void },
    value: unknown
  ) => {
    field.onChange?.({ value });
    if (props.autoComplete && props.data && field.name) {
      props.data[field.name] = value;
    }
  };

  // 表单提交
  const onSubmit = async (values: any) => {
    try {
      loading.value = true;
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
</script>
