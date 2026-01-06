/**
 * 工具函数导出
 * @module utils
 * @description 提供面包屑组件的通用工具函数
 */

// 事件发射器
export {
  createEventEmitter,
  EventEmitter,
  type EventEmitterOptions,
  type EventHandler,
} from './event-emitter'

// 面包屑工具函数
export {
  areItemsEqual,
  calculateVisibleItems,
  debounce,
  deepClone,
  findItem,
  generateKey,
  getFullPath,
  getSeparatorChar,
  hasDropdown,
  isItemClickable,
  mergeConfig,
  normalizeItems,
  parsePath,
  shallowEqual,
  throttle,
  truncateToItem,
} from './breadcrumb-utils'

