/**
 * 面包屑工具函数
 * @module utils/breadcrumb-utils
 */

import type { BreadcrumbConfig, BreadcrumbItem } from '../types'
import { DEFAULT_BREADCRUMB_CONFIG, DEFAULT_HOME_ITEM } from '../types'

/**
 * 生成唯一键
 * @param prefix - 前缀
 * @returns 唯一键
 */
export function generateKey(prefix = 'breadcrumb'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 判断面包屑项是否可点击
 * @param item - 面包屑项
 * @param isLast - 是否为最后一项
 * @param lastItemClickable - 最后一项是否可点击
 * @returns 是否可点击
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
 * 确保每个项都有唯一的 key
 * @param items - 面包屑项列表
 * @returns 规范化后的列表
 */
export function normalizeItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items.map((item, index) => ({
    ...item,
    key: item.key || generateKey(`item-${index}`),
  }))
}

/**
 * 获取分隔符字符
 * @param separator - 分隔符类型
 * @returns 分隔符字符
 */
export function getSeparatorChar(separator: string): string {
  switch (separator) {
    case 'slash':
      return '/'
    case 'arrow':
      return '>'
    case 'dot':
      return '•'
    default:
      return separator
  }
}

