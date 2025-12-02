/**
 * 基于路由自动生成面包屑
 * @module composables/useBreadcrumbRoute
 */

import type { BreadcrumbItem, RouteBreadcrumbMeta } from '@ldesign/breadcrumb-core'
import type { RouteLocationMatched, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { computed, ref, watch } from 'vue'

/**
 * 路由面包屑选项
 */
export interface UseBreadcrumbRouteOptions {
  /**
   * Vue Router 实例
   */
  router?: Router

  /**
   * 当前路由
   */
  route?: RouteLocationNormalizedLoaded

  /**
   * 是否包含首页
   * @default true
   */
  includeHome?: boolean

  /**
   * 首页配置
   */
  homeItem?: Partial<BreadcrumbItem>

  /**
   * 自定义转换函数
   */
  transform?: (route: RouteLocationMatched, index: number) => BreadcrumbItem | null
}

/**
 * 默认首页配置
 */
const DEFAULT_HOME: BreadcrumbItem = {
  key: 'home',
  label: '首页',
  path: '/',
  icon: 'home',
}

/**
 * 从路由元信息提取面包屑配置
 * @param route - 匹配的路由
 * @returns 面包屑项或 null
 */
function extractBreadcrumbFromRoute(route: RouteLocationMatched): BreadcrumbItem | null {
  const meta = route.meta as RouteBreadcrumbMeta | undefined

  // 如果配置为隐藏，则跳过
  if (meta?.hiddenInBreadcrumb || meta?.breadcrumb === false) {
    return null
  }

  // 获取标题
  const label = meta?.breadcrumb?.label || meta?.title || route.name?.toString() || ''
  if (!label) {
    return null
  }

  // 构建面包屑项
  const item: BreadcrumbItem = {
    key: route.path,
    label,
    path: route.path,
    icon: meta?.icon || meta?.breadcrumb?.icon,
    ...meta?.breadcrumb,
  }

  return item
}

/**
 * 基于路由自动生成面包屑
 * @param options - 选项
 * @returns 面包屑项列表
 */
export function useBreadcrumbRoute(options: UseBreadcrumbRouteOptions = {}) {
  const {
    router,
    route,
    includeHome = true,
    homeItem,
    transform,
  } = options

  // 面包屑项列表
  const items = ref<BreadcrumbItem[]>([])

  /**
   * 从当前路由生成面包屑
   */
  const generateBreadcrumbs = (currentRoute: RouteLocationNormalizedLoaded) => {
    const result: BreadcrumbItem[] = []

    // 添加首页
    if (includeHome) {
      result.push({
        ...DEFAULT_HOME,
        ...homeItem,
      })
    }

    // 遍历匹配的路由
    currentRoute.matched.forEach((matchedRoute, index) => {
      // 跳过首页路由（如果已添加）
      if (includeHome && matchedRoute.path === '/') {
        return
      }

      // 使用自定义转换函数或默认提取
      const item = transform
        ? transform(matchedRoute, index)
        : extractBreadcrumbFromRoute(matchedRoute)

      if (item) {
        result.push(item)
      }
    })

    items.value = result
  }

  // 如果提供了路由，监听路由变化
  if (route) {
    watch(
      () => route.path,
      () => generateBreadcrumbs(route),
      { immediate: true },
    )
  }

  // 计算属性版本
  const computedItems = computed(() => items.value)

  return {
    /**
     * 面包屑项列表
     */
    items: computedItems,

    /**
     * 手动刷新面包屑
     */
    refresh: () => {
      if (route) {
        generateBreadcrumbs(route)
      }
    },

    /**
     * 设置面包屑项（覆盖自动生成）
     */
    setItems: (newItems: BreadcrumbItem[]) => {
      items.value = newItems
    },
  }
}

