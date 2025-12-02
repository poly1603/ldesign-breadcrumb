/**
 * 面包屑组合式函数
 * @module composables/useBreadcrumb
 */

import type { InjectionKey, Ref } from 'vue'
import type {
  BreadcrumbConfig,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbSize,
} from '@ldesign/breadcrumb-core'
import { inject, provide } from 'vue'

/**
 * 面包屑上下文
 */
export interface BreadcrumbContext {
  /**
   * 分隔符
   */
  separator: Ref<BreadcrumbSeparator>

  /**
   * 组件大小
   */
  size: Ref<BreadcrumbSize>

  /**
   * 最后一项是否可点击
   */
  lastItemClickable: Ref<boolean>

  /**
   * 当前面包屑项列表
   */
  items: Ref<BreadcrumbItem[]>

  /**
   * 是否展开折叠项
   */
  expanded: Ref<boolean>

  /**
   * 处理项点击
   */
  handleItemClick: (item: BreadcrumbItem, index: number, event: MouseEvent) => void

  /**
   * 切换展开状态
   */
  toggleExpand: () => void
}

/**
 * 面包屑上下文注入键
 */
export const BREADCRUMB_CONTEXT_KEY: InjectionKey<BreadcrumbContext> = Symbol('breadcrumb-context')

/**
 * 提供面包屑上下文
 * @param context - 面包屑上下文
 */
export function provideBreadcrumbContext(context: BreadcrumbContext): void {
  provide(BREADCRUMB_CONTEXT_KEY, context)
}

/**
 * 注入面包屑上下文
 * @returns 面包屑上下文
 * @throws 如果未在 Breadcrumb 组件内部使用会抛出错误
 */
export function useBreadcrumbContext(): BreadcrumbContext {
  const context = inject(BREADCRUMB_CONTEXT_KEY)
  if (!context) {
    throw new Error('[LBreadcrumb] useBreadcrumbContext must be used inside a Breadcrumb component')
  }
  return context
}

/**
 * 面包屑配置 composable 选项
 */
export interface UseBreadcrumbOptions extends Partial<BreadcrumbConfig> {
  /**
   * 点击回调
   */
  onClick?: (item: BreadcrumbItem, index: number, event: MouseEvent) => void
}

