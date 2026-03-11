import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import RemoveCode from './plugins/RemoveCode';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    base: './',
    server: {
      port: 8080,
      open: true,
    },
    define: {
      __PROD__: isProd,
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // RemoveCode(mode),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@/styles/var.scss" as *;
            @use "@/styles/element.scss" as element;
          `,
        },
      },
    },
    build: {
      outDir: `dist`,
      assetsDir: 'static',
      target: 'es2015',
      minify: 'esbuild',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          mobile: resolve(__dirname, 'mobile/index.html'),
        },
      },
    },
  };
});
