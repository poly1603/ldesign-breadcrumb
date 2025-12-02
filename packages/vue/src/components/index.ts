/**
 * 组件导出
 * @module components
 */

import Breadcrumb from './Breadcrumb.vue'
import BreadcrumbDropdown from './BreadcrumbDropdown.vue'
import BreadcrumbItem from './BreadcrumbItem.vue'
import BreadcrumbSeparator from './BreadcrumbSeparator.vue'

// 导出组件
export {
  Breadcrumb,
  Breadcrumb as LBreadcrumb,
  BreadcrumbDropdown,
  BreadcrumbDropdown as LBreadcrumbDropdown,
  BreadcrumbItem,
  BreadcrumbItem as LBreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbSeparator as LBreadcrumbSeparator,
}

// 导出组件类型
export type { BreadcrumbProps } from './Breadcrumb.vue'
export type { BreadcrumbDropdownProps } from './BreadcrumbDropdown.vue'
export type { BreadcrumbItemProps } from './BreadcrumbItem.vue'

