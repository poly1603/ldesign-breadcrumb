/**
 * 面包屑事件类型定义
 * @module types/breadcrumb-events
 */

import type { BreadcrumbDropdownItem, BreadcrumbItem } from './breadcrumb-item'

/**
 * 面包屑点击事件参数
 */
export interface BreadcrumbClickEventParams {
  /**
   * 点击的面包屑项
   */
  item: BreadcrumbItem

  /**
   * 项索引
   */
  index: number

  /**
   * 原始事件
   */
  event: MouseEvent
}

/**
 * 下拉菜单选择事件参数
 */
export interface BreadcrumbDropdownSelectParams {
  /**
   * 父级面包屑项
   */
  parentItem: BreadcrumbItem

  /**
   * 选中的下拉菜单项
   */
  selectedItem: BreadcrumbDropdownItem

  /**
   * 原始事件
   */
  event: MouseEvent
}

/**
 * 折叠展开事件参数
 */
export interface BreadcrumbExpandParams {
  /**
   * 是否展开
   */
  expanded: boolean
}

/**
 * 面包屑事件映射
 */
export interface BreadcrumbEventMap {
  /**
   * 点击事件
   */
  click: BreadcrumbClickEventParams

  /**
   * 下拉菜单选择事件
   */
  dropdownSelect: BreadcrumbDropdownSelectParams

  /**
   * 折叠状态变化事件
   */
  expandChange: BreadcrumbExpandParams
}

/**
 * 事件处理函数类型
 */
export type BreadcrumbEventHandler<K extends keyof BreadcrumbEventMap> = (
  params: BreadcrumbEventMap[K]
) => void

