<script lang="ts" setup>
  import { NeuralIcon } from '@neural/components';
  import Divider from 'primevue/divider';
  import Step from 'primevue/step';
  import StepList from 'primevue/steplist';
  import Stepper from 'primevue/stepper';
  import { ref } from 'vue';

  const modelValue = defineModel<number>({
    default: 1,
  });

  const steps = ref([
    {
      icon: 'Layout',
      label: '布局',
      value: 1,
    },
    {
      icon: 'Component',
      label: '元素',
      value: 2,
    },
    {
      icon: 'Network',
      label: '交互',
      value: 3,
    },
  ]);
</script>

<template>
  <Stepper :value="modelValue" @update:value="modelValue = $event" class="text-xs inline-block!">
    <StepList
      :pt="{
        root: {
          class: 'justify-start!',
        },
      }"
    >
      <template v-for="(step, index) in steps" :key="step.value">
        <Step v-slot="{ activateCallback, value, a11yAttrs }" :value="step.value" asChild>
          <div
            class="flex items-center text-nowrap cursor-pointer"
            :class="[
              index > 0 ? 'pl-2' : '',
              Number(value) <= modelValue ? 'text-(--p-primary-500)' : '',
            ]"
            v-bind="a11yAttrs.header"
            @click="activateCallback"
          >
            <NeuralIcon :name="step.icon" />
            <div class="px-2 flex items-center gap-2">
              <span>{{ step.label }}</span>
              <slot v-if="modelValue === Number(value)" :name="'step' + step.value"></slot>
            </div>
            <Divider
              v-if="index < steps.length - 1"
              class="w-20!"
              :pt="{
                root: {
                  class: modelValue > Number(value) ? 'before:border-(--p-primary-500)!' : '',
                },
              }"
            />
          </div>
        </Step>
      </template>
    </StepList>
  </Stepper>
</template>
