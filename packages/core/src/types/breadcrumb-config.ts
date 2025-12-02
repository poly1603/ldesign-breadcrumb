/**
 * 面包屑配置类型定义
 * @module types/breadcrumb-config
 */

import type { BreadcrumbItem } from './breadcrumb-item'

/**
 * 分隔符类型
 */
export type BreadcrumbSeparator = string | 'slash' | 'arrow' | 'dot'

/**
 * 面包屑大小
 */
export type BreadcrumbSize = 'small' | 'medium' | 'large'

/**
 * 面包屑配置
 */
export interface BreadcrumbConfig {
  /**
   * 面包屑项列表
   */
  items: BreadcrumbItem[]

  /**
   * 分隔符
   * @default '/'
   */
  separator?: BreadcrumbSeparator

  /**
   * 组件大小
   * @default 'medium'
   */
  size?: BreadcrumbSize

  /**
   * 最大显示项数（超出时会折叠中间项）
   * 0 或 undefined 表示不限制
   */
  maxItems?: number

  /**
   * 折叠后保留的头部项数
   * @default 1
   */
  itemsBeforeCollapse?: number

  /**
   * 折叠后保留的尾部项数
   * @default 2
   */
  itemsAfterCollapse?: number

  /**
   * 是否显示首页
   * @default true
   */
  showHome?: boolean

  /**
   * 首页配置
   */
  homeItem?: Partial<BreadcrumbItem>

  /**
   * 是否自动从路由生成
   * @default false
   */
  autoGenerate?: boolean

  /**
   * 最后一项是否可点击
   * @default false
   */
  lastItemClickable?: boolean
}

/**
 * 默认配置
 */
export const DEFAULT_BREADCRUMB_CONFIG: Required<Omit<BreadcrumbConfig, 'items' | 'homeItem'>> = {
  separator: '/',
  size: 'medium',
  maxItems: 0,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 2,
  showHome: true,
  autoGenerate: false,
  lastItemClickable: false,
}

/**
 * 默认首页配置
 */
export const DEFAULT_HOME_ITEM: BreadcrumbItem = {
  key: 'home',
  label: '首页',
  path: '/',
  icon: 'home',
}

