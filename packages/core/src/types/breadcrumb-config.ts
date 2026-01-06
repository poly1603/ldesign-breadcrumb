/**
 * 面包屑配置类型定义
 * @module types/breadcrumb-config
 * @description 定义面包屑组件的配置选项和默认值
 */

import type { BreadcrumbItem } from './breadcrumb-item'

/**
 * 分隔符类型
 * @description 预定义的分隔符类型或自定义字符串
 * @example
 * ```ts
 * const separator: BreadcrumbSeparator = 'slash' // '/'
 * const separator: BreadcrumbSeparator = 'arrow' // '>'
 * const separator: BreadcrumbSeparator = '•' // 自定义
 * ```
 */
export type BreadcrumbSeparator = 'slash' | 'arrow' | 'dot' | 'chevron' | (string & {})

/**
 * 面包屑大小
 * @description 组件尺寸预设
 */
export type BreadcrumbSize = 'small' | 'medium' | 'large'

/**
 * 折叠模式
 * @description 超出最大项数时的处理方式
 */
export type BreadcrumbCollapseMode = 'ellipsis' | 'dropdown' | 'none'

/**
 * 面包屑配置
 * @description 面包屑组件的完整配置选项
 * @template TMeta - 元数据类型
 * @example
 * ```ts
 * const config: BreadcrumbConfig = {
 *   items: [
 *     { key: 'home', label: '首页', path: '/' },
 *     { key: 'users', label: '用户', path: '/users' }
 *   ],
 *   separator: '/',
 *   maxItems: 5,
 *   showHome: true
 * }
 * ```
 */
export interface BreadcrumbConfig<TMeta = unknown> {
  /**
   * 面包屑项列表
   * @description 当前要显示的面包屑项
   */
  items: BreadcrumbItem<TMeta>[]

  /**
   * 分隔符
   * @default '/'
   * @description 项之间的分隔符号
   */
  separator?: BreadcrumbSeparator

  /**
   * 组件大小
   * @default 'medium'
   * @description 影响字体大小和间距
   */
  size?: BreadcrumbSize

  /**
   * 最大显示项数
   * @description 超出时会折叠中间项，0 表示不限制
   */
  maxItems?: number

  /**
   * 折叠后保留的头部项数
   * @default 1
   * @description 折叠时始终显示的前置项数量
   */
  itemsBeforeCollapse?: number

  /**
   * 折叠后保留的尾部项数
   * @default 2
   * @description 折叠时始终显示的后置项数量
   */
  itemsAfterCollapse?: number

  /**
   * 折叠模式
   * @default 'ellipsis'
   * @description 超出最大项数时的显示方式
   */
  collapseMode?: BreadcrumbCollapseMode

  /**
   * 是否显示首页
   * @default true
   * @description 是否自动在开头添加首页项
   */
  showHome?: boolean

  /**
   * 首页配置
   * @description 自定义首页项的配置
   */
  homeItem?: Partial<BreadcrumbItem<TMeta>>

  /**
   * 是否自动从路由生成
   * @default false
   * @description 启用后会根据当前路由自动生成面包屑
   */
  autoGenerate?: boolean

  /**
   * 最后一项是否可点击
   * @default false
   * @description 通常最后一项是当前页面，不需要点击
   */
  lastItemClickable?: boolean

  /**
   * 自定义分隔符渲染函数
   * @description 用于完全自定义分隔符的渲染
   */
  separatorRender?: () => unknown

  /**
   * 自定义项渲染函数
   * @description 用于完全自定义面包屑项的渲染
   */
  itemRender?: (item: BreadcrumbItem<TMeta>, index: number, items: BreadcrumbItem<TMeta>[]) => unknown

  /**
   * 是否在路由变化时自动更新
   * @default true
   * @description 仅在 autoGenerate 为 true 时有效
   */
  watchRoute?: boolean

  /**
   * 缓存路由生成的面包屑
   * @default true
   * @description 是否缓存路由到面包屑的映射
   */
  cacheRoutes?: boolean

  /**
   * aria-label 属性
   * @default '面包屑导航'
   */
  ariaLabel?: string
}

/**
 * 深度必选的配置类型
 * @description 所有属性都是必选的配置类型
 */
export type RequiredBreadcrumbConfig<TMeta = unknown> = Required<BreadcrumbConfig<TMeta>>

/**
 * 部分配置类型
 * @description 所有属性都是可选的配置类型
 */
export type PartialBreadcrumbConfig<TMeta = unknown> = Partial<BreadcrumbConfig<TMeta>>

/**
 * 默认配置
 * @description 面包屑组件的默认配置值
 */
export const DEFAULT_BREADCRUMB_CONFIG: Required<Omit<BreadcrumbConfig, 'items' | 'homeItem' | 'separatorRender' | 'itemRender'>> = {
  separator: '/',
  size: 'medium',
  maxItems: 0,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 2,
  collapseMode: 'ellipsis',
  showHome: true,
  autoGenerate: false,
  lastItemClickable: false,
  watchRoute: true,
  cacheRoutes: true,
  ariaLabel: '面包屑导航',
}

/**
 * 默认首页配置
 * @description 首页项的默认配置
 */
export const DEFAULT_HOME_ITEM: BreadcrumbItem = {
  key: 'home',
  label: '首页',
  path: '/',
  icon: 'home',
}

/**
 * 分隔符映射表
 * @description 预定义分隔符到实际字符的映射
 */
export const SEPARATOR_MAP: Record<string, string> = {
  slash: '/',
  arrow: '>',
  dot: '•',
  chevron: '›',
}

/**
 * 尺寸映射表
 * @description 尺寸到 CSS 变量名的映射
 */
export const SIZE_MAP: Record<BreadcrumbSize, string> = {
  small: 'l-breadcrumb--small',
  medium: 'l-breadcrumb--medium',
  large: 'l-breadcrumb--large',
}

