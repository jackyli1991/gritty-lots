<template>
  <div class="flex flex-col gap-3 inline-block">
    <!-- 盒模型可视化区域 -->
    <div class="flex justify-center">
      <!-- Margin 层（最外层） -->
      <div
        class="bm-layer grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-1 p-3.5 px-5 rounded-sm relative bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600"
      >
        <span
          class="bm-label absolute flex items-center gap-0.5 px-1 leading-none text-[0.625rem] text-gray-400 dark:text-gray-500 uppercase"
        >
          margin
          <span
            class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            @click="(e) => openUnitEditor(e, 'margin')"
            >({{ model.units.margin }})</span
          >
        </span>
        <template v-for="side in sides" :key="`margin-${side}`">
          <span
            class="bm-value cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-1 transition-colors text-[0.6875rem] text-gray-700 dark:text-gray-200 select-none"
            :class="`bm-${side}`"
            @click="(e) => openSideEditor(e, 'margin', side)"
          >
            {{ getSideValue('margin', side) }}
          </span>
        </template>
        <div class="bm-inner">
          <!-- Border 层 -->
          <div
            class="bm-layer grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-2 p-2.5 px-4 rounded-sm relative bg-gray-200 dark:bg-gray-700 border"
            :style="{ borderStyle: model.border.style, borderColor: model.border.color }"
          >
            <ColorPicker
              v-model="model.border.color"
              :formControl="{ novalidate: true }"
              size="small"
              class="absolute top-2 right-4 z-20"
            />
            <span
              class="bm-label absolute flex items-center gap-0.5 px-1 leading-none text-[0.625rem] text-gray-400 dark:text-gray-500 uppercase"
            >
              border
              <span
                class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                @click="(e) => openUnitEditor(e, 'border')"
                >({{ model.units.border }})</span
              >
              -
              <Badge
                :value="model.border.style"
                severity="secondary"
                class="cursor-pointer"
                @click="(e: MouseEvent) => openStyleEditor(e)"
              />
            </span>
            <template v-for="side in sides" :key="`border-${side}`">
              <span
                class="bm-value cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-1 transition-colors text-[0.6875rem] text-gray-700 dark:text-gray-200 select-none"
                :class="`bm-${side}`"
                @click="(e) => openSideEditor(e, 'border', side)"
              >
                {{ getSideValue('border', side) }}
              </span>
            </template>
            <!-- border-radius 四角值 -->
            <span
              class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-0.5 transition-colors text-[0.625rem] text-gray-700 dark:text-gray-200 select-none absolute top-0.5 left-0.5 z-10"
              @click="(e) => openRadiusEditor(e, 'topLeft')"
            >
              {{ model.borderRadius.topLeft }}
            </span>
            <span
              class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-0.5 transition-colors text-[0.625rem] text-gray-700 dark:text-gray-200 select-none absolute top-0.5 right-0.5 z-10"
              @click="(e) => openRadiusEditor(e, 'topRight')"
            >
              {{ model.borderRadius.topRight }}
            </span>
            <span
              class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-0.5 transition-colors text-[0.625rem] text-gray-700 dark:text-gray-200 select-none absolute bottom-0.5 right-0.5 z-10"
              @click="(e) => openRadiusEditor(e, 'bottomRight')"
            >
              {{ model.borderRadius.bottomRight }}
            </span>
            <span
              class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-0.5 transition-colors text-[0.625rem] text-gray-700 dark:text-gray-200 select-none absolute bottom-0.5 left-0.5 z-10"
              @click="(e) => openRadiusEditor(e, 'bottomLeft')"
            >
              {{ model.borderRadius.bottomLeft }}
            </span>
            <div class="bm-inner">
              <!-- Padding 层 -->
              <div
                class="bm-layer grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-1 p-3.5 px-5 rounded-sm relative bg-blue-50 dark:bg-blue-950 border border-dashed border-blue-200 dark:border-blue-800"
              >
                <span
                  class="bm-label absolute -top-2 -left-4 z-10 flex items-center gap-0.5 px-1 leading-none text-[0.625rem] text-gray-400 dark:text-gray-500 uppercase"
                >
                  padding
                  <span
                    class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    @click="(e) => openUnitEditor(e, 'padding')"
                    >({{ model.units.padding }})</span
                  >
                </span>
                <template v-for="side in sides" :key="`padding-${side}`">
                  <span
                    class="bm-value cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-1 transition-colors text-[0.6875rem] text-gray-700 dark:text-gray-200 select-none"
                    :class="`bm-${side}`"
                    @click="(e) => openSideEditor(e, 'padding', side)"
                  >
                    {{ getSideValue('padding', side) }}
                  </span>
                </template>
                <div class="bm-inner">
                  <!-- Content 区域（width × height） -->
                  <div
                    class="flex items-center justify-center gap-1 min-w-[8.75rem] min-h-[3.125rem] bg-white dark:bg-gray-900 border border-dashed border-gray-700 dark:border-gray-300 rounded-sm p-2"
                  >
                    <span
                      class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-1 transition-colors text-xs text-gray-700 dark:text-gray-200 select-none"
                      @click="(e) => openContentEditor(e, 'width')"
                    >
                      {{ model.width }}
                    </span>
                    <span
                      class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[0.625rem] text-gray-400 dark:text-gray-500 select-none"
                      @click="(e) => openUnitEditor(e, 'width')"
                      >{{ model.units.width }}</span
                    >
                    <span class="text-xs text-gray-500 dark:text-gray-400">x</span>
                    <span
                      class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-1 transition-colors text-xs text-gray-700 dark:text-gray-200 select-none"
                      @click="(e) => openContentEditor(e, 'height')"
                    >
                      {{ model.height }}
                    </span>
                    <span
                      class="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[0.625rem] text-gray-400 dark:text-gray-500 select-none"
                      @click="(e) => openUnitEditor(e, 'height')"
                      >{{ model.units.height }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑 Popover：点击值时弹出 InputNumber 进行编辑 -->
    <Popover ref="bmPopover">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ currentLabel }}</span>
        <div class="flex items-center gap-2">
          <InputNumber
            :modelValue="currentValue"
            @update:modelValue="onCurrentValueChange"
            size="small"
            :showButtons="true"
            fluid
            :minFractionDigits="0"
            :maxFractionDigits="2"
            placeholder="输入数值"
            :pt="{
              root: {
                class: 'w-25!',
              },
            }"
            :formControl="{ novalidate: true }"
            @keydown.enter="closeEditor"
          />
          <Button v-if="showApplyAll" label="应用到所有" size="small" text @click="applyToAll" />
        </div>
      </div>
    </Popover>

    <!-- 单位选择 Popover：点击单位值时弹出 Listbox 进行选择 -->
    <Popover ref="unitPopover">
      <Listbox
        :options="unitOptions"
        optionLabel="label"
        optionValue="value"
        :modelValue="currentUnitValue"
        @update:modelValue="onUnitSelect"
        :formControl="{ novalidate: true }"
        size="small"
      />
    </Popover>

    <!-- 边框样式选择 Popover：点击样式值时弹出 Listbox 进行选择 -->
    <Popover ref="stylePopover">
      <Listbox
        :options="borderStyleOptions"
        optionLabel="label"
        optionValue="value"
        :modelValue="model.border.style"
        @update:modelValue="onStyleSelect"
        :formControl="{ novalidate: true }"
        size="small"
      />
    </Popover>
  </div>
