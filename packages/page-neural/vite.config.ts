import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    tsconfigPaths: true, // 启用 tsconfig 路径解析功能
  },
});
