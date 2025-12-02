/**
 * 面包屑项类型定义
 * @module types/breadcrumb-item
 */

/**
 * 链接打开方式
 */
export type BreadcrumbTarget = '_self' | '_blank' | '_parent' | '_top'

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  /**
   * 唯一标识
   */
  key: string

  /**
   * 显示文本
   */
  label: string

  /**
   * 图标名称或组件
   */
  icon?: string

  /**
   * 链接地址（外部链接）
   */
  href?: string

  /**
   * 路由路径（内部路由）
   */
  path?: string

  /**
   * 路由参数
   */
  params?: Record<string, string | number>

  /**
   * 路由查询参数
   */
  query?: Record<string, string | number | boolean>

  /**
   * 链接打开方式
   * @default '_self'
   */
  target?: BreadcrumbTarget

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否可点击
   * @default true
   */
  clickable?: boolean

  /**
   * 下拉菜单项（支持快速导航到子页面）
   */
  children?: BreadcrumbDropdownItem[]

  /**
   * 额外元数据
   */
  meta?: Record<string, unknown>
}

/**
 * 下拉菜单项
 */
export interface BreadcrumbDropdownItem {
  /**
   * 唯一标识
   */
  key: string

  /**
   * 显示文本
   */
  label: string

  /**
   * 图标
   */
  icon?: string

  /**
   * 链接地址
   */
  href?: string

  /**
   * 路由路径
   */
  path?: string

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 额外元数据
   */
  meta?: Record<string, unknown>
}

/**
 * 路由元信息中的面包屑配置
 */
export interface RouteBreadcrumbMeta {
  /**
   * 面包屑显示文本
   */
  title?: string

  /**
   * 面包屑图标
   */
  icon?: string

  /**
   * 是否在面包屑中隐藏
   */
  hiddenInBreadcrumb?: boolean

  /**
   * 自定义面包屑配置
   */
  breadcrumb?: Partial<BreadcrumbItem> | false
}

