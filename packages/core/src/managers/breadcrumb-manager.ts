/**
 * 面包屑管理器
 * @module managers/breadcrumb-manager
 * @description 核心状态管理和事件处理，提供框架无关的面包屑逻辑
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
  deepClone,
  EventEmitter,
  normalizeItems,
} from '../utils'

/**
 * 面包屑管理器配置
 * @template TMeta - 元数据类型
 */
export interface BreadcrumbManagerConfig<TMeta = unknown> extends Partial<BreadcrumbConfig<TMeta>> {
  /**
   * 初始面包屑项
   */
  items?: BreadcrumbItem<TMeta>[]

  /**
   * 是否启用状态历史记录
   * @default false
   * @description 启用后可使用 undo/redo 功能
   */
  enableHistory?: boolean

  /**
   * 最大历史记录数
   * @default 50
   */
  maxHistoryLength?: number
}

/**
 * 面包屑状态
 * @template TMeta - 元数据类型
 */
export interface BreadcrumbState<TMeta = unknown> {
  /**
   * 当前面包屑项列表
   */
  items: BreadcrumbItem<TMeta>[]

  /**
   * 是否展开折叠项
   */
  expanded: boolean

  /**
   * 可见项信息
   */
  visibleItems: ReturnType<typeof calculateVisibleItems>

  /**
   * 状态版本号（每次变更自动递增）
   */
  version: number
}

/**
 * 状态快照
 * @description 用于状态备份和恢复
 */
export interface BreadcrumbSnapshot<TMeta = unknown> {
  items: BreadcrumbItem<TMeta>[]
  expanded: boolean
  timestamp: number
  version: number
}

/**
 * 批量操作类型
 */
export type BatchOperation<TMeta = unknown> =
  | { type: 'add', item: BreadcrumbItem<TMeta>, index?: number }
  | { type: 'remove', key: string }
  | { type: 'update', key: string, updates: Partial<BreadcrumbItem<TMeta>> }
  | { type: 'replace', items: BreadcrumbItem<TMeta>[] }

/**
 * 面包屑管理器
 * @description 提供面包屑的核心状态管理和事件处理功能
 * @template TMeta - 元数据类型
 * @example
 * ```ts
 * // 创建管理器
 * const manager = new BreadcrumbManager({
 *   items: [
 *     { key: 'home', label: '首页', path: '/' },
 *     { key: 'users', label: '用户', path: '/users' }
 *   ],
 *   showHome: true,
 *   maxItems: 5
 * })
 *
 * // 监听事件
 * manager.on('click', ({ item, index }) => {
 *   console.log('clicked', item.label)
 * })
 *
 * // 更新项
 * manager.setItems([...])
 *
 * // 获取状态
 * const state = manager.getState()
 * ```
 */
export class BreadcrumbManager<TMeta = unknown> {
  /** 配置 */
  private config: Required<Omit<BreadcrumbConfig<TMeta>, 'homeItem' | 'separatorRender' | 'itemRender'>> & {
    homeItem: BreadcrumbItem<TMeta>
    enableHistory: boolean
    maxHistoryLength: number
  }

  /** 当前状态 */
  private state: BreadcrumbState<TMeta>

  /** 事件发射器 */
  private readonly emitter = new EventEmitter<BreadcrumbEventMap & Record<string, unknown>>()

  /** 状态历史记录 */
  private history: BreadcrumbSnapshot<TMeta>[] = []

  /** 历史指针位置 */
  private historyIndex = -1

  /** 是否处于批量操作中 */
  private isBatching = false

  /** 批量操作队列 */
  private batchQueue: BatchOperation<TMeta>[] = []

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 创建面包屑管理器
   * @param config - 管理器配置
   */
  constructor(config: BreadcrumbManagerConfig<TMeta> = {}) {
    // 合并默认配置
    const mergedHomeItem: BreadcrumbItem<TMeta> = config.homeItem
      ? { ...DEFAULT_HOME_ITEM, ...config.homeItem } as BreadcrumbItem<TMeta>
      : DEFAULT_HOME_ITEM as BreadcrumbItem<TMeta>

    // 解构 config 以排除 homeItem
    const { homeItem: _, ...restConfig } = config

    this.config = {
      ...DEFAULT_BREADCRUMB_CONFIG,
      items: [],
      enableHistory: config.enableHistory ?? false,
      maxHistoryLength: config.maxHistoryLength ?? 50,
      ...restConfig,
      homeItem: mergedHomeItem,
    }

    // 构建初始项列表
    const initialItems = this.buildItems(this.config.items)

    // 初始化状态
    this.state = {
      items: initialItems,
      expanded: false,
      visibleItems: calculateVisibleItems(initialItems, this.config),
      version: 0,
    }

    // 保存初始状态到历史
    if (this.config.enableHistory) {
      this.saveToHistory()
    }
  }

