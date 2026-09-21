<template>
  <!-- $form 是表单实例，包含 states、handleSubmit、reset、validate -->
  <Form v-slot="$form" :resolver="resolver" @submit="onSubmit">
    <div :class="`grid grid-cols-${props.columns} gap-x-2 gap-y-1`">
      <FormItem
        v-for="item in props.schema"
        :key="item.fieldName"
        :class="item.class"
        :label="item.label"
        :name="item.fieldName"
        :required="item.required"
        :initial-value="item.defaultValue"
      >
        <template #default="{ field }">
          <component
            :is="components[item.component]"
            :name="item.fieldName"
            :invalid="field.invalid"
            :modelValue="field.value"
            class="w-full"
            v-bind="item.componentProps"
            @update:modelValue="field.onChange?.({ value: $event })"
          />
        </template>
      </FormItem>
    </div>
    <div class="flex w-full">
      <Button type="submit" label="提交" :loading="loading" />
      <Button type="button" label="重置" severity="secondary" @click="$form.reset" />
    </div>
  </Form>
</template>

<script setup lang="ts">
  import { Form } from '@primevue/forms';
  import { zodResolver } from '@primevue/forms/resolvers/zod'; // 重点！resolver单独路径
  import Button from 'primevue/button';
  import { ref, computed } from 'vue';

  import FormItem from './FormItem.vue';
  import * as components from './register';
  import type { FormItemProps } from './types';

  // 直接从 zodResolver 签名推导 schema 入参类型，避免直接引用 zod 的 Schema
  type ResolverSchema = Parameters<typeof zodResolver>[0];

  interface Props {
    columns: number; // 表单列数，默认 1
    schema: FormItemProps[];
    rules: ResolverSchema;
  }

  const loading = ref(false);

  const props = defineProps<Props>();

  // 验证规则
  const resolver = computed(() => zodResolver(props.rules));

  // 表单提交
  const onSubmit = async (values: any) => {
    try {
      loading.value = true;
      console.log('表单数据', values);
    } finally {
      loading.value = false;
    }
  };
</script>
