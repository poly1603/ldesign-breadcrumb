/**
 * 事件发射器
 * @module utils/event-emitter
 * @description 提供类型安全的事件发布/订阅机制
 */

/**
 * 事件处理函数类型
 * @template T - 事件数据类型
 */
export type EventHandler<T = unknown> = (data: T) => void

/**
 * 事件处理器信息
 * @internal
 */
interface HandlerInfo<T = unknown> {
  /** 处理函数 */
  handler: EventHandler<T>
  /** 优先级，数值越小优先级越高 */
  priority: number
  /** 是否只执行一次 */
  once: boolean
}

/**
 * EventEmitter 配置选项
 */
export interface EventEmitterOptions {
  /**
   * 每个事件的最大监听器数量
   * @default 100
   * @description 超出时会在控制台警告
   */
  maxListeners?: number

  /**
   * 是否在处理器报错时继续执行其他处理器
   * @default true
   */
  continueOnError?: boolean

  /**
   * 错误处理函数
   */
  onError?: (error: Error, event: string) => void
}

/**
 * 轻量级事件发射器
 * @description 用于组件内部的类型安全事件通信
 * @template EventMap - 事件名到事件数据的映射类型
 * @example
 * ```ts
 * // 定义事件映射
 * interface MyEvents {
 *   click: { x: number; y: number }
 *   change: { value: string }
 * }
 *
 * // 创建实例
 * const emitter = new EventEmitter<MyEvents>()
 *
 * // 订阅事件
 * const unsubscribe = emitter.on('click', (data) => {
 *   console.log(data.x, data.y)
 * })
 *
 * // 触发事件
 * emitter.emit('click', { x: 100, y: 200 })
 *
 * // 取消订阅
 * unsubscribe()
 * ```
 */
export class EventEmitter<EventMap extends Record<string, unknown>> {
  /** 事件监听器映射 */
  private readonly listeners = new Map<keyof EventMap, HandlerInfo<unknown>[]>()

  /** 配置选项 */
  private readonly options: Required<EventEmitterOptions>

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: Required<EventEmitterOptions> = {
    maxListeners: 100,
    continueOnError: true,
    onError: (error, event) => {
      console.error(`[EventEmitter] Error in event "${String(event)}":`, error)
    },
  }

  /**
   * 创建事件发射器实例
   * @param options - 配置选项
   */
  constructor(options: EventEmitterOptions = {}) {
    this.options = { ...EventEmitter.DEFAULT_OPTIONS, ...options }
  }

  /**
   * 订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @param priority - 优先级，默认 0，数值越小优先级越高
   * @returns 取消订阅函数
   * @example
   * ```ts
   * const unsubscribe = emitter.on('click', (data) => {
   *   console.log('clicked', data)
   * })
   * ```
   */
  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
    priority = 0,
  ): () => void {
    return this.addListener(event, handler, priority, false)
  }

  /**
   * 一次性订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @param priority - 优先级
   * @returns 取消订阅函数
   * @example
   * ```ts
   * emitter.once('ready', () => {
   *   console.log('ready only once')
   * })
   * ```
   */
  once<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
    priority = 0,
  ): () => void {
    return this.addListener(event, handler, priority, true)
  }

  /**
   * 取消订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      const index = handlers.findIndex(h => h.handler === handler)
      if (index !== -1) {
        handlers.splice(index, 1)
        if (handlers.length === 0) {
          this.listeners.delete(event)
        }
      }
    }
  }

  /**
   * 移除指定事件的所有监听器
   * @param event - 事件名称
   */
  offAll<K extends keyof EventMap>(event: K): void {
    this.listeners.delete(event)
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   * @returns 是否有监听器处理了该事件
   * @example
   * ```ts
   * const handled = emitter.emit('click', { x: 100, y: 200 })
   * ```
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    const handlers = this.listeners.get(event)
    if (!handlers || handlers.length === 0) {
      return false
    }

    // 创建副本以防止在处理过程中修改
    const handlersCopy = [...handlers]
    const oncesToRemove: HandlerInfo<unknown>[] = []

    for (const info of handlersCopy) {
      try {
        info.handler(data)
        if (info.once) {
          oncesToRemove.push(info)
        }
      }
      catch (error) {
        this.options.onError(error as Error, String(event))
        if (!this.options.continueOnError) {
          break
        }
      }
    }

    // 移除一次性监听器
    for (const info of oncesToRemove) {
      this.off(event, info.handler as EventHandler<EventMap[K]>)
    }

    return true
  }

  /**
   * 异步触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   * @returns Promise<boolean> 是否有监听器处理了该事件
   */
  async emitAsync<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<boolean> {
    const handlers = this.listeners.get(event)
    if (!handlers || handlers.length === 0) {
      return false
    }

    const handlersCopy = [...handlers]
    const oncesToRemove: HandlerInfo<unknown>[] = []

    for (const info of handlersCopy) {
      try {
        await Promise.resolve(info.handler(data))
        if (info.once) {
          oncesToRemove.push(info)
        }
      }
      catch (error) {
        this.options.onError(error as Error, String(event))
        if (!this.options.continueOnError) {
          break
        }
      }
    }

    for (const info of oncesToRemove) {
      this.off(event, info.handler as EventHandler<EventMap[K]>)
    }

    return true
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.listeners.clear()
  }

  /**
   * 获取事件监听器数量
   * @param event - 事件名称（可选，不传则返回所有事件的监听器总数）
   * @returns 监听器数量
   */
  listenerCount(event?: keyof EventMap): number {
    if (event !== undefined) {
      return this.listeners.get(event)?.length ?? 0
    }
    let count = 0
    this.listeners.forEach(handlers => (count += handlers.length))
    return count
  }

  /**
   * 获取所有已注册的事件名称
   * @returns 事件名称数组
   */
  eventNames(): (keyof EventMap)[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event - 事件名称
   * @returns 是否有监听器
   */
  hasListeners<K extends keyof EventMap>(event: K): boolean {
    return (this.listeners.get(event)?.length ?? 0) > 0
  }

  /**
   * 添加监听器（内部方法）
   * @internal
   */
  private addListener<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
    priority: number,
    once: boolean,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const handlers = this.listeners.get(event)!

    // 检查最大监听器数量
    if (handlers.length >= this.options.maxListeners) {
      console.warn(
        `[EventEmitter] Max listeners (${this.options.maxListeners}) exceeded for event "${String(event)}"`,
      )
    }

    const info: HandlerInfo<unknown> = {
      handler: handler as EventHandler<unknown>,
      priority,
      once,
    }

    // 按优先级插入
    const insertIndex = handlers.findIndex(h => h.priority > priority)
    if (insertIndex === -1) {
      handlers.push(info)
    }
    else {
      handlers.splice(insertIndex, 0, info)
    }

    return () => this.off(event, handler)
  }
}

/**
 * 创建事件发射器实例的工厂函数
 * @template EventMap - 事件映射类型
 * @param options - 配置选项
 * @returns EventEmitter 实例
 */
export function createEventEmitter<EventMap extends Record<string, unknown>>(
  options?: EventEmitterOptions,
): EventEmitter<EventMap> {
  return new EventEmitter<EventMap>(options)
}