</template>

<script lang="ts" setup>
  import { borderStyleOptions, unitOptions } from '@neural/data';
  import Badge from 'primevue/badge';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import Listbox from 'primevue/listbox';
  import Popover from 'primevue/popover';
  import { ref, computed, useTemplateRef } from 'vue';

  import ColorPicker from '../colorPicker';

  /** 盒模型四方向值 */
  interface BoxSides {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  /** border 四方向值 + 样式 + 颜色 */
  interface BorderSides extends BoxSides {
    style?: string;
    color?: string;
  }

  /** border-radius 四角值 */
  interface BorderRadius {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  }

  /** 盒模型完整数据结构 */
  interface BoxModelValue {
    margin: BoxSides;
    border: BorderSides;
    padding: BoxSides;
    width: number;
    height: number;
    borderRadius: BorderRadius;
    units: {
      margin: string;
      border: string;
      padding: string;
      width: string;
      height: string;
    };
  }

  /** 当前编辑目标（区分 side / radius / content 三种类型） */
  type EditTarget =
    | { type: 'side'; layer: Layer; side: Side }
    | { type: 'radius'; corner: Corner }
    | { type: 'content'; dim: ContentDim };

  /** 方向常量 */
  const sides = ['top', 'right', 'bottom', 'left'] as const;
  type Side = (typeof sides)[number];
  type Layer = 'margin' | 'border' | 'padding';
  type Corner = keyof BorderRadius;
  type ContentDim = 'width' | 'height';

  /** 单位键：margin/border/padding 层 + width/height */
  type UnitKey = Layer | ContentDim;

  /** v-model 绑定，带默认值 */
  const model = defineModel<BoxModelValue>({
    default: () => ({
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0, style: 'solid', color: '#9ca3af' },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      width: 100,
      height: 50,
      borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      units: { margin: 'px', border: 'px', padding: 'px', width: 'px', height: 'px' },
    }),
  });

  /** Popover 实例引用 */
  const bmPopover = useTemplateRef<InstanceType<typeof Popover>>('bmPopover');

  /** 当前正在编辑的目标 */
  const editTarget = ref<EditTarget | null>(null);

  /** 获取某层某方向的值 */
  const getSideValue = (layer: Layer, side: Side) => model.value[layer][side];

  /** 某层某方向值更新 */
  const onSideUpdate = (layer: Layer, side: Side, val: number | null) => {
    model.value[layer] = { ...model.value[layer], [side]: val ?? 0 };
  };

  /** border-radius 某角值更新 */
  const onRadiusUpdate = (corner: Corner, val: number | null) => {
    model.value.borderRadius = { ...model.value.borderRadius, [corner]: val ?? 0 };
  };

  /** content 宽/高更新 */
  const onContentUpdate = (dim: ContentDim, val: number | null) => {
    model.value[dim] = val ?? 0;
  };

  /** 某项单位更新 */
  const onUnitUpdate = (key: UnitKey, val: string) => {
    model.value.units = { ...model.value.units, [key]: val };
  };

  /** 单位选择 Popover 实例引用 */
  const unitPopover = useTemplateRef<InstanceType<typeof Popover>>('unitPopover');

  /** 当前正在编辑单位的项 */
  const unitKey = ref<UnitKey | null>(null);

  /** 点击单位值，打开单位选择 Popover */
  const openUnitEditor = (e: MouseEvent, key: UnitKey) => {
    unitKey.value = key;
    unitPopover.value?.toggle(e);
  };

  /** 当前选中单位的值 */
  const currentUnitValue = computed(() => {
    return unitKey.value ? model.value.units[unitKey.value] : '';
  });

  /** Listbox 选择单位后写回对应项 */
  const onUnitSelect = (val: string) => {
    if (unitKey.value) onUnitUpdate(unitKey.value, val);
  };

  /** 边框样式选择 Popover 实例引用 */
  const stylePopover = useTemplateRef<InstanceType<typeof Popover>>('stylePopover');

  /** 点击边框样式值，打开选择 Popover */
  const openStyleEditor = (e: MouseEvent) => {
    stylePopover.value?.toggle(e);
  };

  /** Listbox 选择边框样式后写回 */
  const onStyleSelect = (val: string) => {
    model.value.border = { ...model.value.border, style: val };
  };

  /** 点击 side 值，打开 Popover 编辑 */
  const openSideEditor = (e: MouseEvent, layer: Layer, side: Side) => {
    editTarget.value = { type: 'side', layer, side };
    bmPopover.value?.toggle(e);
  };

  /** 点击 border-radius 值，打开 Popover 编辑 */
  const openRadiusEditor = (e: MouseEvent, corner: Corner) => {
    editTarget.value = { type: 'radius', corner };
    bmPopover.value?.toggle(e);
  };

  /** 点击 content 值，打开 Popover 编辑 */
  const openContentEditor = (e: MouseEvent, dim: ContentDim) => {
    editTarget.value = { type: 'content', dim };
    bmPopover.value?.toggle(e);
  };

  /** 关闭 Popover */
  const closeEditor = () => {
    bmPopover.value?.hide();
  };

  /** Popover 中 InputNumber 当前绑定的值（根据 editTarget 动态读取） */
  const currentValue = computed(() => {
    const t = editTarget.value;
    if (!t) return 0;
    if (t.type === 'side') return model.value[t.layer][t.side];
    if (t.type === 'radius') return model.value.borderRadius[t.corner];
    return model.value[t.dim];
  });

  /** Popover 中 InputNumber 值变化时，将值写回对应字段 */
  const onCurrentValueChange = (val: number | null) => {
    const t = editTarget.value;
    if (!t) return;
    if (t.type === 'side') onSideUpdate(t.layer, t.side, val);
    else if (t.type === 'radius') onRadiusUpdate(t.corner, val);
    else onContentUpdate(t.dim, val);
  };

  /** 当前编辑位置的名称（如 margin-top、border-radius-topLeft、width） */
  const currentLabel = computed(() => {
    const t = editTarget.value;
    if (!t) return '';
    if (t.type === 'side') return `${t.layer}-${t.side}`;
    if (t.type === 'radius') return `border-radius-${t.corner}`;
    return t.dim;
  });

  /** 是否显示"应用到所有"按钮（仅 margin/border/padding/border-radius） */
  const showApplyAll = computed(() => {
    const t = editTarget.value;
    return t !== null && (t.type === 'side' || t.type === 'radius');
  });

  /** 将当前值同步到对应属性的所有方向 */
  const applyToAll = () => {
    const t = editTarget.value;
    if (!t) return;
    const val = currentValue.value;
    if (t.type === 'side') {
      model.value[t.layer] = {
        ...model.value[t.layer],
        top: val,
        right: val,
        bottom: val,
        left: val,
      };
    } else if (t.type === 'radius') {
      model.value.borderRadius = { topLeft: val, topRight: val, bottomRight: val, bottomLeft: val };
    }
  };
</script>

<style scoped>
  /*
   * 网格定位：3×3 布局中各元素的位置。
   * Tailwind 无法简洁表达 grid-area，因此保留 scoped CSS。
   */

  .bm-label {
    grid-area: 1 / 1;
  }

  .bm-top {
    grid-area: 1 / 2;
    justify-self: center;
  }

  .bm-left {
    grid-area: 2 / 1;
    align-self: center;
  }

  .bm-inner {
    grid-area: 2 / 2;
  }

  .bm-right {
    grid-area: 2 / 3;
    align-self: center;
  }

  .bm-bottom {
    grid-area: 3 / 2;
    justify-self: center;
  }
</style>
