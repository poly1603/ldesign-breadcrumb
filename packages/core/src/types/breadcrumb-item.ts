/**
 * 面包屑项类型定义
 * @module types/breadcrumb-item
 * @description 定义面包屑组件的核心数据结构和类型
 */

/**
 * 链接打开方式
 * @description 与 HTML `<a>` 标签的 target 属性对应
 * @example
 * ```ts
 * const target: BreadcrumbTarget = '_blank' // 新窗口打开
 * ```
 */
export type BreadcrumbTarget = '_self' | '_blank' | '_parent' | '_top'

/**
 * 路由参数值类型
 * @description 路由参数支持的值类型
 */
export type RouteParamValue = string | number

/**
 * 路由查询参数值类型
 * @description 查询参数支持的值类型，包括数组形式
 */
export type RouteQueryValue = string | number | boolean | null | undefined | (string | number | boolean)[]

/**
 * 路由参数对象
 * @description 路由动态参数映射
 */
export type RouteParams = Record<string, RouteParamValue>

/**
 * 路由查询参数对象
 * @description 路由查询字符串参数映射
 */
export type RouteQuery = Record<string, RouteQueryValue>

/**
 * 元数据类型
 * @description 用于存储自定义数据的通用类型
 * @template T - 元数据的具体类型，默认为 unknown
 */
export type BreadcrumbMeta<T = unknown> = Record<string, T>

/**
 * 面包屑项接口
 * @description 定义单个面包屑项的完整结构
 * @template TMeta - 元数据类型
 * @example
 * ```ts
 * // 基本用法
 * const item: BreadcrumbItem = {
 *   key: 'home',
 *   label: '首页',
 *   path: '/'
 * }
 *
 * // 带下拉菜单
 * const itemWithDropdown: BreadcrumbItem = {
 *   key: 'products',
 *   label: '产品',
 *   path: '/products',
 *   children: [
 *     { key: 'phone', label: '手机', path: '/products/phone' },
 *     { key: 'laptop', label: '笔记本', path: '/products/laptop' }
 *   ]
 * }
 *
 * // 外部链接
 * const externalItem: BreadcrumbItem = {
 *   key: 'docs',
 *   label: '文档',
 *   href: 'https://docs.example.com',
 *   target: '_blank'
 * }
 * ```
 */
export interface BreadcrumbItem<TMeta = unknown> {
  /**
   * 唯一标识
   * @description 用于 Vue 的 key 和内部标识，必须在列表中唯一
   */
  readonly key: string

  /**
   * 显示文本
   * @description 面包屑项的显示文字
   */
  label: string

  /**
   * 图标
   * @description 图标名称（字符串）或图标组件
   * @example 'home' | 'user' | IconComponent
   */
  icon?: string | object

  /**
   * 链接地址（外部链接）
   * @description 用于跳转到外部 URL
   * @example 'https://example.com'
   */
  href?: string

  /**
   * 路由路径（内部路由）
   * @description 用于 vue-router 导航
   * @example '/users/123'
   */
  path?: string

  /**
   * 路由参数
   * @description 动态路由参数
   * @example { id: '123', slug: 'hello' }
   */
  params?: RouteParams

  /**
   * 路由查询参数
   * @description URL 查询字符串参数
   * @example { page: 1, sort: 'desc' }
   */
  query?: RouteQuery

  /**
   * 链接打开方式
   * @default '_self'
   * @description 控制链接的打开行为
   */
  target?: BreadcrumbTarget

  /**
   * 是否禁用
   * @default false
   * @description 禁用后不可点击，显示为灰色
   */
  disabled?: boolean

  /**
   * 是否可点击
   * @description 显式设置是否可点击，优先级高于自动判断
   */
  clickable?: boolean

  /**
   * 下拉菜单项
   * @description 子页面快速导航列表
   */
  children?: BreadcrumbDropdownItem<TMeta>[]

  /**
   * 额外元数据
   * @description 存储自定义数据，如权限、徽标等
   * @example { badge: 'new', permission: 'admin' }
   */
  meta?: BreadcrumbMeta<TMeta>

  /**
   * 工具提示
   * @description 鼠标悬停时显示的提示文本
   */
  tooltip?: string

  /**
   * 自定义类名
   * @description 添加到面包屑项的额外 CSS 类
   */
  className?: string

  /**
   * 自定义样式
   * @description 添加到面包屑项的内联样式
   */
  style?: Record<string, string | number>
}

/**
 * 下拉菜单项
 * @description 面包屑下拉菜单的子项结构
 * @template TMeta - 元数据类型
 * @example
 * ```ts
 * const dropdownItem: BreadcrumbDropdownItem = {
 *   key: 'settings',
 *   label: '设置',
 *   path: '/settings',
 *   icon: 'settings'
 * }
 * ```
 */
export interface BreadcrumbDropdownItem<TMeta = unknown> {
  /**
   * 唯一标识
   */
  readonly key: string

  /**
   * 显示文本
   */
  label: string

  /**
   * 图标
   */
  icon?: string | object

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
  params?: RouteParams

  /**
   * 路由查询参数
   */
  query?: RouteQuery

  /**
   * 链接打开方式
   */
  target?: BreadcrumbTarget

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 额外元数据
   */
  meta?: BreadcrumbMeta<TMeta>

  /**
   * 分隔线（在该项前显示分隔线）
   */
  divider?: boolean

  /**
   * 分组标签
   * @description 用于对下拉菜单项进行分组
   */
  group?: string
}

/**
 * 路由元信息中的面包屑配置
 * @description 用于在路由定义中配置面包屑行为
 * @example
 * ```ts
 * // 在路由定义中使用
 * const route = {
 *   path: '/users',
 *   meta: {
 *     title: '用户列表',
 *     icon: 'users',
 *     breadcrumb: {
 *       label: '用户管理'
 *     }
 *   } as RouteBreadcrumbMeta
 * }
 * ```
 */
export interface RouteBreadcrumbMeta {
  /**
   * 面包屑显示文本
   * @description 优先使用 breadcrumb.label，其次使用此值
   */
  title?: string

  /**
   * 面包屑图标
   */
  icon?: string | object

  /**
   * 是否在面包屑中隐藏
   * @description 设为 true 时该路由不会出现在面包屑中
   */
  hiddenInBreadcrumb?: boolean

  /**
   * 自定义面包屑配置
   * @description 设为 false 时完全隐藏，或传入部分配置进行自定义
   */
  breadcrumb?: Partial<BreadcrumbItem> | false

  /**
   * 替换路径
   * @description 用于处理重定向路由的面包屑显示
   */
  breadcrumbRedirect?: string

  /**
   * 父级路由 key
   * @description 用于自定义面包屑层级关系
   */
  breadcrumbParent?: string
}

/**
 * 创建面包屑项的工厂函数类型
 * @description 用于动态创建面包屑项
 */
export type BreadcrumbItemFactory<T = unknown> = (context: T) => BreadcrumbItem | null

/**
 * 面包屑项输入类型
 * @description 支持直接传入对象或工厂函数
 */
export type BreadcrumbItemInput<T = unknown> = BreadcrumbItem | BreadcrumbItemFactory<T>

/**
 * 只读面包屑项
 * @description 不可变的面包屑项类型
 */
export type ReadonlyBreadcrumbItem<TMeta = unknown> = Readonly<BreadcrumbItem<TMeta>>

