<template>
  <div class="flex items-center">
    <InputColor v-model="value">
      <InputColorSwatch @click="handleClick" class="cursor-pointer !w-[28px] !h-[28px]">
        <InputColorTransparencyGrid />
        <InputColorSwatchBackground />
      </InputColorSwatch>
      <Popover ref="op">
        <div class="w-50 space-y-2">
          <InputColorArea>
            <InputColorAreaBackground />
            <InputColorAreaHandle />
          </InputColorArea>
          <InputColorSlider>
            <InputColorTransparencyGrid />
            <InputColorSliderTrack />
            <InputColorSliderHandle />
          </InputColorSlider>
          <InputColorSlider channel="alpha">
            <InputColorTransparencyGrid />
            <InputColorSliderTrack />
            <InputColorSliderHandle />
          </InputColorSlider>
          <div class="flex items-center gap-2">
            <InputColorInput channel="hex" class="flex-1" fluid />
            <InputColorEyeDropper iconOnly severity="secondary" variant="outlined">
              <template #default>
                <NeuralIcon name="Pipette" />
              </template>
            </InputColorEyeDropper>
          </div>
        </div>
      </Popover>
    </InputColor>
  </div>
</template>

<script lang="ts" setup>
  import InputColor from 'primevue/inputcolor';
  import InputColorArea from 'primevue/inputcolorarea';
  import InputColorAreaBackground from 'primevue/inputcolorareabackground';
  import InputColorAreaHandle from 'primevue/inputcolorareahandle';
  import InputColorEyeDropper from 'primevue/inputcoloreyedropper';
  import InputColorInput from 'primevue/inputcolorinput';
  import InputColorSlider from 'primevue/inputcolorslider';
  import InputColorSliderHandle from 'primevue/inputcolorsliderhandle';
  import InputColorSliderTrack from 'primevue/inputcolorslidertrack';
  import InputColorSwatch from 'primevue/inputcolorswatch';
  import InputColorSwatchBackground from 'primevue/inputcolorswatchbackground';
  import InputColorTransparencyGrid from 'primevue/inputcolortransparencygrid';
  import Popover from 'primevue/popover';
  import type { DefineComponent } from 'vue';
  import { useTemplateRef } from 'vue';

  import NeuralIcon from '../icon';

  interface Props {
    size?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'small',
  });

  const value = defineModel<string>();
  const op = useTemplateRef<DefineComponent<typeof Popover>>('op');

  const handleClick = (e: MouseEvent) => {
    op.value?.toggle(e);
  };
</script>