  // ==================== 状态读取 ====================

  /**
   * 获取当前配置
   * @returns 配置的深拷贝
   */
  getConfig(): typeof this.config {
    return deepClone(this.config)
  }

  /**
   * 获取当前状态
   * @returns 状态的深拷贝
   */
  getState(): Readonly<BreadcrumbState<TMeta>> {
    return deepClone(this.state)
  }

  /**
   * 获取所有面包屑项
   * @returns 项列表的深拷贝
   */
  getItems(): BreadcrumbItem<TMeta>[] {
    return deepClone(this.state.items)
  }

  /**
   * 根据 key 获取单个项
   * @param key - 项的唯一标识
   * @returns 找到的项或 undefined
   */
  getItem(key: string): BreadcrumbItem<TMeta> | undefined {
    const item = this.state.items.find(i => i.key === key)
    return item ? deepClone(item) : undefined
  }

  /**
   * 获取项的索引
   * @param key - 项的唯一标识
   * @returns 索引或 -1
   */
  getItemIndex(key: string): number {
    return this.state.items.findIndex(i => i.key === key)
  }

  /**
   * 获取可见项信息
   * @returns 可见项信息
   */
  getVisibleItems(): BreadcrumbState<TMeta>['visibleItems'] {
    if (this.state.expanded) {
      return {
        beforeItems: deepClone(this.state.items),
        collapsedItems: [],
        afterItems: [],
        needsCollapse: false,
      }
    }
    return deepClone(this.state.visibleItems)
  }

  /**
   * 获取当前项的数量
   */
  get count(): number {
    return this.state.items.length
  }

  /**
   * 获取是否展开
   */
  get isExpanded(): boolean {
    return this.state.expanded
  }

  /**
   * 获取状态版本号
   */
  get version(): number {
    return this.state.version
  }

  // ==================== 状态修改 ====================

  /**
   * 更新面包屑项
   * @param items - 新的面包屑项列表
   */
  setItems(items: BreadcrumbItem<TMeta>[]): void {
    this.assertNotDestroyed()
    const newItems = this.buildItems(items)
    this.updateState({
      items: newItems,
      visibleItems: calculateVisibleItems(newItems, this.config),
      expanded: false,
    })
  }

  /**
   * 添加面包屑项
   * @param item - 要添加的项
   * @param index - 插入位置（默认末尾）
   */
  addItem(item: BreadcrumbItem<TMeta>, index?: number): void {
    this.assertNotDestroyed()
    if (this.isBatching) {
      this.batchQueue.push({ type: 'add', item, index })
      return
    }

    const newItems = [...this.state.items]
    const insertIndex = index ?? newItems.length

    // 验证插入位置
    if (insertIndex < 0 || insertIndex > newItems.length) {
      throw new Error(`[BreadcrumbManager] Invalid insert index: ${insertIndex}`)
    }

    // 检查 key 是否重复
    if (newItems.some(i => i.key === item.key)) {
      throw new Error(`[BreadcrumbManager] Duplicate key: ${item.key}`)
    }

    newItems.splice(insertIndex, 0, item)
    this.setItems(newItems)
  }

  /**
   * 移除面包屑项
   * @param key - 要移除的项的 key
   * @returns 是否成功移除
   */
  removeItem(key: string): boolean {
    this.assertNotDestroyed()
    if (this.isBatching) {
      this.batchQueue.push({ type: 'remove', key })
      return true
    }

    const index = this.state.items.findIndex(item => item.key === key)
    if (index === -1) {
      return false
    }

    const newItems = this.state.items.filter(item => item.key !== key)
    this.setItems(newItems)
    return true
  }

  /**
   * 更新指定项
   * @param key - 要更新的项的 key
   * @param updates - 要更新的属性
   * @returns 是否成功更新
   */
  updateItem(key: string, updates: Partial<Omit<BreadcrumbItem<TMeta>, 'key'>>): boolean {
    this.assertNotDestroyed()
    if (this.isBatching) {
      this.batchQueue.push({ type: 'update', key, updates })
      return true
    }

    const index = this.state.items.findIndex(item => item.key === key)
    if (index === -1) {
      return false
    }

    const newItems = [...this.state.items]
    newItems[index] = { ...newItems[index], ...updates }
    this.setItems(newItems)
    return true
  }

