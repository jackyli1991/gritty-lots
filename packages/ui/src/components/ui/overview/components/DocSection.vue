<script setup lang="ts">
  defineOptions({ name: 'DocSection' });

  withDefaults(
    defineProps<{
      title: string;
      tags?: string[];
      span2?: boolean;
      demoClass?: string;
    }>(),
    {
      tags: () => [],
      span2: false,
      demoClass: 'flex flex-wrap gap-2',
    }
  );
</script>

<template>
  <section
    class="flex flex-col gap-2 rounded-lg border border-border p-4"
    :class="{ 'col-span-2': span2 }"
  >
    <div class="flex flex-col gap-0.5">
      <div class="flex items-center gap-2" :class="{ 'flex-wrap': tags.length > 1 }">
        <code
          v-for="tag in tags"
          :key="tag"
          class="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold"
          >{{ tag }}</code
        >
        <span class="text-sm font-medium">{{ title }}</span>
      </div>
      <div class="text-xs text-muted-foreground">
        <slot name="description" />
      </div>
    </div>
    <div :class="demoClass">
      <slot />
    </div>
  </section>
</template>
