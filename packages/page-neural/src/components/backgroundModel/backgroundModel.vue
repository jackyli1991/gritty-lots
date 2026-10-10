<script lang="ts" setup>
  import type { FileUploadUploaderEvent } from 'primevue/fileupload';
  import FileUpload from 'primevue/fileupload';
  import InputText from 'primevue/inputtext';
  import SelectButton from 'primevue/selectbutton';
  import { computed, onBeforeUnmount } from 'vue';

  import ColorPicker from '../colorPicker';
  import NeuralIcon from '../icon';

  /** background 模型完整数据结构 */
  interface BackgroundModelValue {
    backgroundColor: string; // background-color
    backgroundImage: string; // background-image 图片地址
    backgroundPosition: string; // background-position 关键字组合
    backgroundSize: string; // background-size 预设关键字或自定义 CSS 值
  }

  /** 九宫格位置项：图标名 / CSS 关键字 / 提示语 */
  interface PositionItem {
    icon: string;
    value: string;
    label: string;
  }

  /** 九宫格位置配置，顺序即网格渲染顺序 */
  const positions: PositionItem[] = [
    { icon: 'ArrowUpLeft', value: 'left top', label: '左上' },
    { icon: 'ArrowUpToLine', value: 'center top', label: '顶部居中' },
    { icon: 'ArrowUpRight', value: 'right top', label: '右上' },
    { icon: 'ArrowLeftToLine', value: 'left center', label: '左侧居中' },
    { icon: 'Shrink', value: 'center center', label: '居中' },
    { icon: 'ArrowRightToLine', value: 'right center', label: '右侧居中' },
    { icon: 'ArrowDownLeft', value: 'left bottom', label: '左下' },
    { icon: 'ArrowDownToLine', value: 'center bottom', label: '底部居中' },
    { icon: 'ArrowDownRight', value: 'right bottom', label: '右下' },
  ];

  /** background-size 选项 */
  const sizeOptions = [
    { label: 'cover', value: 'cover' },
    { label: 'contain', value: 'contain' },
    { label: 'auto', value: 'auto' },
    { label: '自定义', value: 'custom' },
  ];

  /** background-size 预设关键字 */
  const presetSizes = ['cover', 'contain', 'auto'];

  /** v-model 绑定，带默认值 */
  const model = defineModel<BackgroundModelValue>({
    default: () => ({
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
    }),
  });

  /** 预览框实时样式 */
  const previewStyle = computed(() => ({
    backgroundColor: model.value.backgroundColor,
    backgroundImage: model.value.backgroundImage ? `url("${model.value.backgroundImage}")` : 'none',
    backgroundPosition: model.value.backgroundPosition,
    backgroundSize: model.value.backgroundSize,
    backgroundRepeat: 'no-repeat',
  }));

  /** SelectButton 选中值：预设关键字或 custom；选自定义时给出默认尺寸 */
  const sizeMode = computed<string>({
    get: () =>
      presetSizes.includes(model.value.backgroundSize) ? model.value.backgroundSize : 'custom',
    set: (val) => {
      model.value = {
        ...model.value,
        backgroundSize: val === 'custom' ? '100% auto' : val,
      };
    },
  });

  /** 点击位置图标，写入 background-position */
  const setPosition = (val: string) => {
    model.value = { ...model.value, backgroundPosition: val };
  };

  /** 颜色选择器值更新 */
  const onColorChange = (val: string) => {
    model.value = { ...model.value, backgroundColor: val };
  };

  /** 自定义 background-size 输入 */
  const onCustomSizeChange = (val: string) => {
    model.value = { ...model.value, backgroundSize: val };
  };

  /** 当前上传图片生成的 objectURL，替换图片时回收 */
  let currentObjectUrl: string | null = null;

  /** FileUpload 自定义上传：读取本地图片写入 background-image */
  const onImageUpload = (e: FileUploadUploaderEvent) => {
    const file = Array.isArray(e.files) ? e.files[0] : e.files;
    if (!file) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    model.value = { ...model.value, backgroundImage: currentObjectUrl };
  };

  /** 组件卸载时回收 objectURL，避免内存泄漏 */
  onBeforeUnmount(() => {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  });

  /** 位置图标按钮样式，当前选中项高亮 */
  const getPositionClass = (val: string) => [
    'p-1 rounded transition-colors',
    model.value.backgroundPosition === val
      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
  ];
</script>

<template>
  <div class="flex flex-col gap-3 w-60">
    <!-- 背景效果实时预览框 -->
    <div
      class="relative h-32 rounded border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800"
      :style="previewStyle"
    >
      <!-- 九宫格 background-position 快捷选择 -->
      <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
        <template v-for="(pos, idx) in positions" :key="pos.value">
          <!-- 中间格：居中定位图标 + 图片上传组件 -->
          <div v-if="idx === 4" class="flex items-center justify-center gap-1">
            <NeuralIcon
              name="Shrink"
              label="居中"
              :class="getPositionClass(pos.value)"
              @click="setPosition(pos.value)"
            />
            <FileUpload
              mode="basic"
              accept="image/*"
              :auto="true"
              :customUpload="true"
              chooseLabel="上传"
              :chooseButtonProps="{ size: 'small' }"
              @uploader="onImageUpload"
            />
          </div>
          <!-- 其余八格：对应方位图标 -->
          <div v-else class="flex items-center justify-center">
            <NeuralIcon
              :name="pos.icon"
              :label="pos.label"
              :class="getPositionClass(pos.value)"
              @click="setPosition(pos.value)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- background-color 颜色选择器 -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-500 dark:text-gray-400 select-none"> background-color </span>
      <ColorPicker
        :modelValue="model.backgroundColor"
        size="small"
        :formControl="{ novalidate: true }"
        @update:modelValue="onColorChange"
      />
    </div>

    <!-- background-size 选择 -->
    <div class="flex flex-col gap-2">
      <SelectButton
        v-model="sizeMode"
        :options="sizeOptions"
        optionLabel="label"
        optionValue="value"
        size="small"
        :allowEmpty="false"
        :formControl="{ novalidate: true }"
      />
      <InputText
        v-if="sizeMode === 'custom'"
        :modelValue="model.backgroundSize"
        size="small"
        fluid
        class="font-mono"
        placeholder="例如 100px 100px"
        :formControl="{ novalidate: true }"
        @update:modelValue="onCustomSizeChange"
      />
    </div>
  </div>
</template>
