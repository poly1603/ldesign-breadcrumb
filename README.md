# @ldesign/breadcrumb

现代化的面包屑导航组件，支持 Vue 3，提供路由自动生成、下拉菜单、折叠显示等功能。

[![npm version](https://img.shields.io/npm/v/@ldesign/breadcrumb.svg)](https://www.npmjs.com/package/@ldesign/breadcrumb)
[![license](https://img.shields.io/npm/l/@ldesign/breadcrumb.svg)](https://github.com/ldesign/breadcrumb/blob/main/LICENSE)

## ✨ 特性

- 🎯 **框架无关核心** - 核心逻辑独立，可适配任意框架
- 🖼️ **Vue 3 组件** - 提供开箱即用的 Vue 3 组件
- 🔗 **路由集成** - 支持 Vue Router 自动生成面包屑
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- 🎨 **主题定制** - 支持 CSS 变量和暗色模式
- ♿ **无障碍支持** - 完善的 ARIA 属性和键盘导航
- 📦 **Tree-shaking** - 支持按需引入
- 💪 **TypeScript** - 完整的类型定义

## 📦 安装

```bash
# npm
npm install @ldesign/breadcrumb

# pnpm
pnpm add @ldesign/breadcrumb

# yarn
yarn add @ldesign/breadcrumb
```

## 🚀 快速开始

### 基础用法

```vue
<script setup lang="ts">
import { Breadcrumb } from '@ldesign/breadcrumb/vue'
import '@ldesign/breadcrumb/vue/styles'

const items = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'users', label: '用户列表', path: '/users' },
  { key: 'detail', label: '用户详情' }
]
</script>

<template>
  <Breadcrumb :items="items" />
</template>
```

### 与 Vue Router 集成

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Breadcrumb, useBreadcrumbRoute } from '@ldesign/breadcrumb/vue'

const route = useRoute()
const { items } = useBreadcrumbRoute({
  route,
  includeHome: true,
  labelMap: {
    '/users': '用户管理',
    '/settings': '系统设置'
  }
})
</script>

<template>
  <Breadcrumb :items="items" />
</template>
```

### 使用下拉菜单

```vue
<script setup lang="ts">
import { Breadcrumb } from '@ldesign/breadcrumb/vue'

const items = [
  { key: 'home', label: '首页', path: '/' },
  {
    key: 'products',
    label: '产品',
    path: '/products',
    children: [
      { key: 'phone', label: '手机', path: '/products/phone' },
      { key: 'laptop', label: '笔记本', path: '/products/laptop' },
      { key: 'tablet', label: '平板', path: '/products/tablet' }
    ]
  },
  { key: 'detail', label: '产品详情' }
]
</script>

<template>
  <Breadcrumb :items="items" @dropdown-select="handleSelect" />
</template>
```

### 自动折叠

```vue
<template>
  <Breadcrumb
    :items="items"
    :max-items="4"
    :items-before-collapse="1"
    :items-after-collapse="2"
  />
</template>
```

## 📖 API

### Breadcrumb Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `BreadcrumbItem[]` | `[]` | 面包屑项列表 |
| separator | `string` | `'/'` | 分隔符，可选 `'slash'` `'arrow'` `'dot'` 或自定义 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 组件大小 |
| maxItems | `number` | `0` | 最大显示项数，0 表示不限制 |
| itemsBeforeCollapse | `number` | `1` | 折叠后保留的头部项数 |
| itemsAfterCollapse | `number` | `2` | 折叠后保留的尾部项数 |
| showHome | `boolean` | `true` | 是否显示首页 |
| homeItem | `Partial<BreadcrumbItem>` | - | 首页配置 |
| lastItemClickable | `boolean` | `false` | 最后一项是否可点击 |
| ariaLabel | `string` | `'面包屑导航'` | aria-label 属性 |

### Breadcrumb Events

| 事件 | 参数 | 说明 |
|------|------|------|
| click | `(item, index, event)` | 点击面包屑项 |
| dropdownSelect | `(parentItem, selectedItem, event)` | 下拉菜单选择 |
| expandChange | `(expanded)` | 折叠状态变化 |

### Breadcrumb Slots

| 插槽 | 作用域 | 说明 |
|------|--------|------|
| default | - | 自定义整个内容 |
| separator | - | 自定义分隔符 |
| icon | `{ icon }` | 自定义图标渲染 |

### BreadcrumbItem 类型

```typescript
interface BreadcrumbItem {
  key: string          // 唯一标识
  label: string        // 显示文本
  icon?: string        // 图标
  href?: string        // 外部链接
  path?: string        // 路由路径
  params?: object      // 路由参数
  query?: object       // 查询参数
  target?: string      // 链接打开方式
  disabled?: boolean   // 是否禁用
  clickable?: boolean  // 是否可点击
  children?: BreadcrumbDropdownItem[]  // 下拉菜单项
  meta?: object        // 额外元数据
  tooltip?: string     // 工具提示
  className?: string   // 自定义类名
}
```

## 🎨 主题定制

组件使用 CSS 变量，可以轻松自定义主题：

```css
:root {
  /* 颜色 */
  --l-breadcrumb-color: #6b7280;
  --l-breadcrumb-color-hover: #3b82f6;
  --l-breadcrumb-color-active: #111827;
  --l-breadcrumb-color-disabled: #d1d5db;
  --l-breadcrumb-separator-color: #d1d5db;

  /* 字体 */
  --l-breadcrumb-font-size: 14px;
  --l-breadcrumb-font-size-small: 12px;
  --l-breadcrumb-font-size-large: 15px;

  /* 间距 */
  --l-breadcrumb-separator-margin: 0 10px;
  --l-breadcrumb-item-padding: 4px 6px;
  --l-breadcrumb-item-radius: 6px;

  /* 下拉菜单 */
  --l-breadcrumb-dropdown-bg: #ffffff;
  --l-breadcrumb-dropdown-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --l-breadcrumb-dropdown-radius: 12px;
}
```

### 暗色模式

组件自动支持暗色模式，通过以下方式激活：

```html
<!-- 方式一：使用 data 属性 -->
<html data-theme="dark">

<!-- 方式二：使用 class -->
<html class="dark">
```

## 🔧 高级用法

### 使用 BreadcrumbManager

```typescript
import { BreadcrumbManager } from '@ldesign/breadcrumb/core'

const manager = new BreadcrumbManager({
  items: [
    { key: 'home', label: '首页', path: '/' }
  ],
  maxItems: 5,
  enableHistory: true  // 启用历史记录，支持撤销/重做
})

// 监听事件
manager.on('click', ({ item, index }) => {
  console.log('clicked', item.label)
})

// 批量操作
manager.batch(() => {
  manager.addItem({ key: 'a', label: 'A' })
  manager.addItem({ key: 'b', label: 'B' })
  manager.removeItem('old')
})

// 撤销/重做
manager.undo()
manager.redo()

// 状态快照
const snapshot = manager.createSnapshot()
manager.restoreSnapshot(snapshot)
```

### 工具函数

```typescript
import {
  parsePath,
  calculateVisibleItems,
  generateKey,
  isItemClickable,
  hasDropdown,
  deepClone,
  debounce,
  throttle
} from '@ldesign/breadcrumb/core'

// 解析路径为面包屑项
const items = parsePath('/users/123/posts', {
  labelMap: { '/users': '用户' }
})

// 计算折叠后的可见项
const { beforeItems, collapsedItems, afterItems } = calculateVisibleItems(
  items,
  { maxItems: 3 }
)
```

## 📁 包结构

```
@ldesign/breadcrumb
├── core          # 框架无关的核心模块
│   ├── managers  # 状态管理器
│   ├── types     # 类型定义
│   └── utils     # 工具函数
└── vue           # Vue 3 适配器
    ├── components   # Vue 组件
    ├── composables  # 组合式函数
    └── styles       # 样式文件
```

## 键盘导航

组件支持以下键盘操作：

| 按键 | 操作 |
|------|------|
| `←` / `→` | 在面包屑项之间导航 |
| `Home` | 跳转到第一项 |
| `End` | 跳转到最后一项 |
| `Enter` / `Space` | 激活当前项 |
| `Escape` | 关闭下拉菜单 |

## 浏览器支持

- Chrome >= 80
- Firefox >= 78
- Safari >= 14
- Edge >= 80

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

[MIT](./LICENSE) License © 2024 LDesign Team
