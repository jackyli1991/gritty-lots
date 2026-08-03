<script setup lang="ts">
  import { useVModel } from '@vueuse/core';
  import type { HTMLAttributes, InputTypeHTMLAttribute } from 'vue';
  import { computed, ref, useSlots } from 'vue';

  import type { InputStatus, InputVariants } from '.';
  import { inputVariants } from '.';
  import { cn } from '../../../lib/utils';

  defineOptions({ name: 'GInput' });

  interface Props {
    /** 输入框内容（v-model） */
    modelValue?: string | number;
    /** 输入框默认内容 */
    defaultValue?: string | number;
    /** 声明 input 类型，同原生 input 的 type 属性 */
    type?: InputTypeHTMLAttribute;
    /** 控件大小，沿用设计系统尺寸变量 */
    size?: InputVariants['size'];
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否只读 */
    readonly?: boolean;
    /** 是否有边框 */
    bordered?: boolean;
    /** 是否允许清除 */
    allowClear?: boolean;
    /** 最大输入长度 */
    maxlength?: number;
    /** 前缀图标/文本 */
    prefix?: string;
    /** 后缀图标/文本 */
    suffix?: string;
    /** 前置标签 */
    addonBefore?: string;
    /** 后置标签 */
    addonAfter?: string;
    /** 是否展示字数统计 */
    showCount?:
      | boolean
      | { formatter: (info: { value: string; count: number; maxLength?: number }) => string };
    /** 校验状态 */
    status?: InputStatus;
    /** 占位符 */
    placeholder?: string;
    /** 输入框 id */
    id?: string;
    /** 自定义类名（应用到外层容器） */
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    size: 'default',
    disabled: false,
    readonly: false,
    bordered: true,
    allowClear: false,
    showCount: false,
    status: 'default',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
    (e: 'change', event: Event): void;
    (e: 'input', event: Event): void;
    (e: 'blur', event: FocusEvent): void;
    (e: 'focus', event: FocusEvent): void;
    (e: 'pressEnter', event: KeyboardEvent): void;
  }>();

  const slots = useSlots();
  const inputRef = ref<HTMLInputElement | null>(null);

  const modelValue = useVModel(props, 'modelValue', emit, {
    passive: true,
    defaultValue: props.defaultValue,
  });

  const hasPrefix = computed(() => !!props.prefix || !!slots.prefix);
  const hasAddonBefore = computed(() => !!props.addonBefore || !!slots.addonBefore);
  const hasAddonAfter = computed(() => !!props.addonAfter || !!slots.addonAfter);
  const hasWrapper = computed(() => hasAddonBefore.value || hasAddonAfter.value);

  const showClearIcon = computed(
    () =>
      props.allowClear &&
      !props.disabled &&
      !props.readonly &&
      modelValue.value !== '' &&
      modelValue.value !== undefined &&
      modelValue.value !== null
  );

  const showCountNode = computed(() => {
    if (!props.showCount) return null;
    const value = String(modelValue.value ?? '');
    const count = value.length;
    if (typeof props.showCount === 'object' && props.showCount.formatter) {
      return props.showCount.formatter({ value, count, maxLength: props.maxlength });
    }
    return props.maxlength ? `${count} / ${props.maxlength}` : `${count}`;
  });

  const hasSuffixArea = computed(
    () => showClearIcon.value || !!props.suffix || !!slots.suffix || showCountNode.value !== null
  );

  /**
   * 外层容器样式：统一管理边框、聚焦态、status
   * 使用 focus-within 让聚焦边框包裹 prefix/suffix，避免只高亮 input 本身
   */
  const containerClass = computed(() =>
    cn(
      'rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
      !props.bordered && 'border-0 shadow-none',
      props.status === 'error' &&
        'border-destructive focus-within:border-destructive focus-within:ring-destructive/30 focus-within:ring-3',
      props.status === 'warning' &&
        'border-warning focus-within:border-warning focus-within:ring-warning/30 focus-within:ring-3',
      props.status === 'default' &&
        'focus-within:border-primary focus-within:ring-primary/20 focus-within:ring-3',
      props.disabled && 'opacity-disabled'
    )
  );

  /** input 元素自身样式：尺寸 + padding，无边框无聚焦态（由容器提供） */
  const inputClass = computed(() =>
    cn(
      inputVariants({
        size: props.size,
        hasPrefix: hasPrefix.value,
        hasSuffix: hasSuffixArea.value,
      }),
      'bg-transparent'
    )
  );

  function handleChange(event: Event): void {
    emit('change', event);
  }

  function handleInput(event: Event): void {
    emit('input', event);
  }

  function handleBlur(event: FocusEvent): void {
    emit('blur', event);
  }

  function handleFocus(event: FocusEvent): void {
    emit('focus', event);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') emit('pressEnter', event);
  }

  function clearValue(event: MouseEvent): void {
    modelValue.value = '';
    emit('update:modelValue', '');
    emit('change', event);
    // 清除后让输入框聚焦，便于继续输入
    inputRef.value?.focus();
  }

  function focus(): void {
    inputRef.value?.focus();
  }
  function blur(): void {
    inputRef.value?.blur();
  }

  defineExpose({ focus, blur, inputRef });
