<script setup lang="ts">
  defineOptions({
    name: 'HelloWorld',
  });

  const variants = [
    'default',
    'primary',
    'success',
    'warning',
    'info',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'link',
  ] as const;

  const sizes = ['mini', 'xs', 'sm', 'default', 'lg'] as const;

  const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;

  const shapes = ['default', 'circle', 'round'] as const;
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Variant -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Variant</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="v" :variant="v">{{ v }}</g-button>
      </div>
    </div>

    <!-- Size -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Size</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="s in sizes" :key="s" :size="s" variant="primary">{{ s }}</g-button>
      </div>
    </div>

    <!-- Icon Size -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Icon Size</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="s in iconSizes" :key="s" :size="s" variant="outline">+</g-button>
      </div>
    </div>

    <!-- Shape -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Shape</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="sh in shapes" :key="sh" :shape="sh" variant="primary">{{ sh }}</g-button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="sh in shapes" :key="'icon-' + sh" :shape="sh" size="icon" variant="outline"
          >+</g-button
        >
      </div>
    </div>

    <!-- Ghost -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Ghost</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'ghost-' + v" :variant="v" ghost>{{ v }}</g-button>
      </div>
    </div>

    <!-- Danger -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Danger</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'danger-' + v" :variant="v" danger>{{ v }}</g-button>
      </div>
    </div>

    <!-- Ghost + Danger -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Ghost + Danger</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'gd-' + v" :variant="v" ghost danger>{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Loading -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Loading</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'load-' + v" :variant="v" loading>{{ v }}</g-button>
      </div>
    </div>

    <!-- Loading + Ghost -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Loading + Ghost</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'lg-' + v" :variant="v" loading ghost>{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Loading + Size -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Loading + Size</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="s in sizes" :key="'ls-' + s" :size="s" loading variant="primary">{{
          s
        }}</g-button>
      </div>
    </div>

    <!-- Disabled -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Disabled</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'dis-' + v" :variant="v" disabled>{{ v }}</g-button>
      </div>
    </div>

    <!-- Disabled + Ghost -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Disabled + Ghost</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'dg-' + v" :variant="v" disabled ghost>{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Disabled + Loading -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Disabled + Loading</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'dl-' + v" :variant="v" disabled loading>{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Danger + Loading -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Danger + Loading</span>
      <div class="flex flex-wrap gap-2">
        <g-button v-for="v in variants" :key="'dl2-' + v" :variant="v" danger loading>{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Shape + Variant -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Shape (circle) + Variant</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="v in variants" :key="'sc-' + v" :variant="v" shape="circle" size="icon"
          >+</g-button
        >
      </div>
    </div>

    <!-- Shape (round) + Variant -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Shape (round) + Variant</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button v-for="v in variants" :key="'sr-' + v" :variant="v" shape="round">{{
          v
        }}</g-button>
      </div>
    </div>

    <!-- Shape (circle) + Loading -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-muted-foreground">Shape (circle) + Loading</span>
      <div class="flex flex-wrap items-center gap-2">
        <g-button
          v-for="s in iconSizes"
          :key="'cl-' + s"
          :size="s"
          shape="circle"
          loading
          variant="primary"
        />
      </div>
    </div>
  </div>
</template>