  /**
   * 批量操作
   * @description 将多个操作合并为一次状态更新
   * @param callback - 执行批量操作的回调函数
   * @example
   * ```ts
   * manager.batch(() => {
   *   manager.addItem({ key: 'a', label: 'A' })
   *   manager.addItem({ key: 'b', label: 'B' })
   *   manager.removeItem('old')
   * })
   * ```
   */
  batch(callback: () => void): void {
    this.assertNotDestroyed()
    this.isBatching = true
    this.batchQueue = []

    try {
      callback()
      this.executeBatch()
    }
    finally {
      this.isBatching = false
      this.batchQueue = []
    }
  }

  /**
   * 切换展开状态
   */
  toggleExpand(): void {
    this.assertNotDestroyed()
    this.setExpanded(!this.state.expanded)
  }

  /**
   * 设置展开状态
   * @param expanded - 是否展开
   */
  setExpanded(expanded: boolean): void {
    this.assertNotDestroyed()
    if (this.state.expanded !== expanded) {
      this.updateState({ expanded })
      this.emitter.emit('expandChange', { expanded })
    }
  }

  /**
   * 更新配置
   * @param config - 新配置（部分）
   */
  updateConfig(config: Partial<BreadcrumbConfig<TMeta>>): void {
    this.assertNotDestroyed()
    Object.assign(this.config, config)

    // 如果配置影响可见项计算，需要重新计算
    if ('maxItems' in config || 'itemsBeforeCollapse' in config || 'itemsAfterCollapse' in config) {
      this.updateState({
        visibleItems: calculateVisibleItems(this.state.items, this.config),
      })
    }

    // 如果修改了 showHome，需要重建项列表
    if ('showHome' in config || 'homeItem' in config) {
      if (config.homeItem) {
        this.config.homeItem = { ...DEFAULT_HOME_ITEM, ...config.homeItem } as BreadcrumbItem<TMeta>
      }
      this.setItems(this.state.items.filter(item => item.key !== 'home'))
    }
  }

  // ==================== 事件处理 ====================

  /**
   * 处理面包屑项点击
   * @param item - 点击的项
   * @param index - 项索引
   * @param event - 原始事件
   */
  handleClick(item: BreadcrumbItem<TMeta>, index: number, event: MouseEvent): void {
    this.assertNotDestroyed()
    const params: BreadcrumbClickEventParams = {
      item: item as BreadcrumbItem,
      index,
      event,
    }
    this.emitter.emit('click', params)
  }

