/**
 * 基于路由自动生成面包屑
 * @module composables/useBreadcrumbRoute
 * @description 提供与 Vue Router 集成的面包屑自动生成功能
 */

import type { BreadcrumbItem, RouteBreadcrumbMeta } from '@ldesign/breadcrumb-core'
import type { RouteLocationMatched, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'

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
   * @description 将路由转换为面包屑项，返回 null 则跳过该路由
   */
  transform?: (route: RouteLocationMatched, index: number) => BreadcrumbItem | null

  /**
   * 要排除的路径模式
   * @description 支持字符串或正则表达式
   */
  excludePatterns?: (string | RegExp)[]

  /**
   * 是否缓存路由到面包屑的映射
   * @default true
   */
  cache?: boolean

  /**
   * 路径到标签的映射
   * @description 用于自定义某些路径的显示文本
   */
  labelMap?: Record<string, string>

  /**
   * 是否自动监听路由变化
   * @default true
   */
  watchRoute?: boolean
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
 * @param labelMap - 标签映射
 * @returns 面包屑项或 null
 */
function extractBreadcrumbFromRoute(
  route: RouteLocationMatched,
  labelMap?: Record<string, string>,
): BreadcrumbItem | null {
  const meta = route.meta as RouteBreadcrumbMeta | undefined

  // 如果配置为隐藏，则跳过
  if (meta?.hiddenInBreadcrumb || meta?.breadcrumb === false) {
    return null
  }

  // 获取标题（优先级：自定义映射 > breadcrumb.label > meta.title > 路由名）
  const label = labelMap?.[route.path]
    || meta?.breadcrumb?.label
    || meta?.title
    || (route.name?.toString())
    || ''

  if (!label) {
    return null
  }

  // 获取路径（支持重定向）
  const path = (meta as RouteBreadcrumbMeta & { breadcrumbRedirect?: string })?.breadcrumbRedirect || route.path

  // 构建面包屑项
  const item: BreadcrumbItem = {
    key: route.path,
    label,
    path,
    icon: meta?.icon || meta?.breadcrumb?.icon,
    ...(typeof meta?.breadcrumb === 'object' ? meta.breadcrumb : {}),
  }

  return item
}

/**
 * 检查路径是否匹配排除模式
 */
function matchesExcludePattern(path: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return path === pattern || path.startsWith(`${pattern}/`)
    }
    return pattern.test(path)
  })
}

/**
 * 基于路由自动生成面包屑
 * @description 根据当前路由自动生成面包屑项列表，支持自定义转换、缓存等功能
 * @param options - 配置选项
 * @returns 面包屑项列表和控制方法
 * @example
 * ```ts
 * import { useRoute } from 'vue-router'
 * import { useBreadcrumbRoute } from '@ldesign/breadcrumb-vue'
 *
 * const route = useRoute()
 * const { items, refresh } = useBreadcrumbRoute({
 *   route,
 *   includeHome: true,
 *   labelMap: {
 *     '/users': '用户管理',
 *     '/settings': '系统设置'
 *   }
 * })
 * ```
 */
export function useBreadcrumbRoute(options: UseBreadcrumbRouteOptions = {}) {
  const {
    router,
    route,
    includeHome = true,
    homeItem,
    transform,
    excludePatterns = [],
    cache = true,
    labelMap,
    watchRoute = true,
  } = options

  // 面包屑项列表
  const items = ref<BreadcrumbItem[]>([])

  // 路由缓存
  const routeCache = cache ? shallowRef<Map<string, BreadcrumbItem[]>>(new Map()) : null

  // 路由注销函数
  let unwatch: (() => void) | null = null

  /**
   * 从当前路由生成面包屑
   */
  function generateBreadcrumbs(currentRoute: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
    // 检查缓存
    if (routeCache && routeCache.value.has(currentRoute.path)) {
      return routeCache.value.get(currentRoute.path)!
    }

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

      // 检查排除模式
      if (excludePatterns.length > 0 && matchesExcludePattern(matchedRoute.path, excludePatterns)) {
        return
      }

      // 使用自定义转换函数或默认提取
      const item = transform
        ? transform(matchedRoute, index)
        : extractBreadcrumbFromRoute(matchedRoute, labelMap)

      if (item) {
        result.push(item)
      }
    })

    // 存入缓存
    if (routeCache) {
      routeCache.value.set(currentRoute.path, result)
    }

    return result
  }

  /**
   * 更新面包屑
   */
  function updateBreadcrumbs(currentRoute: RouteLocationNormalizedLoaded): void {
    items.value = generateBreadcrumbs(currentRoute)
  }

  // 如果提供了路由，监听路由变化
  if (route && watchRoute) {
    unwatch = watch(
      () => route.path,
      () => updateBreadcrumbs(route),
      { immediate: true },
    )
  }
  else if (route) {
    // 不监听但立即生成
    updateBreadcrumbs(route)
  }

  // 清理
  onUnmounted(() => {
    unwatch?.()
    routeCache?.value.clear()
  })

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
        // 清除缓存后重新生成
        routeCache?.value.delete(route.path)
        updateBreadcrumbs(route)
      }
    },

    /**
     * 设置面包屑项（覆盖自动生成）
     */
    setItems: (newItems: BreadcrumbItem[]) => {
      items.value = newItems
    },

    /**
     * 清除路由缓存
     */
    clearCache: () => {
      routeCache?.value.clear()
    },

    /**
     * 添加项到末尾
     */
    append: (item: BreadcrumbItem) => {
      items.value = [...items.value, item]
    },

    /**
     * 替换最后一项
     */
    replaceLast: (item: BreadcrumbItem) => {
      if (items.value.length > 0) {
        items.value = [...items.value.slice(0, -1), item]
      }
      else {
        items.value = [item]
      }
    },
  }
}

