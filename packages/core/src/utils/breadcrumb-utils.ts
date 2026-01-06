/**
 * 面包屑工具函数
 * @module utils/breadcrumb-utils
 * @description 提供面包屑组件的通用工具函数
 */

import type { BreadcrumbConfig, BreadcrumbItem } from '../types'
import { DEFAULT_BREADCRUMB_CONFIG, DEFAULT_HOME_ITEM, SEPARATOR_MAP } from '../types'

// ==================== 通用工具 ====================

/**
 * 生成唯一键
 * @param prefix - 前缀
 * @returns 唯一键
 * @example
 * ```ts
 * const key = generateKey('item') // 'item-1704067200000-abc123'
 * ```
 */
export function generateKey(prefix = 'breadcrumb'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 深度克隆对象
 * @description 使用 structuredClone 或 JSON 方法进行深拷贝
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 * @example
 * ```ts
 * const cloned = deepClone({ a: { b: 1 } })
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 优先使用 structuredClone（现代浏览器和 Node.js 17+）
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj)
    }
    catch {
      // structuredClone 不支持某些类型（如函数），回退到 JSON 方法
    }
  }

  // 回退到 JSON 方法
  try {
    return JSON.parse(JSON.stringify(obj))
  }
  catch {
    // 如果 JSON 方法失败，返回原对象（不应该发生）
    return obj
  }
}

/**
 * 浅比较两个对象是否相等
 * @param a - 第一个对象
 * @param b - 第二个对象
 * @returns 是否相等
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 * @example
 * ```ts
 * const debouncedFn = debounce(() => console.log('called'), 300)
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @returns 节流后的函数
 * @example
 * ```ts
 * const throttledFn = throttle(() => console.log('called'), 300)
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    }
    else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
        timeoutId = null
      }, limit - (now - lastCall))
    }
  }
}

// ==================== 面包屑专用 ====================

/**
 * 判断面包屑项是否可点击
 * @param item - 面包屑项
 * @param isLast - 是否为最后一项
 * @param lastItemClickable - 最后一项是否可点击
 * @returns 是否可点击
 * @example
 * ```ts
 * const clickable = isItemClickable(item, false, false)
 * ```
 */
export function isItemClickable(
  item: BreadcrumbItem,
  isLast: boolean,
  lastItemClickable: boolean,
): boolean {
  // 禁用状态不可点击
  if (item.disabled) {
    return false
  }

  // 显式设置了 clickable 属性
  if (item.clickable !== undefined) {
    return item.clickable
  }

  // 最后一项根据配置决定
  if (isLast) {
    return lastItemClickable
  }

  // 有链接或路径的项可点击
  return !!(item.href || item.path)
}

/**
 * 判断面包屑项是否有下拉菜单
 * @param item - 面包屑项
 * @returns 是否有下拉菜单
 */
export function hasDropdown(item: BreadcrumbItem): boolean {
  return Array.isArray(item.children) && item.children.length > 0
}

/**
 * 计算可见项和折叠项
 * @param items - 所有面包屑项
 * @param config - 配置
 * @returns 可见项和折叠项信息
 * @example
 * ```ts
 * const result = calculateVisibleItems(items, { maxItems: 5 })
 * // { beforeItems: [...], collapsedItems: [...], afterItems: [...], needsCollapse: true }
 * ```
 */
export function calculateVisibleItems(
  items: BreadcrumbItem[],
  config: Pick<BreadcrumbConfig, 'maxItems' | 'itemsBeforeCollapse' | 'itemsAfterCollapse'>,
): {
  /** 可见项（折叠前的部分） */
  beforeItems: BreadcrumbItem[]
  /** 被折叠的项 */
  collapsedItems: BreadcrumbItem[]
  /** 可见项（折叠后的部分） */
  afterItems: BreadcrumbItem[]
  /** 是否需要折叠 */
  needsCollapse: boolean
} {
  const {
    maxItems = DEFAULT_BREADCRUMB_CONFIG.maxItems,
    itemsBeforeCollapse = DEFAULT_BREADCRUMB_CONFIG.itemsBeforeCollapse,
    itemsAfterCollapse = DEFAULT_BREADCRUMB_CONFIG.itemsAfterCollapse,
  } = config

  // 不需要折叠
  if (!maxItems || items.length <= maxItems) {
    return {
      beforeItems: items,
      collapsedItems: [],
      afterItems: [],
      needsCollapse: false,
    }
  }

  // 确保折叠前后项数不超过总项数
  const effectiveBefore = Math.min(itemsBeforeCollapse, items.length - 1)
  const effectiveAfter = Math.min(itemsAfterCollapse, items.length - effectiveBefore)

  return {
    beforeItems: items.slice(0, effectiveBefore),
    collapsedItems: items.slice(effectiveBefore, items.length - effectiveAfter),
    afterItems: items.slice(items.length - effectiveAfter),
    needsCollapse: true,
  }
}

/**
 * 合并配置与默认值
 * @param config - 用户配置
 * @returns 完整配置
 */
export function mergeConfig(config: Partial<BreadcrumbConfig>): BreadcrumbConfig {
  return {
    ...DEFAULT_BREADCRUMB_CONFIG,
    ...config,
    items: config.items ?? [],
    homeItem: config.homeItem ?? DEFAULT_HOME_ITEM,
  }
}

/**
 * 规范化面包屑项
 * @description 确保每个项都有唯一的 key
 * @param items - 面包屑项列表
 * @returns 规范化后的列表
 */
export function normalizeItems<T extends BreadcrumbItem>(items: T[]): T[] {
  return items.map((item, index) => ({
    ...item,
    key: item.key || generateKey(`item-${index}`),
  }))
}

/**
 * 获取分隔符字符
 * @param separator - 分隔符类型
 * @returns 分隔符字符
 * @example
 * ```ts
 * getSeparatorChar('slash') // '/'
 * getSeparatorChar('arrow') // '>'
 * getSeparatorChar('•') // '•'
 * ```
 */
export function getSeparatorChar(separator: string): string {
  return SEPARATOR_MAP[separator] ?? separator
}

/**
 * 解析路径为面包屑项
 * @description 将 URL 路径解析为面包屑项数组
 * @param path - URL 路径
 * @param options - 解析选项
 * @returns 面包屑项数组
 * @example
 * ```ts
 * parsePath('/users/123/posts')
 * // [
 * //   { key: 'users', label: 'users', path: '/users' },
 * //   { key: '123', label: '123', path: '/users/123' },
 * //   { key: 'posts', label: 'posts', path: '/users/123/posts' }
 * // ]
 * ```
 */
export function parsePath(
  path: string,
  options: {
    /** 自定义标签映射 */
    labelMap?: Record<string, string>
    /** 是否包含根路径 */
    includeRoot?: boolean
    /** 要排除的路径段 */
    excludeSegments?: string[]
  } = {},
): BreadcrumbItem[] {
  const { labelMap = {}, includeRoot = false, excludeSegments = [] } = options

  // 移除开头的斜杠并分割
  const segments = path.replace(/^\//, '').split('/').filter(Boolean)

  // 过滤排除的段
  const filteredSegments = segments.filter(seg => !excludeSegments.includes(seg))

  const items: BreadcrumbItem[] = []
  let currentPath = ''

  // 如果包含根路径
  if (includeRoot && filteredSegments.length > 0) {
    items.push({
      key: 'root',
      label: labelMap['/'] || '首页',
      path: '/',
    })
  }

  for (const segment of filteredSegments) {
    currentPath += `/${segment}`
    items.push({
      key: segment,
      label: labelMap[segment] || labelMap[currentPath] || segment,
      path: currentPath,
    })
  }

  return items
}

/**
 * 比较两个面包屑项数组是否相等
 * @param a - 第一个数组
 * @param b - 第二个数组
 * @returns 是否相等
 */
export function areItemsEqual(a: BreadcrumbItem[], b: BreadcrumbItem[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, index) => item.key === b[index].key && item.label === b[index].label)
}

/**
 * 查找面包屑项
 * @param items - 面包屑项数组
 * @param predicate - 查找条件
 * @returns 找到的项或 undefined
 */
export function findItem(
  items: BreadcrumbItem[],
  predicate: (item: BreadcrumbItem, index: number) => boolean,
): BreadcrumbItem | undefined {
  return items.find(predicate)
}

/**
 * 截取面包屑到指定项
 * @description 保留从开头到指定 key 的项
 * @param items - 面包屑项数组
 * @param key - 目标项的 key
 * @returns 截取后的数组
 */
export function truncateToItem(items: BreadcrumbItem[], key: string): BreadcrumbItem[] {
  const index = items.findIndex(item => item.key === key)
  if (index === -1) return items
  return items.slice(0, index + 1)
}

/**
 * 获取面包屑的完整路径
 * @description 将面包屑项拼接为完整路径字符串
 * @param items - 面包屑项数组
 * @param separator - 路径分隔符
 * @returns 完整路径
 */
export function getFullPath(items: BreadcrumbItem[], separator = ' / '): string {
  return items.map(item => item.label).join(separator)
}