  /**
   * 处理下拉菜单选择
   * @param parentItem - 父级面包屑项
   * @param selectedItem - 选中的下拉菜单项
   * @param event - 原始事件
   */
  handleDropdownSelect(
    parentItem: BreadcrumbItem<TMeta>,
    selectedItem: BreadcrumbDropdownItem<TMeta>,
    event: MouseEvent,
  ): void {
    this.assertNotDestroyed()
    const params: BreadcrumbDropdownSelectParams = {
      parentItem: parentItem as BreadcrumbItem,
      selectedItem: selectedItem as BreadcrumbDropdownItem,
      event,
    }
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
   * 一次性订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  once<K extends keyof BreadcrumbEventMap>(
    event: K,
    handler: (params: BreadcrumbEventMap[K]) => void,
  ): () => void {
    return this.emitter.once(event, handler)
  }

  /**
   * 取消事件订阅
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  off<K extends keyof BreadcrumbEventMap>(
    event: K,
    handler: (params: BreadcrumbEventMap[K]) => void,
  ): void {
    this.emitter.off(event, handler)
  }

  // ==================== 状态历史 ====================

  /**
   * 创建状态快照
   * @returns 当前状态的快照
   */
  createSnapshot(): BreadcrumbSnapshot<TMeta> {
    return {
      items: deepClone(this.state.items),
      expanded: this.state.expanded,
      timestamp: Date.now(),
      version: this.state.version,
    }
  }

  /**
   * 从快照恢复状态
   * @param snapshot - 要恢复的快照
   */
  restoreSnapshot(snapshot: BreadcrumbSnapshot<TMeta>): void {
    this.assertNotDestroyed()
    this.updateState({
      items: deepClone(snapshot.items),
      expanded: snapshot.expanded,
      visibleItems: calculateVisibleItems(snapshot.items, this.config),
    })
  }

  /**
   * 撤销上一次操作
   * @returns 是否成功撤销
   */
  undo(): boolean {
    if (!this.config.enableHistory || this.historyIndex <= 0) {
      return false
    }

    this.historyIndex--
    const snapshot = this.history[this.historyIndex]
    this.restoreSnapshotWithoutHistory(snapshot)
    return true
  }

  /**
   * 重做上一次撤销的操作
   * @returns 是否成功重做
   */
  redo(): boolean {
    if (!this.config.enableHistory || this.historyIndex >= this.history.length - 1) {
      return false
    }

    this.historyIndex++
    const snapshot = this.history[this.historyIndex]
    this.restoreSnapshotWithoutHistory(snapshot)
    return true
  }

  /**
   * 是否可以撤销
   */
  get canUndo(): boolean {
    return this.config.enableHistory && this.historyIndex > 0
  }

  /**
   * 是否可以重做
   */
  get canRedo(): boolean {
    return this.config.enableHistory && this.historyIndex < this.history.length - 1
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = []
    this.historyIndex = -1
    if (this.config.enableHistory) {
      this.saveToHistory()
    }
  }

  // ==================== 生命周期 ====================

  /**
   * 销毁管理器
   * @description 清理所有事件监听和内部状态
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.emitter.clear()
    this.history = []
    this.batchQueue = []
    this.destroyed = true
  }

  /**
   * 检查管理器是否已销毁
   */
  get isDestroyed(): boolean {
    return this.destroyed
  }

  // ==================== 私有方法 ====================

  /**
   * 构建面包屑项列表
   * @param items - 原始项列表
   * @returns 处理后的项列表
   */
  private buildItems(items: BreadcrumbItem<TMeta>[]): BreadcrumbItem<TMeta>[] {
    const normalizedItems = normalizeItems(items)

    if (this.config.showHome) {
      const hasHome = normalizedItems.some(item => item.key === 'home')
      if (!hasHome) {
        return [this.config.homeItem, ...normalizedItems]
      }
    }

    return normalizedItems
  }

  /**
   * 更新状态
   * @param partial - 部分状态
   */
  private updateState(partial: Partial<BreadcrumbState<TMeta>>): void {
    this.state = {
      ...this.state,
      ...partial,
      version: this.state.version + 1,
    }

    if (this.config.enableHistory && !this.isBatching) {
      this.saveToHistory()
    }
  }

  /**
   * 保存状态到历史
   */
  private saveToHistory(): void {
    // 如果当前不在历史末尾，切掉后面的历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    this.history.push(this.createSnapshot())
    this.historyIndex = this.history.length - 1

    // 限制历史长度
    if (this.history.length > this.config.maxHistoryLength) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * 从快照恢复状态（不记录历史）
   */
  private restoreSnapshotWithoutHistory(snapshot: BreadcrumbSnapshot<TMeta>): void {
    this.state = {
      items: deepClone(snapshot.items),
      expanded: snapshot.expanded,
      visibleItems: calculateVisibleItems(snapshot.items, this.config),
      version: this.state.version + 1,
    }
  }

  /**
   * 执行批量操作
   */
  private executeBatch(): void {
    let items = [...this.state.items]

    for (const op of this.batchQueue) {
      switch (op.type) {
        case 'add': {
          const insertIndex = op.index ?? items.length
          items.splice(insertIndex, 0, op.item)
          break
        }
        case 'remove': {
          items = items.filter(item => item.key !== op.key)
          break
        }
        case 'update': {
          const index = items.findIndex(item => item.key === op.key)
          if (index !== -1) {
            items[index] = { ...items[index], ...op.updates }
          }
          break
        }
        case 'replace': {
          items = [...op.items]
          break
        }
      }
    }

    this.setItems(items)
  }

  /**
   * 断言未销毁
   */
  private assertNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('[BreadcrumbManager] Manager has been destroyed')
    }
  }
}

/**
 * 创建面包屑管理器实例的工厂函数
 * @template TMeta - 元数据类型
 * @param config - 管理器配置
 * @returns BreadcrumbManager 实例
 */
export function createBreadcrumbManager<TMeta = unknown>(
  config?: BreadcrumbManagerConfig<TMeta>,
): BreadcrumbManager<TMeta> {
  return new BreadcrumbManager<TMeta>(config)
}