</script>

<template>
  <!-- 带 addon 的包装结构：[addonBefore] [prefix + input + suffix] [addonAfter] -->
  <div
    v-if="hasWrapper"
    :data-slot="undefined"
    :class="cn(containerClass, 'flex items-stretch w-full', props.class)"
  >
    <span
      v-if="hasAddonBefore"
      data-slot="input-addon-before"
      class="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border-r border-input rounded-l-md shrink-0"
    >
      <slot name="addonBefore">{{ addonBefore }}</slot>
    </span>

    <span class="inline-flex items-center flex-1 min-w-0">
      <span
        v-if="hasPrefix"
        data-slot="input-prefix"
        class="inline-flex items-center shrink-0 pl-2.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
      >
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <input
        ref="inputRef"
        v-model="modelValue"
        data-slot="input"
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :id="id"
        :aria-invalid="status === 'error' ? 'true' : undefined"
        :class="inputClass"
        @change="handleChange"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <span
        v-if="hasSuffixArea"
        data-slot="input-suffix"
        class="inline-flex items-center shrink-0 gap-1 pr-2.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
      >
        <span v-if="showCountNode" data-slot="input-count" class="text-xs tabular-nums">{{
          showCountNode
        }}</span>
        <slot v-if="showClearIcon" name="clearIcon" :clear="clearValue">
          <button
            type="button"
            tabindex="-1"
            aria-label="clear"
            class="inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            @click="clearValue"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>
        </slot>
        <slot v-if="suffix || slots.suffix" name="suffix">{{ suffix }}</slot>
      </span>
    </span>

    <span
      v-if="hasAddonAfter"
      data-slot="input-addon-after"
      class="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border-l border-input rounded-r-md shrink-0"
    >
      <slot name="addonAfter">{{ addonAfter }}</slot>
    </span>
  </div>

  <!-- 不带 addon 的简单结构：[prefix] input [suffix] -->
  <span v-else :class="cn(containerClass, 'inline-flex items-center w-full', props.class)">
    <span
      v-if="hasPrefix"
      data-slot="input-prefix"
      class="inline-flex items-center shrink-0 pl-2.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>

    <input
      ref="inputRef"
      v-model="modelValue"
      data-slot="input"
      :type="type"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :id="id"
      :aria-invalid="status === 'error' ? 'true' : undefined"
      :class="inputClass"
      @change="handleChange"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
    />

    <span
      v-if="hasSuffixArea"
      data-slot="input-suffix"
      class="inline-flex items-center shrink-0 gap-1 pr-2.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
    >
      <span v-if="showCountNode" data-slot="input-count" class="text-xs tabular-nums">{{
        showCountNode
      }}</span>
      <slot v-if="showClearIcon" name="clearIcon" :clear="clearValue">
        <button
          type="button"
          tabindex="-1"
          aria-label="clear"
          class="inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          @click="clearValue"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </button>
      </slot>
      <slot v-if="suffix || slots.suffix" name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>
