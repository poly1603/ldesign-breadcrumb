/**
 * 事件发射器
 * @module utils/event-emitter
 */

/**
 * 事件处理函数类型
 */
type EventHandler<T = unknown> = (data: T) => void

/**
 * 轻量级事件发射器
 * 用于组件内部的事件通信
 */
export class EventEmitter<EventMap extends Record<string, unknown>> {
  /** 事件监听器映射 */
  private listeners = new Map<keyof EventMap, Set<EventHandler<unknown>>>()

  /**
   * 订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler<unknown>)

    return () => this.off(event, handler)
  }

  /**
   * 一次性订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    const wrapper: EventHandler<EventMap[K]> = (data) => {
      this.off(event, wrapper)
      handler(data)
    }
    return this.on(event, wrapper)
  }

  /**
   * 取消订阅事件
   * @param event - 事件名称
   * @param handler - 事件处理函数
   */
  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.listeners.clear()
  }

  /**
   * 获取事件监听器数量
   * @param event - 事件名称（可选）
   * @returns 监听器数量
   */
  listenerCount(event?: keyof EventMap): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0
    }
    let count = 0
    this.listeners.forEach(handlers => (count += handlers.size))
    return count
  }
}

