<script setup lang="ts">
/**
 * 面包屑组件
 * @component LBreadcrumb
 * @description 提供导航路径展示，支持折叠、下拉菜单、路由集成等功能
 * @example
 * ```vue
 * <LBreadcrumb
 *   :items="[
 *     { key: 'home', label: '首页', path: '/' },
 *     { key: 'users', label: '用户', path: '/users' },
 *     { key: 'detail', label: '用户详情' }
 *   ]"
 *   separator="/"
 *   :max-items="5"
 *   @click="handleClick"
 * />
 * ```
 */
import type {
  BreadcrumbDropdownItem,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbSize,
} from '@ldesign/breadcrumb-core'
import {
  BreadcrumbManager,
  getSeparatorChar,
} from '@ldesign/breadcrumb-core'
import { computed, onUnmounted, provide, ref, toRef, watch } from 'vue'
import { BREADCRUMB_CONTEXT_KEY } from '../composables/useBreadcrumb'
import BreadcrumbItemComp from './BreadcrumbItem.vue'
import BreadcrumbSeparatorComp from './BreadcrumbSeparator.vue'

/**
 * 组件 Props
 */
export interface BreadcrumbProps {
  /**
   * 面包屑项列表
   */
  items?: BreadcrumbItem[]

  /**
   * 分隔符
   * @default '/'
   */
  separator?: BreadcrumbSeparator

  /**
   * 组件大小
   * @default 'medium'
   */
  size?: BreadcrumbSize

  /**
   * 最大显示项数（超出时折叠）
   */
  maxItems?: number

  /**
   * 折叠后保留的头部项数
   * @default 1
   */
  itemsBeforeCollapse?: number

  /**
   * 折叠后保留的尾部项数
   * @default 2
   */
  itemsAfterCollapse?: number

  /**
   * 是否显示首页
   * @default true
   */
  showHome?: boolean

  /**
   * 首页配置
   */
  homeItem?: Partial<BreadcrumbItem>

  /**
   * 最后一项是否可点击
   * @default false
   */
  lastItemClickable?: boolean

  /**
   * aria-label 属性
   * @default '面包屑导航'
   */
  ariaLabel?: string
}

/**
 * 组件 Emits
 */
export interface BreadcrumbEmits {
  /**
   * 点击面包屑项
   */
  (e: 'click', item: BreadcrumbItem, index: number, event: MouseEvent): void

  /**
   * 下拉菜单选择
   */
  (e: 'dropdownSelect', parentItem: BreadcrumbItem, selectedItem: BreadcrumbDropdownItem, event: MouseEvent): void

  /**
   * 折叠状态变化
   */
  (e: 'expandChange', expanded: boolean): void
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  items: () => [],
  separator: '/',
  size: 'medium',
  maxItems: 0,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 2,
  showHome: true,
  lastItemClickable: false,
  ariaLabel: '面包屑导航',
})

const emit = defineEmits<BreadcrumbEmits>()

// 创建管理器
const manager = new BreadcrumbManager({
  items: props.items,
  separator: props.separator,
  size: props.size,
  maxItems: props.maxItems,
  itemsBeforeCollapse: props.itemsBeforeCollapse,
  itemsAfterCollapse: props.itemsAfterCollapse,
  showHome: props.showHome,
  homeItem: props.homeItem,
  lastItemClickable: props.lastItemClickable,
})

// 响应式状态
const expanded = ref(false)
const internalItems = ref<BreadcrumbItem[]>(manager.getItems())
const visibleInfo = ref(manager.getVisibleItems())
const focusedIndex = ref(-1)

// 更新内部状态的辅助函数
function updateInternalState(): void {
  internalItems.value = manager.getItems()
  visibleInfo.value = manager.getVisibleItems()
}

// 监听 props.items 变化
watch(
  () => props.items,
  (newItems) => {
    manager.setItems(newItems)
    updateInternalState()
  },
  { deep: true, immediate: true },
)

// 监听配置变化
watch(
  () => [props.maxItems, props.itemsBeforeCollapse, props.itemsAfterCollapse],
  () => {
    manager.updateConfig({
      maxItems: props.maxItems,
      itemsBeforeCollapse: props.itemsBeforeCollapse,
      itemsAfterCollapse: props.itemsAfterCollapse,
    })
    updateInternalState()
  },
)

// 分隔符字符
const separatorChar = computed(() => getSeparatorChar(props.separator))

// 当前显示的项列表
const displayItems = computed(() => {
  if (expanded.value) {
    return internalItems.value
  }
  return [
    ...visibleInfo.value.beforeItems,
    ...(visibleInfo.value.needsCollapse ? [{ key: '__ellipsis__', label: '...' }] : []),
    ...visibleInfo.value.afterItems,
  ]
})

/**
 * 处理项点击
 */
function handleItemClick(item: BreadcrumbItem, index: number, event: MouseEvent): void {
  manager.handleClick(item, index, event)
  emit('click', item, index, event)
}

/**
 * 切换展开
 */
function toggleExpand(): void {
  expanded.value = !expanded.value
  manager.setExpanded(expanded.value)
  emit('expandChange', expanded.value)
}

/**
 * 处理键盘导航
 */
