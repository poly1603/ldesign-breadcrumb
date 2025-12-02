/**
 * 面包屑管理器
 * 核心状态管理和事件处理
 * @module managers/breadcrumb-manager
 */

import type {
  BreadcrumbClickEventParams,
  BreadcrumbConfig,
  BreadcrumbDropdownItem,
  BreadcrumbDropdownSelectParams,
  BreadcrumbEventMap,
  BreadcrumbItem,
} from '../types'
import { DEFAULT_BREADCRUMB_CONFIG, DEFAULT_HOME_ITEM } from '../types'
import {
  calculateVisibleItems,
  EventEmitter,
  normalizeItems,
} from '../utils'

/**
 * 面包屑管理器配置
 */
export interface BreadcrumbManagerConfig extends Partial<BreadcrumbConfig> {
  /**
   * 初始面包屑项
   */
  items?: BreadcrumbItem[]
}

/**
 * 面包屑状态
 */
export interface BreadcrumbState {
  /**
   * 当前面包屑项列表
   */
  items: BreadcrumbItem[]

  /**
   * 是否展开折叠项
   */
  expanded: boolean

  /**
   * 可见项信息
   */
  visibleItems: ReturnType<typeof calculateVisibleItems>
}

/**
 * 面包屑管理器
 * 提供面包屑的核心状态管理和事件处理功能
 */
export class BreadcrumbManager {
  /** 配置 */
  private config: Required<Omit<BreadcrumbConfig, 'homeItem'>> & { homeItem: BreadcrumbItem }

  /** 当前状态 */
  private state: BreadcrumbState

  /** 事件发射器 */
  private emitter = new EventEmitter<BreadcrumbEventMap>()

  /**
   * 创建面包屑管理器
   * @param config - 管理器配置
   */
  constructor(config: BreadcrumbManagerConfig = {}) {
    // 合并默认配置
    this.config = {
      ...DEFAULT_BREADCRUMB_CONFIG,
      items: [],
      homeItem: config.homeItem
        ? { ...DEFAULT_HOME_ITEM, ...config.homeItem }
        : DEFAULT_HOME_ITEM,
      ...config,
    }

    // 构建初始项列表
    const initialItems = this.buildItems(this.config.items)

    // 初始化状态
    this.state = {
      items: initialItems,
      expanded: false,
      visibleItems: calculateVisibleItems(initialItems, this.config),
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): typeof this.config {
    return { ...this.config }
  }

  /**
   * 获取当前状态
   */
  getState(): BreadcrumbState {
    return { ...this.state }
  }

  /**
   * 获取所有面包屑项
   */
  getItems(): BreadcrumbItem[] {
    return [...this.state.items]
  }

  /**
   * 获取可见项信息
   */
  getVisibleItems(): BreadcrumbState['visibleItems'] {
    if (this.state.expanded) {
      // 展开状态下显示所有项
      return {
        beforeItems: this.state.items,
        collapsedItems: [],
        afterItems: [],
        needsCollapse: false,
      }
    }
    return { ...this.state.visibleItems }
  }

  /**
   * 更新面包屑项
   * @param items - 新的面包屑项列表
   */
  setItems(items: BreadcrumbItem[]): void {
    const newItems = this.buildItems(items)
    this.state.items = newItems
    this.state.visibleItems = calculateVisibleItems(newItems, this.config)
    this.state.expanded = false
  }

  /**
   * 添加面包屑项
   * @param item - 要添加的项
   * @param index - 插入位置（默认末尾）
   */
  addItem(item: BreadcrumbItem, index?: number): void {
    const newItems = [...this.state.items]
    const insertIndex = index ?? newItems.length
    newItems.splice(insertIndex, 0, item)
    this.setItems(newItems.map((i, idx) => (idx === 0 && this.config.showHome ? i : i)))
  }

  /**
   * 移除面包屑项
   * @param key - 要移除的项的 key
   */
  removeItem(key: string): void {
    const newItems = this.state.items.filter(item => item.key !== key)
    this.setItems(newItems)
  }

  /**
   * 切换展开状态
   */
  toggleExpand(): void {
    this.state.expanded = !this.state.expanded
    this.emitter.emit('expandChange', { expanded: this.state.expanded })
  }

  /**
   * 设置展开状态
   * @param expanded - 是否展开
   */
  setExpanded(expanded: boolean): void {
    if (this.state.expanded !== expanded) {
      this.state.expanded = expanded
      this.emitter.emit('expandChange', { expanded })
    }
  }

  /**
   * 处理面包屑项点击
   * @param item - 点击的项
   * @param index - 项索引
   * @param event - 原始事件
   */
  handleClick(item: BreadcrumbItem, index: number, event: MouseEvent): void {
    const params: BreadcrumbClickEventParams = { item, index, event }
    this.emitter.emit('click', params)
  }

  /**
   * 处理下拉菜单选择
   * @param parentItem - 父级面包屑项
   * @param selectedItem - 选中的下拉菜单项
   * @param event - 原始事件
   */
  handleDropdownSelect(
    parentItem: BreadcrumbItem,
    selectedItem: BreadcrumbDropdownItem,
    event: MouseEvent,
  ): void {
    const params: BreadcrumbDropdownSelectParams = { parentItem, selectedItem, event }
    this.emitter.emit('dropdownSelect', params)
  }

  /**
   * 订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  on<K extends keyof BreadcrumbEventMap>(
    event: K,
    handler: (params: BreadcrumbEventMap[K]) => void,
  ): () => void {
    return this.emitter.on(event, handler)
  }

  /**
   * 更新配置
   * @param config - 新配置（部分）
   */
  updateConfig(config: Partial<BreadcrumbConfig>): void {
    Object.assign(this.config, config)

    // 如果配置影响可见项计算，需要重新计算
    if ('maxItems' in config || 'itemsBeforeCollapse' in config || 'itemsAfterCollapse' in config) {
      this.state.visibleItems = calculateVisibleItems(this.state.items, this.config)
    }

    // 如果修改了 showHome，需要重建项列表
    if ('showHome' in config || 'homeItem' in config) {
      this.setItems(this.state.items.filter(item => item.key !== 'home'))
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.emitter.clear()
  }

  /**
   * 构建面包屑项列表
   * 根据配置添加首页项
   * @param items - 原始项列表
   * @returns 处理后的项列表
   */
  private buildItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
    const normalizedItems = normalizeItems(items)

    // 如果配置显示首页且列表中没有首页
    if (this.config.showHome) {
      const hasHome = normalizedItems.some(item => item.key === 'home')
      if (!hasHome) {
        return [this.config.homeItem, ...normalizedItems]
      }
    }

    return normalizedItems
  }
}

