import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_BASE_PATH,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('gritty-'), // 自定义Web Component 前缀
          },
        },
      }),
      Components(),
      tailwindcss(),
      vueDevTools(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false,
          }),
        ],
      }),
      VitePWA({
        // autoUpdate：新 SW 接管后自动刷新；prompt：弹提示让用户手动刷新
        registerType: 'autoUpdate',
        // 仅声明 public 下实际存在的额外资产；manifest 图标会自动纳入预缓存，无需在此重复
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Gritty Lots',
          short_name: 'Gritty Lots',
          description: 'Gritty Lots Admin PWA',
          // 与 favicon.svg 品牌色及 public/pwa-*.png 占位图标背景色保持一致
          theme_color: '#863bff',
          background_color: '#ffffff',
          display: 'standalone',
          lang: 'zh-CN',
          // start_url / scope 不在此写死：1.3.0 默认跟随 Vite base（VITE_BASE_PATH），
          // 子路径部署（如 GitHub Pages 的 /repo-name/）也能正确解析
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            // maskable：Android自适应图标，需内容落在安全区（半径≤40%）；占位图标半径35%满足
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{html,js,css,png,jpg,svg,ico,woff2}'],
          // 默认 2 MiB 上限会因 router chunk（聚合 eager glob 的全部视图）超限而中断构建
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === 'https://api.iconify.design',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'iconify-cache' },
            },
          ],
        },
        devOptions: {
          enabled: false, // dev 不启用 SW，避免 HMR 干扰；需要调试时改 true
        },
      }),
    ],
  };
});
