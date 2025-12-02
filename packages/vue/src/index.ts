/**
 * @ldesign/breadcrumb-vue
 * LDesign 面包屑组件 - Vue 3 组件
 * @packageDocumentation
 */

// 组件导出
export * from './components'

// Composables 导出
export * from './composables'

// 重新导出核心类型
export type {
  BreadcrumbClickEventParams,
  BreadcrumbConfig,
  BreadcrumbDropdownItem,
  BreadcrumbDropdownSelectParams,
  BreadcrumbEventHandler,
  BreadcrumbEventMap,
  BreadcrumbExpandParams,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbSize,
  BreadcrumbTarget,
  RouteBreadcrumbMeta,
} from '@ldesign/breadcrumb-core'

// 重新导出核心工具函数和常量
export {
  BreadcrumbManager,
  calculateVisibleItems,
  DEFAULT_BREADCRUMB_CONFIG,
  DEFAULT_HOME_ITEM,
  generateKey,
  getSeparatorChar,
  hasDropdown,
  isItemClickable,
  normalizeItems,
} from '@ldesign/breadcrumb-core'

