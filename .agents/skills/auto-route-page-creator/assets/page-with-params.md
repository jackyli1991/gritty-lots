## 带动态路由参数的页面模板

```vue
<template>
  <div>参数：id = {{ $route.params.id }}</div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'asyncPageName',
  });
</script>
```