function handleKeydown(event: KeyboardEvent): void {
  const items = displayItems.value
  if (items.length === 0) return

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      focusedIndex.value = Math.max(0, focusedIndex.value - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      focusedIndex.value = Math.min(items.length - 1, focusedIndex.value + 1)
      break
    case 'Home':
      event.preventDefault()
      focusedIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      focusedIndex.value = items.length - 1
      break
  }
}

// 提供上下文
provide(BREADCRUMB_CONTEXT_KEY, {
  separator: toRef(props, 'separator'),
  size: toRef(props, 'size'),
  lastItemClickable: toRef(props, 'lastItemClickable'),
  items: internalItems,
  expanded,
  handleItemClick,
  toggleExpand,
})

// 组件卸载时清理
onUnmounted(() => {
  manager.destroy()
})

// 暴露给父组件的方法
defineExpose({
  /** 获取当前所有面包屑项 */
  getItems: () => manager.getItems(),
  /** 展开折叠项 */
  expand: () => {
    expanded.value = true
    manager.setExpanded(true)
  },
  /** 折叠展开项 */
  collapse: () => {
    expanded.value = false
    manager.setExpanded(false)
  },
  /** 获取管理器实例 */
  getManager: () => manager,
  /** 强制更新状态 */
  refresh: () => updateInternalState(),
})
</script>

<template>
  <nav
    class="l-breadcrumb"
    :class="[
      `l-breadcrumb--${size}`,
    ]"
    :aria-label="ariaLabel"
    @keydown="handleKeydown"
  >
    <ol class="l-breadcrumb__list" role="list">
      <!-- 默认插槽优先 -->
      <slot>
        <!-- 展开时显示所有项 -->
        <template v-if="expanded">
          <template v-for="(item, index) in internalItems" :key="item.key">
            <li class="l-breadcrumb__item-wrapper">
              <BreadcrumbItemComp
                :item="item"
                :index="index"
                :is-last="index === internalItems.length - 1"
                :tabindex="focusedIndex === index ? 0 : -1"
                @click="handleItemClick"
              />
            </li>
            <li
              v-if="index < internalItems.length - 1"
              class="l-breadcrumb__separator-wrapper"
              aria-hidden="true"
            >
              <BreadcrumbSeparatorComp>
                <slot name="separator">{{ separatorChar }}</slot>
              </BreadcrumbSeparatorComp>
            </li>
          </template>
        </template>

        <!-- 折叠模式 -->
        <template v-else>
          <!-- 折叠前的项 -->
          <template v-for="(item, index) in visibleInfo.beforeItems" :key="item.key">
            <li class="l-breadcrumb__item-wrapper">
              <BreadcrumbItemComp
                :item="item"
                :index="index"
                :is-last="!visibleInfo.needsCollapse && visibleInfo.afterItems.length === 0 && index === visibleInfo.beforeItems.length - 1"
                @click="handleItemClick"
              />
            </li>
            <!-- 只有在后面还有内容时才显示分隔符 -->
            <li
              v-if="visibleInfo.needsCollapse || visibleInfo.afterItems.length > 0 || index < visibleInfo.beforeItems.length - 1"
              class="l-breadcrumb__separator-wrapper"
              aria-hidden="true"
            >
              <BreadcrumbSeparatorComp>
                <slot name="separator">{{ separatorChar }}</slot>
              </BreadcrumbSeparatorComp>
            </li>
          </template>

          <!-- 折叠指示器 -->
          <template v-if="visibleInfo.needsCollapse">
            <li class="l-breadcrumb__item-wrapper">
              <button
                type="button"
                class="l-breadcrumb__ellipsis"
                :title="`展开 ${visibleInfo.collapsedItems.length} 个隐藏项`"
                :aria-label="`展开 ${visibleInfo.collapsedItems.length} 个隐藏的面包屑项`"
                aria-expanded="false"
                @click="toggleExpand"
                @keydown.enter="toggleExpand"
                @keydown.space.prevent="toggleExpand"
              >
                <span aria-hidden="true">…</span>
              </button>
            </li>
            <li class="l-breadcrumb__separator-wrapper" aria-hidden="true">
              <BreadcrumbSeparatorComp>
                <slot name="separator">{{ separatorChar }}</slot>
              </BreadcrumbSeparatorComp>
            </li>
          </template>

          <!-- 折叠后的项 -->
          <template v-for="(item, index) in visibleInfo.afterItems" :key="item.key">
            <li class="l-breadcrumb__item-wrapper">
              <BreadcrumbItemComp
                :item="item"
                :index="visibleInfo.beforeItems.length + visibleInfo.collapsedItems.length + index"
                :is-last="index === visibleInfo.afterItems.length - 1"
                @click="handleItemClick"
              />
            </li>
            <li
              v-if="index < visibleInfo.afterItems.length - 1"
              class="l-breadcrumb__separator-wrapper"
              aria-hidden="true"
            >
              <BreadcrumbSeparatorComp>
                <slot name="separator">{{ separatorChar }}</slot>
              </BreadcrumbSeparatorComp>
            </li>
          </template>
        </template>
      </slot>
    </ol>
  </nav>
</template>

