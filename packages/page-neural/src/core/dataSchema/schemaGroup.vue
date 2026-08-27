<script setup lang="ts">
  import { ref, computed, onMounted, useTemplateRef } from 'vue';

  import { NeuralIcon, NeuralTooltip, NeuralBadge } from '../../components';
  import SchemaItem from './schemaItem.vue';
  import { type JSONSchemaObject } from './types';
  import { createField } from './utils';

  defineOptions({
    name: 'SchemaGroup',
  });

  const propertiesExpanded = ref(true);
  const propertyFieldList = ref<string[]>([]);
  const schemaItemRef = useTemplateRef<typeof SchemaItem>('schemaItemRef');

  const props = defineProps<{
    schemaProperties: Exclude<JSONSchemaObject['properties'], undefined>;
    requiredList: string[];
    highlight?: boolean;
  }>();

  // 展开状态下的样式
  const hasProperties = computed(() => Object.keys(props.schemaProperties || {}).length > 0);

  /**
   * 添加字段
   */
  const addProperty = () => {
    const { fieldName, jsonSchema } = createField();
    props.schemaProperties[fieldName] = {
      ...jsonSchema,
    };
    propertyFieldList.value.push(fieldName);
  };

  // 移除必填字段
  const removeRequiredField = (field: string) => {
    if (!props.requiredList?.includes(field)) {
      return;
    }
    props.requiredList.splice(props.requiredList.indexOf(field), 1);
  };

  // 添加必填字段
  const addRequiredField = (field: string) => {
    if (props.requiredList?.includes(field)) {
      return;
    }
    props.requiredList?.push(field);
  };

  /**
   * 更新字段名
   * @param oldField 旧字段名
   * @param newField 新字段名
   */
  const updateField = (oldField: string, newField: string) => {
    if (!props.schemaProperties?.[oldField]) {
      return;
    }
    if (!newField) {
      return;
    }
    // 更新老字段
    const properties = props.schemaProperties || {};
    properties[newField] = properties[oldField];
    delete properties[oldField];
    // 更新 required 数组
    if (props.requiredList?.includes(oldField)) {
      removeRequiredField(oldField);
      addRequiredField(newField);
    }
    // 更新 propertyFieldList
    propertyFieldList.value.splice(propertyFieldList.value.indexOf(oldField), 1, newField);
  };

  /**
   * 删除字段
   * @param field 字段名
   */
  const removeField = (field: string) => {
    if (!props.schemaProperties?.[field]) {
      return;
    }
    delete props.schemaProperties[field];
    removeRequiredField(field);
    // 更新 propertyFieldList
    propertyFieldList.value.splice(propertyFieldList.value.indexOf(field), 1);
  };

  /**
   * 更新必填状态
   * @param field 字段名
   */
  const updateRequired = (field: string) => {
    if (props.requiredList?.includes(field)) {
      removeRequiredField(field);
    } else {
      addRequiredField(field);
    }
  };

  /**
   * 切换属性编辑面板展开状态
   */
  function togglePropertiesExpanded() {
    propertiesExpanded.value = !propertiesExpanded.value;
  }

  // 重置属性编辑面板
  function init() {
    propertiesExpanded.value = true;
    propertyFieldList.value = Object.keys(props.schemaProperties || {});
  }

  // 折叠所有配置
  function foldOptions() {
    schemaItemRef.value?.forEach((item: typeof SchemaItem) => {
      item.foldOptions();
    });
  }

  onMounted(() => {
    init();
  });

  defineExpose({
    init,
    foldOptions,
  });
</script>

<template>
  <div class="schema-group">
    <!-- <div>{{ propertyFieldList }}</div> -->
    <div class="schema-group-btn">
      <NeuralTooltip title="折叠/展开" v-if="hasProperties">
        <NeuralIcon
          :class="{
            'schema-group-expand-icon': true,
            'is-expanded': propertiesExpanded,
          }"
          name="ChevronRight"
          @click="togglePropertiesExpanded"
        />
      </NeuralTooltip>
      <NeuralTooltip title="添加字段">
        <NeuralBadge>
          <template #count>
            <span class="schema-badge-count">{{ propertyFieldList.length }}</span>
          </template>
          <NeuralIcon name="CirclePlus" @click="addProperty" />
        </NeuralBadge>
      </NeuralTooltip>
    </div>
    <div v-if="!hasProperties" class="schema-no-fields">
      <NeuralIcon name="ArrowLeft" />
      点击添加字段
    </div>
    <div v-if="hasProperties && !propertiesExpanded" class="schema-no-fields">
      <NeuralIcon name="ArrowLeft" />
      点击展开查看全部字段
    </div>
    <div class="schema-fields" v-show="propertiesExpanded">
      <SchemaItem
        v-for="(item, idx) in propertyFieldList"
        ref="schemaItemRef"
        :key="idx"
        :field="item"
        :data="props.schemaProperties[item]"
        :highlight="highlight"
        :required="requiredList?.includes(item)"
        @update:field="updateField(item, $event)"
        @update:required="updateRequired(item)"
        @remove:field="removeField(item)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .schema-group {
    display: flex;
    align-items: center;
    border-radius: 8px;
    gap: 8px;

    .schema-group-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start;
      gap: 4px;
      // 展开状态下的样式
      .schema-group-expand-icon {
        transition: transform 0.12s ease-in-out;
        &.is-expanded {
          transform: rotate(90deg);
        }
      }

      .schema-badge-count {
        padding: 2px;
        min-width: 14px;
        border-radius: 6px;
        color: #0588f0;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        background-color: #e6f4fe;
      }
    }
    .schema-no-fields {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    .schema-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
