<template>
  <div>
    <h1>动态路由参数：id = {{ $route.params.id }}， name = {{ $route.params.name }}</h1>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'AsyncIdName',
  });
</script>
