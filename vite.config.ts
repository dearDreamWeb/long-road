import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint'; // 引入
import path from 'path';
import postCssPxToRem from 'postcss-pxtorem';
import vitePluginTimer from 'vite-plugin-timer';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        parserOpts: {
          // 装饰器
          plugins: ['decorators-legacy'],
        },
      },
    }),
    // 配置eslintPlugin
    eslintPlugin({
      cache: false,
      include: './src',
    }),
    visualizer(),
    vitePluginTimer(),
  ],
  base: './',
  server: {
    port: 1245,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  css: {
    //* css模块化
    modules: {
      // css模块化 文件以.module.[css|less|scss]结尾
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
    //* 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
    postcss: {
      plugins: [
        postCssPxToRem({
          //允许REM单位增长到的十进制数字,小数点后保留的位数
          unitPrecision: 5,
          //要忽略并保留为px的选择器，本项目我是用的vant ui框架，所以忽略他
          selectorBlackList: ['body'],
          propList: ['*'], // 需要转换的属性，这里选择全部都进行转换
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      manualChunks: (id) => {
        if (id.includes('node_modules/@pixi')) {
          return 'pixi';
        }
      },
    },
  },
});
