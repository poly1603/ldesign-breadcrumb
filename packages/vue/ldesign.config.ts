import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/breadcrumb-vue 构建配置
 *
 * 面包屑组件 Vue 3 适配器
 */
export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    // ESM 模块
    esm: {
      dir: 'esm',
      sourcemap: true,
    },

    // CJS 模块
    cjs: {
      dir: 'cjs',
      sourcemap: true,
    },

    // UMD 模块 - 禁用
    umd: {
      enabled: false,
    },
  },

  // 外部依赖
  external: [
    'vue',
    'vue-router',
    '@ldesign/breadcrumb-core',
    'tslib',
    /^node:/,
  ],

  // 全局变量映射 (UMD 使用)
  globals: {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    '@ldesign/breadcrumb-core': 'LDesignBreadcrumbCore',
  },

  // 库类型
  libraryType: 'vue3',

  // 打包器
  bundler: 'rollup',

  // 类型声明
  dts: {
    enabled: true,
  },
})

