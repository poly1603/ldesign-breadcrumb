<script setup lang="ts">
/**
 * 面包屑组件
 * @component LBreadcrumb
 */
import type {
  BreadcrumbConfig,
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

// 更新内部状态的辅助函数
function updateInternalState() {
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

// 分隔符字符
const separatorChar = computed(() => getSeparatorChar(props.separator))

/**
 * 处理项点击
 */
function handleItemClick(item: BreadcrumbItem, index: number, event: MouseEvent) {
  manager.handleClick(item, index, event)
  emit('click', item, index, event)
}

/**
 * 切换展开
 */
function toggleExpand() {
  expanded.value = !expanded.value
  manager.setExpanded(expanded.value)
  emit('expandChange', expanded.value)
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
  /**
   * 获取当前所有面包屑项
   */
  getItems: () => manager.getItems(),
  /**
   * 展开折叠项
   */
  expand: () => {
    expanded.value = true
    manager.setExpanded(true)
  },
  /**
   * 折叠展开项
   */
  collapse: () => {
    expanded.value = false
    manager.setExpanded(false)
  },
})
</script>

<template>
  <nav
    class="l-breadcrumb"
    :class="[
      `l-breadcrumb--${size}`,
    ]"
    aria-label="面包屑导航"
  >
    <ol class="l-breadcrumb__list">
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
                :is-last="false"
                @click="handleItemClick"
              />
            </li>
            <li class="l-breadcrumb__separator-wrapper" aria-hidden="true">
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
                @click="toggleExpand"
              >
                ...
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

