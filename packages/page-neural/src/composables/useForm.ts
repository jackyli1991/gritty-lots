import { computed, inject, provide, ref, watch, toValue, type MaybeRefOrGetter } from 'vue';

/** Nested PrimeVue inputs must opt out, otherwise they inherit FormField name and overwrite the parent value. */
export const nestedFormControl = { novalidate: true };

interface FormLike {
  register?: (
    name: string,
    control?: Record<string, unknown>
  ) => {
    onChange?: (event: { value: unknown }) => void;
  };
  getFieldState?: (name: string) => { value?: unknown; invalid?: boolean } | undefined;
}

interface FormFieldLike {
  formControl?: Record<string, unknown> & { name?: string; initialValue?: unknown };
  initialValue?: unknown;
  $field?: { value?: unknown; invalid?: boolean };
}

/**
 * Let a custom editor behave like PrimeVue InputText inside Form / FormField:
 * register by `name`, write back via onChange, and follow form reset.
 */
export function useFormControl(options: {
  name: MaybeRefOrGetter<string | undefined>;
  modelValue: MaybeRefOrGetter<unknown>;
  invalid?: MaybeRefOrGetter<boolean | undefined>;
  emit: (event: 'update:modelValue', value: any) => void;
}) {
  const $pcForm = inject<FormLike | undefined>('$pcForm', undefined);
  const $pcFormField = inject<FormFieldLike | undefined>('$pcFormField', undefined);

  // Descendants (SelectButton inner toggles, InputText, etc.) inherit FormField name
  // unless we mask it. ObjectEditor itself still reads the real parent field above.
  provide('$pcFormField', { formControl: nestedFormControl });

  const formField = ref<{ onChange?: (event: { value: unknown }) => void }>({});

  const formName = computed(() => toValue(options.name) || $pcFormField?.formControl?.name);

  watch(
    formName,
    (name) => {
      if (!$pcForm?.register || !name) {
        formField.value = {};
        return;
      }
      formField.value =
        $pcForm.register(
          name,
          $pcFormField?.formControl ?? { name, initialValue: toValue(options.modelValue) }
        ) || {};
    },
    { immediate: true }
  );

  const formValue = computed(
    () =>
      $pcFormField?.$field?.value ??
      (formName.value ? $pcForm?.getFieldState?.(formName.value)?.value : undefined)
  );

  const invalid = computed(
    () =>
      toValue(options.invalid) ??
      $pcFormField?.$field?.invalid ??
      (formName.value ? $pcForm?.getFieldState?.(formName.value)?.invalid : undefined)
  );

  const writeValue = (value: unknown) => {
    options.emit('update:modelValue', value);
    formField.value.onChange?.({ value });
  };

  return { formName, formValue, invalid, writeValue };
}
