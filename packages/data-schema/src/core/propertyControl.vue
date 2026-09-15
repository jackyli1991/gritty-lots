<script setup lang="ts">
  import { computed } from 'vue';

  import { type JSONSchemaType } from './types';
  import { is } from './utils';

  interface Props {
    type: JSONSchemaType | JSONSchemaType[] | undefined;
    fieldName: string;
  }

  const props = defineProps<Props>();

  // 每个字段的显隐控制
  const propertiesVisible = computed<Record<string, boolean>>(() => {
    const type = props.type as JSONSchemaType;

    return {
      uniqueItems: is(type, 'array'),
      minLength_maxLength: is(type, 'string'),
      minItems_maxItems: is(type, 'array'),
      minimum_maximum: is(type, 'number'),
      multipleOf: is(type, 'number'),
      minProperties_maxProperties: is(type, 'object'),
      pattern: is(type, 'string'),
      const_enum_examples: is(type, 'string') || is(type, 'number'),
      format: is(type, 'string') || is(type, 'number'),
      default: is(type, 'string') || is(type, 'number') || is(type, 'boolean'),
    };
  });
</script>

<template>
  <template v-if="propertiesVisible[props.fieldName]">
    <slot></slot>
  </template>
</template>
