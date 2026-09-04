<template>
  <div>
    <h1>这是一个隐藏路由，不会在菜单中显示，但是你仍然可以通过路由跳转访问它。</h1>
    <br />
    <Button @click="router.back()">返回</Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from 'ant-design-vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
</script>
